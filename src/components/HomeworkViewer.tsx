'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Edit3,
  Shuffle,
  Repeat,
  Type,
  Languages,
  GitCompare,
  MessageSquare,
  FileText,
  BookOpen,
  Share2,
  Copy,
  Send,
  Check,
  CheckCircle2,
  Sparkles,
  Link2,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface HomeworkSectionItem {
  id: number;
  question: string;
  options?: string[];
  keyWord?: string;
  promptSecond?: string;
  answer: string;
  explanation: string;
}

export interface HomeworkVocabularyItem {
  id: number;
  word: string;
  pos: string;
  translation: string;
  definition: string;
  example: string;
  collocation?: string;
}

export interface HomeworkGeneratedSection {
  typeKey: string;
  title: string;
  instruction: string;
  items: HomeworkSectionItem[];
}

export interface HomeworkGeneratedData {
  topic: string;
  intensity: 'light' | 'medium' | 'extreme';
  totalCount: number;
  vocabulary?: HomeworkVocabularyItem[];
  sections: HomeworkGeneratedSection[];
}

interface HomeworkViewerProps {
  topic: string;
  data?: HomeworkGeneratedData | null;
  onClose: () => void;
  appLanguage?: 'uz' | 'en' | 'ru';
  isLight?: boolean;
  activeClassroomName?: string;
  activeClassroomId?: string | null;
  onSwitchClassroom?: () => void;
  onAssign?: (data: HomeworkGeneratedData) => void;
}

// Icon mapping for top icon bar matching user copybook drawing
const TYPE_ICON_MAP: Record<string, { icon: React.ElementType; labelEn: string; labelUz: string; labelRu: string }> = {
  mcq: { icon: HelpCircle, labelEn: 'Multiple Choice Questions', labelUz: "Ko'p Variantli Testlar (MCQ)", labelRu: 'Вопросы с выбором ответа' },
  mistake_hunter: { icon: AlertTriangle, labelEn: 'Mistake Hunter', labelUz: "Xatolar Ovchisi", labelRu: 'Охотник за ошибками' },
  open_cloze: { icon: Edit3, labelEn: 'Open / Cloze Fill', labelUz: "Bo'shliqni To'ldirish", labelRu: 'Заполнение пропусков' },
  unscramble: { icon: Shuffle, labelEn: 'Sentence Scramble', labelUz: "Gap Bo'laklarini Tartiblash", labelRu: 'Расстановка слов' },
  sentence_transformation: { icon: Repeat, labelEn: 'Sentence Transformation', labelUz: "Gapni Qayta Tuzish", labelRu: 'Трансформация предложений' },
  word_formation: { icon: Type, labelEn: 'Word Formation', labelUz: "So'z Yasash", labelRu: 'Словообразование' },
  translation: { icon: Languages, labelEn: 'Translation Drill', labelUz: "Tarjima Mashqi", labelRu: 'Упражнение на перевод' },
  contrast_duel: { icon: GitCompare, labelEn: 'Contrast Drill', labelUz: "Qarama-qarshi Qiyoslash", labelRu: 'Контрастное сравнение' },
  dialogue_fill: { icon: MessageSquare, labelEn: 'Dialogue Completion', labelUz: "Muloqotni To'ldirish", labelRu: 'Завершение диалога' },
  writing_challenge: { icon: FileText, labelEn: 'Writing Challenge', labelUz: "Yozma Insho", labelRu: 'Письменное задание' },
  vocabulary: { icon: BookOpen, labelEn: 'Essential Vocabulary', labelUz: "Mavzuviy Lug'at Boyligi", labelRu: 'Ключевой словарный запас' }
};

