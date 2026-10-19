import { NextRequest, NextResponse } from "next/server";

const DEFAULT_KEY_B64 = "QVEuQWI4Uk42S2lTVlB3ajBYM3ZCcUN3MnVIM21ONVFQdDAwZ0JpQ3V0ZFoydVh4b2I1U1E=";
function getGeminiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20) {
    return process.env.GEMINI_API_KEY;
  }
  return Buffer.from(DEFAULT_KEY_B64, "base64").toString("utf8");
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], topic = "General English", lang = "uz", imageBase64 } = await req.json();

    if (!message && !imageBase64) {
      return NextResponse.json({ error: "Message or image is required" }, { status: 400 });
    }

    const apiKey = getGeminiKey();

    const systemPrompt = `You are Bezbet — a brilliant, playful, witty, and exceptionally supportive AI tutor cat from the Smurfs universe (inspired by Azrael / Smurf cats).
You are the dedicated student AI assistant in the TeacherOS educational platform.
Your mission is to help English learners understand grammar, vocabulary, pronunciation, reading, and homework with crystal-clear explanations and encouragement.

Language instruction:
- If lang === "uz": Respond in friendly, natural, fluent Uzbek (with English examples and terms clearly highlighted).
- If lang === "ru": Respond in friendly, supportive Russian (with English examples).
- If lang === "en": Respond in clear, encouraging English suited for intermediate learners.

Tone & Personality:
- Warm, enthusiastic, slightly cat-like (occasional playful "Murr!", "Miyov!", or cat emojis 🐾🐱🐾, but always 100% helpful and pedagogically serious about English).
- Never give dry, robotic answers. Use bullet points, bold keywords, and short memorable examples.
- If the student asks about a grammar rule, give: (1) simple explanation, (2) 2 real-life examples, (3) a common trap to avoid, (4) a quick mini-challenge to test them!
- Current classroom topic context: "${topic}".`;

    // Build context summary from history
    let historyContext = "";
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      historyContext = recent
        .map((h: any) => `${h.sender === "user" ? "Student" : "Bezbet"}: ${h.text}`)
        .join("\n");
    }

    const fullUserPrompt = `${systemPrompt}

${historyContext ? `RECENT CONVERSATION:\n${historyContext}\n` : ""}
CURRENT STUDENT QUESTION:
"${message || "Explain this image or homework task"}"

Respond directly to the student as Bezbet the AI cat:`;

    const userParts: any[] = [{ text: fullUserPrompt }];
    if (imageBase64) {
      const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      userParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64
        }
      });
    }

    const models = [
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
      "gemini-3.1-flash-lite"
    ];

    let aiReply = "";
    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 16000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: "user", parts: userParts }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            aiReply = text.trim();
            break;
          }
        }
      } catch (err) {
        console.warn(`[Gemini tutor ${model}] error:`, err);
      }
    }

    if (!aiReply) {
      aiReply = lang === "en"
        ? "Purr! I'm here to help you with your English lessons. Ask me any question about grammar, vocabulary, or your current homework!"
        : lang === "ru"
        ? "Мяу! Я здесь, чтобы помочь тебе с английским языком. Задавай любой вопрос по грамматике или домашнему заданию!"
        : "Miyov! Men har doim darslaringizda yordamga tayyorman. Grammatika qoidalari, so'zlar ma'nosi yoki uyga vazifangiz bo'yicha istalgan savolingizni bering! 🐾";
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error: any) {
    console.error("Student tutor error:", error);
    return NextResponse.json({
      reply: "Miyov! Hozir ulanishda biroz uzilish bo'ldi, lekin men yoningizdaman. Savolingizni qayta yuboring! 🐾"
    });
  }
}
