import { Curriculum } from "./types";

export const MASTER_CURRICULUMS: Record<string, Curriculum> = {
  past_simple_a1: {
    id: "past_simple_a1",
    topic: "Past Simple & Irregular Verbs",
    level: "A1",
    category: "Grammar & Vocabulary",
    description: "O'tgan oddiy zamon, to'g'ri va noto'g'ri fe'llar qoidasi, 30 ta eng muhim noto'g'ri fe'l va talaffuz.",
    slides: [
      {
        id: "ps1",
        tag: "📖 1-SLAYD: MOHIYAT",
        title: "Past Simple: O'tmishdagi Aniq Nuqta",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Past Simple zamoni o'tmishda <b>boshlanib, aniq vaqtda butunlay tugagan</b> ish-harakatlar uchun ishlatiladi.</p>
          <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 font-mono text-sm space-y-1">
            <div class="text-emerald-400">✅ I visited Bukhara last summer. (O'tgan yoz — tugagan!)</div>
            <div class="text-emerald-400">✅ She cooked dinner two hours ago. (2 soat oldin — tugagan!)</div>
          </div>
        </div>`,
        visual: {
          type: "timeline",
          title: "Past Simple Vaqt Chizig'i",
          subtitle: "O'tmishda aniq tugagan hodisa (Completed Point in Past)",
          data: {
            events: [
              { label: "O'tmish (Past)", icon: "📍", tense: "Past Simple", example: "I bought a laptop yesterday.", desc: "Aniq o'tgan vaqtda tugadi" },
              { label: "Hozir (Now)", icon: "⏱️", tense: "Present", example: "Now I am working.", desc: "O'tmishdagi ish hozirga cho'zilmagan" },
              { label: "Kelajak (Future)", icon: "🚀", tense: "Future", example: "Tomorrow I will rest.", desc: "Kelasi rejalar" }
            ],
            tenseComparison: [
              { title: "Vaqt ko'rsatkichi bilan", text: "I finished the project yesterday.", isPositive: true, note: "yesterday, last night, in 2020 bor → Past Simple" },
              { title: "Xato shakl", text: "I finish the project yesterday.", isPositive: false, note: "O'tmishda fe'l o'zgarmasdan qolishi xato!" }
            ]
          }
        }
      },
      {
        id: "ps2",
        tag: "⚡ 2-SLAYD: NOTO'G'RI FE'LLAR",
        title: "To'g'ri vs Noto'g'ri Fe'llar (3 Ustun)",
        body: `<div class="space-y-3 text-slate-300">
          <p>Ingliz tilida fe'llar ikkiga bo'linadi: <b>Regular</b> (-ed oladi: watch $\\rightarrow$ watched) va <b>Irregular</b> (ildizdan o'zgaradi: go $\\rightarrow$ went $\\rightarrow$ gone).</p>
        </div>`,
        visual: {
          type: "verb_matrix",
          title: "30 ta Eng Muhim Noto'g'ri Fe'llar",
          data: {
            verbs: [
              { v1: "be", v2: "was / were", v3: "been", uz: "bo'lmoq" },
              { v1: "become", v2: "became", v3: "become", uz: "bo'lmoq (o'zgarmoq)" },
              { v1: "begin", v2: "began", v3: "begun", uz: "boshlamoq" },
              { v1: "break", v2: "broke", v3: "broken", uz: "sindirmoq" },
              { v1: "bring", v2: "brought", v3: "brought", uz: "olib kelmoq" },
              { v1: "buy", v2: "bought", v3: "bought", uz: "sotib olmoq" },
              { v1: "catch", v2: "caught", v3: "caught", uz: "tutmoq, ushlamoq" },
              { v1: "choose", v2: "chose", v3: "chosen", uz: "tanlamoq" },
              { v1: "come", v2: "came", v3: "come", uz: "kelmoq" },
              { v1: "do", v2: "did", v3: "done", uz: "qilmoq, bajarmoq" },
              { v1: "drink", v2: "drank", v3: "drunk", uz: "ichmoq" },
              { v1: "drive", v2: "drove", v3: "driven", uz: "haydamoq" },
              { v1: "eat", v2: "ate", v3: "eaten", uz: "yemoq" },
              { v1: "fall", v2: "fell", v3: "fallen", uz: "yiqilmoq" },
              { v1: "feel", v2: "felt", v3: "felt", uz: "his qilmoq" },
              { v1: "find", v2: "found", v3: "found", uz: "topmoq" },
              { v1: "fly", v2: "flew", v3: "flown", uz: "uchmoq" },
              { v1: "forget", v2: "forgot", v3: "forgotten", uz: "unutmoq" },
              { v1: "get", v2: "got", v3: "got / gotten", uz: "olmoq, yetib bormoq" },
              { v1: "give", v2: "gave", v3: "given", uz: "bermoq" },
              { v1: "go", v2: "went", v3: "gone", uz: "bormoq" },
              { v1: "have", v2: "had", v3: "had", uz: "ega bo'lmoq" },
              { v1: "hear", v2: "heard", v3: "heard", uz: "eshitmoq" },
              { v1: "know", v2: "knew", v3: "known", uz: "bilmoq" },
              { v1: "leave", v2: "left", v3: "left", uz: "tark etmoq, jo'namoq" },
              { v1: "lose", v2: "lost", v3: "lost", uz: "yo'qotmoq" },
              { v1: "make", v2: "made", v3: "made", uz: "yasamoq, qilmoq" },
              { v1: "meet", v2: "met", v3: "met", uz: "uchrashmoq" },
              { v1: "pay", v2: "paid", v3: "paid", uz: "to'lamoq" },
              { v1: "read", v2: "read", v3: "read", uz: "o'qimoq" }
            ]
          }
        }
      },
      {
        id: "ps3",
        tag: "🎯 3-SLAYD: FORMULA",
        title: "Inkor va So'roq Qoidasi (did / didn't)",
        body: `<div class="space-y-3 text-slate-300">
          <p>O'zbek o'quvchilari uchun eng katta tuzoq: <b>didn't</b> yoki <b>did</b> kelganda fe'l yana o'zining V1 (asl) shakliga qaytadi!</p>
          <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 font-mono text-sm space-y-1">
            <div class="text-rose-400">❌ I didn't went to school. (XATO!)</div>
            <div class="text-emerald-400">✅ I didn't go to school. (TO'G'RI: did oldi!)</div>
          </div>
        </div>`,
        visual: {
          type: "formula",
          title: "Past Simple Formulalari",
          data: {
            positive: [
              { role: "subject", label: "Ega", value: "I / You / We / They / He / She" },
              { role: "verb", label: "Fe'l (V2)", value: "went / played / ate" },
              { role: "object", label: "Vaqt", value: "yesterday" }
            ],
            negative: [
              { role: "subject", label: "Ega", value: "Subject" },
              { role: "aux", label: "Yordamchi", value: "DID NOT (didn't)" },
              { role: "verb", label: "Asl Fe'l (V1)", value: "go / play / eat" },
              { role: "object", label: "To'ldiruvchi", value: "yesterday" }
            ],
            question: [
              { role: "aux", label: "Boshida", value: "DID" },
              { role: "subject", label: "Ega", value: "you / he / she" },
              { role: "verb", label: "Asl Fe'l (V1)", value: "go / play / eat" },
              { role: "object", label: "Vaqt?", value: "yesterday?" }
            ]
          }
        }
      }
    ],
    flashcards: [
      { word: "yesterday", pos: "adverb", uz: "kecha", ex: "I saw an old friend yesterday." },
      { word: "last week", pos: "phrase", uz: "o'tgan hafta", ex: "We bought a car last week." },
      { word: "ago", pos: "adverb", uz: "...oldin", ex: "The film started ten minutes ago." },
      { word: "decide", pos: "verb", uz: "qaror qilmoq", ex: "She decided to study English." },
      { word: "arrive", pos: "verb", uz: "yetib kelmoq", ex: "They arrived at the hotel safely." },
      { word: "remember", pos: "verb", uz: "eslamoq", ex: "He remembered his teacher's advice." },
      { word: "forget", pos: "verb", uz: "unutmoq", ex: "I forgot my phone at home." },
      { word: "happen", pos: "verb", uz: "sodir bo'lmoq", ex: "What happened yesterday night?" }
    ],
    quiz: [
      { q: "Where ______ you ______ on holiday last summer?", opts: ["did / go", "did / went", "were / go", "have / gone"], ans: "did / go", expl: "'did' bo'lganda asosiy fe'l V1 shaklida bo'ladi: did ... go." },
      { q: "She ______ a delicious cake for my birthday.", opts: ["made", "maked", "make", "was make"], ans: "made", expl: "make fe'lining o'tgan zamon shakli (V2) 'made' bo'ladi." },
      { q: "I ______ any coffee this morning.", opts: ["didn't drink", "didn't drank", "not drank", "wasn't drink"], ans: "didn't drink", expl: "Inkor gapda didn't + V1 (drink)." }
    ],
    homework: [
      {
        title: "1-Bo'lim: Noto'g'ri Fe'llarni Topish",
        instructions: "Qavs ichidagi fe'llarning to'g'ri V2 shaklini yozing.",
        type: "fill_blank",
        items: [
          { prompt: "Yesterday I ______ (go) to the market and ______ (buy) some fruit.", hint: "went / bought" },
          { prompt: "We ______ (see) an exciting movie last night.", hint: "saw" },
          { prompt: "She ______ (not eat) breakfast this morning.", hint: "didn't eat" }
        ]
      }
    ]
  },

  stative_verbs_a1: {
    id: "stative_verbs_a1",
    topic: "Stative vs Dynamic Verbs & 'Need'",
    level: "A1",
    category: "Grammar & Vocabulary",
    description: "Holat va harakat fe'llari farqi, 'need' fe'lining 2 ta shakli (need + noun vs need + to + verb).",
    slides: [
      {
        id: "sv1",
        tag: "🧠 1-SLAYD: KONTRAST",
        title: "Holat Fe'li (Stative) vs Harakat Fe'li (Dynamic)",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Ba'zi fe'llar <b>jismoniy harakat emas</b>, balki insonning ichki holatini, xohishini yoki his-tuyg'usini bildiradi. Ular odatda <b>-ing</b> (Continuous) qo'shimchasini OLMAYDI!</p>
        </div>`,
        visual: {
          type: "metaphor",
          title: "Miya Holati vs Jismoniy Harakat",
          subtitle: "Stative (Continuous bo'lmaydi) vs Dynamic (Continuous bo'ladi)",
          data: {
            left: {
              icon: "🧠",
              badge: "STATIVE (HOLAT)",
              title: "Ichki Holat / Fikr",
              desc: "know, like, want, understand, need, believe. Bu fe'llar miyada sodir bo'ladi, ko'z bilan ko'rib bo'lmaydi. Hech qachon -ing olmaydi!",
              theme: "emerald",
              examples: [
                { text: "✅ I know the answer. (Men bilaman)" },
                { text: "❌ I am knowing the answer. (XATO!)" },
                { text: "✅ She likes ice cream." }
              ]
            },
            right: {
              icon: "🏃",
              badge: "DYNAMIC (HARAKAT)",
              title: "Jismoniy Harakat",
              desc: "run, cook, write, play, drive, eat. Bu fe'llar aniq jismoniy harakat. Ularga bemalol -ing qo'shish mumkin!",
              theme: "sky",
              examples: [
                { text: "✅ He is running right now." },
                { text: "✅ They are cooking dinner." },
                { text: "✅ I am writing a letter." }
              ]
            }
          }
        }
      },
      {
        id: "sv2",
        tag: "⚡ 2-SLAYD: 'NEED' QOIDASI",
        title: "Need + Noun (Ot) vs Need + to + Verb (Fe'l)",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed"><b>Need</b> fe'li o'quvchilarda eng ko'p adashtiriladigan so'z. Qoidasi juda oddiy:</p>
        </div>`,
        visual: {
          type: "metaphor",
          title: "'Need' Fe'lining Ikkita Shakli",
          subtitle: "To'g'ridan-to'g'ri narsa kerakmi yoki ish qilish kerakmi?",
          data: {
            left: {
              icon: "💧",
              badge: "NEED + NARSA",
              title: "1-Shakl: Need + Ot (Noun)",
              desc: "Sizga biron bir narsa (suv, qalam, pul, vaqt) kerak bo'lganda 'to' ishlatilmaydi!",
              theme: "indigo",
              examples: [
                { text: "✅ I need water. (Menga suv kerak)" },
                { text: "✅ She needs help. (Unga yordam kerak)" },
                { text: "✅ We need money. (Bizga pul kerak)" }
              ]
            },
            right: {
              icon: "🛠️",
              badge: "NEED + TO + FE'L",
              title: "2-Shakl: Need + to + Fe'l (Verb)",
              desc: "Siz biror ish-harakatni bajarishingiz kerak bo'lsa, albatta 'TO' qo'yiladi!",
              theme: "emerald",
              examples: [
                { text: "✅ I need to drink water. (Suv ichishim kerak)" },
                { text: "✅ She needs to sleep. (U uxlashi kerak)" },
                { text: "✅ We need to go home. (Biz uyga ketishimiz kerak)" }
              ]
            }
          }
        }
      }
    ],
    flashcards: [
      { word: "need", pos: "verb", uz: "muhtoj bo'lmoq, kerak bo'lmoq", ex: "I need some help with this exercise." },
      { word: "want", pos: "verb", uz: "xohlamoq", ex: "She wants a glass of water." },
      { word: "know", pos: "verb", uz: "bilmoq", ex: "Do you know his phone number?" },
      { word: "understand", pos: "verb", uz: "tushunmoq", ex: "I understand the rule now." },
      { word: "like", pos: "verb", uz: "yoqtirmoq", ex: "They like English lessons." },
      { word: "water", pos: "noun", uz: "suv", ex: "I need water right now." },
      { word: "sleep", pos: "verb", uz: "uxlamoq", ex: "He is tired and needs to sleep." },
      { word: "help", pos: "noun/verb", uz: "yordam / yordam bermoq", ex: "We need your help." }
    ],
    quiz: [
      { q: "I am thirsty. I ______ some cold water.", opts: ["need", "am needing", "needs", "needing"], ans: "need", expl: "'need' holat fe'li, Continuous (-ing) olmaydi va narsa (water) bilan to'g'ridan-to'g'ri keladi." },
      { q: "She is exhausted. She ______ right now.", opts: ["needs to rest", "needs rest to", "is needing rest", "need to rest"], ans: "needs to rest", expl: "Ish-harakat (rest) bo'lgani uchun: needs + to + rest." },
      { q: "Do you ______ this word?", opts: ["understand", "understanding", "understands", "are understanding"], ans: "understand", expl: "'understand' holat fe'li bo'lib, hozirgi zamonda oddiygina Present Simple bilan ishlatiladi." }
    ],
    homework: [
      {
        title: "1-Bo'lim: Need yoki Need to?",
        instructions: "To'g'ri variantni tanlang.",
        type: "mcq",
        items: [
          { prompt: "I ______ a new pen for school.", options: ["need", "need to"], answer: "need" },
          { prompt: "We ______ buy some bread.", options: ["need", "need to"], answer: "need to" }
        ]
      }
    ]
  },

  present_simple_future_b1: {
    id: "present_simple_future_b1",
    topic: "Present Simple for Future (Schedules)",
    level: "B1",
    category: "Grammar & Vocabulary",
    description: "Jadvallar, transport qatnovlari va doimiy voqealar uchun Present Simple qo'llanishi.",
    slides: [
      {
        id: "psf1",
        tag: "🚉 1-SLAYD: JADVALLAR",
        title: "Rasmiy Jadvallar & Reyslar (Timetables)",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Kelajakda sodir bo'ladigan bo'lsa ham, agar voqea <b>rasmiy jadvalga (timetable/schedule)</b> bog'liq bo'lsa, ingliz tilida <b>Present Simple</b> ishlatiladi.</p>
        </div>`,
        visual: {
          type: "schedule_board",
          title: "Toshkent Vokzali & Aeroport Jadvali",
          data: {
            station: "Tashkent Transit Terminal",
            items: [
              { time: "08:00 AM", destination: "Samarkand Afrosiyob", sentence: "The train leaves at 08:00 AM tomorrow." },
              { time: "11:30 AM", destination: "Istanbul Flight TK369", sentence: "Our plane departs at 11:30 AM." },
              { time: "02:15 PM", destination: "Bukhara Express", sentence: "The train arrives in Bukhara at 2:15 PM." },
              { time: "06:00 PM", destination: "English Masterclass", sentence: "The lesson starts at 6:00 PM tonight." }
            ]
          }
        }
      },
      {
        id: "psf2",
        tag: "⚡ 2-SLAYD: QIYOSLASH",
        title: "Shaxsiy Reja vs Rasmiy Jadval",
        body: `<div class="space-y-3 text-slate-300">
          <p>O'zingizning kelishgan rejangiz (Present Continuous) bilan rasmiy poyezd/kino jadvali (Present Simple) orasidagi farq:</p>
        </div>`,
        visual: {
          type: "metaphor",
          title: "Present Simple vs Present Continuous (Future)",
          subtitle: "Kim qaror qilgan: Tashkilotmi yoki Sizmi?",
          data: {
            left: {
              icon: "🗓️",
              badge: "RASMIY JADVAL",
              title: "Present Simple (Jadval)",
              desc: "Poyezd, samolyot, dars, kino seansi. Vaqt sizga bog'liq emas, jadvalga bog'liq!",
              theme: "amber",
              examples: [
                { text: "✅ The film starts at 8:00 PM." },
                { text: "✅ What time does the bank open tomorrow?" }
              ]
            },
            right: {
              icon: "🤝",
              badge: "SHAXSIY KELISHUV",
              title: "Present Continuous (Kelishilgan)",
              desc: "Do'stlar bilan uchrashuv, tushlik, shifokor qabuli. O'zingiz rejalashtirgan ishlar!",
              theme: "sky",
              examples: [
                { text: "✅ I am meeting Sarah tonight." },
                { text: "✅ We are having dinner at 7:00 PM." }
              ]
            }
          }
        }
      }
    ],
    flashcards: [
      { word: "schedule", pos: "noun/verb", uz: "jadval / rejalashtirmoq", ex: "The bus runs on a regular schedule." },
      { word: "depart", pos: "verb", uz: "jo'nab ketmoq", ex: "The flight departs at 9:15 AM." },
      { word: "arrive", pos: "verb", uz: "yetib kelmoq", ex: "What time does the train arrive?" },
      { word: "timetable", pos: "noun", uz: "qatnov jadvali", ex: "Check the train timetable online." },
      { word: "terminate", pos: "verb", uz: "yakunlanmoq", ex: "This flight terminates in Dubai." }
    ],
    quiz: [
      { q: "The concert ______ at 7:00 PM tonight. (Official timetable)", opts: ["starts", "is starting", "will start", "start"], ans: "starts", expl: "Rasmiy tadbir va konsert vaqtlari doim Present Simple bilan: starts." },
      { q: "Our plane ______ at 6:45 tomorrow morning.", opts: ["takes off", "is taking off", "will take off", "take off"], ans: "takes off", expl: "Parvoz jadvali uchun Present Simple ishlatiladi." }
    ],
    homework: [
      {
        title: "1-Bo'lim: Jadval Gaplarini Tuzish",
        instructions: "Fe'lni to'g'ri Present Simple shakliga qo'ying.",
        type: "fill_blank",
        items: [
          { prompt: "The supermarket ______ (open) at 8:00 tomorrow.", hint: "opens" },
          { prompt: "What time ______ the bus ______ (leave)?", hint: "does ... leave" }
        ]
      }
    ]
  },

  have_vs_have_got_b1: {
    id: "have_vs_have_got_b1",
    topic: "Have vs Have Got",
    level: "B1",
    category: "Grammar & Vocabulary",
    description: "Britaniya va Amerika ingliz tili farqlari, inkor/so'roq formulalari va harakat iboralari tuzog'i.",
    slides: [
      {
        id: "h1",
        tag: "🇬🇧 vs 🇺🇸 1-SLAYD",
        title: "British English vs American English",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Egalikni (possession) ifodalashda <b>have</b> va <b>have got</b> bir xil ma'noni beradi. Faqat hududiy va uslubiy farq bor:</p>
        </div>`,
        visual: {
          type: "metaphor",
          title: "Have vs Have Got Geografiyasi",
          subtitle: "Britaniya (have got) vs Amerika (have)",
          data: {
            left: {
              icon: "🇬🇧",
              badge: "BRITISH ENGLISH",
              title: "Have got (Norasmiy & Og'zaki)",
              desc: "Buyuk Britaniyada kundalik suhbatlarda 'have got' juda ko'p ishlatiladi. Yordamchi fe'li: have!",
              theme: "indigo",
              examples: [
                { text: "✅ I have got a headache." },
                { text: "✅ Have you got any brothers?" },
                { text: "✅ She hasn't got much time." }
              ]
            },
            right: {
              icon: "🇺🇸",
              badge: "AMERICAN ENGLISH",
              title: "Have (Oddiy & Universal)",
              desc: "Amerikada 'have' ko'proq ishlatiladi. Inkor va so'roqda do/does yordamchisi talab etiladi!",
              theme: "sky",
              examples: [
                { text: "✅ I have a headache." },
                { text: "✅ Do you have any brothers?" },
                { text: "✅ She doesn't have much time." }
              ]
            }
          }
        }
      },
      {
        id: "h2",
        tag: "⚠️ 2-SLAYD: TUZOQ",
        title: "Harakat Iboralari (Action Expressions) Tuzog'i",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Agar <b>have</b> egalik ma'nosida emas, balki <b>harakat iborasi</b> (have breakfast, have a shower, have fun) bo'lsa — hech qachon <b>GOT</b> ishlatilmaydi!</p>
          <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 font-mono text-sm space-y-1">
            <div class="text-rose-400">❌ I have got a shower every morning. (XATO!)</div>
            <div class="text-emerald-400">✅ I have a shower every morning. (TO'G'RI: Dush qabul qilish — harakat!)</div>
          </div>
        </div>`,
        visual: {
          type: "formula",
          title: "Inkor va So'roq Qiyosiy Matritsasi",
          data: {
            positive: [
              { role: "subject", label: "Ega", value: "I / You / We / They" },
              { role: "verb", label: "UK Shakli", value: "have got a car" },
              { role: "aux", label: "US Shakli", value: "have a car" }
            ],
            negative: [
              { role: "subject", label: "Ega", value: "He / She" },
              { role: "aux", label: "UK Inkor", value: "hasn't got a car" },
              { role: "verb", label: "US Inkor", value: "doesn't have a car" }
            ],
            question: [
              { role: "aux", label: "UK Savol", value: "Have you got a car?" },
              { role: "verb", label: "US Savol", value: "Do you have a car?" }
            ]
          }
        }
      }
    ],
    flashcards: [
      { word: "possession", pos: "noun", uz: "egalik, mulk", ex: "He takes great care of his possessions." },
      { word: "headache", pos: "noun", uz: "bosh og'rig'i", ex: "I have got a terrible headache." },
      { word: "have fun", pos: "phrase", uz: "vaqtni maroqli o'tkazmoq", ex: "Did you have fun at the party?" },
      { word: "have a rest", pos: "phrase", uz: "dam olmoq", ex: "You look tired, have a rest." }
    ],
    quiz: [
      { q: "Which sentence is INCORRECT?", opts: ["I have got a shower at 7 am.", "I have a shower at 7 am.", "I have got two sisters.", "Do you have two sisters?"], ans: "I have got a shower at 7 am.", expl: "Dush qabul qilish harakat iborasi bo'lgani uchun 'got' qo'shib bo'lmaydi." },
      { q: "______ your brother ______ a passport?", opts: ["Has / got", "Has / get", "Does / got", "Is / have"], ans: "Has / got", expl: "British variantida: Has your brother got ... ?" }
    ],
    homework: [
      {
        title: "1-Bo'lim: Have yoki Have got?",
        instructions: "Xatolarni toping va to'g'irlang.",
        type: "error_correct",
        items: [
          { prompt: "❌ She hasn't a pen.", hint: "She doesn't have a pen / She hasn't got a pen" },
          { prompt: "❌ Did you have got breakfast today?", hint: "Did you have breakfast today?" }
        ]
      }
    ]
  },

  used_to_vs_would_b1: {
    id: "used_to_vs_would_b1",
    topic: "Used to vs Would",
    level: "B1",
    category: "Grammar & Vocabulary",
    description: "O'tmishdagi odatlar vs o'tmishdagi holatlar, 'would' fe'lining cheklovlari.",
    slides: [
      {
        id: "ut1",
        tag: "⏳ 1-SLAYD: MOHIYAT",
        title: "O'tmishdagi Odatlar (Past Habits)",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Ikkalasi ham o'tmishda muntazam qilingan, lekin hozir to'xtatilgan odatlar haqida gapirganda ishlatiladi. Ammo <b>bitta ulkan farq bor!</b></p>
        </div>`,
        visual: {
          type: "metaphor",
          title: "Used to (Universal) vs Would (Faqat Harakat)",
          subtitle: "Holat fe'llarida 'would' ishlatish man etiladi!",
          data: {
            left: {
              icon: "🏛️",
              badge: "USED TO (UNIVERSAL)",
              title: "Used to: Ham Holat, Ham Harakat",
              desc: "O'tmishdagi odat bo'lgan harakatlar (play, swim) va o'tmishdagi holatlar (live, be, have, like) uchun ishlatiladi.",
              theme: "emerald",
              examples: [
                { text: "✅ I used to live in Samarkand. (Holat: Yashaganman)" },
                { text: "✅ I used to like football. (Holat: Yoqtirganman)" },
                { text: "✅ I used to swim every morning. (Harakat)" }
              ]
            },
            right: {
              icon: "🔄",
              badge: "WOULD (FAQAT HARAKAT)",
              title: "Would: Faqat Qaytariluvchi Harakat",
              desc: "Faqat o'tmishda takrorlanib turgan jismoniy harakatlar (play, walk, visit) uchun! Holat (live, be, like) bilan ASLO ishlatilmaydi!",
              theme: "rose",
              examples: [
                { text: "✅ Every summer we would swim in the river." },
                { text: "❌ I would live in Samarkand. (XATO! live holat!)" },
                { text: "❌ I would be shy. (XATO! be holat!)" }
              ]
            }
          }
        }
      }
    ],
    flashcards: [
      { word: "habit", pos: "noun", uz: "odat", ex: "Smoking is a very harmful habit." },
      { word: "childhood", pos: "noun", uz: "bolalik", ex: "In my childhood, I used to ride a bike." },
      { word: "nostalgia", pos: "noun", uz: "o'tmishni qo'msash", ex: "He spoke of his school days with nostalgia." }
    ],
    quiz: [
      { q: "When I was young, I ______ chocolate, but now I hate it.", opts: ["used to love", "would love", "am loving", "was loving"], ans: "used to love", expl: "'love' holat fe'li bo'lgani uchun 'would' emas, faqat 'used to' bo'ladi." },
      { q: "Every Sunday, my grandfather ______ us for a walk in the park.", opts: ["would take", "is taking", "will take", "took to"], ans: "would take", expl: "Takrorlanuvchi o'tmishdagi harakat: would take." }
    ],
    homework: [
      {
        title: "1-Bo'lim: Used to yoki Would?",
        instructions: "Ikkala variant ham to'g'ri keladimi yoki faqat used to?",
        type: "mcq",
        items: [
          { prompt: "We ______ have a dog when I was seven.", options: ["used to", "would", "Both"], answer: "used to" },
          { prompt: "My dad ______ read me stories every evening.", options: ["used to", "would", "Both are correct"], answer: "Both are correct" }
        ]
      }
    ]
  },

  will_vs_going_to: {
    id: "will_vs_going_to",
    topic: "Will vs Be Going To",
    level: "A2",
    category: "Grammar & Vocabulary",
    description: "Spontan qarorlar (will), oldindan rejalashtirilgan ishlar va dalilli bashoratlar (be going to).",
    slides: [
      {
        id: "wgt1",
        tag: "💡 vs 📅 1-SLAYD",
        title: "Spontan Fikr vs Oldindan Reja",
        body: `<div class="space-y-3 text-slate-300">
          <p class="text-base leading-relaxed">Kelajak haqida gapirganda shu lahzada qaror qildingizmi yoki oldindan rejalashtirganmidingiz? Mana shu asosiy farq:</p>
        </div>`,
        visual: {
          type: "metaphor",
          title: "Will vs Be Going To Taqqoslash",
          subtitle: "Spontan qaror vs Reja vs Dalil",
          data: {
            left: {
              icon: "💡",
              badge: "WILL (SHU LAHZADA)",
              title: "Spontan Qaror & Va'dalar",
              desc: "Telefon jiringladi, eshik taqilladi, sumka og'ir. Shu paytning o'zida qaror qildingiz!",
              theme: "indigo",
              examples: [
                { text: "✅ The phone is ringing. I'll answer it!" },
                { text: "✅ I'll help you with those heavy bags." },
                { text: "✅ I promise I will call you tonight." }
              ]
            },
            right: {
              icon: "📅",
              badge: "BE GOING TO (REJA)",
              title: "Oldindan Qilingan Reja & Dalil",
              desc: "Chipta olingan, niyat qilingan yoki ko'z oldingizda dalil bor (masalan qora bulutlar)!",
              theme: "emerald",
              examples: [
                { text: "✅ I am going to buy a car next month." },
                { text: "✅ Look at those clouds! It is going to rain." },
                { text: "✅ We are going to visit London this summer." }
              ]
            }
          }
        }
      }
    ],
    flashcards: [
      { word: "spontaneous", pos: "adj", uz: "kutilmagan, o'z-o'zidan paydo bo'lgan", ex: "It was a spontaneous decision." },
      { word: "intention", pos: "noun", uz: "niyat, maqsad", ex: "I have no intention of changing my mind." },
      { word: "evidence", pos: "noun", uz: "dalil, isbot", ex: "Look at the sky, there is clear evidence of rain." }
    ],
    quiz: [
      { q: "Look! That reckless driver ______ crash into the wall!", opts: ["is going to", "will", "is", "shall"], ans: "is going to", expl: "Ko'z oldimizda dalil bor → be going to." },
      { q: "I forgot my wallet at home! — Don't worry, I ______ for you.", opts: ["will pay", "am going to pay", "pay", "am paying"], ans: "will pay", expl: "Shu lahzada qabul qilingan spontan yordam qarori: will pay." }
    ],
    homework: [
      {
        title: "1-Bo'lim: will yoki be going to?",
        instructions: "To'g'ri shaklni tanlang.",
        type: "mcq",
        items: [
          { prompt: "We booked the hotel. We ______ travel to Italy.", options: ["are going to", "will"], answer: "are going to" },
          { prompt: "It's cold in here. — I ______ turn on the heater.", options: ["will", "am going to"], answer: "will" }
        ]
      }
    ]
  }
};

import { LessonLength } from "./types";

export function enrichCurriculumWithSections(c: Curriculum, length: LessonLength = "medium"): Curriculum {
  const result: Curriculum = { ...c, length };

  // 1. Quick Questions (Ensure 5 items)
  if (!result.quickQuestions || result.quickQuestions.length < 5) {
    const existing = result.quickQuestions || [];
    const missingCount = 5 - existing.length;
    const normTopic = (c.topic || "").toLowerCase();
    const isVocabTopic = normTopic.includes("noun") || normTopic.includes("countable") || normTopic.includes("uncountable") || normTopic.includes("article") || normTopic.includes("vocab");

    const defaultQQs = isVocabTopic ? [
      {
        id: `qq_gen_1`,
        q: `${c.topic} doirasida 'information' yoki 'advice' kabi so'zlar ko'plikda (s qo'shimchasi bilan) kelishi mumkinmi?`,
        ans: "Yo'q, ular sanalmaydi",
        opts: ["Yo'q, ular sanalmaydi", "Ha, doim ko'plikda keladi", "Faqat so'roq gapda"],
        expl: `Sanalmaydigan otlar birlik shaklda ishlatiladi va hech qachon noaniq artikl (a/an) yoki ko'plik qo'shimchasi (-s) olmaydi.`
      },
      {
        id: `qq_gen_2`,
        q: `Sanaladigan otlar (countable nouns) bilan qaysi miqdor so'zi to'g'ri ishlatiladi?`,
        ans: "Many / a few",
        opts: ["Many / a few", "Much / a little", "Faqat much"],
        expl: `Sanaladigan otlar bilan 'many' va 'a few', sanalmaydiganlar bilan esa 'much' va 'a little' ishlatiladi.`
      },
      {
        id: `qq_gen_3`,
        q: `Quyidagi jumlalardan qaysi biri to'g'ri?`,
        ans: "I have some luggage.",
        opts: ["I have some luggage.", "I have many luggages.", "I have a luggage."],
        expl: `'Luggage' sanalmaydigan ot bo'lib, 'some luggage' shaklida qo'llaniladi.`
      },
      {
        id: `qq_gen_4`,
        q: `'Much' so'zi asosan qaysi turdagi gaplarda faol ishlatiladi?`,
        ans: "Inkor va so'roq gaplarda",
        opts: ["Inkor va so'roq gaplarda", "Faqat darak gaplarda", "Hech qachon ishlatilmaydi"],
        expl: `'Much' ko'proq inkor va so'roq gaplarda qo'llaniladi (e.g. 'I don't have much time').`
      },
      {
        id: `qq_gen_5`,
        q: `Birlikdagi sanaladigan ot (masalan, apple, book) yolg'iz o'zi artiklsiz kela oladimi?`,
        ans: "Yo'q, artikl yoki egalik olmoshi shart",
        opts: ["Yo'q, artikl yoki egalik olmoshi shart", "Ha, doim yolg'iz keladi", "Faqat so'z boshida"],
        expl: `Birlikdagi sanaladigan ot oldida 'a/an', 'the' yoki 'my/your' bo'lishi shart.`
      }
    ] : [
      {
        id: `qq_gen_1`,
        q: `${c.topic} mavzusidagi bosh grammatik/muloqot qoidasi to'g'rimi?`,
        ans: "Ha, to'g'ri",
        opts: ["Ha, to'g'ri", "Yo'q, noto'g'ri"],
        expl: `Ushbu qoida ${c.topic} mavzusining asosi bo'lib, xalqaro CEFR standartiga to'la mos keladi.`
      },
      {
        id: `qq_gen_2`,
        q: `Quyidagi misolda qaysi so'z shakli kontekstga to'liq mos keladi?`,
        ans: c.quiz && c.quiz[0] ? c.quiz[0].ans : "To'g'ri variant",
        opts: c.quiz && c.quiz[0] ? c.quiz[0].opts.slice(0, 3) : ["To'g'ri variant", "Xato shakl 1", "Xato shakl 2"],
        expl: `Diqqat qiling: o'zbek tiliga xos so'zma-so'z tarjima tuzog'idan saqlaning.`
      },
      {
        id: `qq_gen_3`,
        q: `Jonli muloqotda ushbu qoidani qachon faol ishlatamiz?`,
        ans: "Kontekst talab qilganda",
        opts: ["Kontekst talab qilganda", "Faqat yozma nutqda", "Hech qachon"],
        expl: `Tabiiy ingliz nutqida bu tuzilma faol qo'llaniladi.`
      },
      {
        id: `qq_gen_4`,
        q: `Ushbu mavzuda eng ko'p uchraydigan o'zbekcha qopqon nima?`,
        ans: "Ona tilidan to'g'ridan-to'g'ri tarjima qilish",
        opts: ["Ona tilidan to'g'ridan-to'g'ri tarjima qilish", "Talaffuz xatosi", "Katta harf bilan yozish"],
        expl: `O'zbek tili grammatik modeli bilan solishtirish ko'p hollarda xatoga olib keladi.`
      },
      {
        id: `qq_gen_5`,
        q: `Ushbu tuzilmani nutqda avtomatlashtirishning eng yaxshi yo'li nima?`,
        ans: "Haqiqiy kontekstli gaplar bilan mashq qilish",
        opts: ["Haqiqiy kontekstli gaplar bilan mashq qilish", "Faqat qoidani yodlash", "Lug'atni ko'chirib yozish"],
        expl: `Jonli muloqotda va turli gaplarda qo'llash orqali bilim mustahkamlanadi.`
      }
    ];

    result.quickQuestions = [...existing, ...defaultQQs.slice(existing.length, 5)];
  }

  // 2. Dialog Builder (Medium & Long - Ensure 5 turns)
  if (length !== "short" && (!result.dialog || result.dialog.length < 5)) {
    const existing = result.dialog || [];
    const defaultDialog: any[] = [
      {
        id: "d1",
        speaker: "Teacher (Aziz)",
        role: "teacher",
        text: `Hey Jasur! How comfortable do you feel using "${c.topic}" in your speaking?`,
        uz: `Salom Jasur! Nutqingizda "${c.topic}" mavzusini qo'llash qanchalik oson kechmoqda?`,
        userOptions: [
          `I understand the basic rules, but I still make small mistakes.`,
          `I don't think I need to practice this topic.`,
          `I never make any mistakes at all.`
        ],
        correctOption: `I understand the basic rules, but I still make small mistakes.`
      },
      {
        id: "d2",
        speaker: "Student (Jasur)",
        role: "student",
        text: `It feels clear now, but I still want to avoid common Uzbek learner traps!`,
        uz: `Hozir ancha tushunarli, lekin o'zbek o'quvchilari eng ko'p tushadigan tuzoqlardan qochishni xohlayman!`,
        userOptions: [
          `Great mindset! Paying attention to contrast and context is the key.`,
          `Don't worry about mistakes, grammar doesn't matter.`
        ],
        correctOption: `Great mindset! Paying attention to contrast and context is the key.`
      },
      {
        id: "d3",
        speaker: "Teacher (Aziz)",
        role: "teacher",
        text: `Exactly! Let's now test your intuition in the next drill!`,
        uz: `Aynan shunday! Endi keyingi amaliyotda sezgingizni sinab ko'ramiz!`,
        userOptions: [
          `Let's do it! I'm ready to find the right answers.`,
          `Can we skip this part?`
        ],
        correctOption: `Let's do it! I'm ready to find the right answers.`
      },
      {
        id: "d4",
        speaker: "Student (Jasur)",
        role: "student",
        text: `Could you give me one practical tip to remember this permanently?`,
        uz: `Buni butunlay eslab qolish uchun bitta amaliy maslahat bera olasizmi?`,
        userOptions: [
          `Always think in phrases and sentences, never translate word by word.`,
          `Just memorize isolated grammar formulas without speaking.`
        ],
        correctOption: `Always think in phrases and sentences, never translate word by word.`
      },
      {
        id: "d5",
        speaker: "Teacher (Aziz)",
        role: "teacher",
        text: `Perfect! Let's put this into active practice right now!`,
        uz: `Ajoyib! Keling, buni hoziroq amaliyotga tatbiq etamiz!`
      }
    ];

    result.dialog = [...existing, ...defaultDialog.slice(existing.length, 5)];
  }

  // 3. Error Hunt (Medium & Long - Ensure 5 items)
  if (length !== "short" && (!result.errorHunt || result.errorHunt.length < 5)) {
    const existing = result.errorHunt || [];
    const normTopic = (c.topic || "").toLowerCase();
    const isPrep = normTopic.includes("preposition") || normTopic.includes("in on at") || normTopic.includes("at on in");
    const isVocab = normTopic.includes("noun") || normTopic.includes("countable") || normTopic.includes("uncountable");
    const isModal = normTopic.includes("modal") || normTopic.includes("must") || normTopic.includes("can");
    const isCond = normTopic.includes("conditional") || normTopic.includes("if");
    const isFuture = normTopic.includes("future") || normTopic.includes("will") || normTopic.includes("going to");
    const isPast = normTopic.includes("past");

    let defaultErrors: any[] = [];
    if (isVocab) {
      defaultErrors = [
        {
          id: "eh1",
          sentence: `Can you give me an advice about learning English?`,
          errorWord: `an advice`,
          correction: `some advice / a piece of advice`,
          explanation: `'Advice' sanalmaydigan ot bo'lgani uchun 'an' artiklini olmaydi!`
        },
        {
          id: "eh2",
          sentence: `We bought a lot of new furnitures yesterday.`,
          errorWord: `furnitures`,
          correction: `furniture`,
          explanation: `'Furniture' sanalmaydi va hech qachon ko'plik qo'shimchasi (-s) olmaydi!`
        },
        {
          id: "eh3",
          sentence: `I don't have many information about this course.`,
          errorWord: `many`,
          correction: `much`,
          explanation: `'Information' sanalmaydigan ot, shuning uchun 'many' emas, 'much' ishlatiladi!`
        },
        {
          id: "eh4",
          sentence: `She has a long brown hairs.`,
          errorWord: `hairs`,
          correction: `hair`,
          explanation: `Inson sochi umumiy ma'noda sanalmaydi: 'She has long brown hair'.`
        },
        {
          id: "eh5",
          sentence: `How many money do you need for the trip?`,
          errorWord: `many`,
          correction: `much`,
          explanation: `'Money' sanalmaydigan ot bo'lib, 'How much money' shaklida so'raladi!`
        }
      ];
    } else if (isPrep) {
      defaultErrors = [
        {
          id: "eh1",
          sentence: `We always meet on 8:00 AM.`,
          errorWord: `on`,
          correction: `at`,
          explanation: `Aniq vaqt va soatlar (8:00 AM) oldidan 'on' emas, 'at' predlogi ishlatiladi!`
        },
        {
          id: "eh2",
          sentence: `She was born in Monday morning.`,
          errorWord: `in`,
          correction: `on`,
          explanation: `Hafta kunlari (Monday) oldidan har doim 'on' predlogi qo'llaniladi!`
        },
        {
          id: "eh3",
          sentence: `We usually travel at July.`,
          errorWord: `at`,
          correction: `in`,
          explanation: `Oylar va fasllar (July) uchun 'at' emas, 'in' predlogi ishlatiladi!`
        },
        {
          id: "eh4",
          sentence: `He arrived to the airport late at night.`,
          errorWord: `to`,
          correction: `at`,
          explanation: `'Arrive' fe'li bino/joy uchun 'at' oladi: arrive at the airport.`
        },
        {
          id: "eh5",
          sentence: `I am interested on modern web development.`,
          errorWord: `on`,
          correction: `in`,
          explanation: `'Interested' sifati doim 'in' predlogi bilan keladi: interested in.`
        }
      ];
    } else {
      defaultErrors = [
        {
          id: "eh1",
          sentence: `He don't understand the rules clearly.`,
          errorWord: `don't`,
          correction: `doesn't`,
          explanation: `Uchinchi shaxs (he/she/it) uchun 'don't' emas, 'doesn't' ishlatiladi!`
        },
        {
          id: "eh2",
          sentence: `She is more better at English than before.`,
          errorWord: `more better`,
          correction: `much better / better`,
          explanation: `Sifatning qiyosiy darajasida 'more better' deb birga ishlatilmaydi!`
        },
        {
          id: "eh3",
          sentence: `He is needing help with this topic right now.`,
          errorWord: `is needing`,
          correction: `needs`,
          explanation: `'Need' holat fe'li bo'lib, Continuous (-ing) shaklini olmaydi: He needs help.`
        },
        {
          id: "eh4",
          sentence: `I look forward to hear from you soon.`,
          errorWord: `hear`,
          correction: `hearing`,
          explanation: `'Look forward to' birikmasidan keyin fe'lga -ing qo'shiladi: hearing.`
        },
        {
          id: "eh5",
          sentence: `She explained me the rule very clearly.`,
          errorWord: `me`,
          correction: `to me`,
          explanation: `'Explain' fe'li shaxs bilan 'to' talab qiladi: explained to me.`
        }
      ];
    }

    result.errorHunt = [...existing, ...defaultErrors.slice(existing.length, 5)];
  }

  // 4. Fill the Gap (Long - Ensure 5 items)
  if (length === "long" && (!result.fillGap || result.fillGap.length < 5)) {
    const existing = result.fillGap || [];
    const normTopic = (c.topic || "").toLowerCase();
    const isVocab = normTopic.includes("noun") || normTopic.includes("countable") || normTopic.includes("uncountable");
    const isPrep = normTopic.includes("preposition") || normTopic.includes("in on at") || normTopic.includes("at on in");

    let defaultFillGaps: any[] = [];
    if (isVocab) {
      defaultFillGaps = [
        {
          id: "fg1",
          sentenceBefore: `I need`,
          blank: `______`,
          sentenceAfter: `information about the university application.`,
          options: [`some`, `an`, `a`],
          correct: `some`,
          uzbekHint: `'Information' sanalmaydigan ot bo'lib, birlik noaniq artikl olmaydi.`
        },
        {
          id: "fg2",
          sentenceBefore: `How`,
          blank: `______`,
          sentenceAfter: `apples did you buy at the supermarket?`,
          options: [`many`, `much`, `little`],
          correct: `many`,
          uzbekHint: `Sanaladigan otlar (apples) bilan 'many' ishlatiladi.`
        },
        {
          id: "fg3",
          sentenceBefore: `There is only a`,
          blank: `______`,
          sentenceAfter: `milk left in the fridge.`,
          options: [`little`, `few`, `many`],
          correct: `little`,
          uzbekHint: `Sanalmaydigan ot (milk) bilan oz miqdor: 'a little'.`
        },
        {
          id: "fg4",
          sentenceBefore: `Can I borrow a`,
          blank: `______`,
          sentenceAfter: `of paper to write notes?`,
          options: [`piece`, `slice`, `bar`],
          correct: `piece`,
          uzbekHint: `'Paper' sanalmaydi, birlik uchun 'a piece of paper' birikmasi qo'llanadi.`
        },
        {
          id: "fg5",
          sentenceBefore: `She gave me very useful`,
          blank: `______`,
          sentenceAfter: `for my career.`,
          options: [`advice`, `advices`, `an advice`],
          correct: `advice`,
          uzbekHint: `'Advice' hech qachon -s olmaydi va sanalmaydi.`
        }
      ];
    } else if (isPrep) {
      defaultFillGaps = [
        {
          id: "fg1",
          sentenceBefore: `The concert starts exactly`,
          blank: `______`,
          sentenceAfter: `8:00 PM tonight.`,
          options: [`at`, `on`, `in`],
          correct: `at`,
          uzbekHint: `Aniq vaqt va soatlar uchun predlog.`
        },
        {
          id: "fg2",
          sentenceBefore: `We usually visit our grandparents`,
          blank: `______`,
          sentenceAfter: `Sundays.`,
          options: [`on`, `at`, `in`],
          correct: `on`,
          uzbekHint: `Hafta kunlari uchun predlog.`
        },
        {
          id: "fg3",
          sentenceBefore: `It gets really hot in Tashkent`,
          blank: `______`,
          sentenceAfter: `July and August.`,
          options: [`in`, `on`, `at`],
          correct: `in`,
          uzbekHint: `Oylar va fasllar uchun predlog.`
        },
        {
          id: "fg4",
          sentenceBefore: `She has been working here`,
          blank: `______`,
          sentenceAfter: `three years.`,
          options: [`for`, `since`, `during`],
          correct: `for`,
          uzbekHint: `Vaqt oralig'i (duration) uchun 'for' ishlatiladi.`
        },
        {
          id: "fg5",
          sentenceBefore: `We have lived in this house`,
          blank: `______`,
          sentenceAfter: `2018.`,
          options: [`since`, `for`, `from`],
          correct: `since`,
          uzbekHint: `Boshlang'ich nuqta uchun 'since' ishlatiladi.`
        }
      ];
    } else {
      defaultFillGaps = [
        {
          id: "fg1",
          sentenceBefore: `She`,
          blank: `______`,
          sentenceAfter: `the rules of "${c.topic}" clearly.`,
          options: [`understands`, `understand`, `is understanding`],
          correct: `understands`,
          uzbekHint: `Uchinchi shaxs birlik (she) uchun fe'lga -s qo'shiladi.`
        },
        {
          id: "fg2",
          sentenceBefore: `If you want to master this topic, you`,
          blank: `______`,
          sentenceAfter: `pay close attention to details.`,
          options: [`must`, `must to`, `musted`],
          correct: `must`,
          uzbekHint: `Modal fe'l qoidasi: to qo'shimchasisiz keladi.`
        },
        {
          id: "fg3",
          sentenceBefore: `They haven't completed the assignment`,
          blank: `______`,
          sentenceAfter: `.`,
          options: [`yet`, `already`, `just`],
          correct: `yet`,
          uzbekHint: `Inkor gapda gap oxirida keladigan vaqt belgisi.`
        },
        {
          id: "fg4",
          sentenceBefore: `By this time tomorrow, we`,
          blank: `______`,
          sentenceAfter: `our presentation.`,
          options: [`will have finished`, `will finish`, `finish`],
          correct: `will have finished`,
          uzbekHint: `Kelajakdagi ma'lum nuqtaga qadar tugallanadigan ish.`
        },
        {
          id: "fg5",
          sentenceBefore: `He decided`,
          blank: `______`,
          sentenceAfter: `his speaking skills every single day.`,
          options: [`to practice`, `practice`, `practicing`],
          correct: `to practice`,
          uzbekHint: `'Decide' fe'lidan keyin infinitiv (to + V1) keladi.`
        }
      ];
    }

    result.fillGap = [...existing, ...defaultFillGaps.slice(existing.length, 5)];
  }

  // 5. Summary & Cheat Sheet (Long)
  if (length === "long" && !result.summary) {
    result.summary = {
      title: `${c.topic} — Oltin Qoidalar & Xulosa`,
      takeaway: `Ushbu mavzuning eng muhim mohiyati: grammatik qolipni eslab qolish va o'zbek tiliga to'g'ridan-to'g'ri so'zma-so'z tarjima qilmaslikdir.`,
      rules: [
        {
          tag: "1-OLTIN QOIDA",
          title: "Struktura & Shakl",
          formula: `${c.topic} asosiy qoidasi`,
          example: `To'g'ri shakl namunasi`,
          uzbekTrap: "O'zbek tilidan so'zma-so'z tarjima qilishdagi asosiy farqqa e'tibor bering."
        },
        {
          tag: "2-OLTIN QOIDA",
          title: "Kontekst va Qo'llash",
          formula: "Nutqda to'g'ri vaziyatni tanlash",
          example: "Jonli muloqotdagi tabiiy jumla",
          uzbekTrap: "Vaqt va sharoit mosligini doim tekshiring."
        },
        {
          tag: "3-OLTIN QOIDA",
          title: "Inkor va So'roq Formulalari",
          formula: "Yordamchi elementlar tartibi",
          example: "So'roq va inkor gap namunasi",
          uzbekTrap: "So'roq gapda inversiya (yordamchi element oldinga chiqishi)ga e'tibor qarating."
        }
      ]
    };
  }

  // 6. Ensure Slides Count (Short: 4, Medium: 6, Long: 8)
  const targetSlidesCount = length === "short" ? 4 : length === "long" ? 8 : 6;
  if (!result.slides || result.slides.length < targetSlidesCount) {
    const existingSlides = result.slides || [];
    const topic = c.topic || "English Lesson";
    const extraSlides: any[] = [
      {
        id: "s_extra_1",
        tag: "AMALIY NAMUNA",
        title: `${topic} — Namunaviy Matn & Kontekst`,
        body: `• <b>Mavzuni tushunish:</b> <b>${topic}</b> qoidasini turli misollar bilan mustahkamlash.<br>• <b>Tavsiya:</b> Gapdagi har bir bo'lak vazifasini anglash o'rganishni osonlashtiradi.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>Eslatma:</b> Namunaviy jumlalarni ovoz chiqarib o'qish nutq ravonligini oshiradi.</div>`,
        visual: {
          type: "sentence_anatomy",
          title: "Gap Tuzilishi Tahlili",
          subtitle: "Namunaviy gap anatomiyasi",
          data: {
            sentence: `Students learn ${topic} quickly with practical examples.`,
            translation: "O'quvchilar amaliy misollar bilan mavzuni tez o'rganadilar.",
            rule: `${topic} qo'llanish qoidasi`,
            tokens: [
              { text: "Students", role: "Ega (Subject)", color: "indigo", note: "Bajaruvchi shaxs" },
              { text: "learn", role: "Fe'l (Verb)", color: "purple", note: "Harakat" },
              { text: topic, role: "To'ldiruvchi", color: "sky", note: "Mavzu obyekti" },
              { text: "with practical examples.", role: "Holat", color: "emerald", note: "Qo'shimcha tafsilot" }
            ]
          }
        }
      },
      {
        id: "s_extra_2",
        tag: "TAQQOSLASH & FARQLAR",
        title: `${topic} — To'g'ri vs Noto'g'ri Taqqosi`,
        body: `• <b>O'quvchilar ko'p adashadigan nuqta:</b> O'zbek tili fikrlash tarzi bilan ingliz tili qolipi farqi.<br>• <b>Qoida:</b> Doimo grammatik signal so'zlarga va zamon mosligiga e'tibor qarating.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:6px; font-size:0.9rem;'>⚠️ <b>Diqqat:</b> Xatolardan qochish uchun doim to'g'ri namunaga tayaning.</div>`,
        visual: {
          type: "comparison",
          title: "Taqqoslash Jadvali",
          data: {
            categories: [
              { title: "To'g'ri Shakl ✅", items: [`${topic} qoidasiga to'liq muvofiq jumla`, "To'g'ri so'z tartibi va yordamchi fe'l"] },
              { title: "Xato Shakl ❌", items: ["So'zma-so'z tarjima xatosi", "Yordamchi elementni tushirib qoldirish"] }
            ]
          }
        }
      },
      {
        id: "s_extra_3",
        tag: "XATOLAR USTIDA ISHLASH",
        title: `${topic} — Nozik Qopqonlar Tahlili`,
        body: `• <b>1-Qopqon:</b> Inkor yoki so'roq shaklida yordamchi fe'lni unutish.<br>• <b>2-Qopqon:</b> Zamon ko'rsatkichini noto'g'ri ishlatish.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(245,158,11,0.14); border-left:3px solid #f59e0b; border-radius:6px; font-size:0.9rem;'>🎯 <b>Oltin Maslahat:</b> Imtihonlarda tekshiriladigan asosiy jihat aynan shu tuzoqlardir.</div>`,
        visual: {
          type: "visual_diff",
          title: "Vizual Taqqoslash: To'g'ri vs Xato",
          subtitle: "O'quvchilar eng ko'p adashadigan holat",
          data: {
            correct: `We practice ${topic} correctly in every lesson.`,
            correctLabel: "To'g'ri variant",
            correctWhy: "Grammatik qolipga to'liq mos.",
            wrong: `We practicing ${topic} wrong without auxiliary.`,
            wrongLabel: "O'quvchi xatosi",
            wrongWhy: "Yordamchi strukturadagi chalkashlik."
          }
        }
      },
      {
        id: "s_extra_4",
        tag: "MASTERY & YAKUNIY XULOSA",
        title: `${topic} — Yakuniy Xulosa & Nazorat`,
        body: `• <b>Asosiy xulosa:</b> Ushbu darsda o'rganilgan barcha andozalarni birlashtiring.<br>• <b>Keyingi qadam:</b> Fleshkartalar va test savollari orqali bilimlaringizni sinab ko'ring.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(16,185,129,0.15); border-left:3px solid #10b981; border-radius:6px; font-size:0.9rem;'>🏆 <b>Natija:</b> Mavzu bo'yicha to'liq nazariy va amaliy bilim shakllandi!</div>`,
        visual: {
          type: "concept_pyramid",
          title: "O'zlashtirish Pog'onalari",
          subtitle: "Boshlang'ichdan mustaqil so'zlashuvgacha",
          data: {
            topic: topic,
            levels: [
              { name: "Qoida", scope: "Grammatik formula va mohiyat", examples: ["Formula va andoza"], color: "indigo" },
              { name: "Amaliyot", scope: "Yozma mashqlar va testlar", examples: ["Xatosiz tuzish"], color: "purple" },
              { name: "Ravonlik", scope: "Jonli nutqda erkin qo'llash", examples: ["Avtomatik nutq"], color: "emerald" }
            ]
          }
        }
      },
      {
        id: "s_extra_5",
        tag: "JONLI NUTQ SSENARIYSI",
        title: `${topic} — Muloqot Mashg'uloti`,
        body: `• <b>Muloqot vaziyati:</b> Ushbu qoidani haqiqiy suhbatda ikkilanmasdan qo'llang.<br>• <b>Nutqiy tavsiya:</b> Intonatsiya va so'z urg'usiga e'tibor bering.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💬 <b>Maslahat:</b> Juftlikda yoki o'qituvchi bilan faol mashq qiling.</div>`,
        visual: {
          type: "sentence_anatomy",
          title: "Muloqot Jumlasi Tahlili",
          subtitle: "Suhbatdoshga qaratilgan jumla",
          data: {
            sentence: `Can you explain how ${topic} works in this context?`,
            translation: "Ushbu kontekstda mavzu qanday ishlashini tushuntirib bera olasizmi?",
            rule: "Odobli so'rov shakli",
            tokens: [
              { text: "Can you", role: "Odobli murojaat", color: "indigo", note: "Modallik" },
              { text: "explain", role: "Asosiy fe'l", color: "purple", note: "Harakat" },
              { text: topic, role: "Mavzu", color: "sky", note: "Predmet" },
              { text: "in this context?", role: "Sharoit", color: "emerald", note: "Holat" }
            ]
          }
        }
      },
      {
        id: "s_extra_6",
        tag: "INTENSIV NAZORAT",
        title: `${topic} — Chuqurlashtirilgan Tahlil`,
        body: `• <b>Yuqori darajadagi qo'llanish:</b> CEFR standartlari bo'yicha mukammal bilim.<br>• <b>Oltin qoidalar:</b> Hech qachon shoshilmasdan gapning butun kontekstini o'qing.`,
        visual: {
          type: "metaphor",
          title: "Xotira Kaliti",
          subtitle: "Vizual assotsiatsiya",
          data: {
            metaphor: "Mukammal Zanjir",
            explanation: "Har bir bo'lak o'z o'rnida bo'lgandagina fikr to'liq yetib boradi."
          }
        }
      }
    ];

    const needed = targetSlidesCount - existingSlides.length;
    result.slides = [...existingSlides, ...extraSlides.slice(0, needed)];
  }

  return result;
}