function getSafeItems(
  isVocabTab: boolean,
  currentSection: HomeworkGeneratedSection | null | undefined,
  vocabulary: HomeworkVocabularyItem[] | undefined,
  typeKey: string,
  topic: string,
  isEn: boolean,
  isRu: boolean
): any[] {
  if (isVocabTab) {
    if (vocabulary && vocabulary.length >= 4) return vocabulary;
    return [
      {
        id: 1,
        word: "accomplish",
        pos: "verb",
        translation: isRu ? "выполнять, завершать" : "bajarmoq, erishmoq",
        definition: "to complete something successfully or reach an objective",
        example: "She has accomplished all her language milestones this year.",
        collocation: "accomplish a goal / task"
      },
      {
        id: 2,
        word: "duration",
        pos: "noun",
        translation: isRu ? "продолжительность" : "davomiylik, muddat",
        definition: "the length of time that an action continues",
        example: "He has maintained consistent focus for the duration of the course.",
        collocation: "for the duration of"
      },
      {
        id: 3,
        word: "consistent",
        pos: "adjective",
        translation: isRu ? "последовательный, постоянный" : "izchil, muntazam",
        definition: "acting or done in the same way over time to ensure quality",
        example: "Consistent practice has greatly improved her spoken fluency.",
        collocation: "consistent effort / practice"
      },
      {
        id: 4,
        word: "milestone",
        pos: "noun",
        translation: isRu ? "важный этап, рубеж" : "muhim bosqich, burilish nuqtasi",
        definition: "a significant stage or breakthrough in learning",
        example: "Completing 10 full modules was a major milestone for him.",
        collocation: "reach a milestone"
      },
      {
        id: 5,
        word: "fluency",
        pos: "noun",
        translation: isRu ? "беглость речи" : "ravonlik, erkin so'zlashuv",
        definition: "the ability to speak or write a language easily and accurately",
        example: "She has been practicing conversational English to achieve fluency.",
        collocation: "achieve / gain fluency"
      },
      {
        id: 6,
        word: "acquire",
        pos: "verb",
        translation: isRu ? "приобретать, осваивать" : "egallamoq, o'zlashtirmoq",
        definition: "to learn or develop a skill or habit over time",
        example: "Students acquire grammatical intuition through communicative practice.",
        collocation: "acquire a skill / language"
      }
    ];
  }

  const existingItems: any[] = currentSection?.items && Array.isArray(currentSection.items)
    ? [...currentSection.items]
    : [];

  if (existingItems.length >= 5) {
    return existingItems;
  }

  const fallbackBank: Record<string, any[]> = {
    mcq: [
      {
        question: `Which sentence correctly illustrates "${topic}" in active use?`,
        options: [
          `A) They have been studying for three hours without a break.`,
          `B) They are study since morning without break.`,
          `C) They has been studied all day without break.`,
          `D) They studied since three hours without break.`
        ],
        answer: "A) They have been studying for three hours without a break.",
        explanation: isEn ? "Correct auxiliary verb and duration marker." : isRu ? "Правильная структура с вспомогательным глаголом и маркером времени." : "To'g'ri yordamchi fe'l va vaqt ko'rsatkichi qo'llangan."
      },
      {
        question: `Choose the sentence with the correct time marker for "${topic}":`,
        options: [
          `A) She has lived in London since five years.`,
          `B) She has lived in London for five years.`,
          `C) She lives in London since five years ago.`,
          `D) She has been living in London during five years.`
        ],
        answer: "B) She has lived in London for five years.",
        explanation: isEn ? "'for' is used with a duration of time." : isRu ? "'for' используется для указания длительности." : "Vaqt davomiyligi uchun 'for' qo'llaniladi."
      },
      {
        question: `Identify the correct negative form related to "${topic}":`,
        options: [
          `A) We haven't seen them since last Monday.`,
          `B) We didn't saw them since last Monday.`,
          `C) We hasn't seen them since last Monday.`,
          `D) We haven't saw them since last Monday.`
        ],
        answer: "A) We haven't seen them since last Monday.",
        explanation: isEn ? "Present perfect negative: haven't + V3 (seen)." : isRu ? "Отрицание: haven't + 3-я форма глагола." : "Present perfect inkor shakli: haven't + V3."
      },
      {
        question: `Which question correctly asks about duration for "${topic}"?`,
        options: [
          `A) How long do you wait here?`,
          `B) How long did you waiting here?`,
          `C) How long have you been waiting here?`,
          `D) How long are you waited here?`
        ],
        answer: "C) How long have you been waiting here?",
        explanation: isEn ? "'How long' with ongoing actions takes have/has + been + V-ing." : isRu ? "Вопрос о длительности продолжающегося действия." : "Davom etayotgan harakat davomiyligi uchun 'How long have you been V-ing'."
      },
      {
        question: `Select the sentence that indicates an action with visible present evidence:`,
        options: [
          `A) The streets are wet because it has been raining.`,
          `B) The streets are wet because it rained last week.`,
          `C) The streets wet because it is rain.`,
          `D) The streets are wet because it has rain.`
        ],
        answer: "A) The streets are wet because it has been raining.",
        explanation: isEn ? "Present result caused by recent continuous activity." : isRu ? "Видимый результат недавнего действия." : "Yaqinda bo'lib o'tgan jarayonning ko'rinib turgan natijasi."
      }
    ],
    mistake_hunter: [
      {
        question: `Find and correct the error: "She has been waited here since two hours."`,
        answer: "waited -> waiting, since -> for",
        explanation: isEn ? "Continuous takes V-ing; period of time takes 'for'." : isRu ? "Continuous требует глагол с -ing; период времени используется с 'for'." : "Continuous uchun fe'l -ing oladi; vaqt oralig'i uchun 'for' ishlatiladi."
      },
      {
        question: `Find and correct the error: "I have visited Rome last December with my family."`,
        answer: "have visited -> visited",
        explanation: isEn ? "Specific finished past time (last December) requires Past Simple." : isRu ? "Указание конкретного времени требует Past Simple." : "Aniq o'tgan vaqt (last December) Past Simple talab qiladi."
      },
      {
        question: `Find and correct the error: "He didn't finished his homework yet."`,
        answer: "didn't finished -> hasn't finished",
        explanation: isEn ? "'yet' in negative contexts requires Present Perfect." : isRu ? "'yet' в отрицании требует Present Perfect." : "'yet' inkor gaplarda Present Perfect talab qiladi."
      },
      {
        question: `Find and correct the error: "How long are you knowing your best friend?"`,
        answer: "are you knowing -> have you known",
        explanation: isEn ? "'know' is a stative verb; use have you known." : isRu ? "'know' не используется в continuous." : "'know' holat fe'li bo'lgani uchun 'have you known' bo'ladi."
      },
      {
        question: `Find and correct the error: "They have been working here since five months."`,
        answer: "since -> for",
        explanation: isEn ? "Use 'for' with periods of duration (five months)." : isRu ? "Используйте 'for' с периодом времени." : "Davomiylik (five months) uchun 'for' ishlatiladi."
      }
    ],
    open_cloze: [
      { question: `It has _______ raining heavily since yesterday morning.`, answer: "been", explanation: "'been' completes the continuous passive/active formula." },
      { question: `They have known each other _______ they were at primary school.`, answer: "since", explanation: "'since' marks the specific starting point in time." },
      { question: `We haven't received any confirmation from the airline _______.`, answer: "yet", explanation: "'yet' is placed at the end of negative present perfect clauses." },
      { question: `He has _______ bought the flight tickets — they are on his desk!`, answer: "already", explanation: "'already' indicates action completed sooner than expected." },
      { question: `How _______ have you been studying English at this academy?`, answer: "long", explanation: "'How long' inquires about duration." }
    ],
    sentence_transformation: [
      {
        question: `We started working on this project in 2022.`,
        keyWord: "SINCE",
        promptSecond: `We _______________________________________ 2022.`,
        answer: "have been working on this project since",
        explanation: "Converts past start into continuous duration from past point."
      },
      {
        question: `I arrived home a few moments ago.`,
        keyWord: "JUST",
        promptSecond: `I _______________________________________ home.`,
        answer: "have just arrived",
        explanation: "Converts past recent arrival into 'have just + V3'."
      },
      {
        question: `This is my first time visiting Istanbul.`,
        keyWord: "NEVER",
        promptSecond: `I _______________________________________ Istanbul before.`,
        answer: "have never visited",
        explanation: "Converts first-time experience into negative life experience."
      },
      {
        question: `She began learning the violin three years ago.`,
        keyWord: "FOR",
        promptSecond: `She _______________________________________ three years.`,
        answer: "has been learning the violin for",
        explanation: "Expresses duration of learning spanning three years."
      },
      {
        question: `Is dinner ready yet?`,
        keyWord: "PREPARED",
        promptSecond: `Have you _______________________________________ yet?`,
        answer: "prepared dinner",
        explanation: "Converts state question into active present perfect."
      }
    ],
    word_formation: [
      { question: `Her spoken English has shown remarkable [IMPROVE] this semester.`, keyWord: "IMPROVE", answer: "improvement", explanation: "Noun required after adjective 'remarkable'." },
      { question: `Consistent daily practice is crucial for language [DEVELOP].`, keyWord: "DEVELOP", answer: "development", explanation: "Noun required after compound subject." },
      { question: `They celebrated their team's outstanding [ACHIEVE] in robotics.`, keyWord: "ACHIEVE", answer: "achievement", explanation: "Noun required after possessive noun." },
      { question: `He explained the grammatical rule with great [CLEAR].`, keyWord: "CLEAR", answer: "clarity", explanation: "Abstract noun after preposition 'with'." },
      { question: `His rapid fluency progress was completely [EXPECT].`, keyWord: "EXPECT", answer: "unexpected", explanation: "Adjective describing surprising outcome." }
    ],
    unscramble: [
      { question: `[waiting / how / you / have / long / been / here / ?]`, answer: "How long have you been waiting here?", explanation: "Standard wh-question order for continuous forms." },
      { question: `[since / lived / has / London / in / 2018 / she / .]`, answer: "She has lived in London since 2018.", explanation: "Subject + has + V3 + place + since + year." },
      { question: `[already / finished / have / report / their / they / .]`, answer: "They have already finished their report.", explanation: "Subject + have + already + V3 + object." },
      { question: `[never / has / such / he / delicious / pizza / eaten / .]`, answer: "He has never eaten such delicious pizza.", explanation: "Subject + has + never + V3 + object." },
      { question: `[all / raining / it / been / morning / has / .]`, answer: "It has been raining all morning.", explanation: "Subject + has been + V-ing + time duration." }
    ],
    translation: [
      {
        question: isRu
          ? `Переведите: «Я изучаю английский язык уже три года.»`
          : `Tarjima qiling: "Men uch yildan beri ingliz tilini o'rganib kelyapman."`,
        answer: "I have been learning English for three years.",
        explanation: "Ongoing duration expressed via present perfect continuous."
      },
      {
        question: isRu
          ? `Переведите: «Она уже завершила этот сложный проект.»`
          : `Tarjima qiling: "U allaqachon bu murakkab loyihani yakunladi."`,
        answer: "She has already completed this complex project.",
        explanation: "Completed action before expected time using 'already'."
      },
      {
        question: isRu
          ? `Переведите: «Вы когда-нибудь летали на вертолёте?»`
          : `Tarjima qiling: "Siz hech qachon vertolyotda uchganmisiz?"`,
        answer: "Have you ever flown in a helicopter?",
        explanation: "Life experience question using 'Have you ever + V3'."
      },
      {
        question: isRu
          ? `Переведите: «Мы не видели нашего учителя с прошлой пятницы.»`
          : `Tarjima qiling: "Biz o'tgan jumadan beri ustozimizni ko'rmadik."`,
        answer: "We haven't seen our teacher since last Friday.",
        explanation: "Negative duration from starting point using 'since'."
      },
      {
        question: isRu
          ? `Переведите: «Почему твои глаза красные? Ты плакал?»`
          : `Tarjima qiling: "Ko'zlaring nega qizargan? Yig'ladingmi?"`,
        answer: "Why are your eyes red? Have you been crying?",
        explanation: "Physical evidence calling for present perfect continuous."
      }
    ],
    contrast_duel: [
      {
        question: `I (have lived / lived) here for 10 years, and I still love this city.`,
        options: ["A) have lived", "B) lived", "C) am living", "D) was lived"],
        answer: "A) have lived",
        explanation: "Action began in past and continues to present."
      },
      {
        question: `I (went / have gone) to Samarkand last summer with my classmates.`,
        options: ["A) went", "B) have gone", "C) have been", "D) am going"],
        answer: "A) went",
        explanation: "Finished time period 'last summer' requires Past Simple."
      },
      {
        question: `She (has written / has been writing) five emails this morning.`,
        options: ["A) has written", "B) has been writing", "C) wrote", "D) is writing"],
        answer: "A) has written",
        explanation: "Completed count (five emails) requires Simple aspect."
      },
      {
        question: `He has been waiting (for / since) 8:30 AM.`,
        options: ["A) since", "B) for", "C) during", "D) from"],
        answer: "A) since",
        explanation: "Specific clock time is a starting point, so 'since' is required."
      },
      {
        question: `My brother (has gone / has been) to Paris; he will return next Monday.`,
        options: ["A) has gone", "B) has been", "C) was", "D) had been"],
        answer: "A) has gone",
        explanation: "'has gone' means traveled there and has not yet returned."
      }
    ],
    dialogue_fill: [
      {
        question: `A: You look exhausted! What have you been doing?\nB: _____________________________________________ (run / 5 kilometers).`,
        answer: "I have been running for 5 kilometers.",
        explanation: "Explains recent activity leading to physical fatigue."
      },
      {
        question: `A: Have you heard from Malika recently?\nB: Yes, she _____________________________________________ (just / call / me).`,
        answer: "She has just called me.",
        explanation: "Reports immediate past communication with 'just'."
      },
      {
        question: `A: How long has your brother worked at Google?\nB: He _____________________________________________ (work / there / since / 2021).`,
        answer: "He has been working there since 2021.",
        explanation: "States employment duration starting in 2021."
      },
      {
        question: `A: Would you like another cup of tea?\nB: No thanks, I _____________________________________________ (already / have / two cups).`,
        answer: "I have already had two cups.",
        explanation: "Polite refusal citing completed quantity with 'already'."
      },
      {
        question: `A: Has the parcel arrived from the courier?\nB: No, it _____________________________________________ (not / arrive / yet).`,
        answer: "It hasn't arrived yet.",
        explanation: "Negative statement about awaited delivery."
      }
    ],
    writing_challenge: [
      {
        question: `Write a short reflective paragraph (5-8 sentences) about a language or professional skill you have been learning recently. Use at least 2 instances of duration (for/since) and contrast with past milestones.`,
        answer: "Sample: I have been studying English for over a year now. Last month, I passed my B1 exam. Since then, I have been practicing speaking daily...",
        explanation: "Requires cohesive integration of continuous and simple aspects."
      },
      {
        question: `Write a progress email to your teacher describing your study habits this week. Mention at least three tasks you have already completed and one you haven't finished yet.`,
        answer: "Sample: Dear Teacher, I have already completed the grammar exercises and written my essay. However, I haven't finished the vocabulary flashcards yet...",
        explanation: "Real-world communicative application of already/yet."
      },
      {
        question: `Describe the changes in your hometown over the last five years. Use present perfect to describe modern developments and contrast with what happened in a specific year.`,
        answer: "Sample: My city has changed dramatically over the last five years. In 2020, the government built a new central park. Since then, many modern cafes have opened...",
        explanation: "Contrasts ongoing city evolution with fixed past events."
      },
      {
        question: `Explain a recent achievement or challenge to a friend. Use present perfect continuous to describe the hard work and present perfect simple for the final result.`,
        answer: "Sample: I have been training for the city marathon for six months. Yesterday, I finally completed the race! My legs are sore because I have been running...",
        explanation: "Synthesizes process with outcome."
      },
      {
        question: `Write an interview response to the question: 'What have you been working on recently that you are proud of?' (5-8 sentences).`,
        answer: "Sample: Recently, I have been leading a digital education initiative. We have designed curriculum modules for over 500 students. Since March, our engagement has grown...",
        explanation: "Professional communicative discourse using target grammar."
      }
    ]
  };

  const fallbacks = fallbackBank[typeKey] || fallbackBank.mcq;
  let idx = existingItems.length;
  while (existingItems.length < 5) {
    const itemToAdd = fallbacks[idx % fallbacks.length];
    existingItems.push({
      ...itemToAdd,
      id: existingItems.length + 1
    });
    idx++;
  }

  return existingItems.map((it, i) => ({ ...it, id: i + 1 }));
}

