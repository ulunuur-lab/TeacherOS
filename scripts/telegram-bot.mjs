// ====================================================================
// TeacherOS Student Bot Runner (Permanent Resilient Long Polling)
// Bot: @app_teacheros_bot
// Token: 8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA
// ====================================================================

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception caught safely:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection caught safely:', reason);
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA';
const APP_URL = process.env.APP_URL || 'https://teacher-os-beryl.vercel.app';

console.log(`🤖 Starting TeacherOS Student Bot with token: ${BOT_TOKEN.slice(0, 10)}...`);
console.log(`🔗 Target Student WebApp URL: ${APP_URL}/student`);

// Configure Bot Menu Button & Info
async function initBotConfig() {
  try {
    // 1. Set Chat Menu Button to open Mini App directly from bottom-left button in Telegram
    const menuRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: "O'quvchi Ilovasi 📱",
          web_app: { url: `${APP_URL}/student` }
        }
      })
    });
    const menuData = await menuRes.json();
    console.log('📌 Chat Menu Button configured:', menuData.ok ? 'SUCCESS' : menuData.description);

    // 2. Set description
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: "TeacherOS O'quvchilar Ilovasi 🎓\n\nIngliz tili darslari, interaktiv mashqlar, uyga vazifalar va sun'iy intellekt repititori (Bezbet 🐱)."
      })
    });

    // 3. Clear webhook to allow long polling
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: false })
    });
    console.log('✅ Webhook cleared, ready for instant permanent long polling');
  } catch (err) {
    console.error('⚠️ Bot initialization warning:', err.message);
  }
}

// Send Telegram Message Helper
async function sendTelegramMessage(chatId, text, replyMarkup) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error(`❌ Failed to send message to ${chatId}:`, err.message);
  }
}

// Main Polling Loop
let offset = 0;
async function pollUpdates() {
  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=20`, {
        cache: 'no-store'
      });
      const data = await res.json();

      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          const msg = update.message;
          if (!msg || !msg.chat) continue;

          const chatId = msg.chat.id;
          const text = (msg.text || '').trim();
          const from = msg.from || {};
          const firstName = from.first_name || "O'quvchi";
          const username = from.username ? `@${from.username}` : '';

          console.log(`📩 Incoming message from ${firstName} (${chatId}): "${text}"`);

          const studentAppUrl = `${APP_URL}/student?tg_id=${chatId}&username=${encodeURIComponent(username)}&first_name=${encodeURIComponent(firstName)}`;

          // Student Welcome & Mini App Open Button
          const welcomeMessage = 
            `Salom, <b>${firstName}</b>! 👋\n\n` +
            `🎓 <b>TeacherOS O'quvchi Ilovasiga xush kelibsiz!</b>\n\n` +
            `Bu yerda siz dars taqdimotlari, uyga vazifalar, interaktiv testlar va sun'iy intellekt repititoringiz (<b>Bezbet 🐱</b>) yordamida ingliz tilini o'rganishingiz mumkin.\n\n` +
            `<i>(Ustozlar platformadan veb orqali foydalanadilar)</i>\n\n` +
            `Ilovani ochish uchun quyidagi tugmani bosing 👇`;

          const keyboard = {
            inline_keyboard: [
              [
                {
                  text: "🚀 O'quvchi Ilovasini Ochish",
                  web_app: { url: studentAppUrl }
                }
              ],
              [
                {
                  text: "🌐 Brauzer orqali kirish",
                  url: studentAppUrl
                }
              ]
            ]
          };

          const sent = await sendTelegramMessage(chatId, welcomeMessage, keyboard);
          console.log(`📤 Sent response to ${firstName} (${chatId}):`, sent?.ok ? 'SUCCESS' : sent?.description);
        }
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (err) {
      console.warn('⚠️ Telegram polling reconnecting:', err?.message || 'network timeout');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// Start
initBotConfig().then(() => {
  console.log('⚡ Telegram Bot is actively listening permanently for student /start commands...');
  pollUpdates();
});
