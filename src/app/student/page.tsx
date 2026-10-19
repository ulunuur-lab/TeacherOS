"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  Settings,
  Sparkles,
  MoreVertical,
  X,
  Mic,
  Plus,
  Send,
  ChevronRight,
  CheckCircle2,
  Clock,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Globe,
  Sun,
  Moon,
  Info,
  HelpCircle,
  FileText,
  Shield,
  Edit2,
  Check,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  LogIn,
  QrCode,
  RotateCcw,
  Copy,
  BookOpen,
  ArrowRight
} from "lucide-react";
import BezbetCat from "../../components/BezbetCat";
import StudentHomeworkModal, { StudentHomeworkItem } from "../../components/StudentHomeworkModal";

// 100% Comprehensive Translations for All 3 Languages
const STUDENT_LANG = {
  uz: {
    app_student: "O'quvchi",
    sidebar_classroom: "Sinfxona",
    sidebar_homework: "Uyga vazifalar",
    sidebar_settings: "Sozlamalar",
    sidebar_bezbet: "Bezbet AI",
    status_attendance: "Davomat",
    status_absent: "Qoldirilgan darslar",
    status_streak: "kun uzluksiz",
    recent_title: "Oxirgi darslar & mashqlar",
    recent_past_perfect: "Past Perfect zamoni",
    recent_past_perfect_sub: "Dars taqdimoti va grammatika qoidalari",
    recent_group_quiz: "Guruh testi (Baamboozle)",
    recent_group_quiz_sub: "Sinfdoshlar bilan jonli dars musobaqasi",
    recent_level_check: "Bilim darajasini aniqlash",
    recent_level_check_sub: "Haftalik diagnostik sinov",
    leaderboard_title: "Sinf reytingi",
    leaderboard_col_attend: "Davomat",
    leaderboard_col_streak: "Streak",
    more_btn: "Barchasini ko'rish ∨",
    less_btn: "Yopish ∧",
    homework_title: "Uyga vazifalar",
    homework_subtitle: "Ustoz tomonidan biriktirilgan vazifalar",
    homework_completed_count: "bajarildi",
    hw_empty_title: "Hozircha uyga vazifalar yo'q",
    hw_empty_subtitle: "Ustozingiz ushbu sinfxonaga yangi vazifa biriktirganida, ular avtomatik tarzda shu yerda ko'rinadi.",
    hw_empty_demo_btn: "Mashq uchun namuna vazifani ko'rish",
    hw_done: "Bajarildi ✔",
    hw_not_done: "Bajarilmagan",
    bezbet_tagline: "Bezbet — Smurf olamidan AI ingliz tili murabbiyingiz",
    bezbet_placeholder: "Bezbetdan ingliz tili haqida istalgan narsani so'rang...",
    bezbet_welcome: "Miyov! Salom! Men Bezbetman — sizning ingliz tili bo'yicha shaxsiy AI murabbiyingiz. Darslar, uyga vazifa yoki grammatika qoidalarini birga o'rganamiz! 🐾",
    bezbet_new_chat: "Yangi suhbat",
    bezbet_thinking: "Bezbet javob tayyorlamoqda...",
    bezbet_copy: "Nusxa olish",
    bezbet_copied: "Nusxalandi!",
    bezbet_suggest_1: "Past Perfect qoidasini tushuntirib ber",
    bezbet_suggest_2: "Ingliz tilidagi 5 ta eng katta xato",
    bezbet_suggest_3: "Uyga vazifamni qanday yechish kerak?",
    bezbet_suggest_4: "Kundalik yangi 5 ta ibora o'rgat",
    settings_account_title: "Shaxsiy profil",
    settings_app_title: "Ilova sozlamalari",
    settings_help_title: "Yordam va qo'llanma",
    settings_edit_name: "Ismni tahrirlash",
    lang_label: "Til (Language)",
    lang_desc: "Ilova va AI tushuntirishlari tili",
    theme_label: "Mavzu (Theme)",
    theme_desc: "Ranglar va vizual ko'rinish",
    theme_light: "Yorug'",
    theme_dark: "To'q",
    theme_auto: "Avto",
    sound_label: "Ovoz effektlari",
    sound_desc: "Tugmalar va yutuqlar ovozi",
    how_it_works: "Ilova qanday ishlaydi?",
    ask_help: "Ustozdan yordam so'rash",
    terms: "Foydalanish shartlari",
    privacy: "Maxfiylik siyosati",
    auth_title: "O'quvchi Tizimiga Kirish",
    auth_subtitle: "TeacherOS darslari va uyga vazifalariga ulanish uchun Telegram hisobingiz orqali kiring.",
    auth_tg_btn: "Telegram orqali kirish",
    auth_demo_btn: "Mehmon / Demo sifatida kirish",
    auth_scanning: "Telegram botingizni tekshirmoqdamiz...",
    logout_btn: "Tizimdan chiqish"
  },
  en: {
    app_student: "Student",
    sidebar_classroom: "Classroom",
    sidebar_homework: "Homework",
    sidebar_settings: "Settings",
    sidebar_bezbet: "Bezbet AI",
    status_attendance: "Attendance",
    status_absent: "Absent Lessons",
    status_streak: "day streak",
    recent_title: "Recent Lessons & Tasks",
    recent_past_perfect: "Past Perfect Tense",
    recent_past_perfect_sub: "Lesson presentation and grammar rules",
    recent_group_quiz: "Group Quiz (Baamboozle)",
    recent_group_quiz_sub: "Live multiplayer classroom challenge",
    recent_level_check: "Level Check Diagnostic",
    recent_level_check_sub: "Weekly diagnostic assessment",
    leaderboard_title: "Classroom Leaderboard",
    leaderboard_col_attend: "Attendance",
    leaderboard_col_streak: "Streak",
    more_btn: "View all ∨",
    less_btn: "Collapse ∧",
    homework_title: "Homework Tasks",
    homework_subtitle: "Assignments assigned by your teacher",
    homework_completed_count: "completed",
    hw_empty_title: "No homework assignments yet",
    hw_empty_subtitle: "When your teacher assigns homework for your classroom, it will appear here immediately.",
    hw_empty_demo_btn: "View sample practice task",
    hw_done: "Done ✔",
    hw_not_done: "Not done",
    bezbet_tagline: "Bezbet — Your AI English Tutor Cat from the Smurf Universe",
    bezbet_placeholder: "Ask Bezbet anything about English...",
    bezbet_welcome: "Purr! Hello! I'm Bezbet — your personal AI English tutor. Let's master English together. Ask me any question! 🐾",
    bezbet_new_chat: "New Chat",
    bezbet_thinking: "Bezbet is thinking...",
    bezbet_copy: "Copy",
    bezbet_copied: "Copied!",
    bezbet_suggest_1: "Explain the Past Perfect tense",
    bezbet_suggest_2: "5 most common English mistakes",
    bezbet_suggest_3: "How to complete my homework?",
    bezbet_suggest_4: "Teach me 5 useful daily idioms",
    settings_account_title: "Account Profile",
    settings_app_title: "App Preferences",
    settings_help_title: "Help & Information",
    settings_edit_name: "Edit Name",
    lang_label: "Language",
    lang_desc: "Interface and AI explanations language",
    theme_label: "Theme",
    theme_desc: "Visual appearance and color mode",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_auto: "Auto",
    sound_label: "Sound Effects",
    sound_desc: "Audio feedback for clicks and achievements",
    how_it_works: "How does it work?",
    ask_help: "Ask Teacher for Help",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    auth_title: "Student Sign In",
    auth_subtitle: "Sign in with your Telegram account to access your classroom lessons and homework.",
    auth_tg_btn: "Sign in with Telegram",
    auth_demo_btn: "Continue as Demo / Guest",
    auth_scanning: "Checking your Telegram bot authentication...",
    logout_btn: "Sign Out"
  },
  ru: {
    app_student: "Ученик",
    sidebar_classroom: "Класс",
    sidebar_homework: "Домашние задания",
    sidebar_settings: "Настройки",
    sidebar_bezbet: "Безбет ИИ",
    status_attendance: "Посещаемость",
    status_absent: "Пропущено уроков",
    status_streak: "дней подряд",
    recent_title: "Недавние уроки и задания",
    recent_past_perfect: "Прошедшее совершенное (Past Perfect)",
    recent_past_perfect_sub: "Презентация урока и правила грамматики",
    recent_group_quiz: "Групповая викторина (Baamboozle)",
    recent_group_quiz_sub: "Живое соревнование с одноклассниками",
    recent_level_check: "Диагностика уровня знаний",
    recent_level_check_sub: "Еженедельный проверочный тест",
    leaderboard_title: "Рейтинг класса",
    leaderboard_col_attend: "Посещ.",
    leaderboard_col_streak: "Серия",
    more_btn: "Показать всех ∨",
    less_btn: "Свернуть ∧",
    homework_title: "Домашние задания",
    homework_subtitle: "Задания, назначенные учителем для вашего класса",
    homework_completed_count: "выполнено",
    hw_empty_title: "Пока нет домашних заданий",
    hw_empty_subtitle: "Когда ваш учитель назначит домашнее задание для вашего класса, оно появится здесь автоматически.",
    hw_empty_demo_btn: "Посмотреть образец задания",
    hw_done: "Выполнено ✔",
    hw_not_done: "Не выполнено",
    bezbet_tagline: "Безбет — твой ИИ-репетитор английского из вселенной Смурфиков",
    bezbet_placeholder: "Спроси у Безбета всё что угодно по английскому...",
    bezbet_welcome: "Мяу! Привет! Я Безбет — твой персональный ИИ-репетитор. Давай учить английский вместе! Задавай любой вопрос! 🐾",
    bezbet_new_chat: "Новый диалог",
    bezbet_thinking: "Безбет думает...",
    bezbet_copy: "Копировать",
    bezbet_copied: "Скопировано!",
    bezbet_suggest_1: "Объясни время Past Perfect",
    bezbet_suggest_2: "5 самых частых ошибок в английском",
    bezbet_suggest_3: "Как правильно решать домашку?",
    bezbet_suggest_4: "Научи меня 5 полезным идиомам",
    settings_account_title: "Профиль аккаунта",
    settings_app_title: "Настройки приложения",
    settings_help_title: "Помощь и руководство",
    settings_edit_name: "Изменить имя",
    lang_label: "Язык (Language)",
    lang_desc: "Язык интерфейса и объяснений ИИ",
    theme_label: "Тема (Theme)",
    theme_desc: "Цветовая схема и оформление",
    theme_light: "Светлая",
    theme_dark: "Тёмная",
    theme_auto: "Авто",
    sound_label: "Звуковые эффекты",
    sound_desc: "Аудио-отклик при кликах и достижениях",
    how_it_works: "Как это работает?",
    ask_help: "Попросить помощи у учителя",
    terms: "Условия использования",
    privacy: "Политика конфиденциальности",
    auth_title: "Вход для ученика",
    auth_subtitle: "Войдите через аккаунт Telegram, чтобы получить доступ к урокам и домашним заданиям.",
    auth_tg_btn: "Войти через Telegram",
    auth_demo_btn: "Войти как гость / Демо",
    auth_scanning: "Проверяем авторизацию через Telegram...",
    logout_btn: "Выйти из системы"
  }
};

