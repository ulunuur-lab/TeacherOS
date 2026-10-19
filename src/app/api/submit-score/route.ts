import { NextRequest, NextResponse } from 'next/server';
import { recordSubmission } from '@/lib/db';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA';
const TEACHER_TELEGRAM_CHAT_ID = process.env.TEACHER_TELEGRAM_CHAT_ID || '6315515792';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      student_name,
      syllabus_level,
      topic_id,
      topic_title,
      score,
      total_questions,
      percent,
      mistakes
    } = body;

    if (!student_name || !syllabus_level || topic_id === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Record to Database (Supabase or Local DB)
    const dbResult = await recordSubmission({
      student_name: student_name.trim(),
      syllabus_level,
      topic_id: Number(topic_id),
      topic_title: topic_title || `Topic #${topic_id}`,
      score: Number(score) || 0,
      total_questions: Number(total_questions) || 0,
      percent: Number(percent) || 0,
      mistakes: Array.isArray(mistakes) ? mistakes : []
    });

    // 2. Dispatch Telegram notification to Teacher
    const badge = percent === 100 ? '🏆 <b>MUKAMMAL 100%!</b>' : (percent >= 80 ? '🎯 <b>YUQORI NATIJA</b>' : '⚠️ <b>QAYTA ISHLASH KERAK</b>');
    const msg = `🎓 <b>TEACHEROS • YANGI NATIJA</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>O'quvchi:</b> ${student_name}\n` +
      `📊 <b>Daraja:</b> ${syllabus_level}\n` +
      `📚 <b>Mavzu:</b> #${topic_id} ${topic_title}\n` +
      `🎯 <b>Natija:</b> <b>${score} / ${total_questions} (${percent}%)</b>\n` +
      `🎖️ <b>Status:</b> ${badge}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}\n` +
      `💾 <b>Baza:</b> ${dbResult.source === 'supabase' ? 'Cloud PostgreSQL' : 'Local Storage'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🤖 <i>TeacherOS Automation Engine</i>`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TEACHER_TELEGRAM_CHAT_ID,
        text: msg,
        parse_mode: 'HTML'
      })
    }).catch(err => console.error('Telegram alert failed:', err));

    return NextResponse.json({
      success: true,
      submission: dbResult.data,
      source: dbResult.source
    });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
