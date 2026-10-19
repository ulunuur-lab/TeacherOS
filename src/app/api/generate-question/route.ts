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
    const body = await req.json();
    const {
      topic = "English Grammar",
      level = "B1",
      type = "test",
      existingCount = 5
    } = body;

    const apiKey = getGeminiKey();
    const itemNumber = Number(existingCount) + 1;

    const typeInstructions: Record<string, string> = {
      test: `Generate 1 new Multiple Choice Quiz Question about "${topic}" (Question #${itemNumber}).
Output JSON schema:
{
  "q": "Clear question text?",
  "opts": ["Option A", "Option B", "Option C", "Option D"],
  "ans": "The exact correct option string",
  "expl": "Pedagogical explanation in natural Uzbek"
}`,
      quickQuestion: `Generate 1 new Quick Check Question about "${topic}" (Question #${itemNumber}).
Output JSON schema:
{
  "id": "qq${itemNumber}",
  "q": "Direct concept-checking question?",
  "opts": ["Option A", "Option B", "Option C"],
  "ans": "The exact correct option string",
  "expl": "Explanation in Uzbek"
}`,
      vocab: `Generate 1 new essential vocabulary/keyword card specifically related to "${topic}" (Word #${itemNumber}).
Output JSON schema:
{
  "word": "English word or phrasal verb",
  "pos": "verb | noun | adjective | adverb | preposition",
  "uz": "O'zbekcha tarjimasi",
  "ex": "Natural example sentence in English",
  "hint": "Usage hint in Uzbek"
}`,
      errorHunt: `Generate 1 new Spot-the-Mistake exercise specifically about "${topic}" (Mistake #${itemNumber}).
The sentence MUST contain an authentic error typical for learners.
Output JSON schema:
{
  "id": "eh${itemNumber}",
  "sentence": "English sentence containing the mistake",
  "errorWord": "the exact wrong word or phrase in the sentence",
  "correction": "correct form",
  "explanation": "Clear explanation in Uzbek of why it is wrong and how to fix it"
}`,
      dialog: `Generate 1 new conversation turn between Teacher and Student about "${topic}" (Turn #${itemNumber}).
Output JSON schema:
{
  "speaker": "Teacher (Aziz)" or "Student (Jasur)",
  "role": "teacher" or "student",
  "text": "English line",
  "uz": "O'zbekcha tarjimasi",
  "userOptions": ["Interactive response option 1", "Interactive response option 2"],
  "correctOption": "The pedagogically best option"
}`,
      slide: `Generate 1 new presentation slide about "${topic}" (Slide #${itemNumber}).
Output JSON schema:
{
  "id": "s${itemNumber}",
  "tag": "${itemNumber}. QO'SHIMCHA STRUKTURA",
  "title": "Slide title in Uzbek",
  "body": "• <b>Asosiy qoida:</b> Detail in Uzbek.<br>• <b>Misol:</b> <i>'Authentic English sentence.'</i> ✅<br><div style='margin-top:8px; padding:8px 12px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.85rem;'>💡 <b>O'zbekcha izoh:</b> Practical tip.</div>"
}`,
      fillGap: `Generate 1 new Fill-in-the-Blank sentence about "${topic}" (Item #${itemNumber}).
Output JSON schema:
{
  "id": "fg${itemNumber}",
  "sentenceBefore": "Beginning of sentence",
  "blank": "______",
  "sentenceAfter": "Rest of sentence",
  "options": ["opt1", "opt2", "opt3"],
  "correct": "opt1",
  "uzbekHint": "Hint in Uzbek"
}`
    };

    const instruction = typeInstructions[type] || typeInstructions.test;

    const prompt = `You are a Cambridge certified ESL assessment specialist and master Uzbek educator.
Create 1 HIGH-QUALITY, PEDAGOGICALLY RIGOROUS additional educational item for:
Topic: "${topic}"
CEFR Level: "${level}"
Item Type: "${type}"
Item Number: #${itemNumber}

CRITICAL QUALITY REQUIREMENTS:
1. NON-TRIVIAL: Do NOT create overly simple or obvious questions. It must genuinely test the student's mastery of "${topic}", especially tricky edge cases, time markers, or common Uzbek learner traps.
2. UNIQUENESS: This is item #${itemNumber}. It must be completely DISTINCT in concept, vocabulary, and sentence structure from previous questions.
3. INSTRUCTION FOR "${type}":
${instruction}

RULES:
1. Return ONLY the strict, valid JSON object for this single item.
2. No markdown code blocks, no other text.
3. All explanations, hints, and descriptions must be in natural, insightful Uzbek.
4. All English sentences must be modern and authentic.`;

    const modelsToTry = [
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
      "gemini-3.1-flash-lite"
    ];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.65,
              responseMimeType: "application/json"
            }
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
            const parsed = JSON.parse(clean);
            return NextResponse.json({ success: true, item: parsed });
          }
        }
      } catch (e) {
        console.warn(`[Generate Question API] ${model} failed, trying next:`, e);
      }
    }

    // Fallback item synthesis if Gemini API is temporarily offline (varied by num)
    const fallbackItem = createFallbackItem(topic, type, itemNumber);
    return NextResponse.json({ success: true, item: fallbackItem, fallback: true });
  } catch (error: any) {
    console.error("Generate Question error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate item" },
      { status: 500 }
    );
  }
}

