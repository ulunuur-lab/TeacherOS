export type AppLanguage = 'uz' | 'en' | 'ru';

export interface TranslationDictionary {
  // Common / Brand
  brand_name: string;
  brand_sub: string;
  login_register: string;
  logout: string;
  guest: string;
  close: string;
  done: string;
  cancel: string;
  save: string;
  loading: string;

  // Hero Section
  hero_title: string;
  image_btn: string;
  others_btn: string;
  prompt_placeholder: string;
  length_label: string;
  length_short: string;
  length_medium: string;
  length_long: string;
  level_label: string;
  generate_btn: string;
  generating_btn: string;

  // Voice & Drawing Tooltips
  voice_start_title: string;
  voice_stop_title: string;
  draw_open_title: string;
  draw_close_title: string;
  attach_files_title: string;

  // Drawing Board
  draw_pen: string;
  draw_eraser: string;
  draw_clear: string;
  draw_thickness: string;
  draw_grid_plain: string;
  draw_grid_check: string;
  draw_grid_lines: string;
  draw_hint: string;

  // ☰ History Drawer
  drawer_title: string;
  drawer_home: string;
  drawer_new_lesson: string;
  drawer_blank_board: string;
  drawer_history_heading: string;
  drawer_no_history: string;
  drawer_guest_hint: string;
  drawer_settings: string;
  drawer_login: string;
  drawer_logged_in: string;
  drawer_classroom_solo: string;
  drawer_classroom_switch: string;
  drawer_classroom_guest_title: string;
  drawer_classroom_guest_desc: string;

  // Settings Modal
  settings_title: string;
  settings_lang_section: string;
  settings_lang_desc: string;
  settings_lang_uz: string;
  settings_lang_uz_sub: string;
  settings_lang_en: string;
  settings_lang_en_sub: string;
  settings_lang_ru: string;
  settings_lang_ru_sub: string;
  settings_theme_section: string;
  settings_theme_dark: string;
  settings_theme_light: string;
  settings_account_section: string;
  settings_account_guest: string;
  settings_account_signed_in: string;

  // Interactive Board Controls
  board_slide: string;
  board_fullscreen: string;
  board_audio: string;
  board_draw: string;
  board_regenerate: string;
  board_next: string;
  board_prev: string;
  board_quick_questions: string;
  board_flashcards: string;
  board_quiz: string;
  board_dialogue: string;
  board_error_hunt: string;
  board_summary: string;
  board_homework: string;
  board_share: string;
  board_exit: string;

  // Synthesis Loading Card
  synth_lab_active: string;
  synth_engine: string;
  synth_topic: string;
  synth_title: string;
  synth_desc: string;

  // Others Picker
  others_title: string;
  others_back_to_lesson: string;
  others_hw_title: string;
  others_hw_desc: string;
  others_lc_title: string;
  others_lc_desc: string;
  others_gq_title: string;
  others_gq_desc: string;

