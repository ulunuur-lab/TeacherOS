import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = "8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA";
const APP_URL = process.env.APP_URL || "https://teacher-os-beryl.vercel.app";

async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("TG Send Error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      const from = update.message.from || {};
      const firstName = from.first_name || "O'quvchi";
      const username = from.username ? `@${from.username}` : "";

      const studentAppUrl = `${APP_URL}/student?tg_id=${chatId}&username=${encodeURIComponent(username)}&first_name=${encodeURIComponent(firstName)}`;

      // /start command
      if (text.startsWith("/start")) {
        await sendTelegramMessage(
          chatId,
          `Salom, <b>${firstName}</b>! 👋\n\n` +
          `🎓 <b>TeacherOS O'quvchi Ilovasiga xush kelibsiz!</b>\n\n` +
          `Bu yerda siz dars taqdimotlari, uyga vazifalar, interaktiv testlar va sun'iy intellekt repititoringiz (<b>Bezbet 🐱</b>) yordamida ingliz tilini o'rganishingiz mumkin.\n\n` +
          `Ilovani ochish uchun quyidagi tugmani bosing 👇`,
          {
            inline_keyboard: [
              [
                {
                  text: "🚀 O'quvchi Ilovasini Ochish",
                  web_app: { url: studentAppUrl },
                },
              ],
              [
                {
                  text: "🌐 Brauzerda Ochish",
                  url: studentAppUrl,
                },
              ],
            ],
          }
        );
        return NextResponse.json({ ok: true });
      }

      // Any other message
      await sendTelegramMessage(
        chatId,
        `Salom, <b>${firstName}</b>! 👋\n\n` +
        `TeacherOS O'quvchi Ilovasiga kirish uchun quyidagi tugmani bosing:`,
        {
          inline_keyboard: [
            [
              {
                text: "🚀 O'quvchi Ilovasini Ochish",
                web_app: { url: studentAppUrl },
              },
            ],
            [
              {
                text: "🌐 Brauzerda Ochish",
                url: studentAppUrl,
              },
            ],
          ],
        }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "TeacherOS Webhook Active", bot: "app_teacheros_bot" });
}