function createFallbackItem(topic: string, type: string, num: number) {
  const norm = topic.toLowerCase();
  const isPrep = norm.includes("preposition") || norm.includes("in on at");
  const isPast = norm.includes("past") || norm.includes("continuous");
  const isModal = norm.includes("modal") || norm.includes("regret") || norm.includes("criticism");
  const variant = (num % 3);

  switch (type) {
    case "test":
      if (variant === 0) {
        return {
          q: isModal
            ? `Qaysi gapda o'tgan zamondagi xatoni tanqid qilish (criticism) to'g'ri berilgan?`
            : isPast
            ? `Qaysi gapda to'satdan bo'lgan harakat (interruption) to'g'ri ifodalangan?`
            : `${topic} bo'yicha #${num}-savol: Qaysi gapda qoida to'liq va xatosiz qo'llangan?`,
          opts: [
            isModal ? "You should have listened to the teacher's instructions." : isPast ? "I was studying when the lights suddenly went out." : `She has been working here since last year.`,
            isModal ? "You should have listen to the teacher." : isPast ? "I was studying when the lights was going out." : `She is working here since last year.`,
            isModal ? "You should listened to the instructions." : isPast ? "I studied when the lights were going out." : `She has worked here ago one year.`,
            isModal ? "You must have listen yesterday." : isPast ? "I had study while the lights go out." : `She works here since yesterday.`
          ],
          ans: isModal ? "You should have listened to the teacher's instructions." : isPast ? "I was studying when the lights suddenly went out." : `She has been working here since last year.`,
          expl: isModal ? "'should have + V3' — o'tmishdagi afsus yoki tanqid uchun qo'llaniladi." : isPast ? "Davomiy harakat (was studying) va to'satdan bo'lgan harakat (went out)." : "Vaqt ko'rsatkichi bilan to'g'ri grammatik shakl."
        };
      } else if (variant === 1) {
        return {
          q: isModal
            ? `Nuqtalar o'rnini to'ldiring: "I'm so sorry, I ____________ (call) you, but my phone died."`
            : `${topic} bo'yicha #${num}-amaliy sinov: Gapdagi grammatik bo'shliqni to'ldiring.`,
          opts: [
            isModal ? "should have called" : "have already sent",
            isModal ? "should call" : "already sent",
            isModal ? "had called" : "have send",
            isModal ? "must call" : "had send"
          ],
          ans: isModal ? "should have called" : "have already sent",
          expl: isModal ? "Afsus bildirish uchun: should have + V3 ('called')." : "Zamonning to'g'ri yordamchi fe'l va V3 shakli."
        };
      } else {
        return {
          q: `Quyidagi variantlardan qaysi birida O'ZBEKCHA QOPQON (odatiy xato) mavjud?`,
          opts: [
            isModal ? "I shouldn't have bought this expensive jacket. (Afsus)" : "She visited London last week. (To'g'ri)",
            isModal ? "I didn't should buy this jacket. (Xato)" : "She has visited London last week. (Xato)",
            isModal ? "You could have helped him. (Imkoniyat bor edi)" : "She was working when I called. (To'g'ri)",
            isModal ? "We might have arrived on time. (Ehtimol)" : "She had finished before noon. (To'g'ri)"
          ],
          ans: isModal ? "I didn't should buy this jacket. (Xato)" : "She has visited London last week. (Xato)",
          expl: isModal ? "Modal fe'llarning o'tmishdagi inkori 'shouldn't have + V3' bo'ladi, 'didn't should' mutlaqo xato!" : "'last week' aniq o'tgan vaqt bilan Present Perfect emas, Past Simple ishlatiladi!"
        };
      }

    case "quickQuestion":
      if (variant === 0) {
        return {
          id: `qq${num}`,
          q: isModal
            ? `O'tmishdagi ishdan afsuslanish formulasini ko'rsating:`
            : `${topic} bo'yicha #${num}-savol: Asosiy modelni tanlang:`,
          opts: [
            isModal ? "Subject + should have + V3" : "have/has + V3",
            isModal ? "Subject + should + V1" : "did + V2",
            isModal ? "Subject + had should + V3" : "had + V1"
          ],
          ans: isModal ? "Subject + should have + V3" : "have/has + V3",
          expl: isModal ? "'should have + V3' — o'tmishdagi afsus ifodasi." : "To'g'ri formula modeli."
        };
      } else if (variant === 1) {
        return {
          id: `qq${num}`,
          q: isModal
            ? `"He shouldn't have driven so fast" jumlasi nimani anglatadi?`
            : `${topic} doirasida qaysi vaqt signali bilan ishlatiladi?`,
          opts: [
            isModal ? "U tez haydadi va bu noto'g'ri edi (Tanqid)" : "since / for",
            isModal ? "U hozir tez haydamasligi kerak" : "yesterday / ago",
            isModal ? "U kelajakda tez haydamaydi" : "tomorrow / soon"
          ],
          ans: isModal ? "U tez haydadi va bu noto'g'ri edi (Tanqid)" : "since / for",
          expl: isModal ? "O'tgan ish bo'yicha norozilik va tanqid." : "Zamonning xos signal so'zi."
        };
      } else {
        return {
          id: `qq${num}`,
          q: `Ushbu qoidaning eng nozik jihati nimada?`,
          opts: [
            "Harakat sodir bo'lgan yoki bo'lmaganligi faktiga e'tibor berish",
            "Faqat so'zma-so'z tarjima qilish",
            "Yordamchi fe'lni tushirib qoldirish"
          ],
          ans: "Harakat sodir bo'lgan yoki bo'lmaganligi faktiga e'tibor berish",
          expl: "Kontekst va mantiqiy ma'no eng muhim mezon hisoblanadi."
        };
      }

    case "vocab":
      const vocabList = [
        { word: "regret", pos: "verb", uz: "afsuslanmoq", ex: "I deeply regret not taking that chance.", hint: "O'tmishdagi ishdan pushaymonlik" },
        { word: "criticize", pos: "verb", uz: "tanqid qilmoq", ex: "She criticized his careless decision.", hint: "Birovning xatosiga e'tiroz bildirish" },
        { word: "blame", pos: "verb", uz: "ayblamoq", ex: "Don't blame yourself for what happened.", hint: "Mas'uliyatni birovga yuklash" },
        { word: "consequence", pos: "noun", uz: "oqibat, natija", ex: "Every wrong choice has consequences.", hint: "Qilingan ishning keyingi ta'siri" }
      ];
      const selectedVocab = vocabList[num % vocabList.length];
      return {
        word: selectedVocab.word,
        pos: selectedVocab.pos,
        uz: selectedVocab.uz,
        ex: selectedVocab.ex,
        hint: selectedVocab.hint
      };

    case "errorHunt":
      const errors = [
        { sentence: "You should have tell me earlier.", errorWord: "tell", correction: "told", explanation: "'should have' dan keyin fe'l V3 (told) shaklida bo'lishi shart!" },
        { sentence: "I shouldn't bought that car yesterday.", errorWord: "bought", correction: "have bought", explanation: "O'tgan zamon afsusi uchun 'shouldn't have + V3' ishlatiladi ('have' tushib qolgan)!" },
        { sentence: "She did not should have gone there alone.", errorWord: "did not should", correction: "should not", explanation: "Modal fe'llar inkorida 'did not' ishlatilmaydi, 'should not have' to'g'ri!" }
      ];
      const selectedErr = errors[num % errors.length];
      return {
        id: `eh${num}`,
        sentence: selectedErr.sentence,
        errorWord: selectedErr.errorWord,
        correction: selectedErr.correction,
        explanation: selectedErr.explanation
      };

    case "dialog":
      return {
        speaker: num % 2 === 0 ? "Teacher (Aziz)" : "Student (Jasur)",
        role: num % 2 === 0 ? "teacher" : "student",
        text: num % 2 === 0
          ? `How would you advise a friend who failed an exam because they didn't study?`
          : `I would say: 'You should have reviewed the topics every day!'`,
        uz: num % 2 === 0
          ? `Dars qilmagani uchun imtihondan yiqilgan do'stingizga qanday tanqid/maslahat berasiz?`
          : `Men aytgan bo'lardim: 'Har kuni mavzularni takrorlashing kerak edi!'`,
        userOptions: [
          "You should have reviewed the topics every day!",
          "You should review tomorrow."
        ],
        correctOption: "You should have reviewed the topics every day!"
      };

    case "slide":
      return {
        id: `s${num}`,
        tag: `${num}. AMALIY CHUQURLASHTIRISH`,
        title: `${topic} — #${num}-Chuqur Tahlil`,
        body: `• <b>Qo'shimcha nozik nuqta:</b> O'quvchilarga ushbu grammatik qoida real dialoglarda qanday jaranglashini ko'rsating.<br>• <b>Namunaviy jumla:</b> <i>'We should have booked the tickets earlier.'</i> ✅<br><div style='margin-top:8px; padding:8px 12px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.85rem;'>💡 <b>Pedagogik usul:</b> Ushbu jumlani sinfda o'quvchilar bilan turli ohanglarda takrorlang.</div>`
      };

    default:
      return {
        q: `${topic} yangi savol #${num}?`,
        opts: ["Variant A", "Variant B", "Variant C", "Variant D"],
        ans: "Variant A",
        expl: "To'g'ri tushuntirish."
      };
  }
}