  // Active Modes & Chips
  mode_badge_homework: string;
  mode_badge_group_quiz: string;
  mode_badge_level_check: string;
  quiz_teams_label: string;
  quiz_team_2: string;
  quiz_team_3: string;
  topics_selected_suffix: string;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  uz: {
    brand_name: "Teacher OS",
    brand_sub: "Interaktiv Doska Studiyasi",
    login_register: "Kirish / Ro'yxatdan o'tish",
    logout: "Chiqish",
    guest: "Mehmon",
    close: "Yopish",
    done: "Tayyor",
    cancel: "Bekor qilish",
    save: "Saqlash",
    loading: "Yuklanmoqda...",

    hero_title: "Bugun qaysi mavzuni o'tamiz?",
    image_btn: "+ Rasm",
    others_btn: "Boshqalar",
    prompt_placeholder: "Bugun qaysi mavzuni o'tamiz? (masalan: Present Perfect, History of London)...",
    length_label: "Dars Uzunligi:",
    length_short: "Qisqa",
    length_medium: "O'rtacha",
    length_long: "Uzun",
    level_label: "Daraja:",
    generate_btn: "Yaratish",
    generating_btn: "Sintez qilinmoqda...",

    voice_start_title: "Ovoz bilan yozish",
    voice_stop_title: "Yozishni to'xtatish",
    draw_open_title: "Doskaga qo'lda chizish / yozish",
    draw_close_title: "Chizish rejimini yopish",
    attach_files_title: "Rasm yoki darslik sahifasini yuklash",

    draw_pen: "Ruchka",
    draw_eraser: "O'chirg'ich",
    draw_clear: "Tozalash",
    draw_thickness: "Qalinlik",
    draw_grid_plain: "Oddiy doska",
    draw_grid_check: "Katakli daftarcha",
    draw_grid_lines: "Chiziqli daftar",
    draw_hint: "Mavzuni ruchka bilan yozing yoki doskaga chizing. Tayyor bo'lgach, ✓ tugmasini bosing.",

    drawer_title: "TeacherOS Studiyasi",
    drawer_home: "Bosh sahifa",
    drawer_new_lesson: "Yangi Dars",
    drawer_blank_board: "Bo'sh Doska",
    drawer_history_heading: "Darslar Ro'yxati",
    drawer_no_history: "Hozircha saqlangan darslar yo'q",
    drawer_guest_hint: "Mehmon rejimida darslar tarixi saqlanmaydi. Tarixni saqlash uchun tizimga kiring.",
    drawer_settings: "Sozlamalar",
    drawer_login: "Tizimga Kirish",
    drawer_logged_in: "Faol hisob:",
    drawer_classroom_solo: "Yakkaxon Rejim",
    drawer_classroom_switch: "Sinfxonani almashtirish",
    drawer_classroom_guest_title: "🔒 Sinfxonalar & Darslar Tarixi",
    drawer_classroom_guest_desc: "Sinfxonalar ochish va alohida darslar tarixini saqlash uchun tizimga kiring.",

    settings_title: "Sozlamalar",
    settings_lang_section: "Tizim & Darslik Tili",
    settings_lang_desc: "Interfeys va sun'iy intellekt darslik tushuntirishlarini qaysi tilda ko'rmoqchisiz?",
    settings_lang_uz: "O'zbekcha",
    settings_lang_uz_sub: "O'zbek tilida to'liq tushuntirishlar",
    settings_lang_en: "English",
    settings_lang_en_sub: "100% barcha dars va interfeys ingliz tilida",
    settings_lang_ru: "Русский",
    settings_lang_ru_sub: "Объяснения на русском языке",
    settings_theme_section: "Tizim Ko'rinishi (Mavzu)",
    settings_theme_dark: "Qorong'i rejim (Dark Mode)",
    settings_theme_light: "Yorug' rejim (Light Mode)",
    settings_account_section: "Foydalanuvchi Hisobi",
    settings_account_guest: "Siz mehmon rejimidamisiz. Tarixni saqlash uchun kiring.",
    settings_account_signed_in: "Tizimga muvaffaqiyatli kirilgan",

    board_slide: "Slayd",
    board_fullscreen: "To'liq ekran",
    board_audio: "Ovoz",
    board_draw: "Chizish",
    board_regenerate: "Qayta yaratish",
    board_next: "Keyingi",
    board_prev: "Oldingi",
    board_quick_questions: "Tezkor Savollar",
    board_flashcards: "Fleshkartalar",
    board_quiz: "Bilim Sinovi",
    board_dialogue: "Jonli Muloqot",
    board_error_hunt: "Xato Ovchisi",
    board_summary: "Dars Xulosasi",
    board_homework: "Uyga Vazifa",
    board_share: "Ulashish",
    board_exit: "Chiqish",

    synth_lab_active: "AI SYNTHESIS LAB • FAOL",
    synth_engine: "Gemini 3.5 Engine",
    synth_topic: "Mavzu",
    synth_title: "Interaktiv Doska Sintez Qilinmoqda...",
    synth_desc: "O'qituvchi va talabalar uchun yuqori aniqlikdagi interaktiv darslik tayyorlanmoqda...",

    others_title: "Boshqalar • Maxsus Rejimlar",
    others_back_to_lesson: "Oddiy darsga qaytish",
    others_hw_title: "UYGA VAZIFA",
    others_hw_desc: "Kengaytirilgan uy vazifasi va lug'atlar",
    others_lc_title: "DARAJA TEKSHIRUVI",
    others_lc_desc: "Ko'p modulli daraja diagnostikasi",
    others_gq_title: "GURUH MUSOBAQASI",
    others_gq_desc: "Jamoaviy qiziqarli sinf viktorinasi",

    mode_badge_homework: "UYGA VAZIFA REJIMI",
    mode_badge_group_quiz: "GURUH MUSOBAQASI (Baamboozle)",
    mode_badge_level_check: "DARAJA TEKSHIRUVI (Ko'p mavzuli)",
    quiz_teams_label: "Guruhlar:",
    quiz_team_2: "2 Guruh",
    quiz_team_3: "3 Guruh",
    topics_selected_suffix: "ta mavzu tanlandi"
  },

