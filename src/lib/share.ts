import LZString from "lz-string";
import { Curriculum } from "./types";

export const DEFAULT_TELEGRAM_BOT_TOKEN = "8664328884:AAED3moTd05id_VJb1Op6ose-F0z_8AAAuA";
export const DEFAULT_TEACHER_CHAT_ID = "6315515792"; // Ulugbek's Telegram ID

/**
 * Compresses curriculum into a URL-safe hash string
 */
export function compressCurriculumToHash(curriculum: Curriculum): string {
  try {
    const json = JSON.stringify(curriculum);
    return LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("Compression error:", err);
    return "";
  }
}

/**
 * Decompresses curriculum from URL-safe hash string
 */
export function decompressCurriculumFromHash(hash: string): Curriculum | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    return JSON.parse(json);
  } catch (err) {
    console.error("Decompression error:", err);
    return null;
  }
}

/**
 * Dispatches student submission directly to Telegram (Zero DB, Zero Server Cost)
 */
export async function dispatchSubmissionToTelegram(
  studentName: string,
  topic: string,
  score: number,
  total: number,
  details: string,
  botToken: string = DEFAULT_TELEGRAM_BOT_TOKEN,
  chatId: string = DEFAULT_TEACHER_CHAT_ID
): Promise<boolean> {
  const percent = total > 0 ? Math.round((score / total) * 100) : 100;
  const statusEmoji = percent >= 80 ? "🏆" : percent >= 60 ? "⚡" : "📚";

  const messageText = `
${statusEmoji} <b>YANGI VAZIFA TOPSHIRILDI (TeacherOS)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>O'quvchi:</b> ${studentName}
📖 <b>Mavzu:</b> ${topic}
🎯 <b>Natija:</b> ${score} / ${total} (${percent}%)
⏰ <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}

📝 <b>HISOBOT & JAVOBLAR:</b>
${details}
━━━━━━━━━━━━━━━━━━━━
<i>TeacherOS Zero-Database Engine orqali yuborildi</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML"
      })
    });
    return res.ok;
  } catch (e) {
    console.error("Telegram send failed:", e);
    return false;
  }
}

/**
 * Generates an offline standalone HTML file that works anywhere without internet/database!
 */
export function generateStandaloneHtml(curriculum: Curriculum): string {
  const curriculumJson = JSON.stringify(curriculum).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${curriculum.topic} — TeacherOS O'quvchi Portali</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    :root {
      --bg: #080b14;
      --card: #0f172a;
      --primary: #6366f1;
      --emerald: #10b981;
      --rose: #ef4444;
      --border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.4); margin-bottom: 8px; }
    h1 { font-size: 26px; font-weight: 800; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 24px; margin-bottom: 20px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; width: 100%; box-shadow: 0 10px 25px -5px rgba(99,102,241,0.4); }
    .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
    .quiz-opt { padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); margin-top: 8px; cursor: pointer; font-size: 14px; transition: 0.2s; }
    .quiz-opt:hover { border-color: var(--primary); }
    .quiz-opt.selected { background: rgba(99,102,241,0.2); border-color: var(--primary); color: white; }
    .quiz-opt.correct { background: rgba(16,185,129,0.2); border-color: var(--emerald); color: #34d399; }
    .quiz-opt.incorrect { background: rgba(239,68,68,0.2); border-color: var(--rose); color: #f87171; }
    input[type="text"] { width: 100%; padding: 14px; border-radius: 12px; background: #0b1120; border: 1px solid var(--border); color: white; font-size: 15px; margin-top: 8px; margin-bottom: 16px; }
    .audio-btn { background: #1e293b; border: none; color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
    .audio-btn:hover { background: var(--primary); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${curriculum.level} • TeacherOS Darslik</div>
      <h1>${curriculum.topic}</h1>
      <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Ushbu darslik va vazifa offline ham to'liq ishlaydi</p>
    </div>

    <!-- Student Name Input -->
    <div class="card">
      <label style="font-weight: 700; font-size: 14px;">Ism va Familiyangizni kiriting:</label>
      <input type="text" id="studentName" placeholder="Masalan: Shaxzoda Olimova">
      <p style="color: var(--text-muted); font-size: 12px;">Topshirgan natijangiz ustozingizning Telegram botiga avtomatik yuboriladi.</p>
    </div>

    <!-- Quiz Section -->
    <div class="card" id="quizContainer">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">🎯 Test Mashqlari</h3>
      <div id="quizItems"></div>
    </div>

    <!-- Submit Section -->
    <div class="card" style="text-align: center;">
      <button class="btn btn-primary" id="btnSubmit" onclick="submitWork()">
        <span>🚀 Ustozga Topshirish (Telegram)</span>
      </button>
      <div id="submitResult" style="margin-top: 14px; font-size: 14px; font-weight: 600;"></div>
    </div>
  </div>

  <script>
    const CURRICULUM = ${curriculumJson};
    let userAnswers = {};

    function renderQuiz() {
      const cont = document.getElementById('quizItems');
      cont.innerHTML = '';
      (CURRICULUM.quiz || []).forEach((q, idx) => {
        const item = document.createElement('div');
        item.style.marginBottom = '20px';
        item.innerHTML = '<p style="font-weight:600; font-size:15px;">' + (idx+1) + '. ' + q.q + '</p>';
        q.opts.forEach(opt => {
          const optDiv = document.createElement('div');
          optDiv.className = 'quiz-opt';
          optDiv.innerText = opt;
          optDiv.onclick = () => {
            userAnswers[idx] = opt;
            Array.from(item.getElementsByClassName('quiz-opt')).forEach(el => el.classList.remove('selected'));
            optDiv.classList.add('selected');
          };
          item.appendChild(optDiv);
        });
        cont.appendChild(item);
      });
    }

    async function submitWork() {
      const name = document.getElementById('studentName').value.trim();
      if (!name) {
        alert("Iltimos, avval ismingizni kiriting!");
        return;
      }
      let correct = 0;
      let total = (CURRICULUM.quiz || []).length;
      let report = '';

      (CURRICULUM.quiz || []).forEach((q, idx) => {
        const userAns = userAnswers[idx] || "Javob berilmadi";
        const isRight = userAns === q.ans;
        if (isRight) correct++;
        report += (idx+1) + '. ' + q.q + '\\n' + (isRight ? '✅ ' : '❌ ') + userAns + '\\n\\n';
      });

      const btn = document.getElementById('btnSubmit');
      btn.disabled = true;
      btn.innerText = "Yuborilmoqda...";

      const token = "${DEFAULT_TELEGRAM_BOT_TOKEN}";
      const chatId = "${DEFAULT_TEACHER_CHAT_ID}";
      const percent = Math.round((correct / total) * 100);

      const text = '🏆 <b>YANGI VAZIFA TOPSHIRILDI</b>\\n👤 <b>O\\'quvchi:</b> ' + name + '\\n📖 <b>Mavzu:</b> ' + CURRICULUM.topic + '\\n🎯 <b>Natija:</b> ' + correct + '/' + total + ' (' + percent + '%)\\n\\n' + report;

      try {
        const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
        });
        if (res.ok) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          document.getElementById('submitResult').innerHTML = '<span style="color:#10b981;">🎉 Ajoyib! Natijangiz ustozingizga yetkazildi (' + correct + '/' + total + ').</span>';
          btn.innerText = "✅ Muvaffaqiyatli topshirildi";
        } else {
          throw new Error("Telegram xatolik");
        }
      } catch (e) {
        document.getElementById('submitResult').innerHTML = '<span style="color:#ef4444;">❌ Internet ulanishini tekshiring yoki ustozingizga xabar bering.</span>';
        btn.disabled = false;
        btn.innerText = "Qayta urinish";
      }
    }

    renderQuiz();
  </script>
</body>
</html>`;
}
