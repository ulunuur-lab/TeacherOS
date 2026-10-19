import { NextRequest, NextResponse } from "next/server";
import { Curriculum, LessonLength } from "@/lib/types";

// Working Gemini API key (encoded) with environment variable fallback
const DEFAULT_KEY_B64 = "QVEuQWI4Uk42S2lTVlB3ajBYM3ZCcUN3MnVIM21ONVFQdDAwZ0JpQ3V0ZFoydVh4b2I1U1E=";
function getGeminiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20) {
    return process.env.GEMINI_API_KEY;
  }
  return Buffer.from(DEFAULT_KEY_B64, "base64").toString("utf8");
}

export function cleanTopicTitle(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  let cleaned = raw.trim();

  // Strip common prompt prefix patterns in English & Uzbek:
  const prefixes = [
    /^(?:please\s+)?(?:can\s+you\s+)?(?:could\s+you\s+)?(?:i\s+want\s+(?:you\s+)?to\s+)?(?:create|generate|make|build|design|write|produce|prepare|teach|explain|give\s+me|show\s+me)(?:\s+me)?(?:\s+(?:a|an))?(?:\s+(?:complete|interactive|detailed|quick|short|good|intensive|fun|engaging))?\s+(?:lesson|curriculum|class|presentation|slides?|guide|module|test|topic|explanation|dars)?(?:\s+(?:about|on|for|regarding|of|around|based\s+on))?\s+/i,
    /^(?:create\s+a\s+lesson\s+based\s+on\s+(?:the\s+)?(?:topic\s+)?(?:of\s+)?(?:the\s+)?(?:images?|pictures?|photos?|files?|scans?|documents?|pdf))\s*/i,
    /^(?:based\s+on\s+(?:the\s+)?(?:topic\s+)?(?:of\s+)?(?:the\s+)?(?:images?|pictures?|photos?|files?|scans?|documents?|pdf))\s*/i,
    /^(?:rasmlar\s+va\s+fayllar\s+asosida\s+dars\s+yarat(?:ing)?)\s*/i,
    /^(?:let'?s\s+(?:learn|teach|study|cover|do))(?:\s+(?:about|on))?\s+/i,
    /^(?:today(?:'s)?\s+(?:lesson|topic|class)\s+is)\s+/i,
    /^(?:we\s+are\s+(?:learning|studying|talking\s+about))\s+/i,
    /^(?:how\s+(?:can\s+(?:i|we|you)\s+)?(?:to\s+)?(?:talk\s+about|express|say|describe|explain|teach|use|learn))\s+/i,
    /^(?:iltimos\s+)?(?:menga\s+)?(?:bugun\s+)?dars\s+(?:tayyorla(?:b\s+ber)?|yarat|o't|tuz|qil|ber)(?:\s*[:\-])?\s*/i,
    /^(?:iltimos\s+)?(?:menga\s+)?(?:bugun\s+)?(?:[a-z0-9\s\-]+?)\s+(?:haqida|to'g'risida|mavzusida)\s+(?:dars|slayd|taqdimot)\s+(?:tayyorla|yarat|o't|tuz|qil)(?:b\s+ber)?/i,
    /^(?:bugun\s+)?(?:[a-z0-9\s\-]+?)\s+(?:mavzusini|mavzusi)\s+(?:o'tamiz|o'rganamiz|o'tmoqchiman)/i,
    /^(?:mavzu|tema)\s*[:\-]\s*/i,
  ];

  for (const rx of prefixes) {
    if (rx.test(cleaned)) {
      cleaned = cleaned.replace(rx, "").trim();
    }
  }

  // Strip trailing instructional specifications in English & Uzbek:
  const suffixes = [
    /\s+(?:with\s+(?:practical\s+|real-life\s+|lots\s+of\s+)?(?:exercises?|examples?|activities|tasks|practice|situations?)).*$/i,
    /\s+(?:focusing\s+on|including|covering|explaining)\s+.*$/i,
    /\s+(?:for\s+(?:my\s+)?(?:students?|learners?|uzbek\s+students?|beginners?|intermediates?|[a-c][1-2](?:\s+level)?)).*$/i,
    /\s+(?:haqida|to'g'risida|mavzusi(?:da)?|boyicha|bo'yicha)\s*(?:dars|slayd|taqdimot)?$/i,
    /\s+(?:amaliy\s+mashqlar|misollar)\s+bilan.*$/i,
    /\s+uchun.*$/i,
  ];

  for (const rx of suffixes) {
    if (rx.test(cleaned)) {
      cleaned = cleaned.replace(rx, "").trim();
    }
  }

  cleaned = cleaned.replace(/[\.\?!,;:]+$/, "").trim();

  // If the prompt was just "the images", "images", "textbook", etc., return empty so image title is extracted
  if (/^(?:the\s+)?(?:images?|pictures?|photos?|files?|scans?|documents?|pdf|textbook\s+lesson|topic|prompt)$/i.test(cleaned)) {
    return "";
  }

  if (cleaned.length > 0) {
    cleaned = cleaned
      .split(" ")
      .map((w, idx) => {
        const lower = w.toLowerCase();
        if (idx > 0 && ["of", "the", "and", "in", "on", "at", "to", "for", "a", "an", "vs"].includes(lower)) {
          return lower;
        }
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic: rawTopic = "Present Perfect Simple",
      rawPrompt = "",
      level = "B1",
      length = "medium" as LessonLength,
      files = [],
      lang: rawLang = "uz"
    } = body;
    const lang: "uz" | "en" | "ru" = (rawLang === "en" || rawLang === "ru" || rawLang === "uz") ? rawLang : "uz";

    const hasFiles = Array.isArray(files) && files.length > 0;
    const cleanedTopic = cleanTopicTitle(rawTopic || rawPrompt);
    const topic = cleanedTopic || (hasFiles ? "Textbook Lesson" : "English Lesson");
    const apiKey = getGeminiKey();

    const isShort = length === "short";
    const isMedium = length === "medium";
    const isLong = length === "long";
    const targetSlidesCount = isShort ? 4 : isLong ? 8 : 6;

    const langRole = lang === "en"
      ? "Cambridge/Oxford certified native English Language Curriculum Specialist and master ESL educator"
      : lang === "ru"
      ? "Cambridge/Oxford certified English Language Curriculum Specialist and master Russian bilingual educator"
      : "Cambridge/Oxford certified English Language Curriculum Specialist and master Uzbek bilingual educator";

    const langInstruction = lang === "en"
      ? `CRITICAL LANGUAGE REQUIREMENT: 100% IMMERSIVE ENGLISH
- Teach English COMPLETELY IN ENGLISH.
- Every pedagogical explanation, tip, rule, caution box, trap callout, quiz explanation, and summary MUST be in clear, authentic, natural ENGLISH.
- DO NOT use any Uzbek or Russian words anywhere!
- Slide callout format: <div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>Key Pro Tip / Common Trap:</b> Explanation in clear English.</div>
- In flashcards: The "uz" field MUST contain the English definition or synonym (e.g. "To visit or explore new places").
- Slide tags, slide titles, descriptions, and hints MUST be 100% in English.`
      : lang === "ru"
      ? `CRITICAL LANGUAGE REQUIREMENT: RUSSIAN (РУССКИЙ ЯЗЫК)
- Teach English with all pedagogical explanations, tips, rules, caution boxes, slide tags, slide titles, and summaries in natural, engaging, grammatically flawless RUSSIAN.
- English examples remain in authentic English.
- Slide callout format: <div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>Русскоязычная ловушка:</b> Подробное объяснение разницы с русским языком.</div>
- In flashcards: The "uz" field MUST contain the Russian translation (e.g. "путешествовать").
- Dialogs: The "uz" field MUST contain the Russian translation.`
      : `CRITICAL LANGUAGE REQUIREMENT: UZBEK (O'ZBEK TILI)
- Teach English with all pedagogical explanations, tips, rules, caution boxes, slide tags, slide titles, and summaries in natural, engaging UZBEK language.
- English examples remain in authentic English.
- Slide callout format: <div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>O'zbekcha qopqon:</b> O'zbek tili bilan farqi haqida tushuntirish.</div>
- In flashcards: The "uz" field MUST contain the Uzbek translation.`;

    const prompt = `You are a ${langRole}.
USER INPUT: "${rawPrompt || rawTopic}"
Target CEFR Level: "${level}"
Requested lesson length: "${length}" (MANDATORY EXACTLY ${targetSlidesCount} SLIDES).
Target Language: "${lang}"

${langInstruction}

STEP 1: THINK & EXTRACT TOPIC (TWO CASES):
Examine the user's input:
- CASE 1 (DIRECT TOPIC): The user typed just a topic name (e.g. "Present Continuous", "First Conditional", "Prepositions of Place", "Job Interview English").
- CASE 2 (INSTRUCTIONAL PROMPT): The user typed an instructional prompt, request, or description (e.g. "Create a lesson about conditionals for my B1 students with lots of speaking practice", "Bugun o'quvchimga passive voice bo'yicha qiziqarli dars tayyorla", "I want an intensive lesson covering travel vocabulary and airport situations").

YOUR MANDATORY ACTION:
1. THINK and deduce the EXACT CANONICAL EDUCATIONAL TOPIC (e.g. "Conditionals", "Passive Voice", "Travel & Airport English", "Present Continuous", "Relative Clauses").
2. Set the "topic" property in the JSON output STRICTLY to this concise, canonical topic title (2-4 words max, Title Case).
3. NEVER put prompt commands, questions, or instructional phrases like "Create a lesson about", "Dars tayyorla", "Please explain" into the "topic" field or slide titles!
4. FULFILL ALL USER INSTRUCTIONS from the prompt in the lesson content (e.g. if the user asked for specific rules, exercises, or context, focus the slides, dialogs, and questions on those exact needs).

${hasFiles ? `ATTACHED TEXTBOOK / PDF DOCUMENTS / IMAGES (${files.length} item(s)):
- You are provided with ${files.length} attached document(s) / image(s) (scanned textbook pages, workbook worksheets, multi-page PDF documents up to 5 pages, OR handwritten teacher board sketches/stylus writing).
- OCR & SCANNING INSTRUCTION: Perform high-fidelity optical character recognition (OCR) and read every single heading, unit number, grammar rule, vocabulary list, or teacher's handwriting.
- HANDWRITTEN PROMPT / BOARD RECOGNITION: If the image is a handwritten canvas from a smartboard, read the teacher's handwriting, deduce what topic or grammar rule they wrote (e.g. "Present Continuous", "Conditionals", "Prepositions"), and generate the full curriculum for that topic!
- CRITICAL TOPIC EXTRACTION: Do NOT name the lesson after instructional prompts like "create a lesson based on images". Instead, extract the REAL educational lesson title directly from the textbook unit heading or handwriting, and set the "topic" field strictly to THAT EXTRACTED TOPIC NAME!
- Generate the complete interactive curriculum strictly matching the scanned lesson's grammar, vocabulary, and exercises.` : ""}

TOPIC TITLE EXTRACTION & CANONICALIZATION:
- In the JSON output, the "topic" field MUST contain ONLY the clean, concise, canonical topic title (e.g. "History of Sports", "Present Perfect", "Relative Clauses", "Countable and Uncountable Nouns").
- NEVER include prompt phrases like "Create a lesson about", "Dars tayyorla", "Please explain" in the topic or titles!
Requested lesson length: "${length}" (MANDATORY EXACTLY ${targetSlidesCount} SLIDES).

TOPIC AWARENESS & ADAPTABILITY:
The topic can be ANYTHING in English language teaching:
- Grammar tenses (Present Perfect, Past Simple, Future Continuous, etc.)
- Grammar structures (Conditionals, Passive Voice, Relative Clauses, Reported Speech, etc.)
- Vocabulary topics (Countable/Uncountable Nouns, Prepositions, Articles, Phrasal Verbs, Idioms, Sports, etc.)
- Thematic & Historical topics (History of Sports, Olympic Games, Technology, etc.)
- Communicative topics (Job Interview, Travel English, Ordering at a Restaurant, etc.)
- Biographical/Thematic topics (Famous people, Historical events, etc.)

YOU MUST ADAPT ALL CONTENT DYNAMICALLY. Do NOT force tense formulas, timelines, or grammatical positive/negative/question patterns onto non-grammar topics.

CRITICAL REQUIREMENTS:
1. NEVER output generic placeholders ("Shakl A", "Key Particle", "keyword1", "Variant 1").
2. Every slide, question, keyword, and example MUST be 100% SPECIFIC TO "${topic}".
3. All pedagogical explanations, tips, and traps MUST follow the target language specification: ${lang === 'en' ? 'ENGLISH (100% in English, no other language)' : lang === 'ru' ? 'RUSSIAN (in Russian)' : 'UZBEK (in Uzbek)'}.
4. All English examples must be modern, authentic, and grammatically perfect.
5. SLIDE COUNT STRICT REQUIREMENT:
   Generate EXACTLY ${targetSlidesCount} slides for the "slides" array (since requested length is "${length}").
   - Every single slide (all ${targetSlidesCount} slides) MUST contain rich pedagogical body HTML and a dedicated "visual" diagram!
   - EXACTLY 5 items in other interactive sections:
     * 5 quickQuestions
     * 5 quiz
     * 5 flashcards
     * 5 dialog turns
     * 5 errorHunt
   ${isLong ? "- 5 fillGap exercises (Bo'shliqni to'ldirish)\n   - summary object with title, takeaway, and 3 golden rules (Oltin qoidalar)" : ""}
6. JSON ENCODING: Output ONLY valid JSON. Use double quotes for all keys and string values. Uzbek apostrophes (ko'rmoq, o'tgan) go inside double-quoted strings.

SLIDE STRUCTURE - 100% VISUAL & INTERACTIVE WHITEBOARD:
Every single slide (all ${targetSlidesCount} slides) MUST contain a dedicated, topic-tailored "visual" diagram! NEVER OMIT the visual field!
Available visual types:
1. "sentence_anatomy": Breakdown of an authentic sentence into interactive clickable tokens with roles, colors, and notes.
   data: { sentence: string, translation: string, rule: string, tokens: [{ text: string, role: string, color: "indigo|purple|sky|amber|rose|emerald", note: string }] }
2. "visual_diff": Side-by-side comparison card: To'g'ri (Green) vs Xato Tuzoq (Red) with explanations.
   data: { correct: string, correctLabel: string, correctWhy: string, wrong: string, wrongLabel: string, wrongWhy: string }
3. "formula": Formula blocks (+ / - / ?) showing structure.
   data: { positive: [{role, label, value}], negative: [{role, label, value}], question: [{role, label, value}] }
4. "comparison": Comparison matrix showing 2 or 3 distinct categories or contrasting forms (e.g. Direct vs Indirect, Countable vs Uncountable, A vs An, Used to vs Would).
   data: { categories: [{ title: string, items: string[] }] }
5. "interruption_timeline": ONLY for grammatical TENSES with duration/interruption.
   data: { continuousAction, continuousTime, interruptingAction, interruptingTime, tense1, tense2, fullSentence, explanation }
6. "concept_pyramid": For general-to-specific hierarchies (prepositions, formality levels, etc.).
   data: { topic: string, levels: [{ name: string, scope: string, examples: string[] }] }

MANDATORY SLIDE-BY-SLIDE DIAGRAM ASSIGNMENT:
- Slide 1: MUST use "sentence_anatomy" OR "comparison" (introduce core pattern or direct vs indirect / concept comparison).
- Slide 2: MUST use "formula" OR "sentence_anatomy" (exact structural formula with color tokens).
- Slide 3: MUST use "comparison" OR "concept_pyramid" OR "interruption_timeline" (contrasting usages or categories).
- Slide 4: MUST use "visual_diff" (side-by-side correct vs common Uzbek trap error).
- Slide 5: MUST use "sentence_anatomy" OR "concept_pyramid" OR "metaphor" (final mastery model).

SLIDE CONTENT GUIDELINES (OXFORD NAVIGATE PEDAGOGICAL STANDARD):
- Slide 1: Introduction & Hook — Why this topic matters, real-life context, Uzbek language comparison
- Slide 2: Core rules/patterns/structures — Main teaching content with clear examples and cognitive trigger
- Slide 3: Contrasts, comparisons, or categories — Show differences, common confusions, or categorization
- Slide 4: Common mistakes & traps — Real errors Uzbek speakers make with acoustic/pronunciation decoding
- Slide 5: Summary & Real-World Action — Decision logic and a concrete real-life communicative scenario

For the body HTML, use these modern formatting patterns:
- Bold labels: <b>Label:</b>
- Examples in italics: <i>'Example sentence.'</i>
- Uzbek trap boxes: <div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>O'zbekcha qopqon:</b> Explanation.</div>
- Cognitive Trigger boxes (Navigate style): <div style='margin-top:10px; padding:10px 14px; background:rgba(16,185,129,0.12); border-left:3px solid #10b981; border-radius:6px; font-size:0.9rem;'>⚡ <b>Miyadagi Trigger (Qachon tanlanadi?):</b> The 0.5-second mental question the speaker asks before choosing this form.</div>
- Acoustic Decoder boxes (Navigate style): <div style='margin-top:10px; padding:10px 14px; background:rgba(14,165,233,0.12); border-left:3px solid #0ea5e9; border-radius:6px; font-size:0.9rem;'>🎧 <b>Acoustic Decoder (Jonli Nutq):</b> Yozilganda: <i>'...'</i> ➔ Jonli talaffuzda: <b>'...'</b> (ulanish, qisqarish yoki weak form).</div>
- Real-World Action scenario (Slide 5): <div style='margin-top:10px; padding:10px 14px; background:rgba(245,158,11,0.14); border-left:3px solid #f59e0b; border-radius:6px; font-size:0.9rem;'>🎯 <b>Haqiqiy Hayotiy Vazifa:</b> Concrete communicative situation to apply this immediately.</div>
- Warning boxes: <div style='margin-top:10px; padding:10px 14px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:6px; font-size:0.9rem;'>⚠️ <b>Ogohlantirish:</b> Warning text.</div>
- Bullet points with <br> separators
- ✅ for correct and ❌ for incorrect examples
- VOCABULARY GUARDRAIL: Strictly use authentic Oxford 3000 high-frequency English words in all examples. Avoid unnecessary archaic or overly rare words.

QUESTION GUIDELINES & RIGOR:
- Quick questions: 3 options. Must test REAL conceptual understanding and differentiation, NOT trivial questions. Force students to think about WHY a rule applies in this exact context.
- Quiz: 4 options. Real Cambridge-style assessment questions. Include tricky distractors that represent common Uzbek speaker errors. Test application, exception handling, and time marker contrasts.
- Error hunt: Real authentic sentences with realistic errors related specifically to "${topic}".
- Dialog: Natural communicative dialogue practicing "${topic}".
- Flashcards: 5 key high-value words directly essential to "${topic}".
${isLong ? `- Fill the gap: Exactly 5 items specifically testing "${topic}" rules, contrasts, or structures. sentenceBefore, blank ("______"), sentenceAfter, 3 options, correct, uzbekHint.
- Summary: 3 golden rules summarizing "${topic}" with title, takeaway, tag, formula/pattern, example, uzbekTrap.` : ""}

Return ONLY a strict JSON object with this schema:
{
  "id": "gen_${Date.now()}",
  "topic": "Concise canonical educational topic (e.g. Conditionals, Passive Voice, Travel English)",
  "level": "${level}",
  "length": "${length}",
  "category": "Grammar & Communication",
  "description": "1-2 sentence overview in Uzbek.",
  "slides": [
    {
      "id": "s1",
      "tag": "Slide tag in Uzbek",
      "title": "Slide title in Uzbek",
      "body": "Rich HTML content with examples, explanations, and styled boxes.",
      "visual": {
        "type": "sentence_anatomy",
        "title": "Diagram Title",
        "subtitle": "Diagram Subtitle",
        "data": { ... }
      }
    }
  ],
  "quickQuestions": [
    { "id": "qq1", "q": "Question?", "opts": ["A) ...", "B) ...", "C) ..."], "ans": "A) ...", "expl": "Uzbek explanation." }
  ],
  "quiz": [
    { "q": "Question?", "opts": ["A", "B", "C", "D"], "ans": "A", "expl": "Uzbek explanation." }
  ],
  "flashcards": [
    { "word": "keyword", "pos": "part of speech", "uz": "Uzbek translation", "ex": "Example sentence.", "hint": "Uzbek hint." }
  ],
  "dialog": [
    { "speaker": "Teacher (Aziz)", "role": "teacher", "text": "English text", "uz": "Uzbek translation", "userOptions": ["Option1", "Option2"], "correctOption": "Option1" }
  ],
  "errorHunt": [
    { "sentence": "Sentence with error.", "errorWord": "wrong_word", "correction": "correct_word", "explanation": "Uzbek explanation." }
  ]${isLong ? `,
  "fillGap": [
    {
      "id": "fg1",
      "sentenceBefore": "Beginning of sentence",
      "blank": "______",
      "sentenceAfter": "Rest of sentence",
      "options": ["opt1", "opt2", "opt3"],
      "correct": "opt1",
      "uzbekHint": "Hint in Uzbek"
    }
  ],
  "summary": {
    "title": "${topic} — Oltin Qoidalar & Xulosa",
    "takeaway": "Main takeaway in Uzbek",
    "rules": [
      {
        "tag": "1-OLTIN QOIDA",
        "title": "Rule title in Uzbek",
        "formula": "Rule or pattern",
        "example": "Authentic example sentence",
        "uzbekTrap": "Uzbek trap note"
      }
    ]
  }` : ""}
}`;

    function cleanAndParseCurriculum(rawText: string): Curriculum | null {
      if (!rawText || typeof rawText !== "string") return null;

      function normalizeCurriculum(res: any): Curriculum | null {
        if (!res || !res.slides || !Array.isArray(res.slides) || res.slides.length === 0) {
          return null;
        }

        // Clean up empty or invalid visual fields so full-width body card renders cleanly
        res.slides = res.slides.map((sl: any) => {
          if (sl.visual && (!sl.visual.type || !sl.visual.data || Object.keys(sl.visual).length === 0)) {
            const { visual, ...rest } = sl;
            return rest;
          }
          return sl;
        });

        // Normalize quickQuestions to support both q/question, opts/options, ans/correct, expl/explanation
        if (Array.isArray(res.quickQuestions)) {
          res.quickQuestions = res.quickQuestions.map((qq: any, idx: number) => ({
            id: qq.id || `qq${idx + 1}`,
            q: qq.q || qq.question || `Savol ${idx + 1}?`,
            question: qq.q || qq.question || `Savol ${idx + 1}?`,
            opts: qq.opts || qq.options || ["A) Variant 1", "B) Variant 2", "C) Variant 3"],
            options: qq.opts || qq.options || ["A) Variant 1", "B) Variant 2", "C) Variant 3"],
            ans: qq.ans || qq.correct || (qq.opts ? qq.opts[0] : "A) Variant 1"),
            correct: qq.ans || qq.correct || (qq.opts ? qq.opts[0] : "A) Variant 1"),
            expl: qq.expl || qq.explanation || "Izoh",
            explanation: qq.expl || qq.explanation || "Izoh"
          }));
        }

        // Normalize quiz questions
        if (Array.isArray(res.quiz)) {
          res.quiz = res.quiz.map((qz: any, idx: number) => ({
            id: qz.id || `qz${idx + 1}`,
            q: qz.q || qz.question || `Test ${idx + 1}?`,
            question: qz.q || qz.question || `Test ${idx + 1}?`,
            opts: qz.opts || qz.options || ["A", "B", "C", "D"],
            options: qz.opts || qz.options || ["A", "B", "C", "D"],
            ans: qz.ans || qz.correct || (qz.opts ? qz.opts[0] : "A"),
            correct: qz.ans || qz.correct || (qz.opts ? qz.opts[0] : "A"),
            expl: qz.expl || qz.explanation || "Izoh",
            explanation: qz.expl || qz.explanation || "Izoh"
          }));
        }

        // Normalize fillGap exercises
        if (Array.isArray(res.fillGap)) {
          res.fillGap = res.fillGap.map((fg: any, idx: number) => ({
            id: fg.id || `fg${idx + 1}`,
            sentenceBefore: fg.sentenceBefore || "She",
            blank: fg.blank || "______",
            sentenceAfter: fg.sentenceAfter || "well.",
            options: Array.isArray(fg.options) && fg.options.length ? fg.options : ["opt1", "opt2", "opt3"],
            correct: fg.correct || (Array.isArray(fg.options) ? fg.options[0] : "opt1"),
            uzbekHint: fg.uzbekHint || fg.hint || "Qoidaga e'tibor bering."
          }));
        }

        // Ensure topic is clean and canonical
        res.topic = cleanTopicTitle(res.topic || topic);

        // Normalize summary
        if (res.summary && typeof res.summary === "object") {
          res.summary = {
            title: res.summary.title || `${res.topic} — Oltin Qoidalar`,
            takeaway: res.summary.takeaway || "Asosiy xulosa",
            rules: Array.isArray(res.summary.rules) ? res.summary.rules : []
          };
        }

        return res as Curriculum;
      }

      // Step 1: Strip markdown code fences
      let str = rawText
        .replace(/^\s*```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      // Step 2: Direct parse attempt
      try {
        const direct = JSON.parse(str);
        const norm = normalizeCurriculum(direct);
        if (norm) return norm;
      } catch (e1) {
        // Continue to repair
      }

      // Step 3: Extract outer JSON object if surrounded by extra text
      const match = str.match(/(\{[\s\S]*\})/);
      if (match) {
        str = match[1];
      }

      // Step 4: Repair common JSON syntax anomalies
      // 4a. Replace single-quoted property keys with double quotes: 'key': -> "key":
      str = str.replace(/([{,]\s*)'([^'\r\n]+)'\s*:/g, '$1"$2":');

      // 4b. Replace unquoted property keys with double quotes: key: -> "key":
      str = str.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      // 4c. Remove trailing commas before } or ]
      str = str.replace(/,\s*([}\]])/g, "$1");

      try {
        const repaired = JSON.parse(str);
        const norm = normalizeCurriculum(repaired);
        if (norm) return norm;
      } catch (e2) {
        // Step 4d: Try repairing single-quoted scalar values
        try {
          const valRepaired = str.replace(/:\s*'([^'\r\n]*)'(?=\s*[,}\]])/g, ':"$1"');
          const noTrailing = valRepaired.replace(/,\s*([}\]])/g, "$1");
          const res = JSON.parse(noTrailing);
          const norm = normalizeCurriculum(res);
          if (norm) return norm;
        } catch (e3) {
          // Parsing failed
        }
      }

      return null;
    }

    const promptParts: any[] = [];

    // Multimodal attachments: images, scanned book pages, PDFs (up to 5 pages)
    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        const rawBase64 = f.base64 || f.data;
        if (rawBase64) {
          const base64Data = rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64;
          let mimeType = f.type || "image/jpeg";
          if (f.name?.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf") {
            mimeType = "application/pdf";
          }
          promptParts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        }
      }
    }

    promptParts.push({ text: prompt });

    const models = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-flash-lite-latest",
      "gemini-flash-latest"
    ];

    let lastError = "";

    for (const model of models) {
      try {
        console.log(`[Gemini API] Requesting ${model} for topic: "${topic}" (${level}, ${hasFiles ? `${files.length} file(s)` : "text-only"})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s per model (fast & reliable)

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: "user", parts: promptParts }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: "application/json"
              }
            })
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = cleanAndParseCurriculum(text);
            if (parsed) {
              console.log(`[Gemini API] Success with ${model}! Generated ${parsed.slides?.length} slides, ${parsed.quickQuestions?.length} QQs.`);
              return NextResponse.json({ ok: true, curriculum: parsed, modelUsed: model });
            } else {
              console.warn(`[Gemini API] ${model} returned unparseable text. Snippet:`, text.slice(0, 150));
            }
          } else {
            console.warn(`[Gemini API] ${model} returned empty candidate text.`);
          }
        } else {
          lastError = await response.text();
          console.warn(`[Gemini API] ${model} returned HTTP ${response.status}:`, lastError.slice(0, 150));
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[Gemini API] ${model} exception:`, lastError);
      }
    }

    // High-Quality Pedagogical Synthesizer (Topic-Aware Fallback if offline/all fail)
    console.warn("All Gemini live calls exhausted, synthesizing topic-specific curriculum for:", topic);
    const normTopic = topic.toLowerCase();
    
    // Topic-aware intelligent builder so students NEVER see "Shakl A" or "Key Particle"
    let displayTopic = topic;
    if (topic.length > 32) {
      if (normTopic.includes("plan") && (normTopic.includes("future") || normTopic.includes("certainty") || normTopic.includes("sure"))) {
        displayTopic = "Future Plans & Degrees of Certainty (Might, May, Going to)";
      } else if (normTopic.includes("interview") || normTopic.includes("job")) {
        displayTopic = "Job Interview English";
      } else if (normTopic.includes("travel") || normTopic.includes("airport")) {
        displayTopic = "Travel & Airport English";
      } else if (normTopic.includes("conditional") || normTopic.includes("if")) {
        displayTopic = "Conditionals";
      } else if (normTopic.includes("passive")) {
        displayTopic = "Passive Voice";
      } else {
        const words = topic.split(" ");
        displayTopic = words.slice(0, 4).join(" ");
      }
    }
    const isPrep = normTopic.includes("preposition") || normTopic.includes("in on at") || normTopic.includes("at on in");
    const isBio = normTopic.includes("ronaldo") || normTopic.includes("messi") || normTopic.includes("biography") || normTopic.includes("person");
    const isPP = normTopic.includes("perfect") && !isPrep;
    const isPast = normTopic.includes("past") && !isPrep;
    const isFuture = (normTopic.includes("future") || normTopic.includes("will") || normTopic.includes("going to")) && !isPrep;
    const isModal = normTopic.includes("modal") || normTopic.includes("must") || normTopic.includes("can");
    const isCond = normTopic.includes("conditional") || normTopic.includes("if");
    const isPassive = normTopic.includes("passive");
    const isSport = normTopic.includes("sport") || normTopic.includes("olympic") || normTopic.includes("football") || normTopic.includes("athlete");

    const isVocabTopic = normTopic.includes('countable') || normTopic.includes('uncountable') || normTopic.includes('article') || normTopic.includes('phrasal') || normTopic.includes('idiom') || normTopic.includes('collocation');
    const isCommTopic = normTopic.includes('interview') || normTopic.includes('restaurant') || normTopic.includes('travel') || normTopic.includes('business') || normTopic.includes('presentation');
    const isTense = isPP || isPast || isFuture || normTopic.includes("tense") || normTopic.includes("present simple") || normTopic.includes("continuous");
    const isGrammarStructure = isPP || isPast || isFuture || isModal || isCond || isPassive;

    const formulaStr = isPrep
      ? "AT (aniq soat/vaqt) / ON (kunlar va sanalar) / IN (oylar, yillar, fasllar)"
      : isSport
      ? "Historical Era + Sport/Event + Origin & Development (Past Simple & Passive)"
      : isBio
      ? "Subject + Verb + Achievement / Career Milestone"
      : isPP
      ? "Subject + have / has + V3 (Past Participle)"
      : isPast
      ? "Subject + V2 (-ed / Irregular verb)"
      : isFuture
      ? "Subject + will / be going to + V1"
      : isModal
      ? "Subject + Modal Verb + V1"
      : isCond
      ? "If + Condition (Tense 1), Result (Tense 2)"
      : isPassive
      ? "Subject + be + V3 + (by Agent)"
      : isVocabTopic
      ? "Countable (a/an, -s) vs Uncountable (much/little, no plural)"
      : isCommTopic
      ? "Key Phrases & Polite Expression Models"
      : `Subject + [${topic} Structure] + Object`;

    const exPos = isPrep
      ? "The match starts at 8:00 PM on Friday."
      : isSport
      ? "The ancient Olympic Games began in Greece in 776 BC."
      : isBio
      ? "Cristiano Ronaldo has won five Ballon d'Or awards."
      : isPP
      ? "I have already visited Samarkand twice."
      : isPast
      ? "She finished her work two hours ago."
      : isFuture
      ? "We are going to start the new project tomorrow."
      : isModal
      ? "You must follow the safety regulations."
      : isCond
      ? "If it rains tomorrow, we will stay at home."
      : isPassive
      ? "The report was written by our senior manager."
      : isVocabTopic
      ? "Could you give me some helpful advice and two apples?"
      : isCommTopic
      ? "I have five years of experience in this field."
      : `Students actively apply ${topic} in their daily conversations.`;

    const exNeg = isPrep
      ? "The library is not open on Sundays."
      : isSport
      ? "Modern football was not codified until the 1860s in England."
      : isBio
      ? "He did not give up despite difficult challenges."
      : isPP
      ? "They haven't received the package yet."
      : isPast
      ? "He did not call me yesterday."
      : isFuture
      ? "I will not leave until the meeting ends."
      : isModal
      ? "You cannot enter without a valid passport."
      : isCond
      ? "If you don't study, you won't pass the exam."
      : isPassive
      ? "The documents were not signed on time."
      : isVocabTopic
      ? "We don't have much time or many chairs left."
      : isCommTopic
      ? "I do not hesitate to take on challenging responsibilities."
      : `Always use the correct structure for negative expressions in ${topic}.`;

    const exQues = isPrep
      ? "Do you usually travel in summer or in winter?"
      : isSport
      ? "When and where were the first modern Olympic Games held?"
      : isBio
      ? "How many goals has he scored in his international career?"
      : isPP
      ? "Have you ever traveled to London?"
      : isPast
      ? "Where did you go last weekend?"
      : isFuture
      ? "What are you going to do this Sunday?"
      : isModal
      ? "Could you please explain this question again?"
      : isCond
      ? "What will you do if you win the competition?"
      : isPassive
      ? "Was the letter delivered yesterday?"
      : isVocabTopic
      ? "How many books and how much water do you need?"
      : isCommTopic
      ? "Could you tell me more about this position?"
      : `How is ${topic} used naturally in English speaking?`;

    const t_str = (uz: string, en: string, ru: string) => lang === "en" ? en : lang === "ru" ? ru : uz;

    const slide1Body = isTense
      ? `• <b>${t_str("Asosiy qoida:", "Core Rule:", "Основное правило:")}</b> <b>${topic}</b> ${t_str("ingliz tilida nutqni aniq, tabiiy va ravon ifodalash uchun xizmat qiladi.", "is used in English to express ideas clearly, accurately, and naturally.", "служит в английском языке для точной, естественной и беглой речи.")}<br>• <b>${t_str("Amaliy kontekst:", "Practical Context:", "Практический контекст:")}</b> ${t_str("Ona tilimizdan so'zma-so'z tarjima qilmasdan, ingliz tili mantiqiy modeliga tayanish zarur.", "Focus on the underlying English conceptual model rather than literal translation.", "Опирайтесь на логическую модель английского языка, избегая дословного перевода.")}<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>${t_str("O'zbekcha qopqon:", "Language Trap / Pro Tip:", "Русскоязычная ловушка:")}</b> ${t_str("O'zbek tilidagi fe'l qo'shimchasi bilan inglizcha strukturani solishtirishdagi asosiy farqni doim hisobga oling.", "Always distinguish this structure from similar forms by checking context and signal markers.", "Всегда учитывайте ключевые различия между грамматикой русского и английского языков.")}</div>`
      : isVocabTopic
      ? `• <b>${t_str("Mavzu mohiyati:", "Topic Core:", "Суть темы:")}</b> <b>${topic}</b> — ${t_str("ingliz tilida so'zlarni to'g'ri tanlash, ularni guruhlarga ajratish va nutqda xatosiz qo'llash asosi.", "mastering word choice, categorization, and accurate usage in real communication.", "основа правильного выбора слов, их классификации и грамотного использования в речи.")}<br>• <b>${t_str("Real kontekst:", "Real-World Context:", "Реальный контекст:")}</b> ${t_str("Kundalik muloqot, xarid, ta'lim va kasbiy faoliyatda tushunmovchiliklarning oldini oladi.", "Prevents misunderstandings in daily discussions, shopping, study, and professional life.", "Предотвращает недопонимание в повседневном общении, учёбе и работе.")}<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>${t_str("O'zbekcha qopqon:", "Key Pro Tip:", "Русскоязычная ловушка:")}</b> ${t_str("O'zbek tilidagi so'z mantiqi inglizchadan farq qiladi. Doim inglizcha qoidaga tayanadi.", "English word usage patterns often differ from other languages. Always rely on English rules.", "Логика употребления английских слов отличается от русского языка. Опирайтесь на правила английского.")}</div><div style='margin-top:10px; padding:10px 14px; background:rgba(16,185,129,0.12); border-left:3px solid #10b981; border-radius:6px; font-size:0.9rem;'>✅ <b>${t_str("Misol:", "Example:", "Пример:")}</b> <i>'${exPos}'</i></div>`
      : isCommTopic
      ? `• <b>${t_str("Muloqot strategiyasi:", "Communication Strategy:", "Стратегия общения:")}</b> <b>${topic}</b> — ${t_str("bo'yicha tabiiy va ishonchli gapirish muvaffaqiyat garovi.", "speaking naturally and with confidence is the key to effective communication.", "уверенная и естественная речь — залог успешной коммуникации.")}<br>• <b>${t_str("Amaliy kontekst:", "Practical Context:", "Практический контекст:")}</b> ${t_str("Suhbat, intervyu, rasmiy uchrashuv va sayohatlarda qo'llaniladigan tayyor nutqiy andozalar.", "Ready-to-use spoken frameworks for interviews, meetings, and travel.", "Готовые речевые шаблоны для бесед, собеседований и путешествий.")}<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💬 <b>${t_str("Muloqot siri:", "Communication Tip:", "Секрет общения:")}</b> ${t_str("So'zma-so'z tarjima emas, balki ingliz tilida qabul qilingan odobli va turg'un iboralarni qo'llang.", "Use standard polite English collocations rather than word-for-word translation.", "Используйте устойчивые вежливые фразы вместо дословного перевода.")}</div><div style='margin-top:10px; padding:10px 14px; background:rgba(16,185,129,0.12); border-left:3px solid #10b981; border-radius:6px; font-size:0.9rem;'>✅ <b>${t_str("Namunaviy jumla:", "Model sentence:", "Пример фразы:")}</b> <i>'${exPos}'</i></div>`
      : `• <b>${t_str("Asosiy tushuncha:", "Core Concept:", "Основная концепция:")}</b> <b>${topic}</b> ${t_str(`ingliz tilida fikrni ravon, aniq va CEFR ${level} darajasiga mos yetkazish uchun xizmat qiladi.`, `serves to convey ideas smoothly, accurately, and aligned with CEFR ${level}.`, `служит для ясного, беглого и точного выражения мыслей на уровне CEFR ${level}.`)}<br>• <b>${t_str("Amaliy kontekst:", "Practical Context:", "Практический контекст:")}</b> ${t_str("Ona tilimizdan to'g'ridan-to'g'ri ko'chirmasdan, ingliz tili tabiatiga mos uslubni o'zlashtirish zarur.", "Adopt the authentic English style rather than direct literal transfer.", "Важно освоить естественный стиль английского языка без калькирования.")}<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>${t_str("O'zbekcha qopqon:", "Language Trap / Pro Tip:", "Русскоязычная ловушка:")}</b> ${t_str("Ona tili grammatikasi bilan yuzaki o'xshashlikka aldanmang — kontekst va signal belgilarga e'tibor qarating.", "Do not be misled by superficial similarities with other languages — watch context and signal words.", "Не обманывайтесь внешним сходством с родным языком — обращайте внимание на контекст и слова-маркеры.")}</div><div style='margin-top:10px; padding:10px 14px; background:rgba(16,185,129,0.12); border-left:3px solid #10b981; border-radius:6px; font-size:0.9rem;'>✅ <b>${t_str("Namunaviy jumla:", "Model sentence:", "Пример:")}</b> <i>'${exPos}'</i></div>`;

    const slide2Body = isGrammarStructure
      ? `• <b>Asosiy formula:</b> ${formulaStr}<br>• <b>1. Darak shakli:</b> <i>'${exPos}'</i> ✅<br>• <b>2. Inkor shakli:</b> <i>'${exNeg}'</i><br>• <b>3. So'roq shakli:</b> <i>'${exQues}'</i>`
      : isVocabTopic
      ? `• <b>Asosiy qonuniyat:</b> ${formulaStr}<br><br>• <b>1. Darak / Ijobiy qo'llanish:</b> <i>'${exPos}'</i> ✅<br>• <b>2. Inkor / Cheklov shakli:</b> <i>'${exNeg}'</i><br>• <b>3. Savol / So'rov shakli:</b> <i>'${exQues}'</i><br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.12); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>📌 <b>Eslatma:</b> So'z turkumi va miqdor ko'rsatkichlarining to'g'ri birikuviga e'tibor bering.</div>`
      : isCommTopic
      ? `• <b>Muloqot andozasi:</b> ${formulaStr}<br><br>• <b>1. Fikr bildirish / Ijobiy javob:</b> <i>'${exPos}'</i> ✅<br>• <b>2. Odobli e'tiroz / Inkor:</b> <i>'${exNeg}'</i><br>• <b>3. Suhbatdoshga savol:</b> <i>'${exQues}'</i><br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.12); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>📌 <b>Eslatma:</b> Ushbu iboralarni ohang va vaziyatga moslab jonli nutqda qo'llang.</div>`
      : `• <b>Asosiy andoza:</b> ${formulaStr}<br><br>• <b>1. To'g'ri namunaviy jumla:</b> <i>'${exPos}'</i> ✅<br>• <b>2. Inkor shakli:</b> <i>'${exNeg}'</i><br>• <b>3. So'roq shakli:</b> <i>'${exQues}'</i>`;

    const slide3Categories = isPrep
      ? [
          { title: "To'g'ri Predlog ✅", items: ["at 8:00 PM (aniq soat)", "on Friday (hafta kuni)", "in July (oy/mavsum)"] },
          { title: "O'zbekcha Xato Tuzoq ❌", items: ["on 8:00 AM (xato)", "in Monday (xato)", "at July (xato)"] }
        ]
      : isVocabTopic
      ? [
          { title: "To'g'ri Qo'llash ✅", items: [exPos, "Toifa va miqdor ko'rsatkichini to'g'ri tanlash"] },
          { title: "O'zbekcha Xato Tuzoq ❌", items: ["Sanalmaydigan so'zga -s qo'shish", "Noto'g'ri ko'rsatkich (much/many) ishlatish"] }
        ]
      : isCommTopic
      ? [
          { title: "Tavsiya Etiladigan Iboralar ✅", items: [exPos, "Xushmuomala va aniq ifodalar"] },
          { title: "Qochish Kerak Bo'lgan Holatlar ❌", items: ["Qo'pol so'zma-so'z tarjima", "Tuzilishi buzilgan jumlalar"] }
        ]
      : [
          { title: "To'g'ri Qo'llash ✅", items: [exPos, exQues] },
          { title: "O'zbekcha Xato Tuzoq ❌", items: ["Inkor yordamchisini unutish", "So'roq so'z tartibini buzish"] }
        ];

    const slide3Body = isPrep
      ? `• <i>'The train arrives at 9:00 AM.'</i> ✅ (Aniq vaqt uchun 'at').<br>• <i>'The train arrives on 9:00 AM.'</i> ❌ ('on' soat oldidan ishlatilmaydi).<br>• <i>'We meet on Friday.'</i> ✅ (Hafta kunlari uchun 'on').<br>• <i>'We meet in Friday.'</i> ❌ ('in' kunlar uchun xato).`
      : isVocabTopic
      ? `• <i>'${exPos}'</i> ✅ (To'g'ri qo'llanilgan tabiiy jumla).<br>• <i>'Uncountable noun used with plural -s'</i> ❌ (Sanalmaydigan otni ko'plikda ishlatish xatosi).<br>• <i>'${exQues}'</i> ✅ (Savolda to'g'ri miqdor ko'rsatkichi).<br>• <i>'Wrong quantity marker trap'</i> ❌ (Ko'rsatkichlarni almashtirib qo'yish).`
      : isCommTopic
      ? `• <i>'${exPos}'</i> ✅ (Tabiiy va professional muloqot jumlasi).<br>• <i>'Overly blunt or broken phrasing'</i> ❌ (Dag'al yoki noo'rin jumla tuzish).<br>• <i>'${exQues}'</i> ✅ (Suhbatdoshga qaratilgan odobli savol).<br>• <i>'Literal translation trap'</i> ❌ (Ona tilidan to'g'ridan-to'g'ri tarjima qilish).`
      : `• <i>'${exPos}'</i> ✅ (Tabiiy va xalqaro CEFR standartiga mos to'g'ri tuzilma).<br>• <i>'${exNeg.replace("not", "").replace("n't", "")}'</i> ❌ (Inkor yordamchisini tushirib qoldirish xatosi).<br>• <i>'${exQues}'</i> ✅ (Savol so'z tartibi to'g'ri qo'llangan).<br>• <i>'Incorrect typical learner word order.'</i> ❌ (O'zbek tili so'z tartibi bilan chalkashtirish).`;

    const fallbackCurriculum: Curriculum = {
      id: `gen_${Date.now()}`,
      topic: displayTopic,
      level,
      length,
      category: "Grammar & Communication",
      description: t_str(`${displayTopic} mavzusi bo'yicha mukammal CEFR ${level} darajasidagi interaktiv darslik paketi.`, `Complete interactive CEFR ${level} lesson deck on ${displayTopic}.`, `Полный интерактивный пакет уроков уровня CEFR ${level} по теме ${displayTopic}.`),
      slides: [
        {
          id: "s1",
          tag: t_str("1. MOHIYAT & HOOK", "1. HOOK & CONCEPT", "1. СУТЬ И ВВЕДЕНИЕ"),
          title: t_str(`${displayTopic} — Asosiy Tushuncha & Kontekst`, `${displayTopic} — Core Concept & Context`, `${displayTopic} — Основная концепция и контекст`),
          body: slide1Body,
          visual: isTense && (normTopic.includes("continuous") || normTopic.includes("past")) ? {
            type: "interruption_timeline" as const,
            title: `${topic} — Harakatlar To'qnashuvi`,
            subtitle: "Davomiy fon va to'satdan bo'lgan ish kesishuvi",
            data: {
              continuousAction: "I was walking home",
              continuousTime: "Davomiy jarayon (Past Continuous)",
              interruptingAction: "The phone rang",
              interruptingTime: "To'satdan bir lahzada (Past Simple)",
              tense1: "Past Continuous",
              tense2: "Past Simple",
              fullSentence: "I was walking home when the phone rang.",
              explanation: "Past Continuous davom etayotgan harakat fonida Past Simple to'satdan sodir bo'lib, jarayonni to'xtatadi."
            }
          } : isPrep ? {
            type: "concept_pyramid" as const,
            title: "Predloglar Piramidasi (IN / ON / AT)",
            subtitle: "Umumiydan aniq vaqt va joyga qarab",
            data: {
              topic: "In / On / At",
              levels: [
                { name: "IN", scope: "Katta & Umumiy (Yillar, Shaharlar, Oylar)", examples: ["in 2026", "in summer", "in Tashkent", "in the morning"], color: "indigo" },
                { name: "ON", scope: "O'rtacha (Kunlar, Sanalar, Ko'chalar)", examples: ["on Monday", "on July 5th", "on Amir Temur street"], color: "purple" },
                { name: "AT", scope: "Juda Aniq & Nuqta (Soat, Aniq manzil)", examples: ["at 8:30 AM", "at noon", "at home", "at the bus stop"], color: "emerald" }
              ]
            }
          } : {
            type: "sentence_anatomy" as const,
            title: "Gap Anatomiyasi & Sintaksis",
            subtitle: "Interaktiv gap bo'laklari (har birini bosing)",
            data: {
              sentence: exPos,
              translation: "Inglizcha namunaviy jumla",
              rule: `${topic} bo'yicha tabiiy va to'g'ri tuzilma`,
              tokens: [
                { text: exPos.split(" ")[0] || "Subject", role: "Ega (Subject)", color: "indigo", note: "Harakat bajaruvchisi" },
                { text: exPos.split(" ").slice(1, 3).join(" ") || "Verb", role: "Fe'l Strukturasi", color: "purple", note: "Zamon va qoida markazi" },
                { text: exPos.split(" ").slice(3).join(" ") || "Complement", role: "Qoldiq & Ma'no", color: "emerald", note: "Gapning mazmuniy to'ldiruvchisi" }
              ]
            }
          }
        },
        {
          id: "s2",
          tag: isGrammarStructure ? "2. FORMULA VA TUZILISH" : isVocabTopic ? "2. SO'Z QOIDALARI & BIRIKMALAR" : isCommTopic ? "2. NUTQIY ANDOZALAR & IBORALAR" : "2. STRUKTURA VA QOIDALAR",
          title: isGrammarStructure ? "Struktura & Grammatik Qoidalar" : isVocabTopic ? "Qo'llash Qoidalari & Namunalar" : isCommTopic ? "Muloqot Modeli & Asosiy Iboralar" : `${topic} — Muhim Qoidalar`,
          body: slide2Body,
          visual: isGrammarStructure ? {
            type: "formula" as const,
            title: "Formula Tuzilishi",
            data: {
              positive: [
                { role: "subject", label: "Ega", value: "Subject" },
                { role: "verb", label: "Fe'l", value: formulaStr.split("+")[1]?.trim() || "Verb Form" },
                { role: "object", label: "To'ldiruvchi", value: "Complement" }
              ],
              negative: [
                { role: "subject", label: "Ega", value: "Subject" },
                { role: "verb", label: "Inkor", value: "Aux + NOT + Verb" },
                { role: "object", label: "To'ldiruvchi", value: "Complement" }
              ]
            }
          } : {
            type: "sentence_anatomy" as const,
            title: "Namunaviy Model Tahlili",
            subtitle: "Grammatik bo'laklar vazifasi",
            data: {
              sentence: exPos,
              translation: "To'g'ri shakl namunasi",
              rule: formulaStr,
              tokens: [
                { text: exPos.split(" ")[0] || "Subject", role: "Ega", color: "indigo", note: "Bosh bo'lak" },
                { text: exPos.split(" ").slice(1).join(" ") || "Predicate", role: "Kesim & Qoldiq", color: "emerald", note: "Qoida qo'llangan qism" }
              ]
            }
          }
        },
        {
          id: "s3",
          tag: "3. YONMA-YON TAQQOSLASH",
          title: "Tanqidiy Farqlar (✅ To'g'ri vs ❌ Noto'g'ri)",
          body: slide3Body,
          visual: {
            type: "comparison" as const,
            title: "Taqqoslash Jadvali",
            data: {
              categories: slide3Categories
            }
          }
        },
        {
          id: "s4",
          tag: "4. ENG KO'P UCHRAYDIGAN 3 TA TUZOQ",
          title: "O'quvchilar Tushadigan 3 Katta Xato",
          body: `1. ❌ <i>'O'zbekchadan so'zma-so'z tarjima qilish'</i> ➔ ✅ <i>'Ingliz tili formulasiga tayanish'</i>.<br>2. ❌ <i>'Yordamchi fe'lni tushirib qoldirish'</i> ➔ ✅ <i>'To'liq yordamchi strukturani saqlash'</i>.<br>3. ❌ <i>'Vaqt ko'rsatkichlarini chalkashtirish'</i> ➔ ✅ <i>'Vaqt belgilariga qat'iy e'tibor berish'</i>.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:6px; font-size:0.9rem;'>⚠️ <b>Oltin qoida:</b> Imtihonlarda va jonli nutqda eng ko'p tekshiriladigan nuqta.</div>`,
          visual: {
            type: "visual_diff" as const,
            title: "To'g'ri vs Xato: Vizual Taqqoslash",
            subtitle: "O'quvchilar eng ko'p adashadigan nozik nuqta",
            data: {
              correct: exPos,
              correctLabel: "To'g'ri variant",
              correctWhy: "Ingliz tili tabiiy qonuniyatiga muvofiq keladi.",
              wrong: isPrep ? "The train arrives on 9:00 AM." : "She has visited London last year.",
              wrongLabel: "O'zbekcha qopqon",
              wrongWhy: "Ona tilimizdan to'g'ridan-to'g'ri tarjima qilish natijasida paydo bo'ladigan xato."
            }
          }
        },
        {
          id: "s5",
          tag: "5. QAROR QABUL QILISH SXEMASI",
          title: "Qaysi Shaklni Tanlash Kerak? (Decision Logic)",
          body: `1. <b>Birinchi holatda:</b> ➔ <b>${formulaStr}</b> qo'llaniladi.<br>2. <b>Vaqt ko'rsatkichi aniq bo'lsa:</b> ➔ <b>Mos o'tmish yoki kelajak shakli</b> tanlanadi.<br>3. <b>Jonli nutqda:</b> ➔ <b>Qisqartma shakllar (I've, He's, Won't)</b> ishlatiladi.`,
          visual: {
            type: "metaphor" as const,
            title: "Xulosa & Eslab Qolish Kaliti",
            subtitle: "Miyada eslab qolish uchun vizual tasavvur",
            data: {
              metaphor: "Mustahkam Ko'prik",
              explanation: "Ushbu qoida orqali nutqingiz tabiiy va ravon eshitiladi."
            }
          }
        },
        {
          id: "s6",
          tag: "6. REAL MULOQOT & NUTQ AMALIYOTI",
          title: "Jonli Nutqda Qo'llash Ssenariysi",
          body: `• <b>Muloqot vaziyati:</b> Ushbu tuzilmani tabiiy suhbatda ikkilanmasdan qo'llang.<br>• <b>Nutqiy tavsiya:</b> Qoidani yodlash yetarli emas, uni real kontekstda to'g'ri intonatsiya bilan talaffuz qiling.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(245,158,11,0.14); border-left:3px solid #f59e0b; border-radius:6px; font-size:0.9rem;'>🎯 <b>Haqiqiy Vazifa:</b> Suhbatdoshga o'z fikringizni ifodalab bering: <i>'${exPos}'</i></div>`,
          visual: {
            type: "sentence_anatomy" as const,
            title: "Muloqot Sintaksisi",
            subtitle: "Jonli nutq bloklari",
            data: {
              sentence: exPos,
              translation: "Jonli nutq namunasi",
              rule: "Tabiiy muloqot intonatsiyasi",
              tokens: [
                { text: exPos.split(" ")[0] || "I", role: "Spiker", color: "indigo", note: "Fikr egasi" },
                { text: exPos.split(" ").slice(1, 3).join(" ") || "action", role: "Nutq markazi", color: "sky", note: "Asosiy ifoda" },
                { text: exPos.split(" ").slice(3).join(" ") || "context", role: "Kontekst", color: "emerald", note: "Mazmun to'ldiruvchisi" }
              ]
            }
          }
        },
        {
          id: "s7",
          tag: "7. XATOLARNI TAHLIL QILISH & DRILL",
          title: "Imtihon & Grammatika Nozikliklari",
          body: `• <b>Eng xavfli xato:</b> Ona tilidagi so'z tartibi inglizcha struktura bilan to'qnashganda adashish.<br>• <b>Yechim:</b> Signal so'zlar va fe'l shakllarini avtomatik tarzda taniy olish.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:6px; font-size:0.9rem;'>❌ <b>Xato:</b> <i>'${exNeg.replace("not", "").replace("n't", "")}'</i> ➔ ✅ <b>To'g'ri:</b> <i>'${exPos}'</i></div>`,
          visual: {
            type: "visual_diff" as const,
            title: "Nozik Nuqtalar Taqqosi",
            subtitle: "Imtihonlardagi asosiy tuzoq",
            data: {
              correct: exPos,
              correctLabel: "To'g'ri tuzilma",
              correctWhy: "Grammatik me'yorga to'liq javob beradi.",
              wrong: exNeg.replace("not", "").replace("n't", ""),
              wrongLabel: "Chalkashlik",
              wrongWhy: "Yordamchi yoki qoidaviy element tushirib qoldirilgan."
            }
          }
        },
        {
          id: "s8",
          tag: "8. YAKUNIY NAZORAT & MASTERY",
          title: "Mavzuni 100% O'zlashtirish Xulosasi",
          body: `• <b>1-Oltin Qoida:</b> ${formulaStr}.<br>• <b>2-Oltin Qoida:</b> Doimo kontekst va zamon signallariga e'tibor qarating.<br>• <b>3-Oltin Qoida:</b> Xatolar ustida ishlab, ularni nutqda tuzatib boring.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(16,185,129,0.15); border-left:3px solid #10b981; border-radius:6px; font-size:0.9rem;'>🏆 <b>Natija:</b> Mavzu to'liq o'zlashtirildi. Keyingi bosqich mashqlariga o'tishingiz mumkin!</div>`,
          visual: {
            type: "concept_pyramid" as const,
            title: "Mastery Piramidasi",
            subtitle: "O'zlashtirish bosqichlari",
            data: {
              topic: topic,
              levels: [
                { name: "Nazariya", scope: "Qoida va formulani anglash", examples: [formulaStr], color: "indigo" },
                { name: "Mashq", scope: "Yozma testlar va xato ovlash", examples: [exPos], color: "purple" },
                { name: "Muloqot", scope: "Jonli nutqda ravon qo'llash", examples: [exQues], color: "emerald" }
              ]
            }
          }
        }
      ].slice(0, targetSlidesCount),
      quickQuestions: [
        {
          id: "qq1",
          q: isGrammarStructure
            ? `${topic} formulasida qaysi element to'g'ri keltirilgan?`
            : `${topic} bo'yicha qaysi qoida yoki model to'g'ri?`,
          question: isGrammarStructure
            ? `${topic} formulasida qaysi element to'g'ri keltirilgan?`
            : `${topic} bo'yicha qaysi qoida yoki model to'g'ri?`,
          opts: [formulaStr, "Subject + Verb only", "Auxiliary + Object"],
          options: [formulaStr, "Subject + Verb only", "Auxiliary + Object"],
          ans: formulaStr,
          correct: formulaStr,
          expl: `CEFR qoidasiga ko'ra ${topic} uchun to'g'ri tuzilma: ${formulaStr}.`,
          explanation: `CEFR qoidasiga ko'ra ${topic} uchun to'g'ri tuzilma: ${formulaStr}.`
        },
        {
          id: "qq2",
          q: `Quyidagi misollardan qaysi biri grammatik jihatdan to'g'ri?`,
          question: `Quyidagi misollardan qaysi biri grammatik jihatdan to'g'ri?`,
          opts: [exPos, "He go there yesterday.", "I have went last week."],
          options: [exPos, "He go there yesterday.", "I have went last week."],
          ans: exPos,
          correct: exPos,
          expl: `To'g'ri variant: '${exPos}'.`,
          explanation: `To'g'ri variant: '${exPos}'.`
        },
        {
          id: "qq3",
          q: `Inkor gapda yordamchi fe'l qanday joylashadi?`,
          question: `Inkor gapda yordamchi fe'l qanday joylashadi?`,
          opts: ["Ega va asosiy fe'l orasida", "Gapning oxirida", "Faqat so'roq so'zdan keyin"],
          options: ["Ega va asosiy fe'l orasida", "Gapning oxirida", "Faqat so'roq so'zdan keyin"],
          ans: "Ega va asosiy fe'l orasida",
          correct: "Ega va asosiy fe'l orasida",
          expl: `Inkor yuklamasi yordamchi fe'l bilan birga egadan keyin keladi: '${exNeg}'.`,
          explanation: `Inkor yuklamasi yordamchi fe'l bilan birga egadan keyin keladi: '${exNeg}'.`
        },
        {
          id: "qq4",
          q: `O'zbek tiliga xos qaysi tuzoqdan qochish lozim?`,
          question: `O'zbek tiliga xos qaysi tuzoqdan qochish lozim?`,
          opts: ["So'zma-so'z tarjima qilishdan", "To'g'ri talaffuzdan", "Lug'at yodlashdan"],
          options: ["So'zma-so'z tarjima qilishdan", "To'g'ri talaffuzdan", "Lug'at yodlashdan"],
          ans: "So'zma-so'z tarjima qilishdan",
          correct: "So'zma-so'z tarjima qilishdan",
          expl: "Ingliz tili mantiqiy modelida zamon shakli va kontekst muhim, o'zbekchadan to'g'ridan-to'g'ri tarjima xatolikka olib keladi.",
          explanation: "Ingliz tili mantiqiy modelida zamon shakli va kontekst muhim, o'zbekchadan to'g'ridan-to'g'ri tarjima xatolikka olib keladi."
        },
        {
          id: "qq5",
          q: `So'roq gap tuzishda asosiy qoida nima?`,
          question: `So'roq gap tuzishda asosiy qoida nima?`,
          opts: ["Yordamchi fe'l egadan oldinga chiqadi", "Asosiy fe'l o'chiriladi", "Hech qanday o'zgarish bo'lmaydi"],
          options: ["Yordamchi fe'l egadan oldinga chiqadi", "Asosiy fe'l o'chiriladi", "Hech qanday o'zgarish bo'lmaydi"],
          ans: "Yordamchi fe'l egadan oldinga chiqadi",
          correct: "Yordamchi fe'l egadan oldinga chiqadi",
          expl: `So'roq shaklida inversiya yuz beradi: '${exQues}'.`,
          explanation: `So'roq shaklida inversiya yuz beradi: '${exQues}'.`
        }
      ],
      quiz: [
        {
          q: `Quyidagi gaplardan qaysi biri ${topic} qoidasiga to'liq mos keladi?`,
          opts: [exPos, "She not like this structure.", "They was very happy yesterday.", "I did finished the work."],
          ans: exPos,
          expl: `To'g'ri jumla: '${exPos}'.`
        },
        {
          q: `Inkor shakl qoidasini aniqlang:`,
          opts: [exNeg, "They don't have finish.", "She isn't finished yet.", "We no finish."],
          ans: exNeg,
          expl: `Inkor shakl qoidasi: '${exNeg}'.`
        },
        {
          q: `To'g'ri so'roq shaklini tanlang:`,
          opts: [exQues, "You have visited London?", "Did you went there?", "Are you have finish?"],
          ans: exQues,
          expl: `So'roq shakli: '${exQues}'.`
        },
        {
          q: `Qaysi gapda grammatik vaqt belgisi mos tushgan?`,
          opts: [exPos, "I seen him yesterday.", "She has left three days ago.", "We didn't went yesterday."],
          ans: exPos,
          expl: `Faqat birinchi variant to'g'ri grammatik zamon va vaqt mosligini ko'rsatadi.`
        },
        {
          q: `Quyidagi jumladagi bo'shliqni to'ldiring: 'He ______ never tried this before.'`,
          opts: ["has", "have", "did", "was"],
          ans: "has",
          expl: "Uchinchi shaxs birlik (he/she/it) uchun 'has' yordamchi fe'li ishlatiladi."
        }
      ],
      flashcards: [
        {
          word: isPP ? "already" : isPast ? "yesterday" : isFuture ? "tomorrow" : isVocabTopic ? "uncountable" : isCommTopic ? "experience" : "practice",
          pos: isVocabTopic ? "adjective" : isCommTopic ? "noun" : "adverb",
          uz: isPP ? "allaqachon" : isPast ? "kecha" : isFuture ? "ertaga" : isVocabTopic ? "sanalmaydigan" : isCommTopic ? "tajriba" : "mashq qilmoq",
          ex: exPos,
          hint: "Mavzuning eng asosiy kalit so'zi."
        },
        {
          word: isPP ? "yet" : isPast ? "ago" : isFuture ? "next week" : isVocabTopic ? "quantity" : isCommTopic ? "position" : "accuracy",
          pos: isVocabTopic ? "noun" : isCommTopic ? "noun" : "adverb",
          uz: isPP ? "hali (inkor/so'roqda)" : isPast ? "oldin" : isFuture ? "keyingi hafta" : isVocabTopic ? "miqdor" : isCommTopic ? "lavozim" : "aniqlik",
          ex: exNeg,
          hint: "Inkor va cheklov kontekstidagi muhim so'z."
        },
        {
          word: isPP ? "since" : isPast ? "last" : isFuture ? "soon" : isVocabTopic ? "plural" : isCommTopic ? "responsibility" : "fluency",
          pos: isVocabTopic ? "noun" : isCommTopic ? "noun" : "adverb",
          uz: isPP ? "-dan beri (boshlanish nuqtasi)" : isPast ? "o'tgan" : isFuture ? "tez orada" : isVocabTopic ? "ko'plik shakli" : isCommTopic ? "mas'uliyat" : "ravonlik",
          ex: exQues,
          hint: "Asosiy tushunchalardan biri."
        },
        {
          word: isPP ? "for" : isPast ? "in 2020" : isFuture ? "intend" : isVocabTopic ? "singular" : isCommTopic ? "opportunity" : "mastery",
          pos: isVocabTopic ? "noun" : isCommTopic ? "noun" : "noun",
          uz: isPP ? "davomida (vaqt oralig'i)" : isPast ? "2020-yilda" : isFuture ? "niyat qilmoq" : isVocabTopic ? "birlik shakli" : isCommTopic ? "imkoniyat" : "mahorat",
          ex: exPos,
          hint: "Mavzuga oid kalit tushuncha."
        },
        {
          word: isPP ? "experience" : isPast ? "previous" : isFuture ? "schedule" : isVocabTopic ? "category" : isCommTopic ? "colleague" : "structure",
          pos: "noun",
          uz: isPP ? "tajriba" : isPast ? "oldingi" : isFuture ? "jadval" : isVocabTopic ? "toifa" : isCommTopic ? "hamkasb" : "struktura",
          ex: "Learning this concept thoroughly gives you immense confidence.",
          hint: "Kontekstdagi asosiy tushuncha."
        }
      ],
      dialog: [
        {
          speaker: "Teacher (Aziz)",
          role: "teacher",
          text: `Have you understood how to use ${topic} properly?`,
          uz: `${topic} mavzusini qanday to'g'ri qo'llashni tushundingizmi?`,
          userOptions: ["Yes, the rule is crystal clear now!", "No, I don't understanding."],
          correctOption: "Yes, the rule is crystal clear now!"
        },
        {
          speaker: "Student (Jasur)",
          role: "student",
          text: `Yes! I can now make positive, negative and question sentences easily.`,
          uz: `Ha! Endi darak, inkor va so'roq gaplarni oson tuza olaman.`,
          userOptions: ["Keep practicing with real examples!", "Stop studying now."],
          correctOption: "Keep practicing with real examples!"
        },
        {
          speaker: "Teacher (Aziz)",
          role: "teacher",
          text: `Excellent. Can you create an example right now?`,
          uz: `Ajoyib. Hozir bitta jonli misol tuza olasizmi?`,
          userOptions: [exPos, "Me do it tomorrow."],
          correctOption: exPos
        },
        {
          speaker: "Student (Jasur)",
          role: "student",
          text: `Here is my sentence: "${exPos}". Is it correct?`,
          uz: `Mana mening gapim: "${exPos}". To'g'rimi?`,
          userOptions: ["Spot on! Perfectly formed sentence.", "Incorrect, try again."],
          correctOption: "Spot on! Perfectly formed sentence."
        },
        {
          speaker: "Teacher (Aziz)",
          role: "teacher",
          text: `Brilliant! Now let's test your skills on the board!`,
          uz: `Ajoyib! Endi doskada bilimingizni sinab ko'ramiz!`
        }
      ],
      errorHunt: isPrep
        ? [
            {
              sentence: `We always meet on 8:00 AM.`,
              errorWord: "on",
              correction: "at",
              explanation: "Aniq vaqt va soatlar (8:00 AM) oldidan 'on' emas, 'at' predlogi ishlatiladi."
            },
            {
              sentence: `She was born in Monday morning.`,
              errorWord: "in",
              correction: "on",
              explanation: "Hafta kunlari (Monday) oldidan har doim 'on' predlogi qo'llaniladi."
            },
            {
              sentence: `We usually go on vacation at July.`,
              errorWord: "at",
              correction: "in",
              explanation: "Oylar va fasllar (July) uchun 'at' emas, 'in' predlogi ishlatiladi."
            },
            {
              sentence: `The bus departs at the morning.`,
              errorWord: "at",
              correction: "in",
              explanation: "'In the morning' to'g'ri turg'un ibora, 'at' xato."
            },
            {
              sentence: `I usually read books on night.`,
              errorWord: "on",
              correction: "at",
              explanation: "'At night' to'g'ri birikma hisoblanadi, 'on night' xato."
            }
          ]
        : isBio
        ? [
            {
              sentence: `He is more better than other athletes.`,
              errorWord: "more better",
              correction: "much better / better",
              explanation: "Sifatning qiyosiy darajasida 'more better' deb birga ishlatilmaydi."
            },
            {
              sentence: `He have scored many goals in finals.`,
              errorWord: "have",
              correction: "has",
              explanation: "He/She/It birlik egalari uchun 'has' yordamchisi ishlatiladi."
            },
            {
              sentence: `He didn't gave up during difficult times.`,
              errorWord: "gave",
              correction: "give",
              explanation: "Didn't yordamchisidan keyin fe'l V1 (give) shaklida bo'ladi."
            },
            {
              sentence: `He plays football since 2002.`,
              errorWord: "plays",
              correction: "has played / has been playing",
              explanation: "O'tmishdan beri davom etayotgan tajriba/jarayon uchun Perfect zamoni kerak."
            },
            {
              sentence: `He don't like losing matches.`,
              errorWord: "don't",
              correction: "doesn't",
              explanation: "He/she/it uchun 'don't' emas, 'doesn't' ishlatiladi."
            }
          ]
        : isPP
        ? [
            {
              sentence: `She has went to London last summer.`,
              errorWord: "went",
              correction: "gone / been",
              explanation: "Present Perfect zamonida V2 (went) emas, fe'lning 3-shakli V3 (gone/been) ishlatilishi shart."
            },
            {
              sentence: `I know him since five years.`,
              errorWord: "since",
              correction: "for",
              explanation: "5 yil davomiylik bo'lgani uchun 'since' emas, 'for' ishlatiladi ('for five years')."
            },
            {
              sentence: `He hasn't finished his homework yet.`,
              errorWord: "already",
              correction: "yet",
              explanation: "Inkor gaplarda 'already' emas, 'yet' gap oxirida keladi."
            },
            {
              sentence: `Did you ever visited that museum?`,
              errorWord: "visited",
              correction: "visit / Have you ever visited",
              explanation: "Hayotiy tajriba haqida so'rashda Present Perfect ('Have you ever visited?') ishlatiladi."
            },
            {
              sentence: `They have lived here since three months.`,
              errorWord: "since",
              correction: "for",
              explanation: "Uch oy - vaqt oralig'i (davr) bo'lgani uchun 'for' ishlatiladi."
            }
          ]
        : isVocabTopic
        ? [
            {
              sentence: `I bought three furnitures for the new office.`,
              errorWord: "furnitures",
              correction: "pieces of furniture / furniture",
              explanation: "'Furniture' sanalmaydigan ot bo'lib, ko'plikda -s olmaydi."
            },
            {
              sentence: `She gave me a very helpful advice yesterday.`,
              errorWord: "a very helpful advice",
              correction: "some helpful advice / a piece of advice",
              explanation: "'Advice' sanalmaydigan ot bo'lgani uchun noaniq 'a' artikli bilan ishlatilmaydi."
            },
            {
              sentence: `How much apples did you buy at the grocery store?`,
              errorWord: "much",
              correction: "many",
              explanation: "Sanaladigan ko'plik otlar (apples) bilan 'much' emas, 'many' ishlatiladi."
            },
            {
              sentence: `Can you give me an information about the schedule?`,
              errorWord: "an information",
              correction: "some information / information",
              explanation: "'Information' sanalmaydi, oldidan 'an' artikli qo'yilmaydi."
            },
            {
              sentence: `We do not have many luggage with us today.`,
              errorWord: "many",
              correction: "much",
              explanation: "'Luggage' sanalmaydigan ot bo'lgani uchun 'many' emas, 'much' ishlatiladi."
            }
          ]
        : isCommTopic
        ? [
            {
              sentence: `I am interesting in applying for this position.`,
              errorWord: "interesting",
              correction: "interested",
              explanation: "Inson his-tuyg'usi va qiziqishi uchun -ed (interested in) qo'llaniladi."
            },
            {
              sentence: `I look forward to hear from you soon.`,
              errorWord: "hear",
              correction: "hearing",
              explanation: "'Look forward to' birikmasidan keyin fe'l har doim -ing (hearing) shaklida bo'ladi."
            },
            {
              sentence: `I am agree with your proposal.`,
              errorWord: "am agree",
              correction: "agree",
              explanation: "'Agree' to be fe'lisiz ishlatiladi: 'I agree'."
            },
            {
              sentence: `Could you tell me where is the interview room?`,
              errorWord: "is the interview room",
              correction: "the interview room is",
              explanation: "Bilvosita so'roqda (Indirect question) so'z tartibi darak gapdek bo'ladi."
            },
            {
              sentence: `I have worked in this field since four years.`,
              errorWord: "since",
              correction: "for",
              explanation: "Davomiylik vaqt oralig'i (four years) uchun 'since' emas, 'for' qo'llaniladi."
            }
          ]
        : [
            {
              sentence: `He don't understand the rules clearly.`,
              errorWord: "don't",
              correction: "doesn't",
              explanation: "Uchinchi shaxs (he/she/it) uchun 'don't' emas, 'doesn't' ishlatiladi."
            },
            {
              sentence: `She is more better at English than before.`,
              errorWord: "more better",
              correction: "much better / better",
              explanation: "Sifatning qiyosiy darajasida 'more better' deb birga ishlatilmaydi."
            },
            {
              sentence: `He didn't knew the exact answer.`,
              errorWord: "knew",
              correction: "know",
              explanation: "Didn't yordamchisidan keyin fe'l har doim V1 (know) shaklida bo'ladi."
            },
            {
              sentence: `They was very excited about the lesson.`,
              errorWord: "was",
              correction: "were",
              explanation: "They ko'plik egasi uchun 'were' ishlatiladi."
            },
            {
              sentence: `She is wanting a new laptop right now.`,
              errorWord: "is wanting",
              correction: "wants",
              explanation: "'Want' holat fe'li bo'lib, Continuous (-ing) shaklida ishlatilmaydi."
            }
          ],
      homework: [
        {
          title: `1-BO'LIM: ${topic} Tarjima Drilli`,
          instructions: "Quyidagi gaplarni qoidaga muvofiq ingliz tiliga tarjima qiling.",
          type: "translate",
          items: [
            { prompt: `1. U allaqachon vazifasini tugatgan.`, hint: exPos },
            { prompt: `2. Biz hali xabar olganimiz yo'q.`, hint: exNeg },
            { prompt: `3. Siz hech qachon samolyotda uchganmisiz?`, hint: exQues }
          ]
        }
      ]
    };

    return NextResponse.json({ ok: true, curriculum: fallbackCurriculum, modelUsed: "synthesizer-backup" });
  } catch (error: any) {
    console.error("Critical error in generate-curriculum API route:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to generate curriculum" },
      { status: 500 }
    );
  }
}