  en: {
    brand_name: "Teacher OS",
    brand_sub: "Interactive Board Studio",
    login_register: "Sign In / Register",
    logout: "Log Out",
    guest: "Guest",
    close: "Close",
    done: "Done",
    cancel: "Cancel",
    save: "Save",
    loading: "Loading...",

    hero_title: "What are we going to teach today?",
    image_btn: "+ Image",
    others_btn: "Others",
    prompt_placeholder: "What are we going to teach today? (e.g. Present Perfect, History of London)...",
    length_label: "Lesson Length:",
    length_short: "Short",
    length_medium: "Medium",
    length_long: "Long",
    level_label: "Level:",
    generate_btn: "Generate",
    generating_btn: "Synthesizing...",

    voice_start_title: "Voice input (Dictate)",
    voice_stop_title: "Stop recording",
    draw_open_title: "Handwrite or draw on board",
    draw_close_title: "Close drawing board",
    attach_files_title: "Upload image or PDF document",

    draw_pen: "Pen",
    draw_eraser: "Eraser",
    draw_clear: "Clear",
    draw_thickness: "Size",
    draw_grid_plain: "Blank board",
    draw_grid_check: "Squared copybook",
    draw_grid_lines: "Lined copybook",
    draw_hint: "Write your topic or draw on the board with a pen. When ready, click ✓.",

    drawer_title: "TeacherOS Studio",
    drawer_home: "Home",
    drawer_new_lesson: "New Lesson",
    drawer_blank_board: "Blank Board",
    drawer_history_heading: "Lesson History",
    drawer_no_history: "No saved lessons yet",
    drawer_guest_hint: "In guest mode, lesson history is not saved. Sign in to save your lessons.",
    drawer_settings: "Settings",
    drawer_login: "Sign In",
    drawer_logged_in: "Active account:",
    drawer_classroom_solo: "Solo Mode",
    drawer_classroom_switch: "Switch classroom",
    drawer_classroom_guest_title: "🔒 Classrooms & Lesson History",
    drawer_classroom_guest_desc: "Sign in to create classrooms and save your lesson history.",

    settings_title: "Settings",
    settings_lang_section: "Interface & Lesson Language",
    settings_lang_desc: "Choose the language for the platform interface and AI lesson explanations.",
    settings_lang_uz: "O'zbekcha",
    settings_lang_uz_sub: "Explanations in Uzbek",
    settings_lang_en: "English",
    settings_lang_en_sub: "100% all-in-English immersion",
    settings_lang_ru: "Русский",
    settings_lang_ru_sub: "Explanations in Russian",
    settings_theme_section: "Appearance Theme",
    settings_theme_dark: "Dark Mode",
    settings_theme_light: "Light Mode",
    settings_account_section: "User Account",
    settings_account_guest: "You are currently in guest mode. Sign in to save your history.",
    settings_account_signed_in: "Signed in successfully",

    board_slide: "Slide",
    board_fullscreen: "Fullscreen",
    board_audio: "Voice",
    board_draw: "Draw",
    board_regenerate: "Regenerate",
    board_next: "Next",
    board_prev: "Previous",
    board_quick_questions: "Quick Questions",
    board_flashcards: "Flashcards",
    board_quiz: "Knowledge Quiz",
    board_dialogue: "Live Dialogue",
    board_error_hunt: "Mistake Hunter",
    board_summary: "Lesson Summary",
    board_homework: "Homework",
    board_share: "Share",
    board_exit: "Exit",

    synth_lab_active: "AI SYNTHESIS LAB • ACTIVE",
    synth_engine: "Gemini 3.5 Engine",
    synth_topic: "Topic",
    synth_title: "Synthesizing Interactive Board...",
    synth_desc: "Synthesizing a high-fidelity interactive digital lesson deck for teachers and students...",

    others_title: "Others • Special Modes",
    others_back_to_lesson: "Back to standard lesson",
    others_hw_title: "HOMEWORK",
    others_hw_desc: "Extended homework & vocabulary review",
    others_lc_title: "LEVEL CHECK",
    others_lc_desc: "Multi-topic level diagnostic assessment",
    others_gq_title: "GROUP QUIZ",
    others_gq_desc: "Interactive team-based classroom quiz",

    mode_badge_homework: "HOMEWORK MODE",
    mode_badge_group_quiz: "GROUP QUIZ (Baamboozle)",
    mode_badge_level_check: "LEVEL CHECK (Multi-topic)",
    quiz_teams_label: "Teams:",
    quiz_team_2: "2 Teams",
    quiz_team_3: "3 Teams",
    topics_selected_suffix: "topics selected"
  },

