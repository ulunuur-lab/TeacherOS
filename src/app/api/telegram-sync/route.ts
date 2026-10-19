import { NextResponse } from 'next/server';

const BOT_TOKEN = '8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, topic, level, length, slides, description, teacherName } = body;

    const targetChatId = chatId || '7957347033'; // Default teacher chat or authenticated teacher's telegram_id

    const slidesSummary = (slides || []).slice(0, 5).map((s: any, i: number) => {
      const cleanBody = (s.body || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      return `📌 <b>${i + 1}-Slayd: ${s.title || s.tag || 'Mavzu'}</b>\n<i>${cleanBody}...</i>`;
    }).join('\n\n');

    const messageText = 
      `🎓 <b>TEACHEROS • DARS TAQDIMOTI ARXIVI</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Ustoz:</b> ${teacherName || 'Ustoz'}\n` +
      `📖 <b>Mavzu:</b> <code>${topic || 'Ingliz tili'}</code>\n` +
      `🎯 <b>Daraja:</b> ${level || 'B1'} • <b>Davomiyligi:</b> ${length || 'medium'}\n` +
      `📝 <b>Tavsif:</b> ${description || 'Interaktiv dars'}\n\n` +
      `📚 <b>SLAYDLAR MAZMUNI:</b>\n\n` +
      `${slidesSummary}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ <i>Ushbu dars TeacherOS 2.0 orqali shaxsiy Telegram arxiviga saqlandi.</i>`;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    const result = await res.json();
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.description || 'Telegramga yuborib bo\'lmadi' }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId: result.result?.message_id });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
