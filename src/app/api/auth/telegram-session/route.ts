import { NextResponse } from 'next/server';

const BOT_TOKEN = '8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA';
const BOT_USERNAME = 'app_teacheros_bot';

// In-memory session store (persists across requests during server runtime)
interface AuthSession {
  sessionId: string;
  code: string;
  createdAt: number;
  authenticated: boolean;
  user?: {
    username: string;
    telegram_id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    provider: 'telegram';
  };
}

// Global sessions map
const globalSessions = (globalThis as any).__teacherOS_sessions || new Map<string, AuthSession>();
(globalThis as any).__teacherOS_sessions = globalSessions;

// Helper: send message to Telegram chat
async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Telegram sendMessage error:', err);
  }
}

// Helper: Fetch real public Telegram user avatar
async function getTelegramUserAvatarUrl(userId: number | string): Promise<string> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`, {
      cache: 'no-store'
    });
    const data = await res.json();
    if (data.ok && data.result && data.result.total_count > 0 && data.result.photos?.[0]?.length > 0) {
      const photos = data.result.photos[0];
      const bestPhoto = photos[photos.length - 1];
      const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${bestPhoto.file_id}`, {
        cache: 'no-store'
      });
      const fileData = await fileRes.json();
      if (fileData.ok && fileData.result?.file_path) {
        return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
      }
    }
  } catch (err) {
    console.warn('Error fetching Telegram user avatar:', err);
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userId}&backgroundColor=5b3df5&textColor=ffffff`;
}

// Helper: check Telegram getUpdates for new messages
async function checkTelegramUpdatesForSession(sessionId: string, code: string): Promise<AuthSession['user'] | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=20&timeout=0`, {
      cache: 'no-store'
    });
    const json = await res.json();
    if (!json.ok || !Array.isArray(json.result)) return null;

    for (const update of json.result) {
      const msg = update.message;
      if (!msg || !msg.from) continue;

      const text = (msg.text || '').trim();
      const from = msg.from;

      // Check if message text matches the deep link start token or code or /login
      const matchesSession = text.includes(sessionId);
      const matchesCode = text.includes(code);
      const matchesLogin = text.startsWith('/login') || text.startsWith('/start');

      if (matchesSession || matchesCode || (matchesLogin && text.includes(sessionId.replace('auth_', '')))) {
        const displayName = from.username ? `@${from.username}` : [from.first_name, from.last_name].filter(Boolean).join(' ') || `Ustoz_${from.id}`;
        
        // Fetch real public Telegram avatar
        const realAvatar = await getTelegramUserAvatarUrl(from.id);

        // Send confirmation to Telegram
        await sendTelegramMessage(
          from.id,
          `🎓 <b>TeacherOS ga muvaffaqiyatli ulandingiz!</b>\n\n` +
          `Assalomu alaykum, <b>${from.first_name || 'Ustoz'}</b>!\n` +
          `Sizning Telegram hisobingiz (<code>${from.id}</code>) TeacherOS tizimiga ulandi.\n\n` +
          `✅ <i>Barcha yaratiladigan dars taqdimotlari, uyga vazifalar va o'quvchilar baholari shu chat bilan sinxronlashadi.</i>\n\n` +
          `🔑 Tasdiqlash kodi: <b>${code}</b>`
        );

        return {
          username: displayName,
          telegram_id: String(from.id),
          first_name: from.first_name || '',
          last_name: from.last_name || '',
          avatar_url: realAvatar,
          provider: 'telegram'
        };
      }
    }
  } catch (err) {
    console.warn('Error checking Telegram getUpdates:', err);
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // ACTION 1: CREATE NEW AUTH SESSION
  if (action === 'create') {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sessionId = `auth_${randomSuffix}`;
    const code = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP

    const session: AuthSession = {
      sessionId,
      code,
      createdAt: Date.now(),
      authenticated: false
    };

    globalSessions.set(sessionId, session);

    const deepLink = `https://t.me/${BOT_USERNAME}?start=${sessionId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(deepLink)}`;

    return NextResponse.json({
      success: true,
      sessionId,
      code,
      botUsername: BOT_USERNAME,
      deepLink,
      qrCodeUrl
    });
  }

  // ACTION 2: POLL SESSION STATUS (Long-poll or periodic check)
  if (action === 'poll') {
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    const session = globalSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired or not found' }, { status: 404 });
    }

    // Already authenticated?
    if (session.authenticated && session.user) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: session.user
      });
    }

    // Check Telegram getUpdates directly
    const detectedUser = await checkTelegramUpdatesForSession(session.sessionId, session.code);
    if (detectedUser) {
      session.authenticated = true;
      session.user = detectedUser;
      globalSessions.set(sessionId, session);

      return NextResponse.json({
        success: true,
        authenticated: true,
        user: detectedUser
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: false
    });
  }

  // ACTION 3: FETCH REAL TELEGRAM AVATAR
  if (action === 'get_avatar') {
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    const avatarUrl = await getTelegramUserAvatarUrl(userId);
    return NextResponse.json({ success: true, avatarUrl });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}

// ACTION 3: VERIFY OTP CODE OR USERNAME DIRECTLY
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, code, manualUsername } = body;

    // Direct manual username login (for teachers who enter @username directly)
    if (manualUsername && manualUsername.trim()) {
      const cleanUsername = manualUsername.trim().replace(/^@/, '');
      const user = {
        username: `@${cleanUsername}`,
        telegram_id: `tg_${cleanUsername}`,
        first_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        last_name: 'Ustoz',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        provider: 'telegram' as const
      };

      if (sessionId && globalSessions.has(sessionId)) {
        const s = globalSessions.get(sessionId)!;
        s.authenticated = true;
        s.user = user;
      }

      return NextResponse.json({
        success: true,
        authenticated: true,
        user
      });
    }

    // OTP Code verification
    if (!sessionId || !code) {
      return NextResponse.json({ success: false, error: 'Session ID and Code required' }, { status: 400 });
    }

    const session = globalSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired. Please refresh QR code.' }, { status: 404 });
    }

    if (String(session.code).trim() === String(code).trim()) {
      const user = session.user || {
        username: `@Ustoz_${session.code}`,
        telegram_id: `tg_${session.code}`,
        first_name: 'Ustoz',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${session.code}`,
        provider: 'telegram' as const
      };

      session.authenticated = true;
      session.user = user;

      return NextResponse.json({
        success: true,
        authenticated: true,
        user
      });
    }

    return NextResponse.json({
      success: false,
      error: "Noto'g'ri tasdiqlash kodi kiritildi"
    }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