  ru: {
    brand_name: "Teacher OS",
    brand_sub: "Студия Интерактивной Доски",
    login_register: "Войти / Регистрация",
    logout: "Выйти",
    guest: "Гость",
    close: "Закрыть",
    done: "Готово",
    cancel: "Отмена",
    save: "Сохранить",
    loading: "Загрузка...",

    hero_title: "Какую тему мы изучаем сегодня?",
    image_btn: "+ Фото",
    others_btn: "Другое",
    prompt_placeholder: "Какую тему мы изучаем сегодня? (например: Present Perfect, History of London)...",
    length_label: "Длина урока:",
    length_short: "Краткий",
    length_medium: "Средний",
    length_long: "Полный",
    level_label: "Уровень:",
    generate_btn: "Создать",
    generating_btn: "Синтезируется...",

    voice_start_title: "Голосовой ввод",
    voice_stop_title: "Остановить запись",
    draw_open_title: "Рукописный ввод и рисование на доске",
    draw_close_title: "Закрыть панель рисования",
    attach_files_title: "Загрузить фото или PDF учебника",

    draw_pen: "Ручка",
    draw_eraser: "Ластик",
    draw_clear: "Очистить",
    draw_thickness: "Толщина",
    draw_grid_plain: "Чистая доска",
    draw_grid_check: "Тетрадь в клетку",
    draw_grid_lines: "Тетрадь в линейку",
    draw_hint: "Напишите тему ручкой или нарисуйте на доске. Когда закончите, нажмите ✓.",

    drawer_title: "Студия TeacherOS",
    drawer_home: "Главная",
    drawer_new_lesson: "Новый урок",
    drawer_blank_board: "Чистая доска",
    drawer_history_heading: "История уроков",
    drawer_no_history: "Пока нет сохранённых уроков",
    drawer_guest_hint: "В гостевом режиме история уроков не сохраняется. Войдите, чтобы сохранять свои уроки.",
    drawer_settings: "Настройки",
    drawer_login: "Войти в систему",
    drawer_logged_in: "Активный аккаунт:",
    drawer_classroom_solo: "Индивидуальный режим",
    drawer_classroom_switch: "Сменить класс",
    drawer_classroom_guest_title: "🔒 Классы и история уроков",
    drawer_classroom_guest_desc: "Войдите в систему, чтобы создавать классы и сохранять историю уроков.",

    settings_title: "Настройки",
    settings_lang_section: "Язык интерфейса и уроков",
    settings_lang_desc: "На каком языке отображать интерфейс и объяснения уроков от ИИ?",
    settings_lang_uz: "O'zbekcha",
    settings_lang_uz_sub: "Объяснения на узбекском языке",
    settings_lang_en: "English",
    settings_lang_en_sub: "100% английский (полное погружение)",
    settings_lang_ru: "Русский",
    settings_lang_ru_sub: "Объяснения на русском языке",
    settings_theme_section: "Тема оформления",
    settings_theme_dark: "Тёмная тема (Dark Mode)",
    settings_theme_light: "Светлая тема (Light Mode)",
    settings_account_section: "Учётная запись",
    settings_account_guest: "Вы находитесь в гостевом режиме. Войдите для сохранения уроков.",
    settings_account_signed_in: "Вы успешно вошли в систему",

    board_slide: "Слайд",
    board_fullscreen: "Во весь экран",
    board_audio: "Озвучка",
    board_draw: "Рисовать",
    board_regenerate: "Пересоздать",
    board_next: "Далее",
    board_prev: "Назад",
    board_quick_questions: "Экспресс-вопросы",
    board_flashcards: "Флешкарты",
    board_quiz: "Тестирование",
    board_dialogue: "Живой диалог",
    board_error_hunt: "Охотник за ошибками",
    board_summary: "Итоги урока",
    board_homework: "Домашнее задание",
    board_share: "Поделиться",
    board_exit: "Выход",

    synth_lab_active: "ЛАБОРАТОРИЯ ИИ-СИНТЕЗА • АКТИВНО",
    synth_engine: "Gemini 3.5 Engine",
    synth_topic: "Тема",
    synth_title: "Синтез интерактивной доски...",
    synth_desc: "Подготовка высокоточной интерактивной презентации для преподавателя и студентов...",

    others_title: "Другое • Специальные режимы",
    others_back_to_lesson: "Вернуться к обычному уроку",
    others_hw_title: "ДОМАШНЕЕ ЗАДАНИЕ",
    others_hw_desc: "Расширенное домашнее задание и словарь",
    others_lc_title: "ПРОВЕРКА УРОВНЯ",
    others_lc_desc: "Многомодульная диагностика уровня",
    others_gq_title: "ГРУППОВАЯ ВИКТОРИНА",
    others_gq_desc: "Командная интерактивная викторина",

    mode_badge_homework: "РЕЖИМ ДОМАШНЕГО ЗАДАНИЯ",
    mode_badge_group_quiz: "ГРУППОВАЯ ВИКТОРИНА (Baamboozle)",
    mode_badge_level_check: "ПРОВЕРКА УРОВНЯ (Мульти-тема)",
    quiz_teams_label: "Команды:",
    quiz_team_2: "2 Команды",
    quiz_team_3: "3 Команды",
    topics_selected_suffix: "выбрано тем"
  },
};