export default function StudentAppPage() {
  // Navigation State (Classroom, Homework, Settings, Bezbet)
  const [activeTab, setActiveTab] = useState<"classroom" | "homework" | "bezbet" | "settings">("classroom");

  // App Language: Uzbek default, English, Russian
  const [lang, setLang] = useState<"uz" | "en" | "ru">("uz");
  const t = STUDENT_LANG[lang];

  // Theme Mode: Dark vs Light
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "auto">("dark");
  const isLight = themeMode === "light";

  // Sound Effects
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Student Profile State
  const [studentName, setStudentName] = useState<string>("Ulug'bek Nurmuhammadov");
  const [telegramUsername, setTelegramUsername] = useState<string>("ulunur");
  const [telegramAvatar, setTelegramAvatar] = useState<string | null>(null);
  const [className, setClassName] = useState<string>("Intermediate group");
  const [attendancePercent, setAttendancePercent] = useState<number>(93);
  const [absentCount, setAbsentCount] = useState<number>(4);
  const [streakDays, setStreakDays] = useState<number>(9);

  // Edit Name Modal State
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(studentName);

  // Leaderboard expansion
  const [showFullLeaderboard, setShowFullLeaderboard] = useState<boolean>(false);

  // Homework State (Default empty if no teacher homework exists)
  const [homeworkList, setHomeworkList] = useState<StudentHomeworkItem[]>([]);
  const [activeModalHomework, setActiveModalHomework] = useState<StudentHomeworkItem | null>(null);

  // Bezbet AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bezbet"; text: string; image?: string; time: string }>>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sound chime helper
  const playSoundEffect = (type: "click" | "success" | "cat") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "click") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === "success") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "cat") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Helper to extract all questions across all sections of any homework structure
  const extractQuestionsFromHomework = (item: any) => {
    if (Array.isArray(item.questions) && item.questions.length > 0) {
      return item.questions;
    }
    const rawSections = item.sections || item.data?.sections || [];
    const extracted: any[] = [];
    let qCounter = 1;

    rawSections.forEach((sec: any) => {
      (sec.items || []).forEach((q: any) => {
        extracted.push({
          id: q.id || qCounter++,
          question: q.question || q.prompt || "",
          options: q.options && q.options.length > 0 ? q.options : undefined,
          answer: q.answer || (q.options ? q.options[0] : ""),
          explanation: q.explanation || sec.instruction || ""
        });
      });
    });

    return extracted;
  };

  // Synchronize classroom homework from both server and local storage
  const syncClassroomHomework = useCallback(async (targetClassName?: string) => {
    if (typeof window === "undefined") return;

    const activeName = targetClassName || className || "Class 9A";
    const collected: StudentHomeworkItem[] = [];
    const seenTopics = new Set<string>();

    const addHomeworkItem = (raw: any) => {
      if (!raw || !raw.topic) return;
      const topicKey = raw.topic.trim().toLowerCase();
      if (seenTopics.has(topicKey)) return;
      seenTopics.add(topicKey);

      const hwId = raw.id || `hw_${raw.topic}_${Date.now()}`;
      const doneKey = `teacheros_student_done_${hwId}`;
      const doneKeyTopic = `teacheros_student_done_${raw.topic}`;
      const isDone =
        localStorage.getItem(doneKey) === "true" ||
        localStorage.getItem(doneKeyTopic) === "true" ||
        raw.isDone === true;

      const questions = extractQuestionsFromHomework(raw);
      const assignedDate = raw.assignedAt || raw.createdAt
        ? new Date(raw.assignedAt || raw.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Bugun";

      collected.push({
        id: hwId,
        topic: raw.topic,
        assignedDate,
        isDone,
        questions
      });
    };

    // 1. Check local storage first (instant responsiveness)
    try {
      const allKeys = Object.keys(localStorage);
      const hwKeys = allKeys.filter((k) => k.startsWith("teacheros_homeworks_") || k === "teacheros_latest_assigned_hw");
      hwKeys.forEach((key) => {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              parsed.forEach((p) => addHomeworkItem(p));
            } else if (parsed && typeof parsed === "object") {
              addHomeworkItem(parsed);
            }
          }
        } catch (e) {}
      });
    } catch (e) {}

    if (collected.length > 0) {
      setHomeworkList([...collected]);
    }

    // 2. Fetch from persistent API for this classroom & all classrooms
    try {
      const urls = [
        `/api/classroom-homework?classroomName=${encodeURIComponent(activeName)}`,
        `/api/classroom-homework?classroomName=all`
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.homeworks)) {
              data.homeworks.forEach((h: any) => addHomeworkItem(h));
            }
          }
        } catch (e) {}
      }

      if (collected.length > 0) {
        setHomeworkList([...collected]);
      }
    } catch (e) {
      console.warn("Classroom homework sync failed:", e);
    }
  }, [className]);

  // Check Telegram session & classroom homework on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // A. Instant Automatic Login via Telegram Mini App
        const tgWebApp = (window as any).Telegram?.WebApp;
        if (tgWebApp) {
          try {
            tgWebApp.ready();
            tgWebApp.expand();
            const tgUser = tgWebApp.initDataUnsafe?.user;
            if (tgUser && (tgUser.first_name || tgUser.username)) {
              const studentObj = {
                username: tgUser.username ? `@${tgUser.username}` : `student_${tgUser.id}`,
                first_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || "O'quvchi",
                photo_url: tgUser.photo_url || null
              };
              localStorage.setItem("teacheros_student_session", JSON.stringify(studentObj));
              setTelegramUsername(studentObj.username);
              setStudentName(studentObj.first_name);
              if (studentObj.photo_url) setTelegramAvatar(studentObj.photo_url);
              setIsAuthenticated(true);
              return;
            }
          } catch (err) {
            console.warn("TG WebApp read error:", err);
          }
        }

        // B. Check URL parameters from Telegram Bot WebApp (?tg_id=...&username=...)
        const params = new URLSearchParams(window.location.search);
        const urlUsername = params.get("username");
        const urlFirstName = params.get("first_name");
        const urlPhoto = params.get("photo_url");

        if (urlUsername || urlFirstName) {
          const studentObj = {
            username: urlUsername || "student",
            first_name: urlFirstName || "Student",
            photo_url: urlPhoto || null
          };
          localStorage.setItem("teacheros_student_session", JSON.stringify(studentObj));
          setTelegramUsername(studentObj.username);
          setStudentName(studentObj.first_name);
          if (studentObj.photo_url) setTelegramAvatar(studentObj.photo_url);
          setIsAuthenticated(true);
        } else {
          // Check saved session
          const savedSession = localStorage.getItem("teacheros_student_session");
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed.username) setTelegramUsername(parsed.username);
            if (parsed.first_name) setStudentName(parsed.first_name);
            if (parsed.photo_url) setTelegramAvatar(parsed.photo_url);
            setIsAuthenticated(true);
          } else {
            // Check if teacher logged in previously to populate student name if convenient
            const teacherAuth = localStorage.getItem("teacheros_auth_user");
            if (teacherAuth) {
              const parsed = JSON.parse(teacherAuth);
              if (parsed.username) setTelegramUsername(parsed.username);
              if (parsed.first_name) setStudentName(parsed.first_name);
              if (parsed.photo_url) setTelegramAvatar(parsed.photo_url);
              setIsAuthenticated(true);
            }
          }
        }
      }

      // 2. Sync Classroom name
      const savedClass = localStorage.getItem("teacheros_classroom");
      let activeClsName = "Class 9A";
      if (savedClass) {
        const parsedCls = JSON.parse(savedClass);
        if (parsedCls.name) {
          setClassName(parsedCls.name);
          activeClsName = parsedCls.name;
        }
      }

      // 3. Load Homework assigned by teacher for this classroom (Server + Local Storage)
      syncClassroomHomework(activeClsName);
    } catch (e) {
      console.warn("Storage sync error:", e);
    } finally {
      setIsAuthLoading(false);
    }
  }, [syncClassroomHomework]);

  // Re-sync homework whenever student switches to homework tab
  useEffect(() => {
    if (activeTab === "homework") {
      syncClassroomHomework();
    }
  }, [activeTab, syncClassroomHomework]);

  // Auto-scroll Bezbet chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAiThinking]);

  // Handle Demo/Guest Login
  const handleDemoLogin = () => {
    playSoundEffect("success");
    const demoUser = {
      username: "ulunur",
      first_name: "Ulug'bek Nurmuhammadov",
      photo_url: null
    };
    localStorage.setItem("teacheros_student_session", JSON.stringify(demoUser));
    setTelegramUsername(demoUser.username);
    setStudentName(demoUser.first_name);
    setIsAuthenticated(true);
  };

  // Handle Logout
  const handleLogout = () => {
    playSoundEffect("click");
    localStorage.removeItem("teacheros_student_session");
    setIsAuthenticated(false);
  };

  // Voice recording via Web Speech API
  const handleToggleVoiceRecord = () => {
    playSoundEffect("click");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browseringizda Speech Recognition (Ovoz orqali yozish) qo'llab-quvvatlanmaydi.");
      return;
    }

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "ru" ? "ru-RU" : lang === "uz" ? "uz-UZ" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecordingVoice(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecordingVoice(false);
      };
      recognition.onerror = () => setIsRecordingVoice(false);
      recognition.onend = () => setIsRecordingVoice(false);

      recognition.start();
    } catch (e) {
      setIsRecordingVoice(false);
    }
  };

  // Image Upload for Bezbet
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      playSoundEffect("click");
    };
    reader.readAsDataURL(file);
  };

  // Send message to Bezbet (Gemini Tutor)
  const handleSendToBezbet = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend && !attachedImage) return;

    playSoundEffect("click");
    const newMsg = {
      sender: "user" as const,
      text: textToSend,
      image: attachedImage || undefined,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setAttachedImage(null);
    setIsTyping(false);
    setIsAiThinking(true);

    try {
      const res = await fetch("/api/student-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages,
          topic: className,
          lang,
          imageBase64: newMsg.image
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bezbet",
            text: data.reply || "Miyov! Sizni tushundim! 🐾",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        playSoundEffect("cat");
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bezbet",
          text: "Miyov! Hozir ulanishda xatolik yuz berdi. Qayta urinib ko'ring! 🐾",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Copy Bezbet text
  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    playSoundEffect("click");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Complete homework handler
  const handleHomeworkComplete = (hwId: string, score: number, total: number) => {
    playSoundEffect("success");
    setHomeworkList((prev) =>
      prev.map((hw) => {
        if (hw.id === hwId || hw.topic === hwId) {
          try {
            localStorage.setItem(`teacheros_student_done_${hw.id}`, "true");
            localStorage.setItem(`teacheros_student_done_${hw.topic}`, "true");
          } catch (e) {}
          return { ...hw, isDone: true, score, totalQuestions: total };
        }
        return hw;
      })
    );
    try {
      localStorage.setItem(`teacheros_student_done_${hwId}`, "true");
    } catch (e) {}
    setStreakDays((p) => p + 1);
  };

  // Add demo homework if list is empty
  const handleAddDemoHomework = () => {
    playSoundEffect("click");
    const demoHw: StudentHomeworkItem = {
      id: "demo_hw_1",
      topic: "Past Perfect Tense",
      assignedDate: "Bugun",
      isDone: false
    };
    setHomeworkList([demoHw]);
  };

  // Leaderboard students
  const LEADERBOARD_STUDENTS = [
    { rank: 1, name: "Jasur R.", attend: "100%", streak: 15, isYou: false },
    { rank: 2, name: "Malika S.", attend: "98%", streak: 12, isYou: false },
    { rank: 3, name: studentName, attend: `${attendancePercent}%`, streak: streakDays, isYou: true },
    { rank: 4, name: "Kamron B.", attend: "90%", streak: 7, isYou: false },
    { rank: 5, name: "Dilnoza M.", attend: "88%", streak: 5, isYou: false },
    { rank: 6, name: "Sardor K.", attend: "85%", streak: 4, isYou: false },
    { rank: 7, name: "Madina T.", attend: "82%", streak: 3, isYou: false }
  ];

  // =========================================================================
  // TELEGRAM AUTHENTICATION GATE SCREEN FOR STUDENTS
  // =========================================================================
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div
        className={`min-h-screen w-full flex items-center justify-center p-4 font-sans select-none ${
          isLight ? "bg-[#f8fafc] text-slate-800" : "bg-[#0f1021] text-white"
        }`}
      >
        <div
          className={`w-full max-w-md p-8 rounded-[28px] border shadow-2xl flex flex-col items-center text-center space-y-6 ${
            isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
          }`}
        >
          {/* Official TeacherOS Brand Logo */}
          <div className="relative">
            <img
              src={isLight ? "/logo-blue.png" : "/logo-white.png"}
              alt="TeacherOS"
              className="h-16 w-auto object-contain drop-shadow-[0_0_25px_rgba(99,91,255,0.5)]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight uppercase">TeacherOS</h1>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#635BFF]/20 text-[#818cf8] border border-[#635BFF]/30">
                {t.app_student}
              </span>
            </div>
            <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              {t.auth_subtitle}
            </p>
          </div>

          {/* Telegram Login Button */}
          <div className="w-full space-y-3 pt-2">
            <a
              href="https://t.me/app_teacheros_bot?start=student_app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDemoLogin}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm shadow-xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>{t.auth_tg_btn}</span>
            </a>

            <button
              type="button"
              onClick={handleDemoLogin}
              className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              {t.auth_demo_btn}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            Telegram bot: @app_teacheros_bot • 100% xavfsiz ta'lim tizimi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex select-none font-sans overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#0f1021] text-white"
      }`}
    >
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR PANEL (Picture 1)                        */}
      {/* ======================================================== */}
      <aside
        className={`w-64 sm:w-72 shrink-0 border-r flex flex-col justify-between py-6 px-4 transition-all z-30 ${
          isLight
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-[#131428] border-white/[0.08]"
        }`}
      >
        <div className="space-y-6">
          {/* Logo (TeacherOS Official Brand Logo + Class Name) */}
          <div className="px-2 space-y-2">
            <div className="flex items-center space-x-2.5">
              <img
                src={isLight ? "/logo-blue.png" : "/logo-white.png"}
                alt="TeacherOS"
                className="h-9 w-auto max-w-[150px] object-contain shrink-0 drop-shadow-[0_0_15px_rgba(99,91,255,0.4)]"
              />
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#635BFF]/20 text-[#818cf8] border border-[#635BFF]/30 uppercase tracking-wider shrink-0">
                {t.app_student}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className={`text-xs font-semibold truncate ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {className}
              </p>
            </div>
          </div>

          {/* Navigation Items (Classroom, Homework, Settings, Bezbet) */}
          <nav className="space-y-2 pt-2">
            {/* 1. Classroom */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect("click");
                setActiveTab("classroom");
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "classroom"
                  ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>{t.sidebar_classroom}</span>
            </button>

            {/* 2. Homework */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect("click");
                setActiveTab("homework");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "homework"
                  ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5 shrink-0" />
                <span>{t.sidebar_homework}</span>
              </div>
              {homeworkList.some((h) => !h.isDone) && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>

            {/* 3. Settings */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect("click");
                setActiveTab("settings");
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>{t.sidebar_settings}</span>
            </button>

            {/* 4. Bezbet AI Cat */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect("click");
                setActiveTab("bezbet");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "bezbet"
                  ? "bg-gradient-to-r from-[#635BFF] to-[#8b5cf6] text-white shadow-lg shadow-[#635BFF]/30"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl leading-none">🐱</span>
                <span>{t.sidebar_bezbet}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400 text-slate-950">
                AI
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Profile Capsule Pill (Clicking goes to Settings) */}
        <div className={`pt-4 border-t ${isLight ? "border-slate-200" : "border-white/[0.08]"}`}>
          <button
            type="button"
            onClick={() => {
              playSoundEffect("click");
              setActiveTab("settings");
            }}
            className={`w-full p-2.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer group text-left ${
              isLight
                ? "bg-slate-50 hover:bg-slate-100 border-slate-200"
                : "bg-white/5 hover:bg-white/10 border-white/10"
            }`}
            title="Profil & Sozlamalar"
          >
            {telegramAvatar ? (
              <img
                src={telegramAvatar}
                alt={studentName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#635BFF]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                {studentName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className={`text-xs font-bold block truncate transition-colors ${
                isLight ? "text-slate-800 group-hover:text-indigo-600" : "text-white group-hover:text-sky-300"
              }`}>
                {studentName}
              </span>
              <span className={`text-[11px] font-mono block truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                @{telegramUsername}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA                                     */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scrollbar-none">
        {/* Top Window Control Bar (Streak, ···, ✕) */}
        <header className="w-full flex items-center justify-between px-8 py-5 shrink-0 z-20">
          <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            {activeTab.toUpperCase()}
          </span>

          <div className="flex items-center space-x-3">
            {/* Streak Pill */}
            <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 shadow-sm ${
              isLight
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            }`}>
              <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{streakDays} {t.status_streak}</span>
            </div>

            {/* Three Dots Button (···) */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect("click");
                setActiveTab("settings");
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
              }`}
              title="Sozlamalar"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Close / Sign out Button (✕) */}
            <button
              type="button"
              onClick={handleLogout}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600"
                  : "bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400"
              }`}
              title={t.logout_btn}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* TAB 1: CLASSROOM (Picture 2)                             */}
        {/* ======================================================== */}
        {activeTab === "classroom" && (
          <div className="w-full max-w-5xl mx-auto px-6 pb-12 space-y-6 animate-fade-in">
            {/* Top Student Profile Card */}
            <div
              className={`w-full p-6 sm:p-8 rounded-[24px] border shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${
                isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left z-10">
                {telegramAvatar ? (
                  <img
                    src={telegramAvatar}
                    alt={studentName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-[#635BFF]/50 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#635BFF] to-[#38BDF8] text-white font-black text-3xl flex items-center justify-center shadow-xl ring-4 ring-white/10">
                    {studentName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    {studentName}
                  </h1>
                  <p className="text-sm font-semibold text-[#635BFF]">{className}</p>
                  <p className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    @{telegramUsername}
                  </p>
                </div>
              </div>

              {/* Attendance Card */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-3 shrink-0 min-w-[220px] text-center sm:text-left z-10 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-[#131428] border-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={isLight ? "text-slate-600" : "text-slate-400"}>{t.status_attendance}</span>
                  <span className="text-emerald-500 font-mono text-sm">{attendancePercent}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                    style={{ width: `${attendancePercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className={isLight ? "text-slate-600" : "text-slate-400"}>{t.status_absent}:</span>
                  <span className="text-amber-500 font-bold">{absentCount} dars</span>
                </div>
              </div>
            </div>

            {/* Bottom 2 Cards Grid: Recent & Best Achievers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: RECENT */}
              <div
                className={`p-6 rounded-[24px] border shadow-xl space-y-4 flex flex-col justify-between ${
                  isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
                }`}
              >
                <div>
                  <h2 className={`text-base sm:text-lg font-black tracking-wide uppercase flex items-center space-x-2 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <span>{t.recent_title}</span>
                  </h2>

                  <div className="space-y-3 pt-4">
                    <div
                      onClick={() => {
                        playSoundEffect("click");
                        setActiveTab("homework");
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isLight
                          ? "bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300"
                          : "bg-[#131428] border-white/5 hover:border-[#635BFF]/40"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isLight ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}`}>
                          {t.recent_past_perfect}
                        </span>
                        <span className={`text-[10px] block font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {t.recent_past_perfect_sub}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                    </div>

                    <div
                      onClick={() => {
                        playSoundEffect("click");
                        alert("Guruh musobaqasi dars vaqtida ustoz tomonidan boshqariladi.");
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isLight
                          ? "bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300"
                          : "bg-[#131428] border-white/5 hover:border-amber-400/40"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isLight ? "text-slate-900 group-hover:text-amber-600" : "text-white group-hover:text-amber-300"}`}>
                          {t.recent_group_quiz}
                        </span>
                        <span className={`text-[10px] block font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {t.recent_group_quiz_sub}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" />
                    </div>

                    <div
                      onClick={() => {
                        playSoundEffect("click");
                        setActiveTab("homework");
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isLight
                          ? "bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300"
                          : "bg-[#131428] border-white/5 hover:border-emerald-400/40"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isLight ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-emerald-300"}`}>
                          {t.recent_level_check}
                        </span>
                        <span className={`text-[10px] block font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {t.recent_level_check_sub}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: BEST ACHIEVERS LEADERBOARD */}
              <div
                className={`p-6 rounded-[24px] border shadow-xl space-y-4 ${
                  isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className={`text-base sm:text-lg font-black tracking-wide uppercase flex items-center space-x-2 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>{t.leaderboard_title}</span>
                  </h2>
                  <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {t.leaderboard_col_attend} / {t.leaderboard_col_streak}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {(showFullLeaderboard ? LEADERBOARD_STUDENTS : LEADERBOARD_STUDENTS.slice(0, 5)).map((st) => (
                    <div
                      key={st.rank}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        st.isYou
                          ? isLight
                            ? "bg-indigo-50 border-indigo-200 shadow-sm"
                            : "bg-[#635BFF]/20 border-[#635BFF]/50 shadow-sm"
                          : isLight
                          ? "bg-slate-50 border-slate-200"
                          : "bg-[#131428] border-white/5"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                            st.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                              : st.rank === 2
                              ? "bg-slate-300 text-slate-950"
                              : st.rank === 3
                              ? "bg-amber-700 text-white"
                              : isLight
                              ? "bg-slate-200 text-slate-600"
                              : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {st.rank}
                        </span>
                        <span className={`font-bold ${
                          st.isYou
                            ? "text-[#635BFF]"
                            : isLight
                            ? "text-slate-900"
                            : "text-white"
                        }`}>
                          {st.name} {st.isYou && `(${lang === 'uz' ? 'Siz' : lang === 'ru' ? 'Вы' : 'You'})`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 font-mono">
                        <span className="text-emerald-500 font-bold">{st.attend}</span>
                        <span className="text-amber-500 font-bold flex items-center space-x-0.5">
                          <span>{st.streak}</span>
                          <span>🔥</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect("click");
                    setShowFullLeaderboard((p) => !p);
                  }}
                  className={`w-full py-2 text-center text-xs font-bold transition-colors cursor-pointer ${
                    isLight ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {showFullLeaderboard ? t.less_btn : t.more_btn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: HOMEWORK (Picture 3)                              */}
        {/* ======================================================== */}
        {activeTab === "homework" && (
          <div className="w-full max-w-4xl mx-auto px-6 pb-12 space-y-6 animate-fade-in">
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}>
              <div className="space-y-1">
                <h1 className={`text-2xl font-black uppercase tracking-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  {t.homework_title}
                </h1>
                <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  {t.homework_subtitle}
                </p>
              </div>

              {homeworkList.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30 font-mono">
                  {homeworkList.filter((h) => h.isDone).length} / {homeworkList.length} {t.homework_completed_count}
                </span>
              )}
            </div>

            {/* If homework exists */}
            {homeworkList.length > 0 ? (
              <div className="space-y-3.5">
                {homeworkList.map((hw) => (
                  <div
                    key={hw.id}
                    onClick={() => {
                      playSoundEffect("click");
                      setActiveModalHomework(hw);
                    }}
                    className={`p-5 rounded-[20px] border flex items-center justify-between transition-all cursor-pointer group shadow-lg ${
                      hw.isDone
                        ? isLight
                          ? "bg-white border-emerald-300 hover:border-emerald-500"
                          : "bg-[#1a1c36] border-emerald-500/30 hover:border-emerald-500/60"
                        : isLight
                        ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md"
                        : "bg-[#1a1c36] border-white/10 hover:border-[#635BFF]/60 hover:shadow-[#635BFF]/20"
                    }`}
                  >
                    <div className="space-y-1">
                      <h3 className={`text-base sm:text-lg font-bold transition-colors ${
                        isLight ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"
                      }`}>
                        {hw.topic}
                      </h3>
                      <p className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        📅 {hw.assignedDate}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isLight
                          ? "bg-slate-100 group-hover:bg-[#2563eb] text-slate-700 group-hover:text-white"
                          : "bg-white/5 group-hover:bg-[#635BFF] text-slate-300 group-hover:text-white"
                      }`}>
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                      </div>

                      {hw.isDone ? (
                        <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center space-x-1.5 shadow-sm min-w-[90px] justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.hw_done}</span>
                        </div>
                      ) : (
                        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center space-x-1.5 shadow-sm min-w-[90px] justify-center">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.hw_not_done}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* EMPTY STATE (Matching User Request) */
              <div
                className={`py-16 px-6 rounded-[28px] border text-center flex flex-col items-center justify-center space-y-4 shadow-xl ${
                  isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#635BFF]/20 to-[#38BDF8]/20 flex items-center justify-center border border-[#635BFF]/30 shadow-md">
                  <span className="text-3xl">📚</span>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                    {t.hw_empty_title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {t.hw_empty_subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddDemoHomework}
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.hw_empty_demo_btn}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BEZBET (AI Smurf Cat Tutor, ChatGPT Flow)          */}
        {/* ======================================================== */}
        {activeTab === "bezbet" && (
          <div className="w-full max-w-4xl mx-auto px-6 h-[calc(100vh-100px)] flex flex-col justify-between pb-6 animate-fade-in">
            {/* If conversation has NOT started: Centered Cat Welcome */}
            {chatMessages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto py-8">
                <BezbetCat
                  isTyping={isTyping}
                  isThinking={isAiThinking}
                  size={190}
                  onCatClick={() => playSoundEffect("cat")}
                />

                <div className="space-y-2">
                  <h2 className={`text-2xl font-black flex items-center justify-center space-x-2 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    <span>Bezbet AI</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30">
                      GEMINI
                    </span>
                  </h2>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {t.bezbet_welcome}
                  </p>
                </div>

                {/* Suggested prompt chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                  {[t.bezbet_suggest_1, t.bezbet_suggest_2, t.bezbet_suggest_3, t.bezbet_suggest_4].map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSendToBezbet(prompt)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between group ${
                        isLight
                          ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                          : "bg-[#1a1c36] hover:bg-white/5 border-white/10 text-slate-200 hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#635BFF] shrink-0 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* If conversation HAS started: Full ChatGPT Flow, Cat at top-left of AI response */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header with New Chat Button */}
                <div className={`flex items-center justify-between pb-3 border-b shrink-0 ${
                  isLight ? "border-slate-200" : "border-white/10"
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🐱</span>
                    <span className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                      Bezbet AI Tutor
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30">
                      LIVE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect("click");
                      setChatMessages([]);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.bezbet_new_chat}</span>
                  </button>
                </div>

                {/* Chat Scroll View (Spacious, ChatGPT-style) */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto space-y-5 py-4 px-1 scrollbar-none"
                >
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="w-full animate-fade-in">
                      {msg.sender === "user" ? (
                        /* User Message */
                        <div className="flex justify-end">
                          <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-[22px] rounded-tr-none bg-[#2563eb] text-white text-sm leading-relaxed shadow-lg space-y-2">
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Attachment"
                                className="max-h-56 rounded-xl object-cover border border-white/20"
                              />
                            )}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <span className="text-[10px] opacity-75 block text-right font-mono">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Bezbet AI Response Message: Mini Cat Avatar at Top-Left (Matching User Requirement) */
                        <div className="flex items-start space-x-3 max-w-full">
                          {/* Mini Bezbet Cat Avatar (Tracks Cursor!) */}
                          <div className="shrink-0 pt-0.5">
                            <BezbetCat
                              size={44}
                              isTyping={isTyping}
                              onCatClick={() => playSoundEffect("cat")}
                            />
                          </div>

                          {/* Message Body Card */}
                          <div
                            className={`flex-1 p-5 rounded-[22px] rounded-tl-none border shadow-lg space-y-3 ${
                              isLight
                                ? "bg-white border-slate-200 text-slate-800"
                                : "bg-[#1a1c36] border-white/10 text-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b pb-2 border-white/5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-[#635BFF]">Bezbet</span>
                                <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  {msg.time}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.text, idx)}
                                className={`text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors ${
                                  isLight ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {copiedIdx === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500">{t.bezbet_copied}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{t.bezbet_copy}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {isAiThinking && (
                    <div className="flex items-start space-x-3 animate-fade-in">
                      <div className="shrink-0 pt-0.5">
                        <BezbetCat size={44} isThinking={true} />
                      </div>
                      <div
                        className={`p-4 rounded-2xl rounded-tl-none border text-xs font-medium flex items-center space-x-2 ${
                          isLight
                            ? "bg-white border-slate-200 text-slate-600 shadow-sm"
                            : "bg-[#1a1c36] border-white/10 text-slate-300"
                        }`}
                      >
                        <span className="text-sm animate-spin">🐾</span>
                        <span>{t.bezbet_thinking}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input Bar Pinned at Bottom */}
            <div className="shrink-0 space-y-2 pt-2">
              {attachedImage && (
                <div className="relative inline-block">
                  <img
                    src={attachedImage}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#635BFF] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div
                className={`w-full p-2 rounded-full border shadow-2xl flex items-center space-x-2 transition-all focus-within:border-[#635BFF] ${
                  isLight
                    ? "bg-white border-slate-300 shadow-slate-200"
                    : "bg-[#1a1c36] border-white/15"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                  }`}
                  title="Rasm yoki topshiriq biriktirish"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setIsTyping(e.target.value.trim().length > 0);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendToBezbet()}
                  placeholder={t.bezbet_placeholder}
                  className={`flex-1 bg-transparent text-sm focus:outline-none px-2 ${
                    isLight ? "text-slate-900 placeholder-slate-400" : "text-white placeholder-slate-400"
                  }`}
                />

                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isRecordingVoice
                      ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_#ef4444]"
                      : isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                  }`}
                  title="Ovoz bilan yozish"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSendToBezbet()}
                  disabled={!inputText.trim() && !attachedImage}
                  className="w-10 h-10 rounded-full bg-[#635BFF] hover:bg-[#5248e3] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SETTINGS & ACCOUNT (Picture 5)                     */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="w-full max-w-4xl mx-auto px-6 pb-12 space-y-6 animate-fade-in">
            {/* Card 1: ACCOUNT */}
            <div
              className={`p-6 rounded-[24px] border shadow-xl space-y-4 ${
                isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {t.settings_account_title}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-xs font-bold text-[#635BFF] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t.settings_edit_name}</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 pt-1">
                {telegramAvatar ? (
                  <img
                    src={telegramAvatar}
                    alt={studentName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#635BFF]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                    {studentName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-0.5">
                  <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {studentName}
                  </h3>
                  <p className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    @{telegramUsername}
                  </p>
                  <p className="text-xs text-[#635BFF] font-semibold">{className}</p>
                </div>
              </div>
            </div>

            {/* Card 2: APP PREFERENCES (LANG, Theme, Sound) */}
            <div
              className={`p-6 rounded-[24px] border shadow-xl space-y-6 ${
                isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
              }`}
            >
              <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {t.settings_app_title}
              </span>

              {/* 1. Language Segmented Control [UZ] [RU] [ENG] */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {t.lang_label}
                  </span>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {t.lang_desc}
                  </p>
                </div>

                <div className={`p-1 rounded-2xl border flex items-center space-x-1 shrink-0 ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-[#131428] border-white/10"
                }`}>
                  {(["uz", "ru", "en"] as const).map((lCode) => (
                    <button
                      key={lCode}
                      type="button"
                      onClick={() => {
                        playSoundEffect("click");
                        setLang(lCode);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        lang === lCode
                          ? "bg-[#635BFF] text-white shadow-md"
                          : isLight
                          ? "text-slate-600 hover:text-slate-900"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lCode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Theme Segmented Control [Light] [Dark] [Auto] */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t ${
                isLight ? "border-slate-200" : "border-white/5"
              }`}>
                <div className="space-y-0.5">
                  <span className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {t.theme_label}
                  </span>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {t.theme_desc}
                  </p>
                </div>

                <div className={`p-1 rounded-2xl border flex items-center space-x-1 shrink-0 ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-[#131428] border-white/10"
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect("click");
                      setThemeMode("light");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                      themeMode === "light"
                        ? "bg-[#635BFF] text-white shadow-md"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t.theme_light}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect("click");
                      setThemeMode("dark");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                      themeMode === "dark"
                        ? "bg-[#635BFF] text-white shadow-md"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{t.theme_dark}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect("click");
                      setThemeMode("auto");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === "auto"
                        ? "bg-[#635BFF] text-white shadow-md"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.theme_auto}
                  </button>
                </div>
              </div>

              {/* 3. Sound Effects Toggle Switch */}
              <div className={`flex items-center justify-between pt-4 border-t ${
                isLight ? "border-slate-200" : "border-white/5"
              }`}>
                <div className="space-y-0.5">
                  <span className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {t.sound_label}
                  </span>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {t.sound_desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (next) playSoundEffect("success");
                  }}
                  className={`w-14 h-8 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                    soundEnabled
                      ? "bg-emerald-500 justify-end"
                      : isLight
                      ? "bg-slate-300 justify-start"
                      : "bg-white/10 justify-start"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

            {/* Card 3: HELP & INFORMATION */}
            <div
              className={`p-6 rounded-[24px] border shadow-xl space-y-3 ${
                isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
              }`}
            >
              <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {t.settings_help_title}
              </span>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => alert("TeacherOS Student App: Sizga ustoz tomonidan yuborilgan darslar, uyga vazifalar va Bezbet AI orqali yordam beruvchi platforma!")}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                      : "bg-[#131428] hover:bg-white/5 border-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>{t.how_it_works}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => alert("Telegram orqali ustozingizga to'g'ridan-to'g'ri xabar yo'llashingiz mumkin.")}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                      : "bg-[#131428] hover:bg-white/5 border-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>{t.ask_help}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => alert("Terms & Conditions: TeacherOS ta'lim platformasi shartlari.")}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                      : "bg-[#131428] hover:bg-white/5 border-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>{t.terms}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Homework Solver Modal */}
        <StudentHomeworkModal
          isOpen={!!activeModalHomework}
          onClose={() => setActiveModalHomework(null)}
          homework={activeModalHomework}
          onComplete={handleHomeworkComplete}
          appLanguage={lang}
        />

        {/* Edit Name Modal */}
        {isEditingName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-sm rounded-[24px] border p-6 space-y-4 shadow-2xl ${
              isLight ? "bg-white border-slate-200" : "bg-[#1a1c36] border-white/10"
            }`}>
              <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.settings_edit_name}
              </h3>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-[#635BFF] ${
                  isLight
                    ? "bg-slate-100 border-slate-300 text-slate-900"
                    : "bg-[#131428] border-white/10 text-white"
                }`}
                autoFocus
              />
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    isLight ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempName.trim()) {
                      setStudentName(tempName.trim());
                      setIsEditingName(false);
                      playSoundEffect("success");
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#635BFF] text-white hover:bg-[#5248e3] shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
