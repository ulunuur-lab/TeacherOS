import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_AUTH_BOT_TOKEN || '8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myedysrfbijtgttxnhhq.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_47gY7ucKybitgovW_2pEPw_c6fB8djL';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    let isValid = false;

    // Telegram HMAC verification
    if (hash && auth_date) {
      try {
        const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
        const checkArr = Object.keys(data)
          .filter((k) => k !== 'hash' && data[k] !== undefined && data[k] !== null)
          .sort()
          .map((k) => `${k}=${data[k]}`);
        const checkString = checkArr.join('\n');
        const calculatedHmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
        isValid = calculatedHmac === hash;
      } catch (e) {
        console.warn('HMAC validation error:', e);
      }
    } else {
      // Direct WebApp or simulation
      isValid = true;
    }

    const displayName = username ? `@${username}` : [first_name, last_name].filter(Boolean).join(' ') || `User_${id}`;

    const userProfile = {
      telegram_id: String(id),
      name: displayName,
      first_name: first_name || '',
      last_name: last_name || '',
      username: username || '',
      avatar_url: photo_url || '',
      credits: 3,
      role: username === 'Ulugb7k' || username === 'ulugbekflex' ? 'teacher' : 'student',
      created_at: new Date().toISOString(),
    };

    // Attempt saving to Supabase if table exists
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/telegram_users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: Number(id),
          first_name: first_name || '',
          last_name: last_name || '',
          username: username || '',
          photo_url: photo_url || '',
          role: userProfile.role,
          credits: userProfile.credits,
          last_login: new Date().toISOString()
        })
      });
    } catch (dbErr) {
      console.warn('Supabase profile sync skipped (table will auto-sync):', dbErr);
    }

    return NextResponse.json({
      success: true,
      verified: isValid,
      user: userProfile
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Telegram auth failed' },
      { status: 500 }
    );
  }
}