export function getDynamicGreeting(lang: AppLanguage, username?: string, customTeacherName?: string): string {
  const hour = new Date().getHours();
  const rawName = customTeacherName?.trim() || username;
  const name = rawName ? (lang === 'uz' ? `${rawName} ustoz` : rawName) : (lang === 'uz' ? "ustoz" : lang === 'ru' ? "учитель" : "teacher");

  if (hour >= 5 && hour < 12) {
    if (lang === 'en') {
      const enMornings = [
        `Good morning, ${name}! Ready for a new lesson?`,
        `Good morning, ${name}! What exciting topic are we teaching today?`,
        `Good morning! Let's build today's interactive lesson plan together.`,
        `Good morning! Type a topic or sketch on the board — AI is ready.`
      ];
      return enMornings[Math.floor(Math.random() * enMornings.length)];
    }
    if (lang === 'ru') {
      const ruMornings = [
        `Доброе утро, ${name}! Готовы к новому уроку?`,
        `Доброе утро, ${name}! Какую интересную тему преподаём сегодня?`,
        `Доброе утро! Давайте составим план сегодняшнего урока вместе.`,
        `Доброе утро! Введите тему или нарисуйте на доске — ИИ готов.`
      ];
      return ruMornings[Math.floor(Math.random() * ruMornings.length)];
    }
    // Uzbek
    const uzMornings = [
      `Xayrli tong, ${name}! Yangi darsga tayyormisiz?`,
      `Xayrli tong, ${name}! Bugun o'quvchilarga qanday qiziqarli dars o'tamiz?`,
      `Xayrli tong! Darslik rejasini birgalikda tuzamiz.`,
      `Xayrli tong! Mavzuni kiriting yoki doskaga chizing — AI tayyor.`
    ];
    return uzMornings[Math.floor(Math.random() * uzMornings.length)];
  }

  if (hour >= 18 || hour < 5) {
    if (lang === 'en') {
      const enEvenings = [
        `Good evening, ${name}! Ready for a new lesson?`,
        `Good evening, ${name}! Type a topic or sketch on the board — AI is ready.`,
        `Good evening! Let's prepare tomorrow's interactive lesson together.`,
        `Good evening! Welcome — let's synthesize your lesson deck.`
      ];
      return enEvenings[Math.floor(Math.random() * enEvenings.length)];
    }
    if (lang === 'ru') {
      const ruEvenings = [
        `Добрый вечер, ${name}! Готовы к новому уроку?`,
        `Добрый вечер, ${name}! Введите тему или нарисуйте на доске — ИИ готов.`,
        `Добрый вечер! Давайте подготовим интерактивный урок вместе.`,
        `Добрый вечер! Добро пожаловать — синтезируем интерактивный урок.`
      ];
      return ruEvenings[Math.floor(Math.random() * ruEvenings.length)];
    }
    // Uzbek
    const uzEvenings = [
      `Xayrli oqshom, ${name}! Yangi darsga tayyormisiz?`,
      `Xayrli oqshom, ${name}! Mavzuni yozing yoki doskaga chizing — AI tayyor.`,
      `Xayrli oqshom! Bugungi dars mavzusini birgalikda tayyorlaymiz.`,
      `Xayrli oqshom! Xush kelibsiz — bugungi darslikni sintez qilamiz.`
    ];
    return uzEvenings[Math.floor(Math.random() * uzEvenings.length)];
  }

  // Afternoon (12:00 - 18:00)
  if (lang === 'en') {
    const enAfternoons = [
      `Good afternoon, ${name}! Ready for a new lesson?`,
      `Good afternoon, ${name}! What topic are we teaching our students today?`,
      `Good afternoon! Type a topic or upload images to generate slides.`,
      `Good afternoon! Enter your lesson topic — AI will synthesize it.`
    ];
    return enAfternoons[Math.floor(Math.random() * enAfternoons.length)];
  }
  if (lang === 'ru') {
    const ruAfternoons = [
      `Добрый день, ${name}! Готовы к новому уроку?`,
      `Добрый день, ${name}! Какую тему объясняем ученикам сегодня?`,
      `Добрый день! Введите тему или загрузите фото для создания слайдов.`,
      `Добрый день! Напишите тему урока — ИИ синтезирует доску.`
    ];
    return ruAfternoons[Math.floor(Math.random() * ruAfternoons.length)];
  }
  // Uzbek
  const uzAfternoons = [
    `Xayrli kun, ${name}! Yangi darsga tayyormisiz?`,
    `Xayrli kun, ${name}! Bugun o'quvchilarga qanday mavzu o'tamiz?`,
    `Xayrli kun! Mavzuni yozing yoki rasm yuklang, darslik tayyorlaymiz.`,
    `Xayrli kun! Dars o'tish uchun mavzuni yozing — AI sintez qiladi.`
  ];
  return uzAfternoons[Math.floor(Math.random() * uzAfternoons.length)];
}