export default function HomeworkViewer({
  topic,
  data,
  onClose,
  appLanguage = 'uz',
  isLight = false,
  activeClassroomName,
  activeClassroomId,
  onSwitchClassroom,
  onAssign
}: HomeworkViewerProps) {

  // Available tabs: generated sections + vocabulary (guaranteed full set)
  const availableTabs = useMemo(() => {
    const tabs: string[] = [];
    if (data?.sections && data.sections.length > 0) {
      data.sections.forEach((s) => tabs.push(s.typeKey));
    } else {
      tabs.push('mcq', 'mistake_hunter', 'open_cloze', 'sentence_transformation', 'word_formation');
    }
    // Always provide vocabulary tab
    tabs.push('vocabulary');
    return tabs;
  }, [data?.sections]);

  // Active question type tab
  const [activeTabKey, setActiveTabKey] = useState<string>(availableTabs[0] || 'mcq');

  // Carousel page offset (slides by 3 cards)
  const [pageIndex, setPageIndex] = useState<number>(0);

  // Sync activeTabKey whenever new data arrives so it never gets stuck on an empty or missing tab
  React.useEffect(() => {
    if (availableTabs.length > 0 && (!activeTabKey || !availableTabs.includes(activeTabKey))) {
      setActiveTabKey(availableTabs[0]);
      setPageIndex(0);
    }
  }, [availableTabs, activeTabKey]);

  // Answer reveals state
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Direct assign & feedback state
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [isAssigned, setIsAssigned] = useState<boolean>(false);
  const [assignToast, setAssignToast] = useState<string | null>(null);

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const isEn = appLanguage === 'en';
  const isRu = appLanguage === 'ru';

  // 1-Click Direct Assign to Classroom
  const handleDirectAssign = async () => {
    if (isAssigning) return;
    setIsAssigning(true);

    try {
      const targetClassroomName = activeClassroomName || "Yakkaxon rejim";
      const targetClassroomId =
        activeClassroomId ||
        (typeof window !== "undefined" ? localStorage.getItem("teacheros_active_classroom_id") : null) ||
        "classroom_1";

      // If data is null, synthesize a complete homework payload using the viewer's rich content
      const assignPayloadData: HomeworkGeneratedData = (data && data.sections && data.sections.length > 0)
        ? data
        : {
            topic: topic || "English Lesson",
            intensity: "medium",
            totalCount: 10,
            vocabulary: getSafeItems(true, null, undefined, "vocabulary", topic, isEn, isRu),
            sections: availableTabs
              .filter((tabKey) => tabKey !== "vocabulary")
              .slice(0, 3)
              .map((tabKey) => {
                const meta = TYPE_ICON_MAP[tabKey];
                return {
                  typeKey: tabKey,
                  title: meta ? (isEn ? meta.labelEn : isRu ? meta.labelRu : meta.labelUz) : tabKey,
                  instruction: isEn
                    ? "Answer the following questions carefully."
                    : isRu
                    ? "Внимательно ответьте на следующие вопросы."
                    : "Quyidagi mashqlarni diqqat bilan bajaring.",
                  items: getSafeItems(false, undefined, undefined, tabKey, topic, isEn, isRu)
                };
              })
          };

      const payload = {
        classroomId: targetClassroomId,
        classroomName: targetClassroomName,
        topic: topic || "English Lesson",
        data: assignPayloadData,
        assignedBy:
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("teacheros_auth_user") || "{}").first_name || "Ustoz"
            : "Ustoz"
      };

      // 1. Post to persistent API (Supabase Cloud + Local + TMP)
      await fetch('/api/classroom-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 2. Also persist in localStorage across all common keys
      if (typeof window !== "undefined") {
        const key = `teacheros_homeworks_${targetClassroomId}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const newEntry = {
          id: `hw_${Date.now()}`,
          topic: topic,
          classroomId: targetClassroomId,
          classroomName: targetClassroomName,
          createdAt: Date.now(),
          data: assignPayloadData
        };
        const updated = [newEntry, ...existing.filter((x: any) => x.topic !== topic)];
        localStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem("teacheros_homeworks_all", JSON.stringify(updated));
        localStorage.setItem("teacheros_latest_assigned_hw", JSON.stringify(newEntry));
        localStorage.setItem("teacheros_homeworks_classroom_1", JSON.stringify(updated));
      }

      // 3. Confetti effect
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.85, x: 0.85 }
      });

      setIsAssigned(true);
      const successMsg = isEn
        ? `✔ Assigned to ${targetClassroomName}!`
        : isRu
        ? `✔ Назначено для ${targetClassroomName}!`
        : `✔ "${targetClassroomName}" sinfiga biriktirildi!`;
      setAssignToast(successMsg);
      setTimeout(() => setAssignToast(null), 4000);

      onAssign?.(assignPayloadData);
    } catch (e: any) {
      console.error("Assign failed:", e);
      setAssignToast(isEn ? "Failed to assign" : isRu ? "Ошибка назначения" : "Xatolik yuz berdi");
    } finally {
      setIsAssigning(false);
    }
  };

  // Current active section or vocabulary
  const isVocabTab = activeTabKey === 'vocabulary';
  const currentSection = useMemo(() => {
    if (isVocabTab) return null;
    return data?.sections?.find((s) => s.typeKey === activeTabKey) || data?.sections?.[0];
  }, [data?.sections, activeTabKey, isVocabTab]);

  // All items for current tab - GUARANTEES AT LEAST 5 ITEMS (ALWAYS 3 CARDS ON PAGE 0)
  const allCurrentItems = useMemo(() => {
    return getSafeItems(isVocabTab, currentSection, data?.vocabulary, activeTabKey, topic, isEn, isRu);
  }, [isVocabTab, currentSection, data?.vocabulary, activeTabKey, topic, isEn, isRu]);

  const totalItemsCount = allCurrentItems.length;

  // Split all current items into pages of 3 items
  const pages = useMemo(() => {
    const chunks: (typeof allCurrentItems)[] = [];
    for (let i = 0; i < allCurrentItems.length; i += 3) {
      chunks.push(allCurrentItems.slice(i, i + 3));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [allCurrentItems]);

  // Reset page index when switching tabs
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    setPageIndex(0);
  };

  const handlePrev = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setPageIndex((prev) => Math.min(pages.length - 1, prev + 1));
  };

  // Active tab title
  const activeTitle = useMemo(() => {
    if (isVocabTab) {
      return isEn ? 'ESSENTIAL VOCABULARY' : isRu ? 'КЛЮЧЕВОЙ СЛОВАРНЫЙ ЗАПАС' : "MAVZUViY LUG'AT BOYLIGI";
    }
    const def = TYPE_ICON_MAP[activeTabKey];
    if (def) {
      return (isEn ? def.labelEn : isRu ? def.labelRu : def.labelUz).toUpperCase();
    }
    return currentSection?.title?.toUpperCase() || 'QUESTIONS';
  }, [activeTabKey, isVocabTab, currentSection, isEn, isRu]);

  // Toggle single item answer
  const toggleAnswerReveal = (idKey: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [idKey]: !prev[idKey] }));
  };

  const triggerCopyFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Copy Student Link
  const handleCopyStudentLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://teacheros.app';
    const link = `${origin}/homework?topic=${encodeURIComponent(topic)}&intensity=${data?.intensity || 'medium'}`;
    navigator.clipboard.writeText(link);
    triggerCopyFeedback(isEn ? 'Link Copied!' : isRu ? 'Ссылка скопирована!' : 'Havola nusxalandi!');
  };

  // Dispatch to Telegram
  const handleDispatchTelegram = () => {
    if (!data) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://teacheros.app';
    const link = `${origin}/homework?topic=${encodeURIComponent(topic)}`;
    const text =
      `📚 *Teacher OS: ${topic}*\n` +
      `🔥 ${data.totalCount} ${isEn ? "homework tasks assigned" : isRu ? "заданий назначено" : "ta uyga vazifa tayyor"}\n\n` +
      `👉 ${link}`;

    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank');
  };

  // Copy tasks only
  const handleCopyTasksOnly = () => {
    if (!data?.sections) return;
    let text = `📝 ${topic} — ${isEn ? "Homework" : isRu ? "Домашнее задание" : "Uyga Vazifa"}\n\n`;
    data.sections.forEach((sec) => {
      text += `📌 ${sec.title}\n`;
      sec.items.forEach((it, idx) => {
        text += `${idx + 1}. ${it.question}\n`;
        if (it.promptSecond) text += `   ➔ ${it.promptSecond}\n`;
        if (it.options) text += `   ${it.options.join('\n   ')}\n`;
        text += '\n';
      });
      text += '---\n\n';
    });
    if (data.vocabulary && data.vocabulary.length > 0) {
      text += `📖 Vocabulary:\n`;
      data.vocabulary.forEach((v, idx) => {
        text += `${idx + 1}. ${v.word} (${v.pos}) — ${v.translation}: ${v.example}\n`;
      });
    }
    navigator.clipboard.writeText(text);
    triggerCopyFeedback(isEn ? 'Tasks Copied!' : isRu ? 'Задания скопированы!' : 'Vazifalar nusxalandi!');
  };

  // Copy full teacher key
  const handleCopyTeacherKey = () => {
    if (!data?.sections) return;
    let text = `📝 ${topic} — Teacher Key (Ustoz Kaliti)\n\n`;
    data.sections.forEach((sec) => {
      text += `📌 ${sec.title}\n`;
      sec.items.forEach((it, idx) => {
        text += `${idx + 1}. ${it.question}\n`;
        if (it.options) text += `   ${it.options.join('\n   ')}\n`;
        text += `   ✅ Answer: ${it.answer}\n`;
        if (it.explanation) text += `   💡 Note: ${it.explanation}\n`;
        text += '\n';
      });
      text += '---\n\n';
    });
    navigator.clipboard.writeText(text);
    triggerCopyFeedback(isEn ? 'Key Copied!' : isRu ? 'Ключи скопированы!' : 'Barcha javoblar nusxalandi!');
  };

  return (
    <div className="w-full h-full max-h-[calc(100vh-2rem)] flex flex-col justify-between select-none animate-fade-in relative overflow-y-auto scrollbar-thin px-1 py-1 gap-2 sm:gap-3">
      {/* 1. TOP BAR: [X] Button on left + Question Type Icons Row in center + Key Toggle on right */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        {/* [X] Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95 backdrop-blur-md ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
              : 'bg-white/5 hover:bg-white/15 border-white/15 text-slate-300 hover:text-white'
          }`}
          title="Yopish (Close)"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Center Row of Question Type Icons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 overflow-x-auto py-1 px-1 scrollbar-none justify-center flex-1 max-w-xl">
          {availableTabs.map((typeKey) => {
            const isActive = activeTabKey === typeKey;
            const def = TYPE_ICON_MAP[typeKey] || { icon: HelpCircle };
            const Icon = def.icon;

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => handleTabChange(typeKey)}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all cursor-pointer shrink-0 relative backdrop-blur-md ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.55)] scale-105 font-black'
                    : isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-950 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-400 hover:text-white hover:border-white/30'
                }`}
                title={TYPE_ICON_MAP[typeKey]?.labelEn || typeKey}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />

                {/* Micro indicator dot if active */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Global Answer Eye Toggle */}
        <button
          type="button"
          onClick={() => setShowAllAnswers((prev) => !prev)}
          className={`h-9 sm:h-11 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 backdrop-blur-md ${
            showAllAnswers
              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-black'
              : isLight
              ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-300 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/15'
          }`}
          title={showAllAnswers ? "Javoblarni yashirish" : "Javoblarni ko'rish"}
        >
          {showAllAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden md:inline font-mono">
            {showAllAnswers
              ? isEn ? 'Hide Key' : isRu ? 'Скрыть ключи' : 'Javoblarni yashirish'
              : isEn ? 'Show Key' : isRu ? 'Показать ключи' : 'Kalitlar'}
          </span>
        </button>
      </div>

      {/* 2. TITLE: Centered Bold Uppercase */}
      <div className="text-center space-y-1 shrink-0">
        {activeClassroomName && (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onSwitchClassroom}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-all cursor-pointer shadow-sm ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400/40'
              }`}
              title="Sinfxonani almashtirish (Switch Classroom)"
            >
              <span>🏫 {activeClassroomName}</span>
              {onSwitchClassroom && <span className="opacity-70 text-[10px] font-bold">⇄</span>}
            </button>
          </div>
        )}
        <h2 className={`text-base sm:text-xl font-black tracking-widest uppercase font-sans ${isLight ? "text-slate-900" : "text-white"}`}>
          {activeTitle}
        </h2>
        <p className={`text-[11px] sm:text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          {isVocabTab
            ? `${data?.vocabulary?.length || 0} core terms for ${topic}`
            : currentSection?.instruction || `${totalItemsCount} practice questions`}
        </p>
      </div>

      {/* 3. CENTER CAROUSEL: [<] Arrow + Sliding Track of 3 Visible Cards + [>] Arrow */}
      <div className="w-full flex-1 flex items-center justify-between gap-2 sm:gap-3 relative my-auto min-h-0">
        {/* Left Arrow Button [<] */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={pageIndex === 0}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xl backdrop-blur-md ${
            pageIndex === 0
              ? 'bg-transparent border-transparent text-slate-400 opacity-20 cursor-not-allowed'
              : isLight
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 hover:scale-105 active:scale-95 shadow-md'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:scale-105 active:scale-95'
          }`}
          title="Oldingi (Previous)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Viewport: overflow-hidden */}
        <div className="flex-1 overflow-hidden relative py-1">
          {/* Sliding Track: Physically pushes 3 cards to left upon Next */}
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${pageIndex * 100}%)` }}
          >
            {pages.map((pageCards, pIdx) => (
              <div
                key={pIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 px-1 items-stretch"
              >
                {pageCards.map((item: any, cardIdx: number) => {
                  const itemNumber = pIdx * 3 + cardIdx + 1;
                  const itemKey = `${activeTabKey}-${item.id || itemNumber}`;
                  const isRevealed = showAllAnswers || !!revealedAnswers[itemKey];

                  // Render Vocabulary Card if on vocab tab
                  if (isVocabTab) {
                    const vocab = item as HomeworkVocabularyItem;
                    return (
                      <div
                        key={vocab.id || cardIdx}
                        className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-5 flex flex-col justify-between space-y-2.5 sm:space-y-3.5 shadow-xl backdrop-blur-xl transition-all group ${
                          isLight
                            ? 'bg-white border-slate-200 hover:border-emerald-500/60 text-slate-900 shadow-xl'
                            : 'bg-[#141624]/90 border-white/10 hover:border-emerald-500/40 text-white'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center font-mono">
                              {itemNumber}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-slate-300 border border-white/10'
                            }`}>
                              {vocab.pos}
                            </span>
                          </div>

                          <div>
                            <h4 className={`text-base sm:text-lg font-black transition-colors ${
                              isLight ? 'text-slate-900 group-hover:text-emerald-600' : 'text-white group-hover:text-emerald-300'
                            }`}>
                              {vocab.word}
                            </h4>
                            <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                              {vocab.translation}
                            </p>
                          </div>

                          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {vocab.definition}
                          </p>

                          <div className={`p-2.5 rounded-xl border text-xs italic ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/40 border-white/5 text-slate-200'
                          }`}>
                            "{vocab.example}"
                          </div>

                          {vocab.collocation && (
                            <div className={`text-[11px] font-mono pt-0.5 ${isLight ? 'text-amber-700 font-bold' : 'text-amber-300/90'}`}>
                              🔗 <b>Collocation:</b> {vocab.collocation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Standard Question Card
                  const qItem = item as HomeworkSectionItem;
                  return (
                    <div
                      key={qItem.id || cardIdx}
                      className={`rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 md:p-5 flex flex-col justify-between space-y-2.5 sm:space-y-3.5 shadow-xl backdrop-blur-xl transition-all text-left group overflow-hidden ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-emerald-500/60 text-slate-900 shadow-xl'
                          : 'bg-[#141624]/90 border-white/10 hover:border-emerald-500/40 text-white'
                      }`}
                    >
                      <div className="space-y-2.5 flex-1 min-h-0 flex flex-col justify-between">
                        {/* Card Header: Number badge + Answer reveal toggle */}
                        <div className="flex items-center justify-between gap-2 pb-0.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center font-mono shrink-0">
                            {itemNumber}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleAnswerReveal(itemKey)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              isRevealed
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-black'
                                : isLight
                                ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                                : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                            }`}
                          >
                            {isRevealed ? 'Hide' : 'Answer'}
                          </button>
                        </div>

                        {/* Question Prompt */}
                        <div className={`text-xs sm:text-[13px] md:text-sm font-bold leading-snug whitespace-pre-line ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {qItem.question}
                        </div>

                        {/* Secondary Prompt (e.g. for transformation) */}
                        {qItem.promptSecond && (
                          <div className={`p-2 rounded-xl border text-[11px] sm:text-xs font-mono ${
                            isLight
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                          }`}>
                            ➔ {qItem.promptSecond}
                          </div>
                        )}

                        {/* Key Word Badge */}
                        {qItem.keyWord && (
                          <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-mono font-black ${
                            isLight
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          }`}>
                            <span>KEY:</span>
                            <span className="underline">{qItem.keyWord}</span>
                          </div>
                        )}

                        {/* Options */}
                        {qItem.options && qItem.options.length > 0 && (
                          <div className="space-y-1 sm:space-y-1.5 pt-0.5 overflow-y-auto max-h-[26vh] sm:max-h-[32vh] scrollbar-thin">
                            {qItem.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-medium transition-colors ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                    : 'bg-black/40 border-white/5 text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Revealed Answer Box */}
                      {isRevealed && (
                        <div className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs space-y-0.5 animate-fade-in shrink-0 mt-2 ${
                          isLight
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                        }`}>
                          <div className={`flex items-center space-x-1.5 font-black ${
                            isLight ? 'text-emerald-900' : 'text-emerald-300'
                          }`}>
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{qItem.answer}</span>
                          </div>
                          {qItem.explanation && (
                            <p className={`text-[10px] sm:text-[11px] pl-5 leading-tight ${
                              isLight ? 'text-slate-700' : 'text-slate-300'
                            }`}>
                              💡 {qItem.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow Button [>] */}
        <button
          type="button"
          onClick={handleNext}
          disabled={pageIndex >= pages.length - 1}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xl backdrop-blur-md ${
            pageIndex >= pages.length - 1
              ? 'bg-transparent border-transparent text-slate-400 opacity-20 cursor-not-allowed'
              : isLight
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 hover:scale-105 active:scale-95 shadow-md'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:scale-105 active:scale-95'
          }`}
          title="Keyingi (Next)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 4. BOTTOM BAR: Page indicator on left + 1-Click [ASSIGN] Button on right */}
      <div className="w-full flex items-center justify-between pt-1 sm:pt-2 shrink-0">
        <div className={`text-xs font-mono flex items-center space-x-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
            {totalItemsCount > 0
              ? `${pageIndex * 3 + 1} - ${Math.min((pageIndex + 1) * 3, totalItemsCount)} / ${totalItemsCount}`
              : '0 / 0'}
          </span>
          <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>•</span>
          <span className="hidden sm:inline">
            {isEn ? 'Use arrows to navigate' : isRu ? 'Стрелки для перелистывания' : "O'tkazish uchun strelkalardan foydalaning"}
          </span>
        </div>

        {/* 1-Click ASSIGN Button directly assigning to active classroom */}
        <div className="flex items-center space-x-2.5">
          {assignToast && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 animate-fade-in flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{assignToast}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleDirectAssign}
            disabled={isAssigning}
            className={`px-7 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 shadow-lg active:scale-95 ${
              isAssigned
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.7)]"
                : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] hover:scale-105"
            }`}
          >
            {isAssigned ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isEn ? "ASSIGNED ✔" : isRu ? "НАЗНАЧЕНО ✔" : "BIRIKTIRILDI ✔"}</span>
              </>
            ) : isAssigning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{isEn ? "ASSIGNING..." : isRu ? "НАЗНАЧЕНИЕ..." : "BIRIKTIRILMOQDA..."}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span>ASSIGN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. ASSIGN TO STUDENTS MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl relative border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#12141F] border-emerald-500/40 text-slate-100'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Share2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {isEn ? 'Assign Homework' : isRu ? 'Назначить задание' : "O'quvchilarga Vazifa Berish"}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {topic} • {data?.totalCount || 0} {isEn ? 'tasks' : isRu ? 'заданий' : 'ta vazifa'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Option 1: Copy Link */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-2 text-xs font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                    <Link2 className="w-4 h-4" />
                    <span>{isEn ? 'Student Assignment Link' : isRu ? 'Ссылка для учеников' : 'Talabalar uchun havola'}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Direct Link</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://teacheros.app'}/homework?topic=${encodeURIComponent(topic)}`}
                    className={`flex-1 border rounded-xl px-3 py-2 text-xs font-mono truncate focus:outline-none ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-black/40 border-white/10 text-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleCopyStudentLink}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
                  >
                    <Copy className="w-3.5 h-3.5 inline mr-1" />
                    {copyFeedback === (isEn ? 'Link Copied!' : isRu ? 'Ссылка скопирована!' : 'Havola nusxalandi!')
                      ? '✓'
                      : isEn ? 'Copy' : isRu ? 'Копировать' : 'Nusxa'}
                  </button>
                </div>
              </div>

              {/* Option 2: Dispatch to Classroom Telegram */}
              <button
                type="button"
                onClick={handleDispatchTelegram}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 border border-sky-500/30 text-left transition-all group flex items-center justify-between cursor-pointer shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold ${isLight ? 'text-slate-900 group-hover:text-sky-700' : 'text-white group-hover:text-sky-200'}`}>
                      {isEn ? 'Dispatch to Classroom Telegram' : isRu ? 'Отправить в Telegram класс' : 'Telegram Sinf Guruhiga Yuborish'}
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? 'Shares directly via Telegram with one click' : isRu ? 'Мгновенная отправка в Telegram группу' : 'Bir bosish bilan dars guruhiga yuboriladi'}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 3: Copy Student Tasks (No Answers) */}
              <button
                type="button"
                onClick={handleCopyTasksOnly}
                className={`w-full p-4 rounded-2xl border text-left transition-all group flex items-center justify-between cursor-pointer ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
                    isLight ? 'bg-slate-200 text-emerald-700' : 'bg-white/10 text-white'
                  }`}>
                    <FileText className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isEn ? 'Copy Tasks Only (No Answers)' : isRu ? 'Скопировать задания (без ответов)' : 'Faqat topshiriqlar matni (javoblarsiz)'}
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? 'Clean text for chat or paper printout' : isRu ? 'Чистый текст для печати или чата' : 'Chop etish yoki chatga tashlash uchun qulay'}
                    </div>
                  </div>
                </div>
                <Copy className={`w-4 h-4 transition-colors ${isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
              </button>

              {/* Option 4: Copy Full Key */}
              <button
                type="button"
                onClick={handleCopyTeacherKey}
                className={`w-full p-4 rounded-2xl border text-left transition-all group flex items-center justify-between cursor-pointer ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
                    isLight ? 'bg-slate-200 text-amber-700' : 'bg-white/10 text-white'
                  }`}>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isEn ? 'Copy Full Teacher Key' : isRu ? 'Скопировать ключи учителя' : 'Ustoz kaliti (barcha javoblar bilan)'}
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? 'All questions with verified answers & notes' : isRu ? 'Все вопросы с ответами и пояснениями' : 'Barcha savollar to\'g\'ri javoblari bilan'}
                    </div>
                  </div>
                </div>
                <Copy className={`w-4 h-4 transition-colors ${isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isEn ? 'Done' : isRu ? 'Готово' : 'Tayyor'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
