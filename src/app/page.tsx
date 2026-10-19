"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Menu,
  Sparkles,
  Play,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  MousePointer,
  Crop,
  PenTool,
  Hand,
  Image as ImageIcon,
  Palette,
  Star,
  Plus,
  Mic,
  ArrowUp,
  RotateCcw,
  RotateCw,
  HelpCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Maximize2,
  Minimize2,
  Send,
  CheckCircle2,
  Copy,
  Sun,
  Moon,
  Zap,
  Target,
  BookOpen,
  MessageSquare,
  Search,
  Edit3,
  Eraser,
  Type,
  Trash2,
  Highlighter,
  Trophy,
  Eye,
  EyeOff,
  Lightbulb,
  History,
  MoreHorizontal,
  FileText,
  Home,
  User,
  Users,
  Settings,
  LogOut,
  Ban,
  Calendar,
  Flame,
  Camera,
  Globe,
  Mail,
  Square,
  Circle,
  Triangle,
  Minus,
  Shapes,
  Layers,
  ArrowUpRight,
  Undo,
  AlertTriangle,
  Shuffle,
  Puzzle,
  AlignLeft,
  Swords,
  ClipboardList
} from "lucide-react";
import {
  Curriculum,
  LessonLength,
  Slide,
  QuickQuestion,
  QuizQuestion,
  Flashcard,
  DialogTurn,
  ErrorHuntItem,
  FillGapItem,
  SummaryRule,
  VisualDiagram as VisualDiagramType,
  TeacherClassroom
} from "../lib/types";
import { MASTER_CURRICULUMS, enrichCurriculumWithSections } from "../lib/curriculums";
import VisualDiagram from "../components/VisualDiagram";
import AuthModal, { AuthUser } from "../components/AuthModal";
import ClassroomModal from "../components/ClassroomModal";
import ClassroomSelector from "../components/ClassroomSelector";
import BaamboozleQuiz from "../components/BaamboozleQuiz";
import HomeworkViewer, { HomeworkGeneratedData } from "../components/HomeworkViewer";
import TeacherAssignmentsHistoryModal from "../components/TeacherAssignmentsHistoryModal";
import {
  compressCurriculumToHash,
  decompressCurriculumFromHash,
  dispatchSubmissionToTelegram,
  generateStandaloneHtml,
  DEFAULT_TEACHER_CHAT_ID
} from "../lib/share";
import { getSlideImageUrl, getVocabImageUrl } from "../lib/pollinations";
import { AppLanguage, TRANSLATIONS, getDynamicGreeting } from "../lib/translations";

function sanitizeSlideBody(rawHtml: string, isLight: boolean = false): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";
  if (isLight) {
    return rawHtml
      .replace(/background(-color)?\s*:\s*(#121624|#16181f|#18191e|#100e22|#0f172a|#090814|rgba\s*\(\s*18\s*,\s*22\s*,\s*34[^)]*\))/gi, "background: #f8fafc")
      .replace(/background(-color)?\s*:\s*rgba\s*\(\s*99\s*,\s*102\s*,\s*241\s*,\s*0\.1[0-9]*\)/gi, "background: #eef2ff")
      .replace(/background(-color)?\s*:\s*rgba\s*\(\s*239\s*,\s*68\s*,\s*68\s*,\s*0\.1[0-9]*\)/gi, "background: #fef2f2")
      .replace(/background(-color)?\s*:\s*rgba\s*\(\s*16\s*,\s*185\s*,\s*129\s*,\s*0\.1[0-9]*\)/gi, "background: #ecfdf5")
      .replace(/border-left\s*:\s*3px solid #6366f1/gi, "border-left: 4px solid #4f46e5; color: #1e1b4b")
      .replace(/border-left\s*:\s*3px solid #ef4444/gi, "border-left: 4px solid #dc2626; color: #7f1d1d")
      .replace(/color\s*:\s*(#ffffff|#fff|white|#f8fafc|#f1f5f9|#e2e8f0|#cbd5e1|#94a3b8|#a5b4fc|#818cf8|#38bdf8|#60a5fa|#93c5fd|#c7d2fe|#a78bfa|#c4b5fd|#ddd6fe|#34d399|#6ee7b7|#fde047|#fcd34d)/gi, "color: #0f172a");
  }
  return rawHtml
    .replace(/background(-color)?\s*:\s*(#ffffff|#fff|white|#f8fafc|#f1f5f9|#f0f9ff|#ecfdf5|#eff6ff|#fef2f2|#fffbeb|rgb\s*\(\s*255\s*,\s*255\s*,\s*255\s*\))/gi, "background: rgba(18, 22, 34, 0.85)")
    .replace(/color\s*:\s*(#000000|#000|black|#111111|#111|#1e293b|#0f172a|#1f2937|#333333|#333|#334155|#475569)/gi, "color: #f1f5f9");
}

function getSmartVocabHint(word: string, pos?: string, uz?: string, providedHint?: string): string {
  if (providedHint && providedHint.trim().length > 3) {
    return providedHint.startsWith("💡") ? providedHint : `💡 ${providedHint}`;
  }
  const w = (word || "").toLowerCase().trim();
  if (w === "which") return "💡 Narsalar, buyumlar va hayvonlarni bog'lash uchun olmosh (Which car? The car which is red). Insonlar uchun ishlatilmaydi!";
  if (w === "who") return "💡 Faqat insonlar va odamlarni bog'lash uchun (The teacher who helped me).";
  if (w === "where") return "💡 Joy, shahar yoki makonlarni bog'lash uchun (The city where I live).";
  if (w === "when") return "💡 Aniq vaqt, sana yoki lahzani ifodalash uchun (The day when we met).";
  if (w === "whose") return "💡 Tegishlilik va egalik munosabati (The boy whose bag was lost).";
  if (w === "that") return "💡 Universal bog'lovchi: ham odamlar, ham narsalar uchun (Defining clauses).";
  if (w === "whom") return "💡 To'ldiruvchi o'rnidagi odamlar uchun rasmiy shakl (The person whom I met).";
  if (w === "decision") return "💡 Biror masala bo'yicha qat'iy to'xtamga kelish: 'make a decision'.";
  if (w === "prediction") return "💡 Kelajak haqida oldindan aytilgan taxmin yoki bashorat.";
  if (w === "promise") return "💡 Bajarishga so'z berilgan qat'iy va'da: 'keep a promise'.";
  if (w === "intention") return "💡 Qalbda yoki fikrda rejalashtirilgan maqsad, niyat: 'have an intention'.";
  if (w === "evidence") return "💡 Ko'z bilan ko'rib turilgan ashyoviy isbot, dalil.";
  if (w === "spontaneous") return "💡 Oldindan o'ylamasdan, o'sha zahoti to'satdan qabul qilingan tezkor qaror.";
  if (w === "achievement") return "💡 Mehnat va intilish orqali erishilgan ulkan yutuq yoki natija.";
  if (w === "dedication") return "💡 Biror maqsad yo'lida butun kuch-quvvat bilan fidoyilik ko'rsatish.";
  if (w === "legacy") return "💡 Inson o'zidan keyingi avlodlar uchun qoldiradigan boy meros.";
  if (uz) return `💡 Donishmand maslahat: '${uz}' ma'nosidagi ${pos || "so'z"}. Misol gapdagi bog'lanishiga e'tibor bering!`;
  return `💡 Donishmand maslahat: Ushbu ${pos || "so'z"}ni jonli nutq vaziyatida tasavvur qilib eslab qoling.`;
}

const OPTION_THEMES = [
  { letter: "A", bg: "bg-rose-600", border: "border-rose-800", ring: "ring-rose-400" },
  { letter: "B", bg: "bg-indigo-600", border: "border-indigo-800", ring: "ring-indigo-400" },
  { letter: "C", bg: "bg-amber-500", border: "border-amber-700", ring: "ring-amber-300" },
  { letter: "D", bg: "bg-emerald-600", border: "border-emerald-800", ring: "ring-emerald-400" }
];

// Screen type union for flattened continuous board navigation
type BoardScreen =
  | { type: "slide"; subIndex: number; total: number; data: Slide }
  | { type: "quickQuestion"; subIndex: number; total: number; data: QuickQuestion }
  | { type: "test"; subIndex: number; total: number; data: QuizQuestion }
  | { type: "vocab"; subIndex: number; total: number; data: Flashcard }
  | { type: "dialog"; subIndex: number; total: number; data: DialogTurn }
  | { type: "errorHunt"; subIndex: number; total: number; data: ErrorHuntItem }
  | { type: "fillGap"; subIndex: number; total: number; data: FillGapItem }
  | { type: "summary"; subIndex: number; total: number; data: { title: string; takeaway: string; rules: SummaryRule[] } };

// Custom Brand Logo Component with automatic fallback (/logo-white.png -> /logo-blue.png -> /logo.png -> CSS Badge)
function BrandLogo({
  isLight = false,
  className = "h-8 max-w-[160px] object-contain",
  onClick
}: {
  isLight?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const [imgSrc, setImgSrc] = useState<string>(isLight ? "/logo-blue.png" : "/logo-white.png");
  const [loadError, setLoadError] = useState(false);
  const [isSubtleEffect, setIsSubtleEffect] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; tx: number; ty: number; char: string; size: number }>>([]);

  useEffect(() => {
    setImgSrc(isLight ? "/logo-blue.png" : "/logo-white.png");
    setLoadError(false);
  }, [isLight]);

  const handleLogoClick = (e: React.MouseEvent) => {
    const sparkleChars = ['✦', '✧', '⋆', '•', '✨', '✦'];
    const angles = [0, 60, 120, 180, 240, 300];
    const newSparkles = angles.map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const dist = 24 + Math.random() * 16;
      return {
        id: Date.now() + i,
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist,
        char: sparkleChars[i % sparkleChars.length],
        size: 9 + (i % 3) * 3,
      };
    });
    setSparkles(newSparkles);
    setIsSubtleEffect(true);
    setTimeout(() => {
      setIsSubtleEffect(false);
    }, 900);

    onClick?.();
  };

  if (loadError) {
    return (
      <div className="relative inline-flex items-center">
        {isSubtleEffect && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-indigo-500/20 pointer-events-none animate-logo-wave" />
            <span className="absolute inset-0 rounded-2xl border border-indigo-400/50 pointer-events-none animate-logo-wave" style={{ animationDelay: '0.12s' }} />
            {sparkles.map((sp) => (
              <span
                key={sp.id}
                className="absolute top-1/2 left-1/2 pointer-events-none text-indigo-400 font-bold animate-logo-sparkle select-none z-30"
                style={{
                  '--tx': `${sp.tx}px`,
                  '--ty': `${sp.ty}px`,
                  fontSize: `${sp.size}px`,
                } as React.CSSProperties}
              >
                {sp.char}
              </span>
            ))}
          </>
        )}
        <div
          onClick={handleLogoClick}
          className={`flex items-center space-x-2 ${onClick ? "cursor-pointer" : ""}`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B3DF5] to-[#8B5CF6] flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-all">
            OS
          </div>
          <span className={`font-bold text-sm tracking-tight hidden sm:inline ${isLight ? "text-slate-900" : "text-white"}`}>
            TeacherOS
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {isSubtleEffect && (
        <>
          <span className="absolute inset-0 rounded-2xl bg-indigo-500/20 pointer-events-none animate-logo-wave" />
          <span className="absolute inset-0 rounded-2xl border border-indigo-400/50 pointer-events-none animate-logo-wave" style={{ animationDelay: '0.12s' }} />
          {sparkles.map((sp) => (
            <span
              key={sp.id}
              className="absolute top-1/2 left-1/2 pointer-events-none text-indigo-400 font-bold animate-logo-sparkle select-none z-30"
              style={{
                '--tx': `${sp.tx}px`,
                '--ty': `${sp.ty}px`,
                fontSize: `${sp.size}px`,
              } as React.CSSProperties}
            >
              {sp.char}
            </span>
          ))}
        </>
      )}
      <img
        src={imgSrc}
        alt="TeacherOS Logo"
        onClick={handleLogoClick}
        className={`${className} transition-transform group-hover:scale-105 active:scale-95 cursor-pointer`}
        onError={() => {
          if (imgSrc === "/logo-white.png") {
            setImgSrc("/logo-blue.png");
          } else if (imgSrc === "/logo-blue.png") {
            setImgSrc("/logo.png");
          } else {
            setLoadError(true);
          }
        }}
      />
    </div>
  );
}

const HOMEWORK_QUESTION_TYPES = [
  {
    id: "mcq",
    title: { uz: "Multiple Choice", en: "Multiple Choice", ru: "Multiple Choice" },
    subtitle: { uz: "A/B/C/D test shakli", en: "A/B/C/D choice test", ru: "Тест с выбором A/B/C/D" },
    icon: HelpCircle,
    color: {
      border: "border-sky-400",
      bgActive: "bg-sky-950/80",
      glow: "shadow-[0_0_20px_rgba(56,189,248,0.35)]",
      text: "text-sky-300",
      badge: "bg-sky-500/20 text-sky-200 border-sky-500/30",
      iconBg: "bg-sky-500/20 text-sky-400"
    }
  },
  {
    id: "mistake_hunter",
    title: { uz: "Mistake Hunter", en: "Mistake Hunter", ru: "Mistake Hunter" },
    subtitle: { uz: "Xatolarni topish & tuzatish", en: "Spot & correct errors", ru: "Поиск и исправление ошибок" },
    icon: AlertTriangle,
    color: {
      border: "border-rose-500",
      bgActive: "bg-rose-950/80",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      text: "text-rose-300",
      badge: "bg-rose-500/20 text-rose-200 border-rose-500/30",
      iconBg: "bg-rose-500/20 text-rose-400"
    }
  },
  {
    id: "open_cloze",
    title: { uz: "Open Cloze", en: "Open Cloze", ru: "Open Cloze" },
    subtitle: { uz: "Variantlarsiz to'ldirish", en: "Direct gap filling", ru: "Прямой пропуск без вариантов" },
    icon: Edit3,
    color: {
      border: "border-emerald-400",
      bgActive: "bg-emerald-950/80",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      text: "text-emerald-300",
      badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
      iconBg: "bg-emerald-500/20 text-emerald-400"
    }
  },
  {
    id: "sentence_transformation",
    title: { uz: "Sentence Transform", en: "Sentence Transform", ru: "Sentence Transform" },
    subtitle: { uz: "Kalit so'z bilan qayta tuzish", en: "Key-word paraphrase", ru: "Перефразирование с ключевым словом" },
    icon: Shuffle,
    color: {
      border: "border-purple-400",
      bgActive: "bg-purple-950/80",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.35)]",
      text: "text-purple-300",
      badge: "bg-purple-500/20 text-purple-200 border-purple-500/30",
      iconBg: "bg-purple-500/20 text-purple-400"
    }
  },
  {
    id: "word_formation",
    title: { uz: "Word Formation", en: "Word Formation", ru: "Word Formation" },
    subtitle: { uz: "Morfologik so'z yasash", en: "Derivational morphology", ru: "Морфологическое словообразование" },
    icon: Puzzle,
    color: {
      border: "border-amber-400",
      bgActive: "bg-amber-950/80",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      text: "text-amber-300",
      badge: "bg-amber-500/20 text-amber-200 border-amber-500/30",
      iconBg: "bg-amber-500/20 text-amber-400"
    }
  },
  {
    id: "unscramble",
    title: { uz: "Sentence Scramble", en: "Sentence Scramble", ru: "Sentence Scramble" },
    subtitle: { uz: "Gapni to'g'ri tartiblash", en: "Reorder word tokens", ru: "Восстановление порядка слов" },
    icon: AlignLeft,
    color: {
      border: "border-cyan-400",
      bgActive: "bg-cyan-950/80",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
      text: "text-cyan-300",
      badge: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
      iconBg: "bg-cyan-500/20 text-cyan-400"
    }
  },
  {
    id: "translation",
    title: { uz: "Translation Drill", en: "Translation Drill", ru: "Translation Drill" },
    subtitle: { uz: "Ona tilidan inglizchaga", en: "L1 to English drill", ru: "Перевод на английский язык" },
    icon: Globe,
    color: {
      border: "border-teal-400",
      bgActive: "bg-teal-950/80",
      glow: "shadow-[0_0_20px_rgba(20,184,166,0.35)]",
      text: "text-teal-300",
      badge: "bg-teal-500/20 text-teal-200 border-teal-500/30",
      iconBg: "bg-teal-500/20 text-teal-400"
    }
  },
  {
    id: "contrast_duel",
    title: { uz: "Contrast Duel", en: "Contrast Duel", ru: "Contrast Duel" },
    subtitle: { uz: "Farqlash: for vs since", en: "Structural contrast", ru: "Различение схожих правил" },
    icon: Swords,
    color: {
      border: "border-orange-400",
      bgActive: "bg-orange-950/80",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
      text: "text-orange-300",
      badge: "bg-orange-500/20 text-orange-200 border-orange-500/30",
      iconBg: "bg-orange-500/20 text-orange-400"
    }
  },
  {
    id: "dialogue_fill",
    title: { uz: "Dialogue Completion", en: "Dialogue Completion", ru: "Dialogue Completion" },
    subtitle: { uz: "Kontekstual muloqot", en: "Contextual dialogue", ru: "Живой контекстный диалог" },
    icon: MessageSquare,
    color: {
      border: "border-indigo-400",
      bgActive: "bg-indigo-950/80",
      glow: "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
      text: "text-indigo-300",
      badge: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
      iconBg: "bg-indigo-500/20 text-indigo-400"
    }
  },
  {
    id: "writing_challenge",
    title: { uz: "Writing Challenge", en: "Writing Challenge", ru: "Writing Challenge" },
    subtitle: { uz: "Erkin insho/yozma", en: "Targeted composition", ru: "Целевое свободное письмо" },
    icon: PenTool,
    color: {
      border: "border-pink-400",
      bgActive: "bg-pink-950/80",
      glow: "shadow-[0_0_20px_rgba(236,72,153,0.35)]",
      text: "text-pink-300",
      badge: "bg-pink-500/20 text-pink-200 border-pink-500/30",
      iconBg: "bg-pink-500/20 text-pink-400"
    }
  }
];

export default function StitchTeacherOS() {
  // 1. Persistent User Auth & Auto-Login Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 2. Classroom Workspace Mode & Real Classroom Management (User Sketch Image 1 & 2)
  const [workspaceMode, setWorkspaceMode] = useState<'classroom' | 'solo'>('solo');
  const [currentClassroom, setCurrentClassroom] = useState<{ id: string; name: string; students: number }>({
    id: 'solo',
    name: 'Yakkaxon Rejim',
    students: 0
  });
  const [classrooms, setClassrooms] = useState<TeacherClassroom[]>([]);
  const [activeClassroomId, setActiveClassroomId] = useState<string | null>(null);
  const [showClassroomModal, setShowClassroomModal] = useState<boolean>(false);
  const [showAssignmentsHistoryModal, setShowAssignmentsHistoryModal] = useState<boolean>(false);
  const [teacherDisplayName, setTeacherDisplayName] = useState<string>('');
  const [classroomModalMode, setClassroomModalMode] = useState<'create' | 'list'>('create');

  // 3. Studio Mode: 'lesson' | 'others_picker' | 'homework' | 'group_quiz' | 'level_check'
  const [studioMode, setStudioMode] = useState<'lesson' | 'others_picker' | 'homework' | 'group_quiz' | 'level_check'>('lesson');

  // 4. Interactive Group Quiz & Homework State
  const [quizTeamsCount, setQuizTeamsCount] = useState<2 | 3>(2);
  const [activeGroupQuizTopic, setActiveGroupQuizTopic] = useState<string | null>(null);
  const [activeHomeworkTopic, setActiveHomeworkTopic] = useState<string | null>(null);
  const [levelCheckTopics, setLevelCheckTopics] = useState<string[]>(['Present Simple', 'Past Simple']);

  // Homework Studio 2-Step Configuration & Multi-Level Intensity State
  const [homeworkStep, setHomeworkStep] = useState<'prompt' | 'config' | 'review'>('prompt');
  const [homeworkIntensity, setHomeworkIntensity] = useState<'light' | 'medium' | 'extreme'>('medium');
  const [selectedHomeworkTypes, setSelectedHomeworkTypes] = useState<string[]>([
    'mcq', 'mistake_hunter', 'open_cloze', 'sentence_transformation', 'word_formation',
    'unscramble', 'translation', 'contrast_duel', 'dialogue_fill', 'writing_challenge'
  ]);
  const [generatedHomeworkData, setGeneratedHomeworkData] = useState<HomeworkGeneratedData | null>(null);
  const [isGeneratingHomework, setIsGeneratingHomework] = useState(false);

  // Social Modal & Custom Blank Board
  type DrawingTool = "pen" | "highlighter" | "text" | "eraser" | "rectangle" | "circle" | "triangle" | "arrow" | "line";
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [isBlankBoardOpen, setIsBlankBoardOpen] = useState(false);
  const blankCanvasRef = useRef<HTMLCanvasElement>(null);
  const blankDrawingDataRef = useRef<ImageData | null>(null);
  const isBlankDrawingRef = useRef(false);
  const blankUndoStackRef = useRef<ImageData[]>([]);
  const [blankPenTool, setBlankPenTool] = useState<DrawingTool>("pen");
  const [blankPenColor, setBlankPenColor] = useState<string>("#5B3DF5");
  const [blankPenSize, setBlankPenSize] = useState<number>(3);
  const [blankTextInputPos, setBlankTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [blankTypedText, setBlankTypedText] = useState("");
  const blankShapeStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const blankShapeSnapshotRef = useRef<ImageData | null>(null);
  const isInitialMountRef = useRef(true);

  // Fullscreen Interactive Visual Diagram Modal
  const [expandedVisual, setExpandedVisual] = useState<VisualDiagramType | null>(null);

  // Smartboard Handwriting Prompt Input State (Pen/Finger Input on Electronic Board)
  const [isHandwritingPromptOpen, setIsHandwritingPromptOpen] = useState(false);
  const handwritingCanvasRef = useRef<HTMLCanvasElement>(null);
  const isHandwritingDrawingRef = useRef(false);
  const [handwritingPenColor, setHandwritingPenColor] = useState("#FFFFFF");
  const [handwritingPenSize, setHandwritingPenSize] = useState(4);
  const [handwritingTool, setHandwritingTool] = useState<"pen" | "eraser">("pen");
  const handwritingUndoStackRef = useRef<ImageData[]>([]);

  // Continuous Speech-to-Text Recording State
  const [recordedInterimText, setRecordedInterimText] = useState("");
  const silenceTimerRef = useRef<any>(null);
  const baseTopicRef = useRef<string>("");

  // 3-Language UI & Curriculum Localization State
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('uz');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('teacheros_language') as AppLanguage;
      if (savedLang === 'uz' || savedLang === 'en' || savedLang === 'ru') {
        setAppLanguage(savedLang);
      }
    } catch (e) {}
  }, []);

  const handleLanguageChange = (newLang: AppLanguage) => {
    setAppLanguage(newLang);
    try {
      localStorage.setItem('teacheros_language', newLang);
    } catch (e) {}
    setHeroGreeting(getDynamicGreeting(newLang, currentUser?.username, teacherDisplayName));
    showToast(newLang === 'en' ? "Language: English" : newLang === 'ru' ? "Язык: Русский" : "Til: O'zbekcha");
  };

  // Dynamic Gemini / ChatGPT style teacher greeting
  const [heroGreeting, setHeroGreeting] = useState<string>("Xayrli kun, ustoz! Yangi darsga tayyormisiz?");

  useEffect(() => {
    setHeroGreeting(getDynamicGreeting(appLanguage, currentUser?.username, teacherDisplayName));
  }, [currentUser, appLanguage, teacherDisplayName]);

  const t = TRANSLATIONS[appLanguage];

  const handleLogout = () => {
    localStorage.removeItem('teacheros_auth_user');
    localStorage.removeItem('teacheros_workspace_mode');
    setCurrentUser(null);
    setWorkspaceMode('solo');
    showToast(appLanguage === 'en' ? "Signed out" : appLanguage === 'ru' ? "Вы вышли из системы" : "Tizimdan chiqildi");
  };

  // Core Prompt & Settings State
  const [topicInput, setTopicInput] = useState("");
  const [level, setLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("B1");
  const [lessonLength, setLessonLength] = useState<LessonLength>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnimatingUp, setIsAnimatingUp] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generationStage, setGenerationStage] = useState<number>(1);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Left history drawer & right bar expansion state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRightBarExpanded, setIsRightBarExpanded] = useState(false);
  const [lessonHistory, setLessonHistory] = useState<Array<{ topic: string; time: string; timestamp?: number }>>([]);

  // Account & Classroom-scoped History & Homework Helpers (Preserved forever per classroom)
  const getHistoryStorageKey = (user: AuthUser | null, classId?: string | null) => {
    const uid = user ? (user.telegram_id || (user as any).id || user.username || 'user') : 'guest';
    const cid = classId !== undefined ? classId : activeClassroomId;
    if (cid && cid !== 'solo') {
      return `teacheros_history_${uid}_${cid}`;
    }
    return `teacheros_history_${uid}_solo`;
  };

  const getHomeworkStorageKey = (user: AuthUser | null, classId?: string | null) => {
    const uid = user ? (user.telegram_id || (user as any).id || user.username || 'user') : 'guest';
    const cid = classId !== undefined ? classId : activeClassroomId;
    if (cid && cid !== 'solo') {
      return `teacheros_homeworks_${uid}_${cid}`;
    }
    return `teacheros_homeworks_${uid}_solo`;
  };

  // Dedicated history loader for specific classroom or solo mode with timestamp migration
  const loadHistoryForClassroom = (targetClassId: string | null) => {
    const teacherUid = currentUser ? (currentUser.telegram_id || (currentUser as any)?.id || currentUser?.username || 'user') : 'guest';
    const key = getHistoryStorageKey(currentUser, targetClassId);
    let saved = localStorage.getItem(key);
    // Legacy fallback for solo mode
    if (!saved && (!targetClassId || targetClassId === 'solo')) {
      saved = localStorage.getItem(`teacheros_history_${teacherUid}`);
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If items don't have distinct timestamps, migrate them with realistic staggered timestamps
          const now = Date.now();
          const migrated = parsed.map((item: any, i: number) => {
            if (!item.timestamp) {
              return { ...item, timestamp: now - (i + 1) * (18 * 60 * 1000 + 45000) };
            }
            return item;
          });
          setLessonHistory(migrated);
          return;
        }
      } catch (e) {}
    }
    setLessonHistory([]);
  };

  const addLessonToHistory = (topic: string, fullCurriculum?: Curriculum) => {
    if (!topic || !topic.trim()) return;
    const clean = topic.trim();
    const timeLabel = appLanguage === 'en' ? "Just now" : appLanguage === 'ru' ? "Только что" : "Hozir";
    const newEntry = {
      topic: clean,
      time: timeLabel,
      timestamp: Date.now(),
      classroomId: activeClassroomId || 'solo',
      classroomName: workspaceMode === 'classroom' ? currentClassroom.name : 'Yakkaxon Rejim'
    };

    setLessonHistory((prev) => {
      const filtered = prev.filter(
        (h) => h.topic.toLowerCase() !== clean.toLowerCase()
      );
      const updated = [newEntry, ...filtered];
      try {
        const key = getHistoryStorageKey(currentUser, activeClassroomId);
        localStorage.setItem(key, JSON.stringify(updated));
        if (fullCurriculum) {
          localStorage.setItem(`teacheros_curriculum_cache_${clean.toLowerCase()}`, JSON.stringify(fullCurriculum));
        }
      } catch (e) {}
      return updated;
    });
  };

  // Dynamic accurate relative time calculator for history items (shows distinct minutes for each item)
  const getRelativeTime = (timestamp?: number, fallbackTime?: string) => {
    if (!timestamp) return fallbackTime || (appLanguage === 'en' ? 'Recently' : appLanguage === 'ru' ? 'Недавно' : 'Hozir');
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (diffSec < 60) return appLanguage === 'en' ? 'Just now' : appLanguage === 'ru' ? 'Только что' : 'Hozir';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    const remMin = diffMin % 60;
    // Show hours AND minutes for up to 6 hours so every lesson has its own distinct elapsed time!
    if (diffHours < 6) {
      return remMin > 0 ? `${diffHours}h ${remMin}m` : `${diffHours}h`;
    }
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w`;
  };

  // Classroom Management Actions (Image 1 & 2)
  const handleCreateClassroom = (name: string, studentUsernames: string[]) => {
    const teacherUid = currentUser?.telegram_id || (currentUser as any)?.id || currentUser?.username || 'user';
    const newClass: TeacherClassroom = {
      id: `cls_${Date.now()}`,
      name,
      createdAt: Date.now(),
      students: studentUsernames.map((u) => ({ username: u, addedAt: Date.now() })),
      inviteCode: `cls_${Date.now().toString(36)}`
    };
    const updated = [newClass, ...classrooms];
    setClassrooms(updated);
    setActiveClassroomId(newClass.id);
    setWorkspaceMode('classroom');
    setCurrentClassroom({ id: newClass.id, name: newClass.name, students: newClass.students.length });
    loadHistoryForClassroom(newClass.id);
    try {
      localStorage.setItem(`teacheros_classrooms_${teacherUid}`, JSON.stringify(updated));
      localStorage.setItem('teacheros_workspace_mode', 'classroom');
      localStorage.setItem('teacheros_classroom', JSON.stringify({ id: newClass.id, name: newClass.name, students: newClass.students.length }));
    } catch (e) {}
    showToast(`🎉 "${name}" sinfi yaratildi!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleSelectClassroom = (cls: TeacherClassroom | null) => {
    if (!cls) {
      setWorkspaceMode('solo');
      setActiveClassroomId(null);
      setCurrentClassroom({ id: 'solo', name: 'Yakkaxon Rejim', students: 0 });
      localStorage.setItem('teacheros_workspace_mode', 'solo');
      localStorage.removeItem('teacheros_classroom');
      loadHistoryForClassroom(null);
      try {
        const hwKey = getHomeworkStorageKey(currentUser, null);
        const savedHws = localStorage.getItem(hwKey);
        if (savedHws) {
          const parsed = JSON.parse(savedHws);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.data) {
            setGeneratedHomeworkData(parsed[0].data);
            setActiveHomeworkTopic(parsed[0].topic || null);
          } else {
            setGeneratedHomeworkData(null);
            setActiveHomeworkTopic(null);
          }
        } else {
          setGeneratedHomeworkData(null);
          setActiveHomeworkTopic(null);
        }
      } catch (e) {}
      showToast(appLanguage === 'en' ? "Switched to Solo Mode" : "Yakkaxon rejimga o'tildi");
    } else {
      setWorkspaceMode('classroom');
      setActiveClassroomId(cls.id);
      setCurrentClassroom({ id: cls.id, name: cls.name, students: cls.students.length });
      localStorage.setItem('teacheros_workspace_mode', 'classroom');
      localStorage.setItem('teacheros_classroom', JSON.stringify({ id: cls.id, name: cls.name, students: cls.students.length }));
      loadHistoryForClassroom(cls.id);
      try {
        const hwKey = getHomeworkStorageKey(currentUser, cls.id);
        const savedHws = localStorage.getItem(hwKey);
        if (savedHws) {
          const parsed = JSON.parse(savedHws);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.data) {
            setGeneratedHomeworkData(parsed[0].data);
            setActiveHomeworkTopic(parsed[0].topic || null);
          } else {
            setGeneratedHomeworkData(null);
            setActiveHomeworkTopic(null);
          }
        } else {
          setGeneratedHomeworkData(null);
          setActiveHomeworkTopic(null);
        }
      } catch (e) {}
      showToast(`"${cls.name}" sinfi faollashtirildi`);
    }
  };

  const handleAddStudentsToClassroom = (classroomId: string, usernames: string[]) => {
    const teacherUid = currentUser?.telegram_id || (currentUser as any)?.id || currentUser?.username || 'user';
    const updated = classrooms.map((c) => {
      if (c.id === classroomId) {
        const existing = new Set(c.students.map((s) => s.username.toLowerCase()));
        const newEntries = usernames
          .filter((u) => !existing.has(u.toLowerCase()))
          .map((u) => ({ username: u, addedAt: Date.now() }));
        return { ...c, students: [...c.students, ...newEntries] };
      }
      return c;
    });
    setClassrooms(updated);
    const active = updated.find((c) => c.id === classroomId);
    if (active && activeClassroomId === classroomId) {
      setCurrentClassroom({ id: active.id, name: active.name, students: active.students.length });
      localStorage.setItem('teacheros_classroom', JSON.stringify({ id: active.id, name: active.name, students: active.students.length }));
    }
    localStorage.setItem(`teacheros_classrooms_${teacherUid}`, JSON.stringify(updated));
    showToast(appLanguage === 'en' ? "Students added!" : "O'quvchilar qo'shildi!");
  };

  const handleDeleteClassroom = (classroomId: string) => {
    const teacherUid = currentUser?.telegram_id || (currentUser as any)?.id || currentUser?.username || 'user';
    const updated = classrooms.filter((c) => c.id !== classroomId);
    setClassrooms(updated);
    if (activeClassroomId === classroomId) {
      setWorkspaceMode('solo');
      setActiveClassroomId(null);
      setCurrentClassroom({ id: 'solo', name: 'Yakkaxon Rejim', students: 0 });
      localStorage.setItem('teacheros_workspace_mode', 'solo');
      localStorage.removeItem('teacheros_classroom');
    }
    localStorage.setItem(`teacheros_classrooms_${teacherUid}`, JSON.stringify(updated));
    showToast(appLanguage === 'en' ? "Classroom deleted" : "Sinfxona o'chirildi");
  };

  // Sync isolated history, classrooms, real Telegram avatar, and teacher display name when user logs in / switches accounts
  useEffect(() => {
    try {
      const teacherUid = currentUser?.telegram_id || (currentUser as any)?.id || currentUser?.username || 'user';
      // Load history for current active classroom (or solo)
      loadHistoryForClassroom(activeClassroomId);

      // Sync teacher display name
      const savedTeacherName = localStorage.getItem(`teacheros_teacher_name_${teacherUid}`);
      if (savedTeacherName) {
        setTeacherDisplayName(savedTeacherName);
      } else if (currentUser?.first_name) {
        setTeacherDisplayName(currentUser.first_name);
      }

      // Sync classrooms
      const savedClasses = localStorage.getItem(`teacheros_classrooms_${teacherUid}`);
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        if (Array.isArray(parsedClasses)) {
          setClassrooms(parsedClasses);
          const savedActiveCls = localStorage.getItem('teacheros_classroom');
          if (savedActiveCls) {
            const active = JSON.parse(savedActiveCls);
            const found = parsedClasses.find((c: TeacherClassroom) => c.id === active.id);
            if (found) {
              setActiveClassroomId(found.id);
              setCurrentClassroom({ id: found.id, name: found.name, students: found.students.length });
            }
          }
        }
      } else {
        setClassrooms([]);
      }

      // Sync real public Telegram user avatar if current avatar is fallback
      if (currentUser?.telegram_id) {
        const isFallback = !currentUser.avatar_url || currentUser.avatar_url.includes('dicebear.com');
        if (isFallback) {
          fetch(`/api/auth/telegram-session?action=get_avatar&userId=${currentUser.telegram_id}`)
            .then((r) => r.json())
            .then((resData) => {
              if (resData.success && resData.avatarUrl && !resData.avatarUrl.includes('dicebear.com')) {
                const updated = { ...currentUser, avatar_url: resData.avatarUrl };
                setCurrentUser(updated);
                localStorage.setItem('teacheros_auth_user', JSON.stringify(updated));
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      setLessonHistory([]);
    }
  }, [currentUser]);

  // Multimodal file upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<
    Array<{ name: string; type: string; preview: string; base64: string }>
  >([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            preview: file.type.startsWith("image/") ? result : "",
            base64: result.split(",")[1] || ""
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    showToast(`📎 ${files.length} ta fayl yuklandi`);
  };

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const cleanTopicTitle = (raw: string): string => {
    if (!raw) return "";
    let clean = raw.trim();
    // English & Uzbek conversational prefixes
    clean = clean.replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:could\s+you\s+)?(?:i\s+want\s+(?:you\s+)?to\s+)?(?:create|generate|make|build|design|write|produce|prepare|teach|explain|give\s+me|show\s+me)(?:\s+me)?(?:\s+(?:a|an))?(?:\s+(?:complete|interactive|detailed|quick|short|good|intensive|fun|engaging))?\s+(?:lesson|curriculum|class|presentation|slides?|guide|module|test|topic|explanation|dars)?(?:\s+(?:about|on|for|regarding|of|around|based\s+on))?\s+/i, "");
    clean = clean.replace(/^(?:create\s+a\s+lesson\s+based\s+on\s+(?:the\s+)?(?:topic\s+)?(?:of\s+)?(?:the\s+)?(?:images?|pictures?|photos?|files?|scans?|documents?|pdf))\s*/i, "");
    clean = clean.replace(/^(?:based\s+on\s+(?:the\s+)?(?:topic\s+)?(?:of\s+)?(?:the\s+)?(?:images?|pictures?|photos?|files?|scans?|documents?|pdf))\s*/i, "");
    clean = clean.replace(/^(?:iltimos\s+)?(?:menga\s+)?(?:bugun\s+)?dars\s+(?:tayyorla(?:b\s+ber)?|yarat|o't|tuz|qil|ber)(?:\s*[:\-])?\s*/i, "");
    clean = clean.replace(/^(?:bugun\s+)?(?:[a-z0-9\s\-]+?)\s+(?:mavzusini|mavzusi)\s+(?:o'tamiz|o'rganamiz|o'tmoqchiman)/i, "");
    clean = clean.replace(/^(?:mavzu|tema)\s*[:\-]\s*/i, "");
    // Trailing instructional specifications
    clean = clean.replace(/\s+(?:with\s+(?:practical\s+|real-life\s+|lots\s+of\s+)?(?:exercises?|examples?|activities|tasks|practice|situations?)).*$/i, "");
    clean = clean.replace(/\s+(?:focusing\s+on|including|covering|explaining)\s+.*$/i, "");
    clean = clean.replace(/\s+(?:for\s+(?:my\s+)?(?:students?|learners?|uzbek\s+students?|beginners?|intermediates?|[a-c][1-2](?:\s+level)?)).*$/i, "");
    clean = clean.replace(/\s+(?:haqida|to'g'risida|mavzusi(?:da)?|boyicha|bo'yicha)\s*(?:dars|slayd|taqdimot)?$/i, "");
    clean = clean.replace(/\s+(?:amaliy\s+mashqlar|misollar)\s+bilan.*$/i, "");
    clean = clean.replace(/\s+uchun.*$/i, "");
    clean = clean.replace(/[\.\?!,;:]+$/, "").trim();

    if (/^(?:the\s+)?(?:images?|pictures?|photos?|files?|scans?|documents?|pdf|textbook\s+lesson|topic|prompt)$/i.test(clean)) {
      return "";
    }

    if (clean.length > 0) {
      clean = clean
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
    return clean || raw;
  };

  // Dynamic Add Item & Feedback State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [wrongWordToken, setWrongWordToken] = useState<string | null>(null);

  // Whiteboard Display & Theme
  const [isBoardLight, setIsBoardLight] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Unified Continuous Screen Index
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  // Interactive Board Step Reveals & User Inputs
  const [boardStepReveal, setBoardStepReveal] = useState<number>(0);
  const [revealedQuickAnswers, setRevealedQuickAnswers] = useState<Record<string, boolean>>({});
  const [selectedQuickOptions, setSelectedQuickOptions] = useState<Record<string, string>>({});
  const [studentQuizAnswers, setStudentQuizAnswers] = useState<Record<number, string>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [dialogAnswers, setDialogAnswers] = useState<Record<string, string>>({});
  const [errorHuntFound, setErrorHuntFound] = useState<Record<string, boolean>>({});
  const [fillGapSelected, setFillGapSelected] = useState<Record<string, string>>({});

  // Studio UI Panels & Tools
  const [showLeftInspector, setShowLeftInspector] = useState(true);
  const [showAgentLog, setShowAgentLog] = useState(false);
  const [activeCanvasTool, setActiveCanvasTool] = useState<"select" | "frame" | "pen" | "pan">("select");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(true);
  const [slideVisualMode, setSlideVisualMode] = useState<Record<number, "theory" | "diagram">>({});
  const [slideImageSeeds, setSlideImageSeeds] = useState<Record<number, number>>({});
  const [vocabImageSeeds, setVocabImageSeeds] = useState<Record<number, number>>({});
  const [imageLoadedMap, setImageLoadedMap] = useState<Record<string, boolean>>({});
  const [vocabHintOpen, setVocabHintOpen] = useState<Record<number, boolean>>({});
  const [slideRevealActive, setSlideRevealActive] = useState<Record<number, boolean>>({});

  // Submission & Toast
  const [studentName, setStudentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Whiteboard Pen & Drawing Annotation State
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [penTool, setPenTool] = useState<DrawingTool>("pen");
  const [penColor, setPenColor] = useState<string>("#ef4444");
  const [penSize, setPenSize] = useState<number>(3);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [typedAnnotationText, setTypedAnnotationText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const pageDrawingsRef = useRef<Record<number, ImageData>>({});
  const shapeStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const shapeSnapshotRef = useRef<ImageData | null>(null);
  const prevScreenIndexRef = useRef<number>(0);

  // Load persistent user auth, workspace, and active lesson on mount (F5 persistence)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('teacheros_auth_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedMode = localStorage.getItem('teacheros_workspace_mode') as 'classroom' | 'solo' | null;
      if (savedMode) setWorkspaceMode(savedMode);
      const savedClass = localStorage.getItem('teacheros_classroom');
      if (savedClass) setCurrentClassroom(JSON.parse(savedClass));

      // Restore Studio Mode & Homework state across F5
      const savedStudioMode = localStorage.getItem('teacheros_studio_mode') as any;
      if (savedStudioMode && ['lesson', 'homework', 'group_quiz', 'level_check', 'others_picker'].includes(savedStudioMode)) {
        setStudioMode(savedStudioMode);
      }
      const savedHwTopic = localStorage.getItem('teacheros_active_hw_topic');
      if (savedHwTopic) setActiveHomeworkTopic(savedHwTopic);
      const savedHwStep = localStorage.getItem('teacheros_hw_step') as any;
      if (savedHwStep && ['prompt', 'config', 'review'].includes(savedHwStep)) {
        setHomeworkStep(savedHwStep);
      }
      const savedHwData = localStorage.getItem('teacheros_generated_hw');
      if (savedHwData) {
        try {
          const parsedHw = JSON.parse(savedHwData);
          if (parsedHw) setGeneratedHomeworkData(parsedHw);
        } catch (e) {}
      }
      const savedHwIntensity = localStorage.getItem('teacheros_hw_intensity') as any;
      if (savedHwIntensity) setHomeworkIntensity(savedHwIntensity);

      const savedCurriculum = localStorage.getItem('teacheros_active_curriculum');
      const savedScreen = localStorage.getItem('teacheros_active_screen_index');
      if (savedCurriculum) {
        const parsed = JSON.parse(savedCurriculum);
        if (parsed && parsed.slides && parsed.slides.length > 0) {
          setCurriculum(parsed);
          if (savedScreen) {
            const idx = parseInt(savedScreen, 10);
            if (!isNaN(idx)) {
              setCurrentScreenIndex(idx);
              prevScreenIndexRef.current = idx;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading saved session', e);
    } finally {
      setIsAuthLoading(false);
      isInitialMountRef.current = false;
    }
  }, []);

  // F5 Refresh Persistence: Sync active curriculum, screen index, studio mode & homework
  useEffect(() => {
    if (isInitialMountRef.current) return;
    try {
      localStorage.setItem('teacheros_studio_mode', studioMode);
      if (activeHomeworkTopic) {
        localStorage.setItem('teacheros_active_hw_topic', activeHomeworkTopic);
      } else {
        localStorage.removeItem('teacheros_active_hw_topic');
      }
      localStorage.setItem('teacheros_hw_step', homeworkStep);
      if (generatedHomeworkData) {
        localStorage.setItem('teacheros_generated_hw', JSON.stringify(generatedHomeworkData));
      } else {
        localStorage.removeItem('teacheros_generated_hw');
      }
      localStorage.setItem('teacheros_hw_intensity', homeworkIntensity);

      if (curriculum) {
        localStorage.setItem('teacheros_active_curriculum', JSON.stringify(curriculum));
        localStorage.setItem('teacheros_active_screen_index', String(currentScreenIndex));
      } else {
        localStorage.removeItem('teacheros_active_curriculum');
        localStorage.removeItem('teacheros_active_screen_index');
      }
    } catch (e) {}
  }, [curriculum, currentScreenIndex, studioMode, activeHomeworkTopic, homeworkStep, generatedHomeworkData, homeworkIntensity]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Per-screen drawing persistence: save previous screen's drawing and restore new screen's drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevIdx = prevScreenIndexRef.current;
    if (prevIdx !== currentScreenIndex && canvas.width > 0 && canvas.height > 0) {
      try {
        const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pageDrawingsRef.current[prevIdx] = currentData;
      } catch (e) {}
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];

    const saved = pageDrawingsRef.current[currentScreenIndex];
    if (saved) {
      try {
        ctx.putImageData(saved, 0, 0);
      } catch (e) {}
    }

    prevScreenIndexRef.current = currentScreenIndex;
  }, [currentScreenIndex]);

  // Resize canvas cleanly and preserve drawing when window resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext("2d");
      let tempImage: ImageData | null = null;
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        try {
          tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {}
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const saved = pageDrawingsRef.current[currentScreenIndex] || tempImage;
        if (saved) {
          try {
            ctx.putImageData(saved, 0, 0);
          } catch (e) {}
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [isFullscreen, isAnnotating, currentScreenIndex]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStackRef.current.push(imgData);
      if (undoStackRef.current.length > 25) {
        undoStackRef.current.shift();
      }
    } catch (e) {}
  };

  const drawShapeOnCanvas = (
    ctx: CanvasRenderingContext2D,
    tool: DrawingTool,
    start: { x: number; y: number },
    end: { x: number; y: number },
    color: string,
    size: number
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
    ctx.fillStyle = color + "33";
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "rectangle") {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();
    } else if (tool === "circle") {
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = Math.min(start.x, end.x) + rx;
      const cy = Math.min(start.y, end.y) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (tool === "triangle") {
      const topX = (start.x + end.x) / 2;
      const topY = Math.min(start.y, end.y);
      const bottomY = Math.max(start.y, end.y);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(start.x, bottomY);
      ctx.lineTo(end.x, bottomY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (tool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = Math.max(12, size * 3.5);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle - Math.PI / 6),
        end.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle + Math.PI / 6),
        end.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAnnotating) return;
    const { x, y } = getCanvasCoords(e);

    if (penTool === "text") {
      setTextInputPos({ x, y });
      setTypedAnnotationText("");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveCanvasState();
    isDrawingRef.current = true;

    const isShape = ["rectangle", "circle", "triangle", "line", "arrow"].includes(penTool);
    if (isShape) {
      shapeStartPosRef.current = { x, y };
      try {
        shapeSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {}
    } else {
      shapeStartPosRef.current = null;
      shapeSnapshotRef.current = null;
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (penTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = penSize * 4;
      } else if (penTool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = penColor + "66";
        ctx.lineWidth = penSize * 4;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
      }
    }
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    const isShape = ["rectangle", "circle", "triangle", "line", "arrow"].includes(penTool);
    if (isShape && shapeStartPosRef.current && shapeSnapshotRef.current) {
      ctx.putImageData(shapeSnapshotRef.current, 0, 0);
      drawShapeOnCanvas(ctx, penTool, shapeStartPosRef.current, { x, y }, penColor, penSize);
    } else if (!isShape) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleEndDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    shapeStartPosRef.current = null;
    shapeSnapshotRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || undoStackRef.current.length === 0) return;
    const previousState = undoStackRef.current.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveCanvasState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    delete pageDrawingsRef.current[currentScreenIndex];
  };

  const handleAddTextAnnotation = () => {
    if (!textInputPos || !typedAnnotationText.trim()) {
      setTextInputPos(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveCanvasState();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = penColor;
    ctx.font = `bold ${Math.max(16, penSize * 5)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(typedAnnotationText.trim(), textInputPos.x, textInputPos.y);

    setTextInputPos(null);
    setTypedAnnotationText("");
  };

  // Blank Board canvas resize & state restoration
  useEffect(() => {
    if (!isBlankBoardOpen) return;
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (blankDrawingDataRef.current) {
        try {
          ctx.putImageData(blankDrawingDataRef.current, 0, 0);
        } catch (e) {}
      }
    }
  }, [isBlankBoardOpen]);

  const saveBlankCanvas = () => {
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width <= 0 || canvas.height <= 0) return;
    try {
      blankDrawingDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {}
  };

  const getBlankCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = blankCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const saveBlankState = () => {
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      blankUndoStackRef.current.push(imgData);
      if (blankUndoStackRef.current.length > 25) {
        blankUndoStackRef.current.shift();
      }
    } catch (e) {}
  };

  const handleBlankStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getBlankCanvasCoords(e);
    if (blankPenTool === "text") {
      setBlankTextInputPos({ x, y });
      setBlankTypedText("");
      return;
    }

    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveBlankState();
    isBlankDrawingRef.current = true;

    const isShape = ["rectangle", "circle", "triangle", "line", "arrow"].includes(blankPenTool);
    if (isShape) {
      blankShapeStartPosRef.current = { x, y };
      try {
        blankShapeSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {}
    } else {
      blankShapeStartPosRef.current = null;
      blankShapeSnapshotRef.current = null;
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (blankPenTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = blankPenSize * 4;
      } else if (blankPenTool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = blankPenColor + "66";
        ctx.lineWidth = blankPenSize * 4;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = blankPenColor;
        ctx.lineWidth = blankPenSize;
      }
    }
  };

  const handleBlankDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isBlankDrawingRef.current) return;
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getBlankCanvasCoords(e);
    const isShape = ["rectangle", "circle", "triangle", "line", "arrow"].includes(blankPenTool);
    if (isShape && blankShapeStartPosRef.current && blankShapeSnapshotRef.current) {
      ctx.putImageData(blankShapeSnapshotRef.current, 0, 0);
      drawShapeOnCanvas(ctx, blankPenTool, blankShapeStartPosRef.current, { x, y }, blankPenColor, blankPenSize);
    } else if (!isShape) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleBlankEndDraw = () => {
    if (!isBlankDrawingRef.current) return;
    isBlankDrawingRef.current = false;
    blankShapeStartPosRef.current = null;
    blankShapeSnapshotRef.current = null;
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
    saveBlankCanvas();
  };

  const handleBlankUndo = () => {
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || blankUndoStackRef.current.length === 0) return;
    const previousState = blankUndoStackRef.current.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      saveBlankCanvas();
    }
  };

  const handleBlankClear = () => {
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveBlankState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blankDrawingDataRef.current = null;
  };

  const handleBlankAddText = () => {
    if (!blankTextInputPos || !blankTypedText.trim()) {
      setBlankTextInputPos(null);
      return;
    }
    const canvas = blankCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveBlankState();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = blankPenColor;
    ctx.font = `bold ${Math.max(16, blankPenSize * 5)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(blankTypedText.trim(), blankTextInputPos.x, blankTextInputPos.y);

    setBlankTextInputPos(null);
    setBlankTypedText("");
    saveBlankCanvas();
  };

  // URL Hash zero-DB loading
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#c=")) {
        const encoded = hash.substring(3);
        const decoded = decompressCurriculumFromHash(encoded);
        if (decoded) {
          const enriched = enrichCurriculumWithSections(decoded, decoded.length || "medium");
          setCurriculum(enriched);
          setTopicInput(enriched.topic);
          setLevel(enriched.level);
          if (enriched.length) setLessonLength(enriched.length);
          showToast(`✨ Darslik yuklandi: ${enriched.topic}`);
        }
      }
    }
  }, []);

  // Audio Speech Synthesis
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }
  };

  // Smartboard Handwriting Prompt Canvas Setup & Handlers
  useEffect(() => {
    if (!isHandwritingPromptOpen) return;
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, [isHandwritingPromptOpen]);

  const getHandwritingCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const saveHandwritingState = () => {
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      handwritingUndoStackRef.current.push(imgData);
      if (handwritingUndoStackRef.current.length > 20) {
        handwritingUndoStackRef.current.shift();
      }
    } catch (e) {}
  };

  const handleHandwritingStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getHandwritingCoords(e);
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveHandwritingState();
    isHandwritingDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (handwritingTool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = handwritingPenSize * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = handwritingPenColor;
      ctx.lineWidth = handwritingPenSize;
    }
  };

  const handleHandwritingDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isHandwritingDrawingRef.current) return;
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getHandwritingCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleHandwritingEndDraw = () => {
    if (!isHandwritingDrawingRef.current) return;
    isHandwritingDrawingRef.current = false;
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
  };

  const handleHandwritingUndo = () => {
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || handwritingUndoStackRef.current.length === 0) return;
    const previousState = handwritingUndoStackRef.current.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
  };

  const handleHandwritingClear = () => {
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveHandwritingState();
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleHandwritingGenerate = async () => {
    const canvas = handwritingCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) {
      showToast("Doskaga mavzuni yozing...");
      return;
    }
    const handwritingFile = {
      name: "handwriting-prompt.png",
      type: "image/png",
      preview: dataUrl,
      base64: base64Data
    };
    setIsHandwritingPromptOpen(false);
    showToast("✍️ Doska qo'lyozmasi skanerlanmoqda va dars yaratilmoqda...");
    await handleGenerate(topicInput || "Handwritten Smartboard Topic", lessonLength, [handwritingFile]);
  };

  // Continuous Speech-to-text recording (Wispr Flow style with Waveform & 6s silence timer)
  const handleVoiceRecord = () => {
    if (isRecording) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      setIsRecording(false);
      setRecordedInterimText("");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ovoz bilan yozish ushbu brauzerda qo'llab-quvvatlanmaydi (Chrome yoki Edge tavsiya etiladi).");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    baseTopicRef.current = topicInput;

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
        setIsRecording(false);
        setRecordedInterimText("");
      }, 6000);
    };

    recognition.onresult = (event: any) => {
      resetSilenceTimer();
      let interim = "";
      let finalSpeech = "";

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalSpeech += item[0].transcript + " ";
        } else {
          interim += item[0].transcript;
        }
      }

      setRecordedInterimText(interim);

      const combined = (baseTopicRef.current + " " + finalSpeech).trim();
      setTopicInput(combined);
    };

    recognition.onerror = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
      setRecordedInterimText("");
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
      setRecordedInterimText("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
      resetSilenceTimer();
    } catch (e) {
      console.warn("Speech recognition start error", e);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (boardRef.current) {
        boardRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Assemble continuous screens across all sections
  const { screens, categories } = useMemo(() => {
    if (!curriculum) return { screens: [], categories: [] };

    const scr: BoardScreen[] = [];
    const cats: Array<{
      key: string;
      title: string;
      icon: any;
      startIndex: number;
      count: number;
      badge: string;
    }> = [];

    // 1. Interactive Board Slides
    if (curriculum.slides && curriculum.slides.length > 0) {
      const start = scr.length;
      curriculum.slides.forEach((sl, idx) => {
        scr.push({ type: "slide", subIndex: idx, total: curriculum.slides.length, data: sl });
      });
      cats.push({
        key: "slides",
        title: "Doska",
        icon: Sparkles,
        startIndex: start,
        count: curriculum.slides.length,
        badge: `${curriculum.slides.length} slayd`
      });
    }

    // 2. Quick Questions
    if (curriculum.quickQuestions && curriculum.quickQuestions.length > 0) {
      const start = scr.length;
      curriculum.quickQuestions.forEach((qq, idx) => {
        scr.push({ type: "quickQuestion", subIndex: idx, total: curriculum.quickQuestions!.length, data: qq });
      });
      cats.push({
        key: "quickQuestions",
        title: "Tezkor Savollar",
        icon: Zap,
        startIndex: start,
        count: curriculum.quickQuestions.length,
        badge: `${curriculum.quickQuestions.length} savol`
      });
    }

    // 3. Actual Tests
    if (curriculum.quiz && curriculum.quiz.length > 0) {
      const start = scr.length;
      curriculum.quiz.forEach((qz, idx) => {
        scr.push({ type: "test", subIndex: idx, total: curriculum.quiz.length, data: qz });
      });
      cats.push({
        key: "tests",
        title: "Asosiy Testlar",
        icon: Target,
        startIndex: start,
        count: curriculum.quiz.length,
        badge: `${curriculum.quiz.length} test`
      });
    }

    // 4. Vocab
    if (curriculum.flashcards && curriculum.flashcards.length > 0) {
      const start = scr.length;
      curriculum.flashcards.forEach((fc, idx) => {
        scr.push({ type: "vocab", subIndex: idx, total: curriculum.flashcards.length, data: fc });
      });
      cats.push({
        key: "vocab",
        title: "Kalit So'zlar",
        icon: BookOpen,
        startIndex: start,
        count: curriculum.flashcards.length,
        badge: `${curriculum.flashcards.length} kalit so'z`
      });
    }

    // 5. Dialog Builder (Medium & Long)
    if (curriculum.dialog && curriculum.dialog.length > 0) {
      const start = scr.length;
      curriculum.dialog.forEach((dg, idx) => {
        scr.push({ type: "dialog", subIndex: idx, total: curriculum.dialog!.length, data: dg });
      });
      cats.push({
        key: "dialog",
        title: "Muloqot",
        icon: MessageSquare,
        startIndex: start,
        count: curriculum.dialog.length,
        badge: `${curriculum.dialog.length} bosqich`
      });
    }

    // 6. Error Hunt (Medium & Long)
    if (curriculum.errorHunt && curriculum.errorHunt.length > 0) {
      const start = scr.length;
      curriculum.errorHunt.forEach((eh, idx) => {
        scr.push({ type: "errorHunt", subIndex: idx, total: curriculum.errorHunt!.length, data: eh });
      });
      cats.push({
        key: "errorHunt",
        title: "Xato Ovchisi",
        icon: Search,
        startIndex: start,
        count: curriculum.errorHunt.length,
        badge: `${curriculum.errorHunt.length} gap`
      });
    }

    // 7. Fill the Gap (Long)
    if (curriculum.fillGap && curriculum.fillGap.length > 0) {
      const start = scr.length;
      curriculum.fillGap.forEach((fg, idx) => {
        scr.push({ type: "fillGap", subIndex: idx, total: curriculum.fillGap!.length, data: fg });
      });
      cats.push({
        key: "fillGap",
        title: "Bo'shliq To'ldirish",
        icon: Edit3,
        startIndex: start,
        count: curriculum.fillGap.length,
        badge: `${curriculum.fillGap.length} mashq`
      });
    }

    // 8. Summary Card (Long)
    if (curriculum.summary) {
      const start = scr.length;
      scr.push({
        type: "summary",
        subIndex: 0,
        total: 1,
        data: curriculum.summary
      });
      cats.push({
        key: "summary",
        title: "Xulosa & Qoidalar",
        icon: Trophy,
        startIndex: start,
        count: 1,
        badge: "Oltin Qoidalar"
      });
    }

    return { screens: scr, categories: cats };
  }, [curriculum]);

  const totalScreens = screens.length;
  const activeScreen = screens[currentScreenIndex] || null;

  // Active category determination
  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return (
      categories.find(
        (c) => currentScreenIndex >= c.startIndex && currentScreenIndex < c.startIndex + c.count
      ) || categories[0]
    );
  }, [categories, currentScreenIndex]);

  // Keyboard navigation & Fullscreen Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!curriculum || totalScreens === 0) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        setCurrentScreenIndex((prev) => Math.min(totalScreens - 1, prev + 1));
        setBoardStepReveal(0);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setCurrentScreenIndex((prev) => Math.max(0, prev - 1));
        setBoardStepReveal(0);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [curriculum, isFullscreen, totalScreens]);

  // Live Homework Synthesis (Multi-Level Intensity & 10 Modular Exercise Engines)
  const handleGenerateHomework = async () => {
    if (selectedHomeworkTypes.length === 0) return;
    setIsGeneratingHomework(true);
    const activeTopic = topicInput.trim() || "Present Perfect Continuous";
    try {
      const res = await fetch("/api/generate-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTopic,
          intensity: homeworkIntensity,
          selectedTypes: selectedHomeworkTypes,
          lang: appLanguage
        })
      });
      if (res.ok) {
        const data = await res.json();
        const hwPayload = data.homework || data;
        setGeneratedHomeworkData(hwPayload);
        // Persist homework permanently scoped to the active classroom forever
        try {
          const hwKey = getHomeworkStorageKey(currentUser, activeClassroomId);
          const existingListRaw = localStorage.getItem(hwKey);
          const existingList = existingListRaw ? JSON.parse(existingListRaw) : [];
          const newEntry = {
            id: `hw_${Date.now()}`,
            topic: activeTopic,
            classroomId: activeClassroomId || 'solo',
            classroomName: workspaceMode === 'classroom' ? currentClassroom.name : 'Yakkaxon Rejim',
            createdAt: Date.now(),
            data: hwPayload
          };
          const updatedList = [newEntry, ...(Array.isArray(existingList) ? existingList : [])].slice(0, 30);
          localStorage.setItem(hwKey, JSON.stringify(updatedList));
        } catch (e) {
          console.warn("Failed saving classroom homework:", e);
        }
      }
    } catch (err) {
      console.error("Homework generation error:", err);
    } finally {
      setIsGeneratingHomework(false);
      setActiveHomeworkTopic(activeTopic);
      setHomeworkStep('review');
    }
  };

  // Live AI Generation (Instant Preset Matching + Gemini Fast Cascade)
  const handleGenerate = async (
    customTopic?: string,
    customLength?: LessonLength,
    customFiles?: Array<{ name: string; type: string; preview: string; base64: string }>
  ) => {
    const rawQuery = (customTopic || topicInput).trim();
    const lengthToUse = customLength || lessonLength;
    let filesToUse = customFiles || attachedFiles;

    // Auto-capture smartboard handwriting if open and drawn upon
    if (isHandwritingPromptOpen && handwritingCanvasRef.current && handwritingUndoStackRef.current.length > 0 && (!customFiles || customFiles.length === 0)) {
      try {
        const dataUrl = handwritingCanvasRef.current.toDataURL("image/png");
        const base64Data = dataUrl.split(",")[1];
        if (base64Data) {
          filesToUse = [{
            name: "handwriting-prompt.png",
            type: "image/png",
            preview: dataUrl,
            base64: base64Data
          }];
          setIsHandwritingPromptOpen(false);
          showToast("✍️ Doska qo'lyozmasi skanerlanmoqda...");
        }
      } catch (e) {}
    }

    if (!rawQuery && filesToUse.length === 0) {
      showToast("Iltimos, dars mavzusini yozing yoki rasm yuklang...");
      return;
    }

    const query = cleanTopicTitle(rawQuery) || rawQuery || (filesToUse.length > 0 ? "Textbook Lesson" : "");

    setIsAnimatingUp(true);
    // Smooth CapCut slide-up transition: capsule shrinks and glides toward the top bar
    await new Promise((resolve) => setTimeout(resolve, 360));

    setIsGenerating(true);
    setIsAnimatingUp(false);
    setGenerationStage(1);
    setGenerationStep("⚡ [1/4] Google Gemini dvigateliga ulanmoqda...");
    setCurrentScreenIndex(0);
    setBoardStepReveal(0);
    setRevealedQuickAnswers({});
    setSelectedQuickOptions({});
    setStudentQuizAnswers({});
    setFlippedCards({});
    setDialogAnswers({});
    setErrorHuntFound({});
    setFillGapSelected({});
    setSubmitSuccess(false);

    // Call live Gemini AI engine (90s timeout matching full HTML architecture)
    let stepInterval: NodeJS.Timeout | null = null;
    try {
      const steps = appLanguage === 'en' ? [
        "⚡ [1/4] Connecting to Google Gemini AI engine...",
        `🔍 [2/4] Analyzing pedagogical structure of "${query}" (${level})...`,
        "🎨 [3/4] Architecting interactive whiteboard and visual models...",
        "💡 [4/4] Assembling flashcards, practice quizzes, and error hunter..."
      ] : appLanguage === 'ru' ? [
        "⚡ [1/4] Подключение к движку Google Gemini AI...",
        `🔍 [2/4] Анализ педагогической структуры "${query}" (${level})...`,
        "🎨 [3/4] Проектирование интерактивной доски и визуальных моделей...",
        "💡 [4/4] Сборка флешкарт, тестов и охотника за ошибками..."
      ] : [
        "⚡ [1/4] Google Gemini dvigateliga ulanmoqda...",
        `🔍 [2/4] "${query}" (${level}) pedagogik tuzilmasi tahlil qilinmoqda...`,
        "🎨 [3/4] Interaktiv gap anatomiyasi va vizual modellar loyihalanmoqda...",
        "💡 [4/4] 3D Fleshkartalar, testlar va xato ovchisi jamlanmoqda..."
      ];
      let stepIdx = 0;
      setGenerationStage(1);
      setGenerationStep(steps[0]);
      stepInterval = setInterval(() => {
        stepIdx = stepIdx + 1;
        if (stepIdx < 4) {
          setGenerationStage(stepIdx + 1);
        }
        setGenerationStep(steps[stepIdx % steps.length]);
      }, 2200);

      const clientCtrl = new AbortController();
      const clientTimeout = setTimeout(() => clientCtrl.abort(), 90000);

      const res = await fetch("/api/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: clientCtrl.signal,
        body: JSON.stringify({
          topic: query,
          rawPrompt: rawQuery,
          level,
          length: lengthToUse,
          files: filesToUse,
          lang: appLanguage
        })
      });

      clearTimeout(clientTimeout);

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.curriculum) {
          data.curriculum.topic = cleanTopicTitle(data.curriculum.topic || query);
          const enriched = enrichCurriculumWithSections(data.curriculum, lengthToUse);
          setCurriculum(enriched);
          setCurrentScreenIndex(0);
          prevScreenIndexRef.current = 0;
          addLessonToHistory(data.curriculum.topic, enriched);
          const modelTag = data.modelUsed ? ` (${data.modelUsed})` : "";
          showToast(appLanguage === 'en' ? `✨ Google Gemini AI generated the complete lesson!${modelTag}` : appLanguage === 'ru' ? `✨ Google Gemini AI полностью создал урок!${modelTag}` : `✨ Google Gemini AI darslikni to'liq yaratdi!${modelTag}`);
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
          if (stepInterval) clearInterval(stepInterval);
          setIsGenerating(false);
          return;
        }
      }

      // Offline / Synthesized Fallback if API returned non-ok
      console.warn("Gemini API returned non-ok, generating enriched curriculum...");
      const cleanTitle = cleanTopicTitle(query) || "English Lesson";
      const norm = cleanTitle.toLowerCase();
      let matched: Curriculum | null = null;
      if (norm.includes("past") || norm.includes("irregular")) matched = MASTER_CURRICULUMS.past_simple_a1;
      else if (norm.includes("stative") || norm.includes("need")) matched = MASTER_CURRICULUMS.stative_verbs_a1;
      else if (norm.includes("timetable") || norm.includes("schedule") || norm.includes("future")) matched = MASTER_CURRICULUMS.present_simple_future_b1;
      else if (norm.includes("have got") || norm.includes("have")) matched = MASTER_CURRICULUMS.have_vs_have_got_b1;
      else if (norm.includes("used to") || norm.includes("would")) matched = MASTER_CURRICULUMS.used_to_vs_would_b1;
      else if (norm.includes("will") || norm.includes("going to")) matched = MASTER_CURRICULUMS.will_vs_going_to;

      if (!matched) {
        const isTenseTopic = norm.includes("past") || norm.includes("future") || norm.includes("perfect") || norm.includes("tense") || norm.includes("continuous") || norm.includes("present simple");
        const isArticleTopic = norm.includes("article") || norm.includes("a/an") || norm.includes("the");
        const isVocab = norm.includes("noun") || norm.includes("countable") || norm.includes("uncountable") || isArticleTopic;

        matched = {
          id: `gen_${Date.now()}`,
          topic: cleanTitle,
          level,
          category: "Grammar & Communication",
          description: `${cleanTitle} bo'yicha interaktiv vizual darslik paketi (${lengthToUse} format).`,
          slides: [
            {
              id: "s1",
              tag: "MOHIYAT",
              title: `${cleanTitle} — Asosiy Tushuncha`,
              body: isArticleTopic
                ? `<p class="font-bold text-slate-300"><b>${cleanTitle}</b> — ingliz tilida otlarning qaysi biri haqida gap ketayotganini aniq ko'rsatuvchi muhim vosita.</p><br>• <b>'A'</b> — undosh tovushdan boshlangan so'zlar oldidan (a book, a car)<br>• <b>'An'</b> — unli tovushdan boshlangan so'zlar oldidan (an apple, an hour)<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>Oltin qoida:</b> Harfga emas, balki TOVUSHGA e'tibor bering! 'an hour' (h aytilmaydi), 'a university' (yu tovushi).</div>`
                : `<p class="font-bold text-slate-300">Ushbu darsda <b>${cleanTitle}</b> mavzusining amaliy qo'llanishi va qoidalarini ko'rib chiqamiz.</p>`,
              imagePrompt: `minimalist educational illustration of ${cleanTitle} concept`,
              ...(isTenseTopic ? {
                visual: {
                  type: "timeline",
                  title: `${cleanTitle} Vaqt Chizig'i`,
                  subtitle: "Vaqt o'qidagi ifodalanishi va konteksti",
                  data: {
                    events: [
                      { label: "O'TMISH", icon: "📍", tense: query, example: `Learning ${query} in context.`, desc: "Nazariy asos va misollar" },
                      { label: "HOZIR", icon: "⏱️", tense: "Amaliyot", example: "Active usage in speech.", desc: "Jonli muloqotda qo'llash" },
                      { label: "KELAJAK", icon: "🚀", tense: "Erkinlik", example: "Mastery achieved.", desc: "Avtomatik to'g'ri so'zlashuv" }
                    ]
                  }
                }
              } : isArticleTopic ? {
                visual: {
                  type: "comparison",
                  title: "'A' va 'An' Taqqoslash",
                  data: {
                    categories: [
                      { title: "A + Undosh Tovush", items: ["a car", "a pen", "a university", "a European country"] },
                      { title: "An + Unli Tovush", items: ["an apple", "an egg", "an hour", "an honest person"] }
                    ]
                  }
                }
              } : {})
            },
            {
              id: "s2",
              tag: isVocab ? "QOIDALAR" : "FORMULA",
              title: isArticleTopic ? "Tovush Qoidasi & Maxsus Holatlar" : "Struktura & Inkor/So'roq Qoidasi",
              body: isArticleTopic
                ? `• <b>Sanaladigan birlik otlar:</b> Noaniq narsa haqida birinchi bor gapirganda 'a/an' shart: <i>'I have a question.'</i><br>• <b>Sanalmaydigan va ko'plik otlar:</b> 'a/an' HECH QACHON ishlatilmaydi: <i>'I need water'</i> (a water emas!).<br><div style='margin-top:10px; padding:10px 14px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:6px; font-size:0.9rem;'>⚠️ <b>Xato tuzoq:</b> 'an advice' yoki 'an information' deb bo'lmaydi!</div>`
                : `<p class="font-bold text-slate-300">Qoidaga muvofiq gap tuzilishi va yordamchi so'zlarning to'g'ri joylashuvi.</p>`,
              imagePrompt: `educational illustration of sentence structure for ${query}`,
              ...(isTenseTopic ? {
                visual: {
                  type: "formula",
                  title: `${query} Formulalar Matritsasi`,
                  data: {
                    positive: [
                      { role: "subject", label: "Ega", value: "Subject" },
                      { role: "verb", label: "Asosiy Fe'l", value: "Verb Structure" },
                      { role: "object", label: "To'ldiruvchi", value: "Object" }
                    ],
                    negative: [
                      { role: "subject", label: "Ega", value: "Subject" },
                      { role: "verb", label: "Inkor", value: "Auxiliary + NOT + Verb" },
                      { role: "object", label: "To'ldiruvchi", value: "Object" }
                    ]
                  }
                }
              } : {})
            }
          ],
          flashcards: isArticleTopic ? [
            { word: "article", pos: "noun", uz: "artikl", ex: "English has definite and indefinite articles." },
            { word: "vowel sound", pos: "noun", uz: "unli tovush", ex: "Use 'an' before a vowel sound." },
            { word: "consonant sound", pos: "noun", uz: "undosh tovush", ex: "Use 'a' before a consonant sound." },
            { word: "countable", pos: "adj", uz: "sanaladigan", ex: "'Book' is a countable noun." },
            { word: "indefinite", pos: "adj", uz: "noaniq", ex: "'A' and 'an' are indefinite articles." }
          ] : [
            { word: "practice", pos: "verb", uz: "mashq qilmoq", ex: "Practice every single day." },
            { word: "accuracy", pos: "noun", uz: "aniqlik", ex: "Grammar accuracy matters." },
            { word: "fluency", pos: "noun", uz: "ravonlik", ex: "Speak with high fluency." }
          ],
          quiz: isArticleTopic ? [
            { q: "She has ______ university degree.", opts: ["a", "an", "the", "-"], ans: "a", expl: "'University' so'zi 'yu' (undosh) tovushi bilan boshlanadi, shuning uchun 'a' bo'ladi." },
            { q: "We waited for ______ hour.", opts: ["an", "a", "the", "-"], ans: "an", expl: "'Hour' so'zida 'h' aytilmaydi, unli tovush bilan boshlanadi ('our'), shuning uchun 'an'." }
          ] : [
            { q: `What is the key rule for ${query}?`, opts: ["Correct Form", "Trap Option 1", "Trap Option 2", "Trap Option 3"], ans: "Correct Form", expl: "CEFR qoidasiga ko'ra to'g'ri shakl tanlanishi lozim." }
          ],
          homework: []
        };
      }

      const enriched = enrichCurriculumWithSections(matched, lengthToUse);
      setCurriculum(enriched);
      setCurrentScreenIndex(0);
      prevScreenIndexRef.current = 0;
      addLessonToHistory(enriched.topic, enriched);
      showToast("💡 Darslik tayyorlandi.");
    } catch (err: any) {
      console.warn("Fetch failed, generating robust fallback curriculum:", err);
      // Fallback: Always generate so teacher is NEVER left with an error!
      const norm = query.toLowerCase();
      const isTenseTopic = norm.includes("past") || norm.includes("future") || norm.includes("perfect") || norm.includes("tense") || norm.includes("continuous") || norm.includes("present simple");
      const isArticleTopic = norm.includes("article") || norm.includes("a/an") || norm.includes("the");
      const isVocab = norm.includes("noun") || norm.includes("countable") || norm.includes("uncountable") || isArticleTopic;

      const fallbackCurriculum = enrichCurriculumWithSections({
        id: `gen_${Date.now()}`,
        topic: query,
        level,
        length: lengthToUse,
        category: "Grammar & Communication",
        description: `${query} bo'yicha interaktiv darslik (${lengthToUse} format).`,
        slides: [
          {
            id: "s1",
            tag: "MOHIYAT",
            title: `${query} — Asosiy Tushuncha`,
            body: isArticleTopic
              ? `<p class="font-bold text-slate-300"><b>${query}</b> — otlarning qaysi biri haqida gap ketayotganini aniq ko'rsatuvchi muhim grammatik vosita.</p><br>• <b>'A'</b> — undosh tovush bilan boshlangan birlik otlar (a book, a doctor)<br>• <b>'An'</b> — unli tovush bilan boshlangan birlik otlar (an umbrella, an idea)<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>Oltin qoida:</b> Talaffuzdagi TOVUSHGA e'tibor bering!</div>`
              : `<p class="font-bold text-slate-300">Ushbu darsda <b>${query}</b> mavzusining amaliy qo'llanishi va qoidalarini ko'rib chiqamiz.</p>`,
            imagePrompt: `minimalist educational illustration of ${query} concept`,
            ...(isTenseTopic ? {
              visual: {
                type: "timeline",
                title: `${query} Qoidalar Tizimi`,
                subtitle: "Mavzuning amaliy qo'llanish doirasi",
                data: {
                  events: [
                    { label: "BOSHLANISH", icon: "📍", tense: "Asosiy Qoida", example: `Learning ${query}`, desc: "Boshlang'ich tushuncha" },
                    { label: "AMALIYOT", icon: "⏱️", tense: "Jonli Nutq", example: `Using ${query} in speech`, desc: "Amaliy qo'llash" },
                    { label: "MUSTAHKAMLASH", icon: "🚀", tense: "Natija", example: `Mastering ${query}`, desc: "Xatosiz so'zlashuv" }
                  ]
                }
              }
            } : isArticleTopic ? {
              visual: {
                type: "comparison",
                title: "'A' va 'An' Taqqoslash",
                data: {
                  categories: [
                    { title: "A + Undosh Tovush", items: ["a car", "a table", "a university"] },
                    { title: "An + Unli Tovush", items: ["an orange", "an apple", "an hour"] }
                  ]
                }
              }
            } : {})
          },
          {
            id: "s2",
            tag: isVocab ? "QOIDALAR" : "FORMULA",
            title: isArticleTopic ? "Qo'llash Cheklovlari & Tuzoqlar" : "Struktura & Inkor/So'roq Qoidasi",
            body: isArticleTopic
              ? `• <b>Birlik sanaladigan otlar:</b> Noaniq narsa haqida aytganda 'a/an' shart: <i>'I bought a car.'</i><br>• <b>Sanalmaydigan otlar:</b> 'a/an' ishlatilmaydi: <i>'I need water'</i>.<br><div style='margin-top:10px; padding:10px 14px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:6px; font-size:0.9rem;'>⚠️ <b>Qopqon:</b> 'an advice' yoki 'a money' deb bo'lmaydi!</div>`
              : `<p class="font-bold text-slate-300">Gap tuzilishi va to'g'ri so'z tartibi.</p>`,
            imagePrompt: `educational illustration of sentence structure for ${query}`,
            ...(isTenseTopic ? {
              visual: {
                type: "formula",
                title: "Formula",
                data: {
                  positive: [
                    { role: "subject", label: "Ega", value: "Subject" },
                    { role: "verb", label: "Fe'l", value: query },
                    { role: "object", label: "To'ldiruvchi", value: "Complement" }
                  ],
                  negative: [
                    { role: "subject", label: "Ega", value: "Subject" },
                    { role: "verb", label: "Inkor", value: `NOT + ${query}` },
                    { role: "object", label: "To'ldiruvchi", value: "Complement" }
                  ]
                }
              }
            } : {})
          }
        ],
        flashcards: isArticleTopic ? [
          { word: "article", pos: "noun", uz: "artikl", ex: "Articles define nouns." },
          { word: "vowel", pos: "noun", uz: "unli tovush", ex: "A, E, I, O, U are vowels." },
          { word: "consonant", pos: "noun", uz: "undosh tovush", ex: "B, C, D are consonants." },
          { word: "countable", pos: "adj", uz: "sanaladigan", ex: "Pen is a countable noun." },
          { word: "indefinite", pos: "adj", uz: "noaniq", ex: "A and an are indefinite." }
        ] : [
          { word: "practice", pos: "verb", uz: "mashq qilmoq", ex: "Practice every single day." },
          { word: "accuracy", pos: "noun", uz: "aniqlik", ex: "Grammar accuracy matters." },
          { word: "fluency", pos: "noun", uz: "ravonlik", ex: "Speak with high fluency." }
        ],
        quiz: isArticleTopic ? [
          { q: "She is ______ English teacher.", opts: ["an", "a", "the", "-"], ans: "an", expl: "'English' unli tovush bilan boshlangani uchun 'an' bo'ladi." },
          { q: "He works at ______ university.", opts: ["a", "an", "the", "-"], ans: "a", expl: "'University' 'yu' (undosh) tovushi bilan boshlanadi, shuning uchun 'a'." }
        ] : [
          { q: `What is the key rule for ${query}?`, opts: ["Correct Form", "Trap Option 1", "Trap Option 2", "Trap Option 3"], ans: "Correct Form", expl: "CEFR qoidasiga ko'ra to'g'ri shakl tanlanishi lozim." }
        ],
        homework: []
      }, lengthToUse);

      setCurriculum(fallbackCurriculum);
      setCurrentScreenIndex(0);
      prevScreenIndexRef.current = 0;
      addLessonToHistory(fallbackCurriculum.topic, fallbackCurriculum);
      showToast("💡 Darslik tayyorlandi.");
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Export HTML
  const handleDownloadHtml = () => {
    if (!curriculum) return;
    const html = generateStandaloneHtml(curriculum);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TeacherOS_${curriculum.topic.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("💾 Standalone HTML yuklab olindi!");
  };

  // Share Link
  const handleShareLink = () => {
    if (!curriculum) return;
    const hash = compressCurriculumToHash(curriculum);
    const shareUrl = `${window.location.origin}${window.location.pathname}#c=${hash}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("🔗 Havola xotiraga nusxalandi!");
  };

  // Telegram Push Sync (Send whole lesson directly to teacher's Telegram chat)
  const [isSyncingTelegram, setIsSyncingTelegram] = useState(false);
  const handleSendToTelegram = async () => {
    if (!curriculum) return;
    setIsSyncingTelegram(true);
    showToast("📲 Dars Telegramga yuborilmoqda...");
    try {
      const resp = await fetch("/api/telegram-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentUser?.telegram_id || "7957347033",
          topic: curriculum.topic,
          level: curriculum.level,
          length: curriculum.length,
          slides: curriculum.slides,
          description: curriculum.description,
          teacherName: currentUser?.first_name || currentUser?.username || "Ustoz"
        })
      });
      const data = await resp.json();
      if (data.success) {
        showToast("✅ Dars Telegram hisobingizga muvaffaqiyatli saqlandi!");
      } else {
        showToast(`⚠️ Xatolik: ${data.error || 'Yuborib bo\'lmadi'}`);
      }
    } catch (err: any) {
      showToast(`⚠️ Tarmoq xatosi: ${err.message}`);
    } finally {
      setIsSyncingTelegram(false);
    }
  };

  // Dynamically add +1 question or item to current section
  const handleAddMoreItem = async () => {
    if (!curriculum || !activeScreen || isAddingItem) return;
    setIsAddingItem(true);
    showToast(`⚡ Yangi ${activeCategory?.title || "savol"} sintez qilinmoqda...`);
    try {
      const resp = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: curriculum.topic,
          level: curriculum.level || "B1",
          type: activeScreen.type,
          existingCount: activeScreen.total
        })
      });

      const data = await resp.json();
      if (data.success && data.item) {
        const newItem = data.item;
        const updated = { ...curriculum };

        if (activeScreen.type === "test") {
          updated.quiz = [...(updated.quiz || []), newItem];
        } else if (activeScreen.type === "quickQuestion") {
          updated.quickQuestions = [...(updated.quickQuestions || []), newItem];
        } else if (activeScreen.type === "vocab") {
          updated.flashcards = [...(updated.flashcards || []), newItem];
        } else if (activeScreen.type === "errorHunt") {
          updated.errorHunt = [...(updated.errorHunt || []), newItem];
        } else if (activeScreen.type === "dialog") {
          updated.dialog = [...(updated.dialog || []), newItem];
        } else if (activeScreen.type === "slide") {
          updated.slides = [...(updated.slides || []), newItem];
        } else if (activeScreen.type === "fillGap") {
          updated.fillGap = [...(updated.fillGap || []), newItem];
        }

        setCurriculum(updated);

        // Find current category to calculate index for the new item
        const currentCat = categories.find((c) =>
          (activeScreen.type === "test" && c.key === "tests") ||
          (activeScreen.type === "quickQuestion" && c.key === "quickQuestions") ||
          (activeScreen.type === "slide" && c.key === "slides") ||
          c.key === activeScreen.type
        );
        if (currentCat) {
          const newTargetIndex = currentCat.startIndex + currentCat.count;
          setCurrentScreenIndex(newTargetIndex);
        }

        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        showToast(`🎉 Yangi element qo'shildi! (${activeScreen.total + 1}/${activeScreen.total + 1})`);
      } else {
        showToast("⚠️ Savol qo'shishda xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error("Add item failed:", err);
      showToast("⚠️ Qayta urinib ko'ring");
    } finally {
      setIsAddingItem(false);
    }
  };

  // 1. Auth Loading Gate
  if (isAuthLoading) {
    return (
      <div className={`w-full h-screen ${isBoardLight ? "bg-[#F8FAFC] text-slate-900 stitch-grid-light" : "bg-[#0D0F14] text-slate-100 stitch-grid"} flex flex-col items-center justify-center space-y-4 select-none`}>
        <Sparkles className="w-8 h-8 text-[#5B3DF5] animate-spin" />
        <span className={`${isBoardLight ? "text-slate-600" : "text-slate-400"} font-mono text-xs`}>TeacherOS yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen ${isBoardLight ? "bg-[#F8FAFC] text-slate-900 stitch-grid-light" : "bg-[#0D0F14] text-slate-100 stitch-grid"} flex flex-col overflow-hidden font-sans select-none`}>


      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1F222E]/95 border border-[#5B3DF5]/50 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#5B3DF5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Optional Auth Modal (when triggered by Sign Up / Log In button) */}
      {showAuthModal && (
        <AuthModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            showToast(`Xush kelibsiz, ${user.username}!`);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Classroom Management Modal (User Sketch Image 1 & 2) */}
      <ClassroomModal
        isOpen={showClassroomModal}
        initialViewMode={classroomModalMode}
        onClose={() => setShowClassroomModal(false)}
        classrooms={classrooms}
        activeClassroomId={activeClassroomId}
        onSelectClassroom={(cls) => {
          handleSelectClassroom(cls);
          setShowClassroomModal(false);
        }}
        onCreateClassroom={(name, studentUsernames) => {
          handleCreateClassroom(name, studentUsernames);
        }}
        onAddStudentsToClassroom={(classroomId, studentUsernames) => {
          handleAddStudentsToClassroom(classroomId, studentUsernames);
        }}
        onDeleteClassroom={(classroomId) => {
          handleDeleteClassroom(classroomId);
        }}
        isLight={isBoardLight}
        appLanguage={appLanguage}
      />

      {/* Teacher Assignments & Submissions History Modal (Separate from main chat history) */}
      <TeacherAssignmentsHistoryModal
        isOpen={showAssignmentsHistoryModal}
        onClose={() => setShowAssignmentsHistoryModal(false)}
        isLight={isBoardLight}
        appLanguage={appLanguage}
        activeClassroomName={workspaceMode === 'classroom' ? currentClassroom.name : 'Sinf'}
      />

      {/* 3-Language & Theme Settings (Docked adjacent to Sidebar if open, or centered modal) */}
      {showSettingsModal && (
        isHistoryOpen ? (
          /* SIDECAR MODE: Occupies the space directly adjacent to the 3-line sidebar */
          <div
            className={`fixed left-80 top-0 bottom-0 z-50 w-[380px] sm:w-[440px] max-w-[calc(100vw-320px)] border-r shadow-2xl p-6 sm:p-7 space-y-6 overflow-y-auto animate-fade-in transition-all ${
              isBoardLight
                ? "bg-white/98 border-slate-200 text-slate-900 shadow-2xl"
                : "bg-[#141724]/98 border-white/10 text-white shadow-[20px_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B3DF5] to-[#a855f7] flex items-center justify-center text-white shadow-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{t.settings_title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t.settings_lang_desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isBoardLight ? "hover:bg-slate-100 text-slate-500 hover:text-slate-900" : "hover:bg-white/10 text-slate-400 hover:text-white"
                }`}
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{t.settings_lang_section}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Uzbek */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange('uz')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                    appLanguage === 'uz'
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                      : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">🇺🇿</span>
                    {appLanguage === 'uz' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className="font-bold text-xs">{t.settings_lang_uz}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{t.settings_lang_uz_sub}</div>
                </button>

                {/* English */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                    appLanguage === 'en'
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                      : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">🇬🇧</span>
                    {appLanguage === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className="font-bold text-xs">{t.settings_lang_en}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{t.settings_lang_en_sub}</div>
                </button>

                {/* Russian */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange('ru')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                    appLanguage === 'ru'
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                      : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">🇷🇺</span>
                    {appLanguage === 'ru' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className="font-bold text-xs">{t.settings_lang_ru}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{t.settings_lang_ru_sub}</div>
                </button>
              </div>
            </div>

            {/* Theme Selection without ugly hex codes */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                {isBoardLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{t.settings_theme_section}</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsBoardLight(false)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                    !isBoardLight
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">{t.settings_theme_dark}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBoardLight(true)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                    isBoardLight
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">{t.settings_theme_light}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{t.settings_account_section}</span>
              </label>

              {currentUser ? (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isBoardLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt="Telegram" className="w-10 h-10 rounded-full border border-sky-400/50 object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#0088cc] flex items-center justify-center font-bold text-white text-sm shadow shrink-0">
                          <Send className="w-5 h-5 fill-white" />
                        </div>
                      )}
                      <div className="truncate">
                        <div className={`font-bold text-sm truncate flex items-center gap-1.5 ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                          <span>{teacherDisplayName || currentUser.first_name || currentUser.username}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" title="Faol Telegram sessiyasi" />
                        </div>
                        <div className="text-[11px] text-sky-400 font-medium truncate flex items-center gap-1">
                          <span>{currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`}</span>
                          {currentUser.telegram_id && (
                            <span className="text-slate-500 font-mono text-[10px]">• ID: {currentUser.telegram_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setShowSettingsModal(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 hover-lift ml-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logout}</span>
                    </button>
                  </div>

                  {/* Teacher Display Name input for personalized greetings */}
                  <div className={`pt-2.5 border-t space-y-1.5 ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>{appLanguage === 'en' ? "Teacher Name (for greeting):" : appLanguage === 'ru' ? "Имя учителя (обращение):" : "Ustoz nomi (Murojaat uchun):"}</span>
                      <span className="text-[10px] text-indigo-400 font-normal">{appLanguage === 'en' ? "Telegram username stays fixed" : appLanguage === 'ru' ? "Telegram ник неизменен" : "Telegram username o'zgarmaydi"}</span>
                    </label>
                    <input
                      type="text"
                      value={teacherDisplayName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTeacherDisplayName(val);
                        const uid = currentUser.telegram_id || (currentUser as any).id || currentUser.username || 'user';
                        localStorage.setItem(`teacheros_teacher_name_${uid}`, val);
                      }}
                      placeholder={currentUser.first_name || currentUser.username || "Masalan: Aziz Ustoz"}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 border transition-all ${
                        isBoardLight
                          ? "bg-white text-slate-900 border-slate-300 placeholder-slate-400"
                          : "bg-white/10 text-white border-white/15 placeholder-slate-500"
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isBoardLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                }`}>
                  <div className="text-xs text-slate-400">
                    {t.settings_account_guest}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowAuthModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#7C3AED] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    {t.login_register}
                  </button>
                </div>
              )}
            </div>

            {/* Done button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isBoardLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              {t.done}
            </button>
          </div>
        ) : (
          /* CENTERED MODAL MODE */
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div
              className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl relative space-y-6 ${
                isBoardLight
                  ? "bg-white border-slate-200 text-slate-900"
                  : "bg-[#141724] border-white/10 text-white"
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between pb-3 border-b ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B3DF5] to-[#a855f7] flex items-center justify-center text-white shadow-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{t.settings_title}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t.settings_lang_desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isBoardLight ? "hover:bg-slate-100 text-slate-500 hover:text-slate-900" : "hover:bg-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t.settings_lang_section}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Uzbek */}
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('uz')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      appLanguage === 'uz'
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🇺🇿</span>
                      {appLanguage === 'uz' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="font-bold text-xs">{t.settings_lang_uz}</div>
                    <div className="text-[10px] text-slate-400 leading-snug">{t.settings_lang_uz_sub}</div>
                  </button>

                  {/* English */}
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      appLanguage === 'en'
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🇬🇧</span>
                      {appLanguage === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="font-bold text-xs">{t.settings_lang_en}</div>
                    <div className="text-[10px] text-slate-400 leading-snug">{t.settings_lang_en_sub}</div>
                  </button>

                  {/* Russian */}
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('ru')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      appLanguage === 'ru'
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🇷🇺</span>
                      {appLanguage === 'ru' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div className="font-bold text-xs">{t.settings_lang_ru}</div>
                    <div className="text-[10px] text-slate-400 leading-snug">{t.settings_lang_ru_sub}</div>
                  </button>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  {isBoardLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{t.settings_theme_section}</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBoardLight(false)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                      !isBoardLight
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : isBoardLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">{t.settings_theme_dark}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBoardLight(true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                      isBoardLight
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">{t.settings_theme_light}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{t.settings_account_section}</span>
                </label>

                {currentUser ? (
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isBoardLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        {currentUser.avatar_url ? (
                          <img src={currentUser.avatar_url} alt="Telegram" className="w-10 h-10 rounded-full border border-sky-400/50 object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#0088cc] flex items-center justify-center font-bold text-white text-sm shadow shrink-0">
                            <Send className="w-5 h-5 fill-white" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className={`font-bold text-sm truncate flex items-center gap-1.5 ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                            <span>{teacherDisplayName || currentUser.first_name || currentUser.username}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" title="Faol Telegram sessiyasi" />
                          </div>
                          <div className="text-[11px] text-sky-400 font-medium truncate flex items-center gap-1">
                            <span>{currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`}</span>
                            {currentUser.telegram_id && (
                              <span className="text-slate-500 font-mono text-[10px]">• ID: {currentUser.telegram_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setShowSettingsModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 hover-lift ml-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.logout}</span>
                      </button>
                    </div>

                    {/* Teacher Display Name input for personalized greetings */}
                    <div className={`pt-2.5 border-t space-y-1.5 ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
                      <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>{appLanguage === 'en' ? "Teacher Name (for greeting):" : appLanguage === 'ru' ? "Имя учителя (обращение):" : "Ustoz nomi (Murojaat uchun):"}</span>
                        <span className="text-[10px] text-indigo-400 font-normal">{appLanguage === 'en' ? "Telegram username stays fixed" : appLanguage === 'ru' ? "Telegram ник неизменен" : "Telegram username o'zgarmaydi"}</span>
                      </label>
                      <input
                        type="text"
                        value={teacherDisplayName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTeacherDisplayName(val);
                          const uid = currentUser.telegram_id || (currentUser as any).id || currentUser.username || 'user';
                          localStorage.setItem(`teacheros_teacher_name_${uid}`, val);
                        }}
                        placeholder={currentUser.first_name || currentUser.username || "Masalan: Aziz Ustoz"}
                        className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 border transition-all ${
                          isBoardLight
                            ? "bg-white text-slate-900 border-slate-300 placeholder-slate-400"
                            : "bg-white/10 text-white border-white/15 placeholder-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isBoardLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}>
                    <div className="text-xs text-slate-400">
                      {t.settings_account_guest}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsModal(false);
                        setShowAuthModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#7C3AED] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      {t.login_register}
                    </button>
                  </div>
                )}
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isBoardLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                {t.done}
              </button>
            </div>
          </div>
        )
      )}


      {/* Interactive Baamboozle Group Quiz Modal */}
      {activeGroupQuizTopic && (
        <div className="fixed inset-0 z-50 bg-[#0D0F14]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <BaamboozleQuiz
            topic={activeGroupQuizTopic}
            teamsCount={quizTeamsCount}
            onClose={() => setActiveGroupQuizTopic(null)}
            appLanguage={appLanguage}
          />
        </div>
      )}



      {/* 4-Blocks Social Channels & Support Modal (Triggered by Logo Click) */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className={`relative w-full max-w-xl border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
            isBoardLight
              ? "bg-white/98 border-slate-300 text-slate-900 shadow-slate-300"
              : "bg-[#141620]/98 border-white/15 text-white"
          }`}>
            {/* Big X Close Button */}
            <button
              type="button"
              onClick={() => setShowSocialModal(false)}
              className={`absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer border ${
                isBoardLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300"
                  : "bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border-white/10"
              }`}
              title="Yopish (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 text-left">
              <div className="flex items-center space-x-2.5">
                <BrandLogo isLight={isBoardLight} className="h-7 max-w-[130px] object-contain" />
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Hamjamiyat
                </span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                TeacherOS Ijtimoiy Tarmoqlari & Aloqa
              </h2>
              <p className={`text-xs sm:text-sm ${isBoardLight ? "text-slate-600" : "text-slate-400"}`}>
                Dars ishlanmalari, metodik yangiliklar va texnik yordam uchun rasmiy manzillarimiz:
              </p>
            </div>

            {/* 4 Distinct Standalone Styled Blocks (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className={`p-4 rounded-2xl border transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  isBoardLight
                    ? "bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-rose-500/10 border-pink-300 hover:border-pink-500 shadow-pink-100"
                    : "bg-gradient-to-br from-pink-500/15 via-purple-600/10 to-rose-500/15 border-pink-500/30 hover:border-pink-500/60 shadow-pink-950/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-pink-500 font-bold px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                    @teacheros.ai
                  </span>
                </div>
                <div>
                  <div className={`font-extrabold text-sm transition-colors ${
                    isBoardLight ? "text-slate-900 group-hover:text-pink-600" : "text-white group-hover:text-pink-200"
                  }`}>
                    Instagram
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-relaxed ${isBoardLight ? "text-slate-600" : "text-slate-400"}`}>
                    Dars ishlanmalari, qisqa videolar va yangi funksiyalar taqdimoti.
                  </div>
                </div>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className={`p-4 rounded-2xl border transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  isBoardLight
                    ? "bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-cyan-500/10 border-sky-300 hover:border-sky-500 shadow-sky-100"
                    : "bg-gradient-to-br from-sky-500/15 via-blue-600/10 to-cyan-500/15 border-sky-500/30 hover:border-sky-500/60 shadow-sky-950/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#229ED9] to-[#0088cc] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-sky-500 font-bold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                    @teacheros_official
                  </span>
                </div>
                <div>
                  <div className={`font-extrabold text-sm transition-colors ${
                    isBoardLight ? "text-slate-900 group-hover:text-sky-600" : "text-white group-hover:text-sky-200"
                  }`}>
                    Telegram Kanal
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-relaxed ${isBoardLight ? "text-slate-600" : "text-slate-400"}`}>
                    O'qituvchilar hamjamiyati, bepul materiallar va tezkor xabarlar.
                  </div>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className={`p-4 rounded-2xl border transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  isBoardLight
                    ? "bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-blue-700/10 border-blue-300 hover:border-blue-500 shadow-blue-100"
                    : "bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-blue-700/15 border-blue-500/30 hover:border-blue-500/60 shadow-blue-950/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1877F2] to-[#0D65D9] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-blue-500 font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    Community
                  </span>
                </div>
                <div>
                  <div className={`font-extrabold text-sm transition-colors ${
                    isBoardLight ? "text-slate-900 group-hover:text-blue-600" : "text-white group-hover:text-blue-200"
                  }`}>
                    Facebook Guruhi
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-relaxed ${isBoardLight ? "text-slate-600" : "text-slate-400"}`}>
                    Metodik tajriba almashish va xalqaro pedagoglar forumi.
                  </div>
                </div>
              </a>

              {/* Support */}
              <a
                href="mailto:support@teacheros.ai"
                className={`p-4 rounded-2xl border transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                  isBoardLight
                    ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10 border-emerald-300 hover:border-emerald-500 shadow-emerald-100"
                    : "bg-gradient-to-br from-emerald-500/15 via-teal-600/10 to-emerald-600/15 border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-950/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-500 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    24/7 Aloqa
                  </span>
                </div>
                <div>
                  <div className={`font-extrabold text-sm transition-colors ${
                    isBoardLight ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-emerald-200"
                  }`}>
                    Support (Qo'llab-quvvatlash)
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-relaxed ${isBoardLight ? "text-slate-600" : "text-slate-400"}`}>
                    Takliflar, darslik integratsiyasi va har qanday texnik yordam.
                  </div>
                </div>
              </a>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isBoardLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY & NAVIGATION DRAWER (Physical push drawer) */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-80 ${
          isBoardLight
            ? "bg-white/98 border-r border-slate-200 text-slate-900 shadow-2xl"
            : "bg-[#12141D]/98 border-r border-white/10 text-white shadow-2xl"
        } p-5 backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHistoryOpen ? "translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.8)]" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="space-y-4">
          {/* Drawer Top Header */}
          <div className={`flex items-center justify-between pb-3 border-b ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
            <div className="flex items-center space-x-2.5">
              <BrandLogo
                isLight={isBoardLight}
                className="h-8 max-w-[130px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
              />
              <span
                className={`text-lg font-black tracking-tight font-sans flex items-center gap-1 select-none ${
                  isBoardLight ? "text-slate-900" : "text-white"
                }`}
              >
                Teacher <span className="bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent font-black">OS</span>
              </span>
            </div>
            <button
              onClick={() => {
                setIsHistoryOpen(false);
                setShowSettingsModal(false);
              }}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                isBoardLight ? "hover:bg-slate-100 text-slate-500 hover:text-slate-900" : "hover:bg-white/10 text-slate-400 hover:text-white"
              }`}
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Classroom Context or Guest Notice (User Sketch Image 1 & 2) */}
          {currentUser ? (
            <div className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
              isBoardLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={`${isBoardLight ? "text-indigo-900" : "text-[#A5B4FC]"} flex items-center space-x-1.5 min-w-0`}>
                  <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{workspaceMode === 'classroom' ? currentClassroom.name : t.drawer_classroom_solo}</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                  isBoardLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-slate-300"
                }`}>
                  {workspaceMode === 'classroom' ? `${currentClassroom.students} ${appLanguage === 'en' ? 'students' : appLanguage === 'ru' ? 'учеников' : 'talaba'}` : (appLanguage === 'en' ? 'No class' : appLanguage === 'ru' ? 'Без класса' : 'Sinfsiz')}
                </span>
              </div>

              {classrooms.length > 0 ? (
                <div className="space-y-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setClassroomModalMode('list');
                      setShowClassroomModal(true);
                      setIsHistoryOpen(false);
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      isBoardLight
                        ? "bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-white/5 hover:bg-white/10 text-indigo-300 border-indigo-500/30"
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <span className="text-xs">⇄</span>
                      <span>{t.drawer_classroom_switch}</span>
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">({classrooms.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClassroomModalMode('create');
                      setShowClassroomModal(true);
                      setIsHistoryOpen(false);
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 border border-dashed ${
                      isBoardLight
                        ? "hover:bg-slate-100 text-slate-700 border-slate-300"
                        : "hover:bg-white/5 text-slate-300 border-white/20"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{appLanguage === 'en' ? "Add New Classroom" : appLanguage === 'ru' ? "Добавить класс" : "Yangi sinf qo'shish"}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setClassroomModalMode('create');
                      setShowClassroomModal(true);
                      setIsHistoryOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#7C3AED] hover:from-[#4C2FE0] hover:to-[#6D28D9] text-white text-[11.5px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md hover-lift"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{appLanguage === 'en' ? "Add New Classroom" : appLanguage === 'ru' ? "Создать новый класс" : "Yangi sinf qo'shish"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{t.drawer_classroom_guest_title}</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isBoardLight ? "text-slate-700" : "text-slate-300"}`}>
                {t.drawer_classroom_guest_desc}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsHistoryOpen(false);
                  setShowAuthModal(true);
                }}
                className="w-full py-1.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-md"
              >
                {t.login_register}
              </button>
            </div>
          )}

          {/* Drawer Action Buttons: Single Clean Icon per Button */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setCurriculum(null);
                setStudioMode('lesson');
                setTopicInput('');
                setIsPromptCollapsed(false);
                setIsHistoryOpen(false);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#7C3AED] text-white font-bold text-xs flex items-center space-x-2.5 shadow-lg shadow-[#5B3DF5]/30 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t.drawer_new_lesson}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurriculum(null);
                setStudioMode('homework');
                setIsHistoryOpen(false);
              }}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                isBoardLight
                  ? "bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200"
                  : "bg-white/5 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30"
              }`}
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span>{t.others_hw_title}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurriculum(null);
                setStudioMode('level_check');
                setIsHistoryOpen(false);
              }}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                isBoardLight
                  ? "bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-700 border border-slate-200"
                  : "bg-white/5 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/5 hover:border-amber-500/30"
              }`}
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>{t.others_lc_title}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurriculum(null);
                setStudioMode('group_quiz');
                setIsHistoryOpen(false);
              }}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                isBoardLight
                  ? "bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200"
                  : "bg-white/5 hover:bg-indigo-500/20 text-slate-200 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30"
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>{t.others_gq_title}</span>
            </button>

            {/* Dedicated Assignments & Results History (Separate from Chat History) */}
            <button
              type="button"
              onClick={() => {
                setShowAssignmentsHistoryModal(true);
                setIsHistoryOpen(false);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-500/30 text-emerald-300 shadow-sm"
            >
              <div className="flex items-center space-x-2.5">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>{appLanguage === 'en' ? "Assignments & Results Hub" : appLanguage === 'ru' ? "Задания и результаты" : "Topshiriqlar & Natijalar Tarixi"}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 font-mono text-emerald-200">
                Hub
              </span>
            </button>
          </div>

          {/* History List Section */}
          <div className="pt-2">
            <div className={`flex items-center space-x-2 pb-2 text-[11px] font-bold uppercase tracking-wider ${
              isBoardLight ? "text-slate-500" : "text-slate-400"
            }`}>
              <History className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.drawer_history_heading}</span>
            </div>

            {currentUser ? (
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {lessonHistory.length > 0 ? (
                  lessonHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const cached = localStorage.getItem(`teacheros_curriculum_cache_${item.topic.toLowerCase()}`);
                        if (cached) {
                          try {
                            const parsed = JSON.parse(cached);
                            if (parsed && parsed.slides && parsed.slides.length > 0) {
                              setCurriculum(parsed);
                              setCurrentScreenIndex(0);
                              prevScreenIndexRef.current = 0;
                              setIsHistoryOpen(false);
                              showToast(appLanguage === 'en' ? `Loaded "${item.topic}" from saved lessons` : appLanguage === 'ru' ? `Урок "${item.topic}" открыт` : `"${item.topic}" darsi ochildi!`);
                              return;
                            }
                          } catch (e) {}
                        }
                        setTopicInput(item.topic);
                        handleGenerate(item.topic);
                        setIsHistoryOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer border ${
                        isBoardLight
                          ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-transparent hover:border-slate-200"
                          : "hover:bg-white/5 text-slate-200 group-hover:text-white border-transparent hover:border-white/5"
                      }`}
                    >
                      <span className="text-xs font-medium truncate max-w-[180px]">
                        {item.topic}
                      </span>
                      <span className={`text-[11px] font-mono font-semibold ${isBoardLight ? "text-slate-400 group-hover:text-indigo-600" : "text-slate-500 group-hover:text-indigo-400"}`}>
                        {getRelativeTime(item.timestamp, item.time)}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className={`p-4 text-center space-y-1.5 rounded-2xl border border-dashed my-1 ${
                    isBoardLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
                  }`}>
                    <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className={`text-xs font-semibold ${isBoardLight ? "text-slate-700" : "text-slate-300"}`}>
                      {t.drawer_no_history}
                    </div>
                    <div className="text-[10.5px] text-slate-400 leading-relaxed">
                      {appLanguage === 'en' ? "Your created lessons will appear here." : appLanguage === 'ru' ? "Созданные уроки появятся здесь." : "Yaratilgan darslaringiz shu yerda saqlanadi."}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-3 rounded-xl border text-center text-[11px] leading-relaxed ${
                isBoardLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-white/5 border-white/5 text-slate-400"
              }`}>
                {t.drawer_guest_hint}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Settings Section (Account is integrated inside Settings) */}
        <div className={`pt-3 border-t ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
          <button
            type="button"
            onClick={() => {
              setShowSettingsModal((prev) => !prev);
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer group hover-lift border ${
              isBoardLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-indigo-500 group-hover:rotate-45 transition-transform" />
              <span>{t.drawer_settings}</span>
              {currentUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" title="Telegram ulangan" />
              )}
            </div>
            <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
              isBoardLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-slate-300"
            }`}>
              <span>{appLanguage === 'uz' ? '🇺🇿 UZ' : appLanguage === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}</span>
            </div>
          </button>
        </div>
      </aside>

      {/* PUSH CONTAINER: Shifts right when drawer opens for genuine physical push */}
      <div
        className={`w-full h-full flex flex-col relative overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHistoryOpen ? "translate-x-80" : "translate-x-0"
        }`}
      >
        {/* Scrim covering the pushed viewport to close on click */}
        {isHistoryOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[1px] cursor-pointer"
            onClick={() => {
              setIsHistoryOpen(false);
              setShowSettingsModal(false);
            }}
            title={t.close}
          />
        )}


        {/* TOP HEADER - Only shown when curriculum is active */}
        {!isFullscreen && curriculum && (
          <header className={`relative h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-30 transition-colors ${
            isBoardLight
              ? "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
              : "bg-[#0D0F14]/90 border-white/10 text-white"
          }`}>
          {/* Brand Logo in Header */}
          <div className="flex items-center space-x-3">
            <div
              onClick={() => setShowSocialModal(true)}
              className="flex items-center space-x-2 cursor-pointer group"
              title="TeacherOS Hamjamiyati & Aloqa"
            >
              <BrandLogo isLight={isBoardLight} onClick={() => setShowSocialModal(true)} />
            </div>

            <div className={`h-4 w-px ${isBoardLight ? "bg-slate-300" : "bg-white/10"}`} />
            <div className="flex items-center space-x-2">
              <span className={`text-xs sm:text-sm font-extrabold truncate max-w-[160px] sm:max-w-xs ${
                isBoardLight ? "text-slate-900" : "text-white"
              }`}>
                {curriculum.topic}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isBoardLight ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-white/10 text-slate-300"
              }`}>
                {curriculum.level}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isBoardLight
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-[#5B3DF5]/20 text-[#A5B4FC] border border-[#5B3DF5]/30"
              }`}>
                {curriculum.length === "short" ? "Qisqa (4)" : curriculum.length === "long" ? "To'liq (8)" : "O'rtacha (6)"}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 text-xs">
            {currentUser && workspaceMode === 'classroom' && (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('solo');
                  localStorage.removeItem('teacheros_workspace_mode');
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isBoardLight
                    ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800"
                    : "bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30 text-indigo-200"
                }`}
                title="Sinfxonani almashtirish"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">{currentClassroom.name}</span>
                <span className="text-[10px] opacity-75">({currentClassroom.students})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAssignmentsHistoryModal(true)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isBoardLight
                  ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                  : "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-200"
              }`}
              title="Biriktirilgan uyga vazifalar va test natijalari tarixi"
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{appLanguage === 'en' ? "Assignments" : appLanguage === 'ru' ? "Задания" : "Topshiriqlar"}</span>
            </button>

            {curriculum && (
              <>
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 font-bold transition-all cursor-pointer"
                  title="To'liq doska rejimi (F)"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  <span className="hidden sm:inline">Present</span>
                </button>

                <button
                  onClick={handleDownloadHtml}
                  className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full border flex items-center space-x-1 font-medium transition-all cursor-pointer ${
                    isBoardLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                  }`}
                  title="HTML Yuklab Olish"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full border flex items-center space-x-1 font-medium transition-all cursor-pointer ${
                    isBoardLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                  }`}
                  title="Havolani Nusxalash"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                {/* Direct Telegram Sync Button */}
                <button
                  onClick={handleSendToTelegram}
                  disabled={isSyncingTelegram}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 flex items-center space-x-1.5 font-bold transition-all cursor-pointer hover-lift disabled:opacity-50"
                  title="Darsni shaxsiy Telegramga yuborish"
                >
                  <Send className="w-3.5 h-3.5 fill-[#229ED9]" />
                  <span className="hidden sm:inline">
                    {isSyncingTelegram ? "Yuborilmoqda..." : "Telegramga"}
                  </span>
                </button>
              </>
            )}

            {/* Auth section: Sign in button for guests, Account pill + Logout for logged in */}
            {currentUser ? (
              <>
                {/* User Pill - Clickable to open Settings & Account */}
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] hover-lift ${
                    isBoardLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-indigo-400 text-slate-800"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-indigo-400 text-slate-300 hover:text-white"
                  }`}
                  title={appLanguage === 'en' ? "Open Settings & Account" : appLanguage === 'ru' ? "Настройки и профиль" : "Sozlamalar va hisob"}
                >
                  <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span className={`font-bold truncate max-w-[100px] ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                    {currentUser.first_name || currentUser.username}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                </button>

                {/* Logout button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center space-x-1 text-xs font-bold cursor-pointer"
                  title="Tizimdan chiqish"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Chiqish</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#2ba6e3] hover:to-[#0094de] text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-[#229ED9]/30 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-white" />
                <span>Telegram orqali Kirish</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Floating Login / User Profile in Top Right */}
      {!isFullscreen && !curriculum && studioMode !== 'homework' && !activeHomeworkTopic && (
        <div className="absolute top-5 right-6 z-30 flex items-center space-x-2">
          {currentUser ? (
            <>
              {/* Floating User Pill - Clickable to open Settings & Account */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border shadow-2xl backdrop-blur-xl text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] hover-lift ${
                  isBoardLight
                    ? "bg-white/95 hover:bg-slate-50 border-slate-300 hover:border-indigo-400 text-slate-800 shadow-slate-200"
                    : "bg-[#141724]/90 hover:bg-[#1a1e30] border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white"
                }`}
                title={appLanguage === 'en' ? "Open Settings & Account" : appLanguage === 'ru' ? "Настройки и профиль" : "Sozlamalar va hisob"}
              >
                <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                <span className={`font-bold truncate max-w-[130px] ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                  {currentUser.first_name || currentUser.username}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className={`p-2 rounded-xl border shadow-2xl backdrop-blur-xl transition-all flex items-center space-x-1 text-xs font-bold cursor-pointer hover-lift ${
                  isBoardLight
                    ? "bg-white/95 hover:bg-red-50 text-slate-500 hover:text-red-500 border-slate-300 hover:border-red-300"
                    : "bg-[#141724]/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border-white/20 hover:border-red-500/30"
                }`}
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#2ba6e3] hover:to-[#0094de] text-white text-xs font-bold flex items-center space-x-2 shadow-2xl shadow-[#229ED9]/40 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border border-white/10 hover-lift"
            >
              <Send className="w-3.5 h-3.5 fill-white" />
              <span>Telegram orqali Kirish</span>
            </button>
          )}
        </div>
      )}

      {/* Floating 3-Lines Menu Button UNDER the Logo (First Screen) */}
      {!isFullscreen && !curriculum && studioMode !== 'homework' && !activeHomeworkTopic && (
        <button
          type="button"
          onClick={() => setIsHistoryOpen((prev) => !prev)}
          className={`absolute top-5 left-5 sm:left-6 z-30 w-10 h-10 rounded-xl border shadow-xl backdrop-blur-xl flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105 active:scale-95 cursor-pointer group hover-lift ${
            isBoardLight
              ? "bg-white/95 hover:bg-slate-100 border-slate-300 hover:border-[#5B3DF5] shadow-slate-200"
              : "bg-[#141724]/95 hover:bg-[#1E2235] border-white/20 hover:border-[#5B3DF5]"
          } ${
            isHistoryOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          title={appLanguage === 'en' ? "Menu & Lessons (☰)" : appLanguage === 'ru' ? "Меню и уроки (☰)" : "Menyu va Darslar (☰)"}
        >
          <div className={`w-5 h-[2px] rounded-full transition-colors ${isBoardLight ? "bg-slate-700 group-hover:bg-[#5B3DF5]" : "bg-slate-100 group-hover:bg-white"}`} />
          <div className={`w-5 h-[2px] rounded-full transition-colors ${isBoardLight ? "bg-slate-700 group-hover:bg-[#5B3DF5]" : "bg-slate-100 group-hover:bg-white"}`} />
          <div className={`w-5 h-[2px] rounded-full transition-colors ${isBoardLight ? "bg-slate-700 group-hover:bg-[#5B3DF5]" : "bg-slate-100 group-hover:bg-white"}`} />
        </button>
      )}

      {/* MAIN CANVAS - Flexible & Scrollable for Windowed PC View */}
      <div className="flex-1 w-full relative flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden min-h-0 py-2 sm:py-4">
        {/* ============================================================ */}
        {/* GENERATING STATE: ONLY CLEAN PROCESS CARD IN CENTER          */}
        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* GENERATING STATE: HIGH-TECH PEDAGOGICAL SYNTHESIS STUDIO     */}
        {/* ============================================================ */}
        {isGenerating && (
          <div className="w-full max-w-4xl px-4 z-20 flex flex-col items-center justify-center animate-fade-in">
            {/* High-Tech Studio Blueprint Card */}
            <div className={`w-full rounded-3xl border shadow-2xl backdrop-blur-2xl p-5 sm:p-7 flex flex-col space-y-5 overflow-hidden relative transition-colors ${
              isBoardLight
                ? "bg-white/98 border-slate-200 shadow-slate-200/80 text-slate-800"
                : "bg-[#12141D]/95 border-[#5B3DF5]/35 shadow-[0_25px_70px_-15px_rgba(91,61,245,0.35)] text-white"
            }`}>
              {/* Ambient background glows */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#5B3DF5]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header Telemetry */}
              <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b text-xs ${
                isBoardLight ? "border-slate-200" : "border-white/10"
              }`}>
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    AI SYNTHESIS LAB • ACTIVE
                  </span>
                  <span className={isBoardLight ? "text-slate-300" : "text-white/20"}>|</span>
                  <span className={`font-mono text-[11px] ${isBoardLight ? "text-slate-500 font-semibold" : "text-slate-400"}`}>
                    Gemini 3.5 Engine
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1.5 shadow-sm border ${
                    isBoardLight
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-[#5B3DF5]/20 text-[#A5B4FC] border-[#5B3DF5]/40"
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5] animate-spin" />
                    <span className="truncate max-w-[200px]">Mavzu: {topicInput || "Yangi Dars"}</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-[11px] border ${
                    isBoardLight
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-white/10 text-slate-300 border-transparent"
                  }`}>
                    {level}
                  </span>
                </div>
              </div>

              {/* Shimmer Blueprint 16:9 Slide Preview */}
              <div className={`w-full aspect-[16/9] max-h-52 sm:max-h-60 rounded-2xl border p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-inner ${
                isBoardLight
                  ? "bg-slate-50 border-slate-200"
                  : "bg-black/40 border-white/10"
              }`}>
                {/* Laser shimmer animation wave traversing skeleton */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-laser-shimmer pointer-events-none`} />

                {/* Top skeleton header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-20 h-4 rounded-md animate-pulse ${isBoardLight ? "bg-slate-300" : "bg-white/15"}`} />
                    <div className={`w-36 h-5 rounded-md animate-pulse ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />
                  </div>
                  <div className="flex space-x-1.5">
                    <div className={`w-6 h-6 rounded-lg ${isBoardLight ? "bg-slate-200" : "bg-white/10"}`} />
                    <div className={`w-6 h-6 rounded-lg ${isBoardLight ? "bg-slate-200" : "bg-white/10"}`} />
                  </div>
                </div>

                {/* Center skeleton dual columns */}
                <div className="grid grid-cols-12 gap-4 items-center my-auto">
                  {/* Left: rule skeleton */}
                  <div className="col-span-6 space-y-2.5">
                    <div className={`w-3/4 h-3.5 rounded animate-pulse ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />
                    <div className={`w-full h-3 rounded animate-pulse ${isBoardLight ? "bg-slate-200" : "bg-white/10"}`} />
                    <div className={`w-5/6 h-3 rounded animate-pulse ${isBoardLight ? "bg-slate-200" : "bg-white/10"}`} />
                    <div className={`w-full h-9 rounded-xl border flex items-center px-3 space-x-2 ${
                      isBoardLight
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-[#5B3DF5]/15 border-[#5B3DF5]/30"
                    }`}>
                      <div className="w-3 h-3 rounded-full bg-[#5B3DF5] animate-pulse" />
                      <div className={`w-44 h-2.5 rounded animate-pulse ${isBoardLight ? "bg-indigo-200" : "bg-white/20"}`} />
                    </div>
                  </div>

                  {/* Right: visual diagram skeleton */}
                  <div className={`col-span-6 h-28 sm:h-32 rounded-xl border p-3 flex flex-col justify-between ${
                    isBoardLight
                      ? "bg-white border-slate-200 shadow-sm"
                      : "bg-white/5 border-white/10"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-24 h-3 rounded ${isBoardLight ? "bg-slate-200" : "bg-white/15"}`} />
                      <div className="w-12 h-3 rounded-full bg-[#5B3DF5]/30" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30 animate-pulse" />
                      <div className="flex-1 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 animate-pulse" />
                      <div className="flex-1 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 animate-pulse" />
                    </div>
                    <div className={`w-full h-1.5 rounded-full ${isBoardLight ? "bg-slate-200" : "bg-white/10"}`} />
                  </div>
                </div>

                {/* Bottom slide dots */}
                <div className={`flex items-center justify-center space-x-2 pt-2 border-t ${
                  isBoardLight ? "border-slate-200" : "border-white/5"
                }`}>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div
                      key={d}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        d <= generationStage
                          ? "w-8 bg-[#5B3DF5] shadow-[0_0_8px_#5B3DF5]"
                          : isBoardLight ? "w-2 bg-slate-300" : "w-2 bg-white/15"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 4-Stage Architectural Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { num: 1, title: "Semantik Tahlil", desc: "CEFR daraja & kontekst", icon: "🔍" },
                  { num: 2, title: "Vizual Modellar", desc: "Interaktiv sintaksis", icon: "🎨" },
                  { num: 3, title: "O'zbekcha Qopqon", desc: "Tuzoqlar & testlar", icon: "⚡" },
                  { num: 4, title: "Doska Yakunlash", desc: "16:9 taqdimot tayyor", icon: "✨" }
                ].map((st) => {
                  const isDone = generationStage > st.num;
                  const isCurrent = generationStage === st.num;
                  return (
                    <div
                      key={st.num}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? isBoardLight
                            ? "bg-indigo-50 border-indigo-500 text-indigo-950 shadow-md scale-102 font-bold"
                            : "bg-[#5B3DF5]/20 border-[#5B3DF5] shadow-[0_0_15px_rgba(91,61,245,0.25)] scale-102 text-white"
                          : isDone
                          ? isBoardLight
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : isBoardLight
                          ? "bg-slate-50 border-slate-200 text-slate-500 opacity-70"
                          : "bg-white/5 border-white/5 text-slate-500 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{st.icon}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : isCurrent ? (
                          <RotateCw className="w-3.5 h-3.5 text-[#5B3DF5] animate-spin" />
                        ) : (
                          <span className={`text-[10px] font-mono ${isBoardLight ? "text-slate-400" : "text-slate-500"}`}>#{st.num}</span>
                        )}
                      </div>
                      <div className={`text-xs font-black ${
                        isCurrent
                          ? isBoardLight ? "text-indigo-950" : "text-white"
                          : isDone
                          ? isBoardLight ? "text-emerald-900" : "text-emerald-200"
                          : isBoardLight ? "text-slate-600" : "text-slate-400"
                      }`}>
                        {st.title}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${
                        isBoardLight ? "text-slate-500" : "text-slate-400"
                      }`}>{st.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Active Telemetry text */}
              <div className="text-center space-y-1 pt-1">
                <div className={`text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 ${
                  isBoardLight ? "text-slate-900" : "text-white"
                }`}>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-[#5B3DF5]" />
                  <span>{generationStep}</span>
                </div>
                <p className={`text-[11px] font-mono ${
                  isBoardLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  O'qituvchi va talabalar uchun yuqori aniqlikdagi interaktiv doska sintez qilinmoqda...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* INITIAL STATE: PROMPT BAR & LENGTH SELECTOR HERO             */}
        {/* ============================================================ */}
        {!curriculum && !isGenerating && (
          studioMode === 'homework' && isGeneratingHomework ? (
            /* ============================================================ */
            /* HOMEWORK GENERATING TRANSFORMATION SKELETON SCREEN           */
            /* ============================================================ */
            <div className="w-full max-w-5xl px-4 sm:px-6 z-20 flex flex-col items-center justify-center space-y-6 animate-fade-in my-auto py-4">
              {/* Telemetry Header */}
              <div className={`w-full p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isBoardLight
                  ? "bg-white/90 border-slate-300 shadow-slate-200"
                  : "bg-[#12141D]/95 border-[#5B3DF5]/30 shadow-[0_20px_50px_rgba(91,61,245,0.25)]"
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B3DF5] to-[#10B981] flex items-center justify-center shadow-lg text-white">
                    <Sparkles className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-black tracking-wider uppercase text-emerald-500 font-mono">
                        {appLanguage === 'en' ? "TRANSFORMING TASKS..." : appLanguage === 'ru' ? "СИНТЕЗ ЗАДАНИЙ..." : "VAZIFALAR SINTEZI..."}
                      </span>
                    </div>
                    <div className={`text-sm font-extrabold truncate max-w-sm sm:max-w-md ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                      {topicInput || "Present Perfect Continuous"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    homeworkIntensity === 'light'
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : homeworkIntensity === 'extreme'
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {homeworkIntensity.toUpperCase()} MODE ({homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10}/tur)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold">
                    CEFR: {level}
                  </span>
                </div>
              </div>

              {/* Shimmering Top Question Tabs (Like Template) */}
              <div className="w-full flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {selectedHomeworkTypes.map((typeId, i) => {
                  const meta = HOMEWORK_QUESTION_TYPES.find((qt) => qt.id === typeId);
                  const Icon = meta?.icon || Sparkles;
                  return (
                    <div
                      key={typeId}
                      className={`flex-shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-bold animate-pulse ${
                        isBoardLight
                          ? "bg-white/80 border-slate-300 text-slate-700 shadow-sm"
                          : "bg-[#141724]/80 border-white/10 text-slate-300"
                      }`}
                      style={{ animationDelay: `${i * 120}ms` }}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#5B3DF5]" />
                      <span className="truncate max-w-[120px]">{meta?.title[appLanguage] || typeId}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    </div>
                  );
                })}
              </div>

              {/* 3 Transforming Question Skeleton Cards (Directly on Dotted Canvas) */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((cardIdx) => (
                  <div
                    key={cardIdx}
                    className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-xl shadow-xl transition-all ${
                      isBoardLight
                        ? "bg-white/80 border-slate-300 shadow-slate-200"
                        : "bg-[#141622]/85 border-white/15"
                    }`}
                  >
                    {/* Laser scanning light sweep */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-laser pointer-events-none" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-20 rounded-full bg-indigo-500/20 animate-pulse" />
                        <div className="h-4 w-12 rounded-full bg-slate-500/20 animate-pulse" />
                      </div>
                      <div className="h-4 w-full rounded-lg bg-slate-500/20 animate-pulse" />
                      <div className="h-4 w-3/4 rounded-lg bg-slate-500/15 animate-pulse" />
                    </div>

                    <div className="space-y-2 pt-3">
                      <div className="h-10 w-full rounded-xl bg-slate-500/10 border border-slate-500/20 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-slate-500/10 border border-slate-500/20 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-slate-500/10 border border-slate-500/20 animate-pulse" />
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <div className="h-4 w-28 rounded-md bg-slate-500/20 animate-pulse" />
                      <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Text */}
              <div className="text-center space-y-1">
                <div className={`text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                  <RotateCw className="w-4 h-4 animate-spin text-[#5B3DF5]" />
                  <span>
                    {appLanguage === 'en'
                      ? "AI is generating authentic pedagogical questions & explanations..."
                      : appLanguage === 'ru'
                      ? "ИИ создаёт аутентичные задания и объяснения..."
                      : "AI o'quvchilar darajasi bo'yicha original savol va izohlarni sintez qilmoqda..."}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedHomeworkTypes.length} tur • {selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} ta vazifa
                </p>
              </div>
            </div>
          ) : studioMode === 'homework' && (homeworkStep === 'review' || activeHomeworkTopic) ? (
            /* ============================================================ */
            /* STANDALONE HOMEWORK REVIEW (Floating Directly on Dotted Canvas) */
            /* ============================================================ */
            <div className="w-full max-w-6xl h-full max-h-[calc(100vh-2rem)] px-2 sm:px-6 z-20 flex flex-col items-center justify-between animate-fade-in my-auto py-1 sm:py-2 overflow-hidden">
              <HomeworkViewer
                topic={activeHomeworkTopic || topicInput.trim() || "Present Perfect"}
                data={generatedHomeworkData}
                onClose={() => {
                  setActiveHomeworkTopic(null);
                  setGeneratedHomeworkData(null);
                  setHomeworkStep('prompt');
                }}
                appLanguage={appLanguage}
                isLight={isBoardLight}
                activeClassroomName={workspaceMode === 'classroom' ? currentClassroom.name : (appLanguage === 'en' ? "Solo Mode" : appLanguage === 'ru' ? "Индивидуальный" : "Yakkaxon rejim")}
                activeClassroomId={workspaceMode === 'classroom' ? currentClassroom.id : 'solo'}
                onSwitchClassroom={() => {
                  setClassroomModalMode('list');
                  setShowClassroomModal(true);
                }}
              />
            </div>
          ) : studioMode === 'homework' && homeworkStep === 'config' ? (
            /* ============================================================ */
            /* STANDALONE HOMEWORK STUDIO (Floating Directly on Dotted Canvas) */
            /* ============================================================ */
            <div className="w-full max-w-5xl px-4 sm:px-6 z-20 flex flex-col items-center justify-center space-y-6 animate-fade-in my-auto pt-2 sm:pt-4">
              
              {/* TOP ROW: Back Button + 3 Intensity Capsule Pills (Matching Image) + Topic Pill */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setHomeworkStep('prompt')}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center space-x-1.5 backdrop-blur-md hover-lift ${
                    isBoardLight
                      ? "bg-white/80 hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
                      : "bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border-white/10"
                  }`}
                  title={appLanguage === 'en' ? "Back to Prompt" : appLanguage === 'ru' ? "Назад к запросу" : "Orqaga (Ko'rsatmaga qaytish)"}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{appLanguage === 'en' ? "Back" : appLanguage === 'ru' ? "Назад" : "Orqaga"}</span>
                </button>

                {/* THE 3 INTENSITY CAPSULE PILLS (Shape of the User's Image) */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                  {/* 🟢 LIGHT MODE */}
                  <button
                    type="button"
                    onClick={() => setHomeworkIntensity('light')}
                    className={`inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all cursor-pointer backdrop-blur-md ${
                      homeworkIntensity === 'light'
                        ? "bg-[#06241a]/90 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.55)] ring-2 ring-emerald-400/40 scale-105"
                        : isBoardLight
                        ? "bg-white/80 border-2 border-slate-200 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 hover:bg-white"
                        : "bg-white/5 border-2 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-white/10"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>LIGHT MODE</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      5 {appLanguage === 'en' ? "/ type" : appLanguage === 'ru' ? "/ тип" : "ta / tur"}
                    </span>
                  </button>

                  {/* 🟡 MEDIUM MODE */}
                  <button
                    type="button"
                    onClick={() => setHomeworkIntensity('medium')}
                    className={`inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all cursor-pointer backdrop-blur-md ${
                      homeworkIntensity === 'medium'
                        ? "bg-[#2b1704]/90 border-2 border-amber-400 text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.55)] ring-2 ring-amber-400/40 scale-105"
                        : isBoardLight
                        ? "bg-white/80 border-2 border-slate-200 text-slate-600 hover:border-amber-500/50 hover:text-amber-600 hover:bg-white"
                        : "bg-white/5 border-2 border-white/10 text-slate-400 hover:border-amber-500/50 hover:text-amber-300 hover:bg-white/10"
                    }`}
                  >
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>MEDIUM MODE</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      10 {appLanguage === 'en' ? "/ type" : appLanguage === 'ru' ? "/ тип" : "ta / tur"}
                    </span>
                  </button>

                  {/* 🔴 EXTREME MODE */}
                  <button
                    type="button"
                    onClick={() => setHomeworkIntensity('extreme')}
                    className={`inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all cursor-pointer backdrop-blur-md ${
                      homeworkIntensity === 'extreme'
                        ? "bg-[#2b080c]/90 border-2 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.55)] ring-2 ring-rose-500/40 scale-105"
                        : isBoardLight
                        ? "bg-white/80 border-2 border-slate-200 text-slate-600 hover:border-rose-500/50 hover:text-rose-600 hover:bg-white"
                        : "bg-white/5 border-2 border-white/10 text-slate-400 hover:border-rose-500/50 hover:text-rose-300 hover:bg-white/10"
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>EXTREME MODE</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      15 {appLanguage === 'en' ? "/ type" : appLanguage === 'ru' ? "/ тип" : "ta / tur"}
                    </span>
                  </button>
                </div>

                {/* Topic Pill */}
                <div className={`hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium truncate max-w-xs backdrop-blur-md ${
                  isBoardLight
                    ? "bg-white/80 border-slate-300 text-slate-700 shadow-sm"
                    : "bg-white/5 border-white/10 text-slate-300"
                }`}>
                  <span className="text-slate-400 text-[10px] uppercase font-mono">{appLanguage === 'en' ? "Topic:" : appLanguage === 'ru' ? "Тема:" : "Mavzu:"}</span>
                  <span className={`font-bold truncate ${isBoardLight ? "text-slate-900" : "text-white"}`}>{topicInput || "Present Perfect Continuous"}</span>
                </div>
              </div>

              {/* MIDDLE: 10 SEPARATE BLOCKS DIRECTLY ON DOTTED CANVAS (WITH BUBBLE-IN ANIMATION) */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {HOMEWORK_QUESTION_TYPES.map((qt, idx) => {
                  const isSelected = selectedHomeworkTypes.includes(qt.id);
                  const Icon = qt.icon;
                  const countPerType = homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10;
                  const colors = qt.color;

                  return (
                    <button
                      key={qt.id}
                      type="button"
                      style={{ animationDelay: `${idx * 45}ms` }}
                      onClick={() => {
                        setSelectedHomeworkTypes((prev) =>
                          isSelected ? prev.filter((id) => id !== qt.id) : [...prev, qt.id]
                        );
                      }}
                      className={`animate-bubble-in p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 backdrop-blur-md group hover:scale-[1.02] active:scale-[0.98] ${
                        isSelected
                          ? `${colors.bgActive} ${colors.border} ${colors.glow} ring-1 ${colors.border}`
                          : isBoardLight
                          ? "bg-white/85 border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm opacity-90 hover:opacity-100"
                          : "bg-[#141620]/70 border-white/10 hover:border-white/20 hover:bg-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl transition-colors ${
                          isSelected
                            ? colors.iconBg
                            : isBoardLight
                            ? "bg-slate-100 text-slate-500 group-hover:text-slate-900"
                            : "bg-white/10 text-slate-400 group-hover:text-white"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? colors.badge
                            : isBoardLight
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-white/5 text-slate-400 border-white/5"
                        }`}>
                          {countPerType} {appLanguage === 'en' ? "items" : appLanguage === 'ru' ? "зад." : "ta"}
                        </span>
                      </div>

                      <div>
                        <div className={`text-xs font-black line-clamp-1 ${
                          isSelected
                            ? "text-white"
                            : isBoardLight
                            ? "text-slate-900 group-hover:text-indigo-600"
                            : "text-white"
                        }`}>
                          {qt.title[appLanguage] || qt.title.uz}
                        </div>
                        <div className={`text-[10px] line-clamp-1 mt-0.5 font-medium ${
                          isBoardLight ? "text-slate-500" : "text-slate-400"
                        }`}>
                          {qt.subtitle[appLanguage] || qt.subtitle.uz}
                        </div>
                      </div>

                      <div className={`flex items-center space-x-1.5 pt-1.5 border-t ${
                        isBoardLight ? "border-slate-200/80" : "border-white/5"
                      }`}>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                          isSelected
                            ? `${colors.iconBg} ${colors.border} text-white`
                            : isBoardLight
                            ? "border-slate-300 text-transparent"
                            : "border-white/20 text-transparent"
                        }`}>
                          {isSelected ? "✓" : ""}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          isSelected
                            ? colors.text
                            : isBoardLight
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}>
                          {isSelected
                            ? (appLanguage === 'en' ? "Selected" : appLanguage === 'ru' ? "Выбрано" : "Tanlandi")
                            : (appLanguage === 'en' ? "Click to add" : appLanguage === 'ru' ? "Добавить" : "Tanlash")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* BOTTOM: FLOATING ACTION BAR DIRECTLY ON CANVAS */}
              <div className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                isBoardLight
                  ? "bg-white/95 border-slate-300 shadow-slate-200"
                  : "bg-[#141724]/90 border-white/15"
              }`}>
                {/* Left Quick Toggles */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedHomeworkTypes([
                      'mcq', 'mistake_hunter', 'open_cloze', 'sentence_transformation', 'word_formation',
                      'unscramble', 'translation', 'contrast_duel', 'dialogue_fill', 'writing_challenge'
                    ])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isBoardLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                        : "bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/10"
                    }`}
                  >
                    ✓ {appLanguage === 'en' ? "Select All (10)" : appLanguage === 'ru' ? "Выбрать все (10)" : "Barchasini Tanlash (10)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHomeworkTypes([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isBoardLight
                        ? "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/5"
                    }`}
                  >
                    ✕ {appLanguage === 'en' ? "Clear" : appLanguage === 'ru' ? "Очистить" : "Tozalash"}
                  </button>
                </div>

                {/* Center Task Volume Counter */}
                <div className={`text-xs font-mono flex items-center space-x-2 ${
                  isBoardLight ? "text-slate-700" : "text-slate-300"
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {appLanguage === 'en'
                      ? `Total: ${selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} authentic questions`
                      : appLanguage === 'ru'
                      ? `Всего: ${selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} аутентичных заданий`
                      : `Jami: ${selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} ta original savol`}
                  </span>
                </div>

                {/* Right Action Button */}
                <button
                  type="button"
                  onClick={handleGenerateHomework}
                  disabled={isGeneratingHomework || selectedHomeworkTypes.length === 0}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B3DF5] via-[#7C3AED] to-[#10B981] hover:from-[#4C2FE0] hover:to-[#059669] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(91,61,245,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGeneratingHomework ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                      <span>{appLanguage === 'en' ? "Synthesizing Tasks..." : appLanguage === 'ru' ? "Синтез заданий..." : "Vazifalar Sintez Qilinmoqda..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>
                        {appLanguage === 'en'
                          ? `Generate Homework (${selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} Tasks)`
                          : appLanguage === 'ru'
                          ? `Создать задание (${selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} зад.)`
                          : `Uyga Vazifani Sintez Qilish (${selectedHomeworkTypes.length * (homeworkIntensity === 'light' ? 5 : homeworkIntensity === 'extreme' ? 15 : 10)} ta)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
          <div
            className={`w-full max-w-2xl px-6 flex flex-col items-center text-center space-y-4 sm:space-y-6 z-20 my-auto py-2 ${
              isAnimatingUp ? "pointer-events-none" : "animate-fade-in"
            }`}
          >
            {/* Minimalist Hero Branding (ONLY shown in standard lesson mode) */}
            {studioMode === 'lesson' && (
              isHandwritingPromptOpen ? (
                /* Compact Hero Branding when handwriting is open to prevent pushing prompt offscreen */
                <div className="flex items-center justify-center space-x-3 mb-2 animate-fade-in">
                  <BrandLogo
                    isLight={isBoardLight}
                    className="h-9 sm:h-11 max-w-[170px] object-contain cursor-pointer hover:opacity-90 transition-opacity drop-shadow-[0_0_20px_rgba(91,61,245,0.6)]"
                  />
                  <span
                    className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight font-sans select-none flex items-center gap-1.5 ${
                      isBoardLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Teacher <span className="bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent font-black">OS</span>
                  </span>
                </div>
              ) : (
                <div
                  className={`space-y-3.5 transition-all duration-400 ease-out ${
                    isAnimatingUp ? "opacity-0 -translate-y-8 scale-95 pointer-events-none" : "opacity-100 translate-y-0"
                  }`}
                >
                  {/* Outstanding, sleek Brand Lockup aligned with logo */}
                  <div
                    className={`inline-flex items-center justify-center space-x-3.5 px-4 py-1.5 rounded-2xl transition-all duration-300 select-none group mb-1 ${
                      isBoardLight
                        ? "hover:bg-slate-200/50 drop-shadow-[0_0_20px_rgba(91,61,245,0.2)]"
                        : "hover:bg-white/[0.05] drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                    }`}
                    title="TeacherOS"
                  >
                    <BrandLogo
                      isLight={isBoardLight}
                      className="h-12 sm:h-16 md:h-20 max-w-[240px] sm:max-w-[280px] object-contain transition-transform group-hover:scale-105 duration-300 drop-shadow-[0_0_30px_rgba(91,61,245,0.7)]"
                    />
                    <span className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight font-sans flex items-center gap-2 ${
                      isBoardLight ? "text-slate-900" : "text-white"
                    }`}>
                      Teacher <span className="bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent font-black">OS</span>
                    </span>
                  </div>

                  <h1 className={`text-3xl sm:text-4xl md:text-[44px] font-black tracking-tight leading-tight ${
                    isBoardLight ? "text-slate-900" : "text-white"
                  }`}>
                    {t.hero_title}
                  </h1>
                  <p className={`text-sm sm:text-base max-w-lg mx-auto font-medium flex items-center justify-center gap-2 ${
                    isBoardLight ? "text-slate-600" : "text-slate-300/90"
                  }`}>
                    <Sparkles className="w-4 h-4 text-[#a855f7] shrink-0 animate-pulse" />
                    <span>{heroGreeting}</span>
                  </p>
                </div>
              )
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              multiple
              className="hidden"
            />

            {/* The Two Topic Blocks: + Image (Navy Blue) and Others (Navy Orange) - in lesson mode */}
            {studioMode === 'lesson' && (
              <div
                className={`w-full max-w-md mx-auto grid grid-cols-2 gap-3 transition-all duration-300 ease-out ${
                  isAnimatingUp ? "opacity-0 -translate-y-4 scale-95 pointer-events-none" : "opacity-100 translate-y-0"
                }`}
              >
                {/* + Image: Navy Blue with electric cyan glow & 3D Parallax Hover */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-parallax-hover py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0c1f3d] via-[#1e3a8a] to-[#172554] border-2 border-[#38bdf8] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] cursor-pointer backdrop-blur-md"
                >
                  <ImageIcon className="w-5 h-5 text-[#38bdf8] shrink-0" />
                  <span className="tracking-wide">{t.image_btn}</span>
                </button>

                {/* Others: Navy Orange with vibrant amber glow & 3D Parallax Hover */}
                <button
                  type="button"
                  onClick={() => setStudioMode('others_picker')}
                  className="btn-parallax-hover py-3 px-4 rounded-2xl bg-gradient-to-r from-[#361605] via-[#7c2d12] to-[#431407] border-2 border-[#fb923c] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-[0_0_25px_rgba(251,146,60,0.35)] hover:shadow-[0_0_35px_rgba(251,146,60,0.55)] cursor-pointer backdrop-blur-md"
                >
                  <MoreHorizontal className="w-5 h-5 text-[#fb923c] shrink-0" />
                  <span className="tracking-wide">{t.others_btn}</span>
                </button>
              </div>
            )}

            {/* OTHERS PICKER: 3 BLOCKS SCREEN (Photo 4 & 5) */}
            {studioMode === 'others_picker' && (
              <div className="w-full max-w-xl mx-auto space-y-4 animate-fade-in text-left">
                <div className={`flex items-center justify-between pb-2 border-b ${isBoardLight ? "border-slate-300" : "border-white/10"}`}>
                  <span className={`text-xs font-black uppercase tracking-wider flex items-center space-x-2 ${
                    isBoardLight ? "text-slate-800" : "text-slate-300"
                  }`}>
                    <Sparkles className="w-4 h-4 text-[#fb923c]" />
                    <span>{t.others_title}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStudioMode('lesson')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      isBoardLight
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                        : "bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t.others_back_to_lesson}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Block 1: HOMEWORK */}
                  <button
                    type="button"
                    onClick={() => setStudioMode('homework')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#064e3b]/90 to-[#022c22]/90 border-2 border-[#10b981] hover:border-[#34d399] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-emerald-200">
                        {t.others_hw_title}
                      </h3>
                      <p className="text-[11px] text-emerald-200/70 mt-1 leading-snug">
                        {t.others_hw_desc}
                      </p>
                    </div>
                  </button>

                  {/* Block 2: GROUP QUIZ (Baamboozle) */}
                  <button
                    type="button"
                    onClick={() => setStudioMode('group_quiz')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#312e81]/90 to-[#1e1b4b]/90 border-2 border-[#818cf8] hover:border-[#a5b4fc] shadow-[0_0_20px_rgba(129,140,248,0.3)] hover:shadow-[0_0_30px_rgba(129,140,248,0.5)] hover:scale-105 active:scale-95 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-indigo-200">
                        {t.others_gq_title}
                      </h3>
                      <p className="text-[11px] text-indigo-200/70 mt-1 leading-snug">
                        {t.others_gq_desc}
                      </p>
                    </div>
                  </button>

                  {/* Block 3: LEVEL CHECK */}
                  <button
                    type="button"
                    onClick={() => setStudioMode('level_check')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#78350f]/90 to-[#451a03]/90 border-2 border-[#f59e0b] hover:border-[#fbbf24] shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-200">
                        {t.others_lc_title}
                      </h3>
                      <p className="text-[11px] text-amber-200/70 mt-1 leading-snug">
                        {t.others_lc_desc}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVE MODE FLOATING BADGES (Photo 5) */}
            {studioMode === 'homework' && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-900 border-2 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-fade-in">
                <Home className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black tracking-wide text-emerald-200">{t.mode_badge_homework}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudioMode('others_picker');
                    setHomeworkStep('prompt');
                  }}
                  className="p-1 rounded-md hover:bg-white/20 text-emerald-300 hover:text-white transition-all ml-1 cursor-pointer"
                  title={t.others_title}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {studioMode === 'group_quiz' && (
              <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-950 to-purple-900 border-2 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black tracking-wide text-indigo-200">{t.mode_badge_group_quiz}</span>
                  <button
                    type="button"
                    onClick={() => setStudioMode('others_picker')}
                    className="p-1 rounded-md hover:bg-white/20 text-indigo-300 hover:text-white transition-all ml-1 cursor-pointer"
                    title={t.others_title}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Team Count Selector (2 or 3 Groups) */}
                <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white/10 border border-white/15">
                  <span className="text-[11px] font-bold text-slate-300 px-2">{t.quiz_teams_label}</span>
                  <button
                    type="button"
                    onClick={() => setQuizTeamsCount(2)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      quizTeamsCount === 2
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.quiz_team_2}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizTeamsCount(3)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      quizTeamsCount === 3
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.quiz_team_3}
                  </button>
                </div>
              </div>
            )}

            {studioMode === 'level_check' && (
              <div className="w-full max-w-xl mx-auto space-y-2 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-950 to-orange-900 border-2 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black tracking-wide text-amber-200">{t.mode_badge_level_check}</span>
                    <button
                      type="button"
                      onClick={() => setStudioMode('others_picker')}
                      className="p-1 rounded-md hover:bg-white/20 text-amber-300 hover:text-white transition-all ml-1 cursor-pointer"
                      title={t.others_title}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400">
                    {levelCheckTopics.length} {t.topics_selected_suffix}
                  </span>
                </div>

                {/* Topic Selection Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10">
                  {[
                    "Present Simple",
                    "Past Simple",
                    "Present Perfect",
                    "Future Tenses",
                    "Conditionals",
                    "Passive Voice",
                    "Modal Verbs",
                    "Prepositions"
                  ].map((t) => {
                    const isSelected = levelCheckTopics.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setLevelCheckTopics((prev) =>
                            isSelected ? prev.filter((item) => item !== t) : [...prev, t]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-slate-900 font-black shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prompt Capsule Box - CapCut Slide-Up */}
            <div
              className={`w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl space-y-3.5 focus-within:border-[#5B3DF5] text-left capcut-slide-up ${
                isBoardLight
                  ? "bg-white/95 border-slate-300 shadow-slate-200"
                  : "bg-[#1A1C23]/95 border-white/15"
              } ${
                isAnimatingUp
                  ? "-translate-y-7 scale-[0.97] opacity-0 blur-xs"
                  : "translate-y-0 scale-100 opacity-100 blur-none"
              }`}
            >
              <div className="relative flex items-center space-x-2">
                {/* + button on the left of prompt input */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer border ${
                    isBoardLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300"
                      : "bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/10"
                  }`}
                  title="Rasm yoki PDF yuklash (+)"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Voice recording active wave pill */}
                {isRecording ? (
                  <div className="flex-1 flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center space-x-1">
                      <span className="w-1.5 h-4 bg-red-500 rounded-full animate-wave-1" />
                      <span className="w-1.5 h-6 bg-red-400 rounded-full animate-wave-2" />
                      <span className="w-1.5 h-8 bg-red-500 rounded-full animate-wave-3" />
                      <span className="w-1.5 h-5 bg-red-400 rounded-full animate-wave-4" />
                      <span className="w-1.5 h-3 bg-red-500 rounded-full animate-wave-5" />
                    </div>
                    <span className="text-xs font-bold text-red-400">Tinglamoqda...</span>
                    {recordedInterimText && (
                      <span className="text-xs text-indigo-400 italic truncate max-w-xs">{recordedInterimText}</span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (studioMode === 'homework') {
                          setHomeworkStep('config');
                        } else if (studioMode === 'group_quiz') {
                          setActiveGroupQuizTopic(topicInput || "English Grammar & Vocabulary");
                        } else if (studioMode === 'level_check') {
                          handleGenerate(levelCheckTopics.join(', ') || topicInput || "Level Check");
                        } else {
                          handleGenerate();
                        }
                      }
                    }}
                    placeholder={
                      studioMode === 'homework'
                        ? (appLanguage === 'en' ? "Write detailed homework prompt (e.g. Present Perfect Continuous, focus on for vs since, realistic life contexts)..." : appLanguage === 'ru' ? "Подробная инструкция к заданию (напр., Present Perfect Continuous, акцент на for vs since)..." : "Uyga vazifa uchun batafsil ko'rsatma (masalan: Present Perfect Continuous, for va since farqlari, hayotiy misollar)...")
                        : studioMode === 'group_quiz'
                        ? (appLanguage === 'en' ? "Group quiz topic (e.g. Irregular Verbs, Animals)..." : appLanguage === 'ru' ? "Тема викторины (напр., Неправильные глаголы)..." : "Guruhlar musobaqasi mavzusi (masalan: Irregular Verbs, Animals, Tenses)...")
                        : studioMode === 'level_check'
                        ? (appLanguage === 'en' ? "Additional requirements or topics..." : appLanguage === 'ru' ? "Дополнительные требования или темы..." : "Qo'shimcha talablar yoki mavzular (masalan: 15 ta test, 10 ta ochiq savol)...")
                        : attachedFiles.length > 0
                        ? (appLanguage === 'en' ? "Write instruction based on image (optional)..." : appLanguage === 'ru' ? "Инструкция к изображению (необязательно)..." : "Rasm bo'yicha ko'rsatma yozing (ixtiyoriy)...")
                        : t.prompt_placeholder
                    }
                    className={`w-full bg-transparent text-sm sm:text-base focus:outline-none font-medium px-1 pr-20 ${
                      isBoardLight ? "text-slate-900 placeholder-slate-400" : "text-white placeholder-slate-400"
                    }`}
                    autoFocus
                  />
                )}

                {/* Right actions: Mic & Handwriting Button */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleVoiceRecord}
                    className={`p-1.5 rounded-lg transition-all ${
                      isRecording
                        ? 'bg-red-500/20 text-red-400 animate-pulse'
                        : isBoardLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isRecording ? t.voice_stop_title : t.voice_start_title}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHandwritingPromptOpen(!isHandwritingPromptOpen)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isHandwritingPromptOpen
                        ? 'bg-[#5B3DF5] text-white shadow-md shadow-[#5B3DF5]/40'
                        : isBoardLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isHandwritingPromptOpen ? (appLanguage === 'en' ? "Close handwriting board (✕)" : appLanguage === 'ru' ? "Закрыть доску (✕)" : "Qo'lyozma doskasini yopish (✕)") : t.draw_open_title}
                  >
                    {isHandwritingPromptOpen ? <X className="w-4 h-4 text-white" /> : <PenTool className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Smartboard Handwriting Canvas Panel (Expands downward for stylus / touch input) */}
              {isHandwritingPromptOpen && (
                <div className={`w-full pt-3 pb-1 border-t space-y-3 animate-fade-in ${isBoardLight ? "border-slate-300" : "border-white/10"}`}>
                  {/* Toolbar: Color picker, stroke size, eraser, undo, clear */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-black text-indigo-300 flex items-center space-x-1.5">
                        <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{appLanguage === 'en' ? "SMARTBOARD HANDWRITING CANVAS:" : appLanguage === 'ru' ? "ДОСКА РУКОПИСНОГО ВВОДА:" : "SMARTBOARD QO'LYOZMA DOSKASI:"}</span>
                      </span>

                      {/* Color Palette */}
                      <div className="flex items-center space-x-1 pl-2">
                        {["#FFFFFF", "#38BDF8", "#34D399", "#FBBF24", "#F472B6"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setHandwritingPenColor(c);
                              setHandwritingTool("pen");
                            }}
                            style={{ backgroundColor: c }}
                            className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                              handwritingPenColor === c && handwritingTool === "pen"
                                ? "scale-125 border-white ring-2 ring-indigo-500/50"
                                : "border-black/30 hover:scale-110"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Eraser */}
                      <button
                        type="button"
                        onClick={() => setHandwritingTool(handwritingTool === "eraser" ? "pen" : "eraser")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                          handwritingTool === "eraser"
                            ? "bg-red-500 text-white shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                        title={t.draw_eraser}
                      >
                        <Eraser className="w-3 h-3" />
                        <span>{t.draw_eraser}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Undo & Clear */}
                      <button
                        type="button"
                        onClick={handleHandwritingUndo}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title={appLanguage === 'en' ? "Undo" : appLanguage === 'ru' ? "Отменить" : "Qaytarish (Undo)"}
                      >
                        <Undo className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleHandwritingClear}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-[11px] font-bold transition-all cursor-pointer"
                        title={t.draw_clear}
                      >
                        {t.draw_clear}
                      </button>
                    </div>
                  </div>

                  {/* The Handwriting Canvas (Compact height so all controls fit without scrolling) */}
                  <div className="relative w-full h-32 sm:h-36 rounded-2xl border-2 border-indigo-500/40 bg-[#1e293b] shadow-inner overflow-hidden">
                    <canvas
                      ref={handwritingCanvasRef}
                      onMouseDown={handleHandwritingStartDraw}
                      onMouseMove={handleHandwritingDrawMove}
                      onMouseUp={handleHandwritingEndDraw}
                      onMouseLeave={handleHandwritingEndDraw}
                      onTouchStart={handleHandwritingStartDraw}
                      onTouchMove={handleHandwritingDrawMove}
                      onTouchEnd={handleHandwritingEndDraw}
                      style={{ touchAction: "none" }}
                      className="w-full h-full cursor-crosshair block"
                    />
                    <div className="absolute bottom-2 left-3 pointer-events-none text-[11px] text-slate-400/60 font-mono">
                      💡 {t.draw_hint}
                    </div>
                  </div>
                </div>
              )}

              {/* Attached file chips */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span>OCR Skanerlash Faol: {attachedFiles.length} ta fayl (Darslik / PDF 5 sahifagacha)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-xs text-indigo-200 font-medium"
                      >
                        <span>{f.name.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'} {f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-slate-400 hover:text-red-400 ml-1 font-bold cursor-pointer"
                          title="Olib tashlash"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DARS UZUNLIGI (Lesson Length Selector: Short / Medium / Long) */}
              <div className={`pt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                isBoardLight ? "border-slate-300" : "border-white/10"
              }`}>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[11px] font-bold mr-1 ${isBoardLight ? "text-slate-700" : "text-slate-400"}`}>{t.length_label}</span>
                  
                  <button
                    type="button"
                    onClick={() => setLessonLength("short")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all ${
                      lessonLength === "short"
                        ? "bg-[#5B3DF5] text-white shadow-md"
                        : isBoardLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <span>⚡ {t.length_short}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonLength("medium")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all ${
                      lessonLength === "medium"
                        ? "bg-[#5B3DF5] text-white shadow-md"
                        : isBoardLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <span>🎯 {t.length_medium}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonLength("long")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all ${
                      lessonLength === "long"
                        ? "bg-[#5B3DF5] text-white shadow-md"
                        : isBoardLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <span>🚀 {t.length_long}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Level Pill with clickable Chevron */}
                  <label className={`relative flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border cursor-pointer ${
                    isBoardLight
                      ? "bg-slate-100 border-slate-300 text-slate-800"
                      : "bg-white/5 border-white/10 text-slate-300"
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer appearance-none pr-5 z-10"
                    >
                      {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
                        <option key={lvl} value={lvl} className={isBoardLight ? "bg-white text-slate-900" : "bg-[#1A1C23] text-white"}>
                          {t.level_label} {lvl}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2" />
                  </label>

                  <button
                    onClick={() => {
                      if (studioMode === 'homework') {
                        setHomeworkStep('config');
                      } else if (studioMode === 'group_quiz') {
                        setActiveGroupQuizTopic(topicInput || "English Grammar & Vocabulary");
                      } else if (studioMode === 'level_check') {
                        handleGenerate(levelCheckTopics.join(', ') || topicInput || "Level Check");
                      } else {
                        handleGenerate();
                      }
                    }}
                    disabled={isGenerating}
                    className="h-8 px-4 rounded-xl bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white font-bold flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[11px]">
                      {isGenerating
                        ? t.generating_btn
                        : studioMode === 'homework'
                        ? (appLanguage === 'en' ? "Configure Homework →" : appLanguage === 'ru' ? "Настроить задание →" : "Vazifani Sozlash →")
                        : studioMode === 'group_quiz'
                        ? (appLanguage === 'en' ? "Start Quiz" : appLanguage === 'ru' ? "Начать викторину" : "Musobaqani Boshlash")
                        : studioMode === 'level_check'
                        ? (appLanguage === 'en' ? "Start Diagnostic" : appLanguage === 'ru' ? "Начать тест" : "Sinovni Boshlash")
                        : t.generate_btn}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

        {/* ============================================================ */}
        {/* ACTIVE STUDIO STATE: ZERO-SCROLL INTERACTIVE WHITEBOARD      */}
        {/* ============================================================ */}
        {curriculum && (
          <>
            {/* MAIN PRESENTATION WRAPPER: Left ☰ Column, Slides Board, and Right Toolbar as Flex Siblings */}
            <div className="w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-3 md:p-4 gap-2.5 sm:gap-3 md:gap-4 overflow-hidden">
              {/* 1. LEFT GUTTER: ☰ History & Classrooms Menu Button (Completely separate from the slides block, never overlaps) */}
              {!isFullscreen && (
                <div className="flex flex-col items-center justify-start h-full pt-1.5 sm:pt-2 shrink-0 z-30">
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen((prev) => !prev)}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border shadow-xl backdrop-blur-xl flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105 active:scale-95 cursor-pointer group hover-lift shrink-0 ${
                      isBoardLight
                        ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800 shadow-slate-200"
                        : "bg-[#141724]/95 hover:bg-[#1E2235] border-white/20 hover:border-[#5B3DF5]"
                    }`}
                    title="Menyu va Darslar (☰)"
                  >
                    <div className={`w-5 h-[2px] rounded-full transition-colors ${isBoardLight ? "bg-slate-700 group-hover:bg-slate-900" : "bg-slate-100 group-hover:bg-white"}`} />
                    <div className={`w-5 h-[2px] rounded-full transition-colors ${isBoardLight ? "bg-slate-700 group-hover:bg-slate-900" : "bg-slate-100 group-hover:bg-white"}`} />
                    <div className={`w-5 h-[2px] rounded-full transition-colors ${isBoardLight ? "bg-slate-700 group-hover:bg-slate-900" : "bg-slate-100 group-hover:bg-white"}`} />
                  </button>
                </div>
              )}

              {/* 2. CENTER: Slides Board */}
              <div
                ref={boardRef}
                className={`transition-all duration-200 relative flex flex-col justify-between shadow-2xl ${
                  isFullscreen
                    ? "w-screen h-screen rounded-none p-3 sm:p-5 md:p-6 z-50 fixed inset-0 overflow-hidden"
                    : "flex-1 max-w-6xl 2xl:max-w-7xl h-full max-h-[calc(100vh-4.25rem)] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border overflow-hidden min-w-0"
                } ${
                  isBoardLight
                    ? "bg-white text-slate-900 border-slate-200 board-light"
                    : "bg-[#16181F] text-white border-white/15"
                }`}
              >
                {/* Custom Blank Board (Expands to the size of the whole slides block with Light/Dark mode support) */}
                {isBlankBoardOpen && (
                  <div className={`absolute inset-0 z-50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col justify-between overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 ${
                    isBoardLight ? "bg-[#f8fafc] text-slate-900 border-2 border-slate-300" : "bg-[#12141C] text-white border-2 border-white/10"
                  }`}>
                    {/* Blank Board Top Toolbar */}
                    <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b shrink-0 ${
                      isBoardLight ? "border-slate-200" : "border-white/15"
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center space-x-1.5 shadow-md">
                          <Square className="w-3.5 h-3.5" />
                          <span>BO'SH DOSKA</span>
                        </span>
                        <span className={`text-[11px] font-medium hidden sm:inline ${
                          isBoardLight ? "text-slate-600" : "text-slate-400"
                        }`}>
                          Dars davomida chizmalar saqlanadi
                        </span>
                      </div>

                      {/* Drawing & Shape Tools for Blank Board */}
                      <div className={`flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 rounded-xl border ${
                        isBoardLight ? "bg-white border-slate-300 shadow-sm" : "bg-black/40 border-white/10"
                      }`}>
                        {/* Freehand Pen */}
                        <button
                          onClick={() => setBlankPenTool("pen")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "pen" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="Qalam"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                        </button>

                        {/* Highlighter */}
                        <button
                          onClick={() => setBlankPenTool("highlighter")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "highlighter" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="Marker"
                        >
                          <Highlighter className="w-3.5 h-3.5" />
                        </button>

                        {/* Text note */}
                        <button
                          onClick={() => setBlankPenTool("text")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "text" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="Matn yozish"
                        >
                          <Type className="w-3.5 h-3.5" />
                        </button>

                        {/* Shape Tools */}
                        <div className={`h-4 w-px mx-0.5 ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                        <button
                          onClick={() => setBlankPenTool("rectangle")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "rectangle" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="To'rtburchak (Rectangle)"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setBlankPenTool("circle")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "circle" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="Aylana (Circle)"
                        >
                          <Circle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setBlankPenTool("triangle")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "triangle" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="Uchburchak (Triangle)"
                        >
                          <Triangle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setBlankPenTool("line")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "line" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="To'g'ri chiziq (Line)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setBlankPenTool("arrow")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "arrow" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="Strelka (Arrow)"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Eraser */}
                        <div className={`h-4 w-px mx-0.5 ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                        <button
                          onClick={() => setBlankPenTool("eraser")}
                          className={`p-1.5 rounded-lg transition-all ${
                            blankPenTool === "eraser" ? "bg-[#5B3DF5] text-white shadow-sm" : isBoardLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                          }`}
                          title="O'chirg'ich"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                        </button>

                        <div className={`h-4 w-px mx-0.5 ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                        {/* Colors */}
                        <div className="flex items-center space-x-1">
                          {["#1e293b", "#ef4444", "#f59e0b", "#10b981", "#5B3DF5", "#0ea5e9"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setBlankPenColor(color)}
                              className={`w-4 h-4 rounded-full border transition-transform ${
                                blankPenColor === color ? "scale-125 border-white ring-2 ring-[#5B3DF5]" : "border-black/30"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <div className={`h-4 w-px mx-0.5 ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                        {/* Undo */}
                        <button
                          onClick={handleBlankUndo}
                          className={`p-1.5 rounded-lg transition-all ${
                            isBoardLight ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" : "hover:bg-white/10 text-slate-400 hover:text-white"
                          }`}
                          title="Undo"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Clear */}
                        <button
                          onClick={handleBlankClear}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 hover:text-rose-600"
                          title="Tozalash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Right toolbar controls: Sun/Moon toggle & Close Button "X" */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsBoardLight((prev) => !prev);
                            showToast(isBoardLight ? "🌙 To'q doska yoqildi" : "☀️ Katakli daftar (Light Mode) yoqildi");
                          }}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer border ${
                            isBoardLight
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                              : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/15"
                          }`}
                          title={isBoardLight ? "To'q doskaga o'tish (Dark)" : "Katakli daftar yorug' rejimiga o'tish (Light)"}
                        >
                          {isBoardLight ? <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
                          <span className="hidden sm:inline">{isBoardLight ? "Katakli Daftar" : "Doska"}</span>
                        </button>

                        <button
                          onClick={() => {
                            saveBlankCanvas();
                            setIsBlankBoardOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer border ${
                            isBoardLight
                              ? "bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300"
                              : "bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30"
                          }`}
                          title="Slaydga qaytish"
                        >
                          <span>Slaydga Qaytish</span>
                          <X className="w-4 h-4 font-black" />
                        </button>
                      </div>
                    </div>

                    {/* Blank Canvas Area - School Copybook Checked / Squared Notebook Grid (Katakli Daftar) */}
                    <div className={`relative flex-1 min-h-0 w-full my-2 rounded-2xl border overflow-hidden cursor-crosshair ${
                      isBoardLight ? "copybook-grid-light border-blue-200/70 shadow-inner" : "copybook-grid-dark border-white/15 shadow-inner"
                    }`}>
                      <canvas
                        ref={blankCanvasRef}
                        onMouseDown={handleBlankStartDraw}
                        onMouseMove={handleBlankDrawMove}
                        onMouseUp={handleBlankEndDraw}
                        onMouseLeave={handleBlankEndDraw}
                        onTouchStart={handleBlankStartDraw}
                        onTouchMove={handleBlankDrawMove}
                        onTouchEnd={handleBlankEndDraw}
                        className="absolute inset-0 w-full h-full"
                      />

                      {/* Floating text input on blank board */}
                      {blankTextInputPos && (
                        <div
                          style={{
                            left: Math.max(10, Math.min(blankTextInputPos.x, (blankCanvasRef.current?.clientWidth || 800) - 220)),
                            top: Math.max(10, Math.min(blankTextInputPos.y, (blankCanvasRef.current?.clientHeight || 600) - 60))
                          }}
                          className={`absolute z-40 p-2 rounded-xl border shadow-2xl flex items-center space-x-2 ${
                            isBoardLight ? "bg-white border-[#5B3DF5]" : "bg-[#16181F] border-[#5B3DF5]"
                          }`}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={blankTypedText}
                            onChange={(e) => setBlankTypedText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleBlankAddText();
                              if (e.key === "Escape") setBlankTextInputPos(null);
                            }}
                            placeholder="Matn yozing..."
                            className={`border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#5B3DF5] w-48 font-bold ${
                              isBoardLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/50 border-white/20 text-white"
                            }`}
                          />
                          <button
                            onClick={handleBlankAddText}
                            className="p-1.5 rounded-lg bg-[#5B3DF5] text-white hover:bg-[#4C2FE0] text-xs font-bold"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBlankTextInputPos(null)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Blank Board Footer Note */}
                    <div className={`flex items-center justify-between text-[11px] pt-1 shrink-0 ${
                      isBoardLight ? "text-slate-500" : "text-slate-500"
                    }`}>
                      <span>Chizmalar dars yakunlangunga qadar saqlanib turadi.</span>
                      <button
                        type="button"
                        onClick={() => {
                          saveBlankCanvas();
                          setIsBlankBoardOpen(false);
                        }}
                        className="text-[#5B3DF5] hover:text-[#4C2FE0] font-bold transition-colors cursor-pointer"
                      >
                        ✕ Yopish va slaydga o'tish
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Whiteboard Top Header Bar */}
                <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full bg-[#5B3DF5] text-white shadow-sm flex items-center space-x-1.5">
                      {activeCategory?.icon && <activeCategory.icon className="w-3.5 h-3.5" />}
                      <span>{activeCategory?.title || "DOSKA"}</span>
                    </span>

                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${isBoardLight ? "bg-slate-100 text-slate-800 border border-slate-300 font-bold" : "bg-white/10 text-slate-300"}`}>
                      {activeScreen ? `${activeScreen.subIndex + 1} / ${activeScreen.total}` : "1 / 5"}
                    </span>

                    {/* + Add More Item Button */}
                    <button
                      onClick={handleAddMoreItem}
                      disabled={isAddingItem}
                      className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center space-x-1 shadow-md transition-all hover-lift disabled:opacity-50"
                      title={appLanguage === 'en' ? "Add another question or item (+)" : appLanguage === 'ru' ? "Добавить элемент (+)" : "Yana bitta savol yoki element qo'shish (+)"}
                    >
                      {isAddingItem ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span className="hidden sm:inline text-[11px] font-bold">
                        {isAddingItem
                          ? (appLanguage === 'en' ? "Adding..." : appLanguage === 'ru' ? "Добавление..." : "Qo'shilmoqda...")
                          : (appLanguage === 'en' ? "Add" : appLanguage === 'ru' ? "Добавить" : "Qo'shish")}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Audio Speaker */}
                    <button
                      onClick={() => {
                        if (activeScreen?.type === "slide") speak(activeScreen.data.title);
                        else if (activeScreen?.type === "quickQuestion") speak(activeScreen.data.q);
                        else if (activeScreen?.type === "test") speak(activeScreen.data.q);
                        else if (activeScreen?.type === "vocab") speak(activeScreen.data.word);
                        else if (activeScreen?.type === "dialog") speak(activeScreen.data.text);
                        else if (activeScreen?.type === "errorHunt") speak(activeScreen.data.sentence);
                      }}
                      className="p-1.5 sm:p-2 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 transition-all shadow-sm hover-lift"
                      title={t.board_audio}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Pen / Annotation Tool Toggle */}
                    <button
                      onClick={() => setIsAnnotating((prev) => !prev)}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm hover-lift ${
                        isAnnotating
                          ? "bg-[#5B3DF5] text-white ring-2 ring-[#5B3DF5]/50 scale-105"
                          : isBoardLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title={isAnnotating ? (appLanguage === 'en' ? "Close Pen" : appLanguage === 'ru' ? "Закрыть перо" : "Qalam rejimini yopish") : t.board_draw}
                    >
                      <PenTool className="w-4 h-4" />
                    </button>

                    {/* Blank Board Icon Button */}
                    <button
                      type="button"
                      onClick={() => setIsBlankBoardOpen((prev) => !prev)}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm hover-lift ${
                        isBlankBoardOpen
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-500/50 scale-105"
                          : isBoardLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title={isBlankBoardOpen ? (appLanguage === 'en' ? "Back to slide" : appLanguage === 'ru' ? "Назад к слайду" : "Slaydga qaytish") : (appLanguage === 'en' ? "Blank Board" : appLanguage === 'ru' ? "Чистая доска" : "Bo'sh doska")}
                    >
                      <Square className="w-4 h-4" />
                    </button>

                    {/* Dark/Light toggle */}
                    <button
                      onClick={() => setIsBoardLight((prev) => !prev)}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm hover-lift ${
                        isBoardLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 hover:bg-white/20 text-amber-300"
                      }`}
                      title={isBoardLight ? t.settings_theme_dark : t.settings_theme_light}
                    >
                      {isBoardLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>

                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm hover-lift ${
                        isBoardLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title={isFullscreen ? (appLanguage === 'en' ? "Exit (Esc)" : appLanguage === 'ru' ? "Выйти (Esc)" : "Chiqish (Esc)") : t.board_fullscreen}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Whiteboard Center Interactive Stage */}
                <div className="flex-1 min-h-0 overflow-y-auto my-1.5 sm:my-2 px-1 relative custom-scrollbar flex flex-col">
                  {/* Floating Whiteboard Annotation Toolbar (Full Light & Dark mode support + hover-lift) */}
                  {isAnnotating && (
                    <div className={`absolute top-1 left-1/2 -translate-x-1/2 z-40 backdrop-blur-xl border px-3 py-2 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 ${
                      isBoardLight
                        ? "bg-white/95 border-slate-300 text-slate-800 shadow-xl shadow-slate-300/40"
                        : "bg-[#16181F]/95 border-white/20 text-white shadow-2xl"
                    }`}>
                      {/* Pen */}
                      <button
                        onClick={() => setPenTool("pen")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "pen"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Qalam (Pen)"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>

                      {/* Highlighter */}
                      <button
                        onClick={() => setPenTool("highlighter")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "highlighter"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Marker (Highlighter)"
                      >
                        <Highlighter className="w-4 h-4" />
                      </button>

                      {/* Text Note */}
                      <button
                        onClick={() => setPenTool("text")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "text"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Matn yozish (Doskaga bosing)"
                      >
                        <Type className="w-4 h-4" />
                      </button>

                      {/* Shapes */}
                      <button
                        onClick={() => setPenTool("rectangle")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "rectangle"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="To'rtburchak (Rectangle)"
                      >
                        <Square className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPenTool("circle")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "circle"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Aylana (Circle)"
                      >
                        <Circle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPenTool("triangle")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "triangle"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Uchburchak (Triangle)"
                      >
                        <Triangle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPenTool("line")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "line"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Chiziq (Line)"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPenTool("arrow")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "arrow"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Strelka (Arrow)"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      {/* Eraser */}
                      <button
                        onClick={() => setPenTool("eraser")}
                        className={`p-2 rounded-xl transition-all hover-lift ${
                          penTool === "eraser"
                            ? "bg-[#5B3DF5] text-white shadow-md scale-105"
                            : isBoardLight
                            ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="O'chirg'ich (Eraser)"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>

                      <div className={`h-5 w-[1px] my-auto ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                      {/* Color Palette */}
                      <div className="flex items-center space-x-1.5">
                        {[
                          { color: "#ef4444", name: "Qizil" },
                          { color: "#f59e0b", name: "Sariq" },
                          { color: "#10b981", name: "Yashil" },
                          { color: "#5B3DF5", name: "Binafsha" },
                          { color: "#0ea5e9", name: "Ko'k" },
                          { color: isBoardLight ? "#0f172a" : "#ffffff", name: isBoardLight ? "Qora" : "Oq" }
                        ].map((c) => (
                          <button
                            key={c.color}
                            onClick={() => setPenColor(c.color)}
                            className={`w-5 h-5 rounded-full border-2 transition-transform hover-lift ${
                              penColor === c.color
                                ? isBoardLight
                                  ? "scale-125 border-slate-900 ring-2 ring-[#5B3DF5]"
                                  : "scale-125 border-white ring-2 ring-[#5B3DF5]"
                                : isBoardLight
                                ? "border-slate-300 hover:scale-110"
                                : "border-white/30 hover:scale-110"
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>

                      <div className={`h-5 w-[1px] my-auto ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                      {/* Stroke Sizes */}
                      <div className="flex items-center space-x-1">
                        {[
                          { size: 2, label: "2px" },
                          { size: 4, label: "4px" },
                          { size: 8, label: "8px" }
                        ].map((s) => (
                          <button
                            key={s.size}
                            onClick={() => setPenSize(s.size)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all hover-lift ${
                              penSize === s.size
                                ? "bg-[#5B3DF5] text-white font-bold shadow-sm"
                                : isBoardLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      <div className={`h-5 w-[1px] my-auto ${isBoardLight ? "bg-slate-300" : "bg-white/20"}`} />

                      {/* Undo */}
                      <button
                        onClick={handleUndo}
                        className={`p-1.5 rounded-lg transition-all hover-lift ${
                          isBoardLight ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" : "hover:bg-white/10 text-slate-300 hover:text-white"
                        }`}
                        title="Bekor qilish (Undo)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Clear Canvas */}
                      <button
                        onClick={handleClearCanvas}
                        className={`p-1.5 rounded-lg transition-all hover-lift ${
                          isBoardLight ? "hover:bg-rose-100 text-rose-600" : "hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                        }`}
                        title="Barchasini tozalash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Close */}
                      <button
                        onClick={() => setIsAnnotating(false)}
                        className={`p-1.5 rounded-lg transition-all hover-lift ${
                          isBoardLight ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" : "hover:bg-white/10 text-slate-400 hover:text-white"
                        }`}
                        title="Yopish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Interactive Transparent Whiteboard Canvas Overlay */}
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleDrawMove}
                    onMouseUp={handleEndDraw}
                    onMouseLeave={handleEndDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleDrawMove}
                    onTouchEnd={handleEndDraw}
                    className={`absolute inset-0 z-30 ${
                      isAnnotating ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
                    }`}
                  />

                  {/* Floating Inline Text Input for Canvas */}
                  {isAnnotating && textInputPos && (
                    <div
                      style={{
                        left: Math.max(10, Math.min(textInputPos.x, (canvasRef.current?.clientWidth || 800) - 220)),
                        top: Math.max(10, Math.min(textInputPos.y, (canvasRef.current?.clientHeight || 600) - 60))
                      }}
                      className="absolute z-40 bg-[#16181F] p-2.5 rounded-xl border border-[#5B3DF5] shadow-2xl flex items-center space-x-2 animate-in fade-in zoom-in-95"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={typedAnnotationText}
                        onChange={(e) => setTypedAnnotationText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTextAnnotation();
                          if (e.key === "Escape") setTextInputPos(null);
                        }}
                        placeholder="Izoh yozing..."
                        className="bg-black/50 border border-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#5B3DF5] w-48 font-bold"
                      />
                      <button
                        onClick={handleAddTextAnnotation}
                        className="p-1.5 rounded-lg bg-[#5B3DF5] text-white hover:bg-[#4C2FE0] text-xs font-bold"
                        title="Joylash"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTextInputPos(null)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
                        title="Bekor qilish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Content Container (Centers when small, scrolls from top when tall) */}
                  <div className="my-auto w-full py-1">
                    {/* ======================================================== */}
                    {/* SCREEN TYPE 1: THEORY / INTERACTIVE BOARD SLIDES         */}
                    {/* ======================================================== */}
                    {activeScreen?.type === "slide" && (
                    <div className="flex flex-col justify-between py-0.5 space-y-1.5">
                      <div className="text-center space-y-0.5 shrink-0">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${
                          isBoardLight
                            ? "bg-indigo-100 text-indigo-900 border-indigo-200 font-black"
                            : "bg-indigo-500/15 text-indigo-400 border-indigo-500/20"
                        }`}>
                          {activeScreen.data.tag || "NAZARIYA & STRUKTURA"}
                        </span>

                        <div className="flex items-center justify-center space-x-2">
                          <h2 className={`text-base sm:text-lg md:text-xl font-black tracking-tight ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                            {activeScreen.data.title}
                          </h2>
                          <button
                            type="button"
                            onClick={() => speak(activeScreen.data.title)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                            title="Tinglash"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Area: Unified Pedagogical Card + Interactive Diagram */}
                      {(() => {
                        let visualToRender = activeScreen.data.visual;
                        if (!visualToRender && activeScreen.data.body) {
                          // Try to extract an example sentence from <i>'...'</i> or <i>"..."</i> or <i>...</i>
                          const match = activeScreen.data.body.match(/<i>['"]?([^<'"]+)['"]?<\/i>/);
                          if (match && match[1] && match[1].length > 5) {
                            const words = match[1].trim().split(" ");
                            visualToRender = {
                              type: "sentence_anatomy",
                              title: "Interaktiv Gap Tahlili",
                              subtitle: "Namunaviy jumla bo'laklari (har birini bosing)",
                              data: {
                                sentence: match[1],
                                translation: "Darsdagi namunaviy jumla",
                                rule: activeScreen.data.title || "Grammatik andoza",
                                tokens: words.map((w: string, idx: number) => ({
                                  text: w,
                                  role: idx === 0 ? "Ega (Subject)" : idx === 1 ? "Fe'l Strukturasi" : idx === words.length - 1 ? "Vaqt / O'rin Holi" : "To'ldiruvchi",
                                  color: idx === 0 ? "indigo" : idx === 1 ? "purple" : idx === words.length - 1 ? "amber" : "emerald",
                                  note: idx === 0 ? "Gapning bosh bo'lagi" : idx === 1 ? "Qoidaga mos fe'l shakli" : "Gap mazmunini to'ldiruvchi bo'lak"
                                }))
                              }
                            };
                          }
                        }

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                            {/* Left: Rule & Pedagogical Explanation */}
                            <div className={`${visualToRender ? "lg:col-span-6" : "lg:col-span-12 max-w-4xl mx-auto"} flex flex-col justify-center px-1`}>
                              <div className={`rounded-xl p-3 sm:p-4 border shadow-md max-h-[340px] overflow-y-auto custom-scrollbar ${
                                isBoardLight
                                  ? "bg-slate-50 border-slate-200 text-slate-800"
                                  : "bg-[#121624]/90 backdrop-blur-xl border-white/10 text-slate-200"
                              }`}>
                                <div
                                  className="slide-visual-card !p-0 !bg-transparent !border-0 text-xs sm:text-[13px] leading-relaxed space-y-2"
                                  dangerouslySetInnerHTML={{ __html: sanitizeSlideBody(activeScreen.data.body, isBoardLight) }}
                                />
                              </div>
                            </div>

                            {/* Right: Interactive Visual Diagram */}
                            {visualToRender && (
                              <div className="lg:col-span-6 flex flex-col justify-center relative group/visual">
                                <button
                                  type="button"
                                  onClick={() => setExpandedVisual(visualToRender)}
                                  className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-black/60 hover:bg-[#5B3DF5] text-white/80 hover:text-white transition-all shadow-md backdrop-blur-md border border-white/10 hover:border-[#5B3DF5] cursor-pointer"
                                  title="Katta ekranda ko'rish (Fullscreen)"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <VisualDiagram diagram={visualToRender} onSpeak={speak} isLight={isBoardLight} />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 2: QUICK QUESTIONS (Tezkor Savol)            */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "quickQuestion" && (() => {
                    const qqId = activeScreen.data.id || String(activeScreen.subIndex);
                    const qqText = activeScreen.data.q || activeScreen.data.question || "Savol?";
                    const qqOpts = activeScreen.data.opts || activeScreen.data.options || [];
                    const qqAns = activeScreen.data.ans || activeScreen.data.correct || "";
                    const qqExpl = activeScreen.data.expl || activeScreen.data.explanation || "";

                    return (
                      <div className="flex flex-col justify-center max-w-3xl mx-auto w-full py-2 space-y-4 text-center">
                        <div className="space-y-1.5">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-flex items-center space-x-1">
                            <Zap className="w-3.5 h-3.5 fill-amber-400" />
                            <span>Tezkor Savol ({activeScreen.subIndex + 1}/{activeScreen.total})</span>
                          </span>
                          <h2 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-2 ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                            {qqText}
                          </h2>
                        </div>

                        {/* Interactive Options */}
                        {qqOpts && qqOpts.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                            {qqOpts.map((opt, oIdx) => {
                              const isChosen = selectedQuickOptions[qqId] === opt;
                              const normS = (s: string) => (s || "").replace(/^[A-Da-d][\).\s]+/, "").trim().toLowerCase();
                              const optLetter = ["A", "B", "C", "D"][oIdx];
                              const cleanAns = (qqAns || "").trim();
                              const isCorrect =
                                opt.trim().toLowerCase() === cleanAns.toLowerCase() ||
                                normS(opt) === normS(cleanAns) ||
                                cleanAns.toUpperCase().startsWith(optLetter) ||
                                cleanAns.toUpperCase() === optLetter ||
                                (cleanAns.length > 2 && opt.trim().toLowerCase().includes(cleanAns.toLowerCase())) ||
                                (opt.length > 2 && cleanAns.toLowerCase().includes(opt.trim().toLowerCase()));

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => {
                                    setSelectedQuickOptions((prev) => ({ ...prev, [qqId]: opt }));
                                    setRevealedQuickAnswers((prev) => ({ ...prev, [qqId]: true }));
                                    if (isCorrect) {
                                      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                                    }
                                  }}
                                  className={`p-3.5 sm:p-4 rounded-2xl font-black text-sm transition-all border-b-4 flex items-center justify-between ${
                                    isChosen
                                      ? isCorrect
                                        ? "bg-emerald-600 border-emerald-800 text-white scale-102 ring-4 ring-emerald-400/40"
                                        : "bg-rose-600 border-rose-800 text-white scale-102 ring-4 ring-rose-400/40"
                                      : isBoardLight
                                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                                      : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isChosen && (
                                    <span
                                      className={`quiz-answer-badge w-7 h-7 rounded-full flex items-center justify-center font-black shadow-md shrink-0 ${
                                        isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                      }`}
                                    >
                                      {isCorrect ? (
                                        <Check className="w-4 h-4 stroke-[3.5] text-white" style={{ stroke: "#ffffff" }} />
                                      ) : (
                                        <X className="w-4 h-4 stroke-[3.5] text-white" style={{ stroke: "#ffffff" }} />
                                      )}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}

                        {/* Click-to-Reveal Answer Toggle */}
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setRevealedQuickAnswers((prev) => ({ ...prev, [qqId]: !prev[qqId] }));
                              if (!revealedQuickAnswers[qqId]) {
                                confetti({ particleCount: 50, spread: 50 });
                              }
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center space-x-2 transition-all shadow-lg active:scale-95"
                          >
                            {revealedQuickAnswers[qqId] ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                <span>Javobni Yashirish</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                <span>💡 Javobni Ko'rsatish</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Revealed Answer Box */}
                        {revealedQuickAnswers[qqId] && (
                          <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold animate-fade-in ${
                            isBoardLight ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          }`}>
                            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mb-1">
                              ✅ To'g'ri Javob: {qqAns}
                            </div>
                            <p className="opacity-90">{qqExpl}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 3: ACTUAL TESTS (Asosiy Testlar)             */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "test" && (
                    <div className="flex flex-col justify-center max-w-4xl mx-auto w-full py-1 space-y-3.5">
                      <div className="text-center space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                          🎯 Test Savoli ({activeScreen.subIndex + 1}/{activeScreen.total})
                        </span>
                        <h2 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-1.5 ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                          {activeScreen.data.q}
                        </h2>
                      </div>

                      {/* 4 Clean A/B/C/D Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {activeScreen.data.opts.map((opt, oIdx) => {
                          const theme = OPTION_THEMES[oIdx % OPTION_THEMES.length];
                          const selectedOpt = studentQuizAnswers[activeScreen.subIndex];
                          const isChosen = selectedOpt === opt;
                          const normS = (s: string) => (s || "").replace(/^[A-Da-d][\).\s]+/, "").trim().toLowerCase();
                          const optLetter = ["A", "B", "C", "D"][oIdx];
                          const cleanAns = (activeScreen.data.ans || "").trim();
                          const isCorrect =
                            opt.trim().toLowerCase() === cleanAns.toLowerCase() ||
                            normS(opt) === normS(cleanAns) ||
                            cleanAns.toUpperCase().startsWith(optLetter) ||
                            cleanAns.toUpperCase() === optLetter ||
                            (cleanAns.length > 2 && opt.trim().toLowerCase().includes(cleanAns.toLowerCase())) ||
                            (opt.length > 2 && cleanAns.toLowerCase().includes(opt.trim().toLowerCase()));

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                setStudentQuizAnswers((prev) => ({ ...prev, [activeScreen.subIndex]: opt }));
                                if (isCorrect) {
                                  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                                }
                              }}
                              className={`p-3.5 sm:p-4 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-between transition-all duration-150 ${theme.bg} border-b-4 ${theme.border} shadow-md ${
                                isChosen
                                  ? `scale-102 ring-4 ${theme.ring} brightness-110 -translate-y-0.5`
                                  : "hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0"
                              }`}
                            >
                              <div className="flex items-center space-x-3 text-left">
                                <span className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-black text-sm text-white shrink-0">
                                  {theme.letter}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {/* Chosen option indicator: Green check or Red cross */}
                              {isChosen && (
                                <span
                                  className={`quiz-answer-badge w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shrink-0 ring-2 ring-white/90 animate-in zoom-in-75 duration-150 ${
                                    isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <Check className="w-5 h-5 stroke-[3.5] text-white" style={{ stroke: "#ffffff" }} />
                                  ) : (
                                    <X className="w-5 h-5 stroke-[3.5] text-white" style={{ stroke: "#ffffff" }} />
                                  )}
                                </span>
                              )}

                              {/* If user answered incorrectly, also show the green tick on the correct answer */}
                              {!isChosen && isCorrect && selectedOpt && (
                                <span
                                  className="quiz-answer-badge w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shrink-0 ring-2 ring-white/90 animate-in zoom-in-75 duration-150"
                                  title="To'g'ri javob"
                                >
                                  <Check className="w-5 h-5 stroke-[3.5] text-white" style={{ stroke: "#ffffff" }} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {studentQuizAnswers[activeScreen.subIndex] && (
                        <div className={`p-3 rounded-xl border text-xs font-bold text-center animate-fade-in font-mono ${
                          isBoardLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-black/30 border-white/10 text-slate-300"
                        }`}>
                          💡 <b>Izoh:</b> {activeScreen.data.expl}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 4: VOCABULARY (3D Interactive Flashcard)     */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "vocab" && (
                    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full py-1">
                      <div
                        onClick={() =>
                          setFlippedCards((prev) => ({
                            ...prev,
                            [activeScreen.subIndex]: !prev[activeScreen.subIndex]
                          }))
                        }
                        className="perspective-1000 w-full min-h-[320px] sm:min-h-[360px] cursor-pointer group"
                      >
                        <div
                          className={`w-full h-full relative transition-transform duration-500 transform-style-3d rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl border ${
                            isBoardLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#18191E] border-white/15 text-white"
                          } ${flippedCards[activeScreen.subIndex] ? "rotate-y-180" : ""}`}
                        >
                          {/* Front of Card */}
                          <div className="backface-hidden flex flex-col justify-between h-full space-y-3">
                            {/* Top Bar: Part of Speech + Card Number */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-[#E8DEFF] text-[#5B3DF5]">
                                {activeScreen.data.pos || "WORD"}
                              </span>
                              <span className="text-xs font-bold text-slate-400 font-mono">
                                {activeScreen.subIndex + 1} / {activeScreen.total}
                              </span>
                            </div>

                            {/* Center: Large English Word & Audio */}
                            <div className="text-center py-1 flex flex-col items-center space-y-2">
                              <div className="flex items-center justify-center space-x-3">
                                <h3 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                                  {activeScreen.data.word}
                                </h3>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speak(activeScreen.data.word);
                                  }}
                                  className="p-2 rounded-xl bg-[#5B3DF5] text-white hover:bg-[#4C2FE0] shadow-md transition-transform active:scale-95"
                                  title="Talaffuzni tinglash"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-xs font-medium text-slate-400">
                                O'quvchi ma'nosini eslay olasizmi? O'ylang...
                              </p>

                              {/* Interactive Pedagogical Hint Button */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVocabHintOpen((prev) => ({
                                      ...prev,
                                      [activeScreen.subIndex]: !prev[activeScreen.subIndex]
                                    }));
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-sm ${
                                    vocabHintOpen[activeScreen.subIndex]
                                      ? "bg-amber-400 text-slate-950 font-bold"
                                      : "bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30"
                                  }`}
                                >
                                  <Lightbulb className="w-3.5 h-3.5" />
                                  <span>{vocabHintOpen[activeScreen.subIndex] ? "Maslahatni yopish" : "💡 Yordamchi Maslahat (Hint)"}</span>
                                </button>
                              </div>

                              {/* Expanded Pedagogical Hint Box (Wise words / Mnemonic hint) */}
                              {vocabHintOpen[activeScreen.subIndex] && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className={`w-full max-w-sm mt-1 p-3.5 rounded-2xl border shadow-xl text-left space-y-2 animate-in fade-in zoom-in-95 duration-200 ${
                                    isBoardLight
                                      ? "bg-amber-50/95 border-amber-300 text-amber-950 font-bold"
                                      : "bg-slate-900/95 border-amber-500/40 text-amber-200 font-medium"
                                  }`}
                                >
                                  <div className="flex items-start space-x-2">
                                    <span className="text-amber-500 text-sm mt-0.5 shrink-0">💡</span>
                                    <p className={`text-xs font-bold leading-relaxed ${isBoardLight ? "text-amber-950" : "text-amber-200"}`}>
                                      {getSmartVocabHint(
                                        activeScreen.data.word,
                                        activeScreen.data.pos,
                                        activeScreen.data.uz,
                                        activeScreen.data.hint
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Bottom Card Controls */}
                            <div className={`flex items-center justify-between pt-2 border-t ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
                              <span className="text-[11px] font-bold text-slate-400">
                                Javobni ko'rish uchun bosing ↻
                              </span>

                              <span className="text-xs font-black text-indigo-400 flex items-center space-x-1">
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Flip</span>
                              </span>
                            </div>
                          </div>

                          {/* Back of Card (Uzbek Translation & Context) */}
                          <div className="backface-hidden rotate-y-180 absolute inset-0 p-6 sm:p-7 flex flex-col justify-between h-full bg-[#5B3DF5] rounded-3xl text-white shadow-2xl">
                            <div>
                              <span className="text-xs font-black text-[#E8DEFF] uppercase tracking-wider">O'ZBEKCHA MA'NOSI:</span>
                              <h4 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                                {activeScreen.data.uz}
                              </h4>
                            </div>

                            <div className="border-t border-white/20 pt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-[#E8DEFF]">Misol gap:</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speak(activeScreen.data.ex);
                                  }}
                                  className="p-1 text-[#E8DEFF] hover:text-white"
                                  title="Tinglash"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-white font-bold italic font-mono">
                                "{activeScreen.data.ex}"
                              </p>
                            </div>

                            <div className="text-right text-xs font-black text-[#E8DEFF]">
                              Ortga o'girish ↺
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 5: DIALOG BUILDER (Muloqot Simulatori)       */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "dialog" && (
                    <div className="flex flex-col justify-center max-w-3xl mx-auto w-full py-2 space-y-3.5">
                      <div className="text-center space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full border border-sky-400/20 inline-flex items-center space-x-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Muloqot Bosqichi ({activeScreen.subIndex + 1}/{activeScreen.total})</span>
                        </span>
                      </div>

                      {/* Speaker Bubble */}
                      <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex items-start space-x-3.5 text-left ${
                        isBoardLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-800/80 border-slate-700/80 text-white"
                      }`}>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md">
                          {activeScreen.data.speaker[0] || "T"}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-sky-500">{activeScreen.data.speaker}</span>
                            <button
                              onClick={() => speak(activeScreen.data.text)}
                              className="p-1 rounded-lg hover:bg-black/10 text-slate-400 hover:text-slate-600 dark:hover:bg-white/10 dark:text-slate-300"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className={`text-base sm:text-lg font-black ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                            "{activeScreen.data.text}"
                          </p>
                          {activeScreen.data.uz && (
                            <p className="text-xs font-bold text-slate-500 italic">
                              Tarjimasi: {activeScreen.data.uz}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* User Choices to Respond */}
                      {activeScreen.data.userOptions && activeScreen.data.userOptions.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-slate-400 block text-center">
                            Sizning javobingizni tanlang:
                          </span>
                          <div className="grid grid-cols-1 gap-2.5">
                            {activeScreen.data.userOptions.map((opt, oIdx) => {
                              const isChosen = dialogAnswers[activeScreen.data.id || String(activeScreen.subIndex)] === opt;
                              const isCorrect = opt === activeScreen.data.correctOption;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => {
                                    setDialogAnswers((prev) => ({
                                      ...prev,
                                      [activeScreen.data.id || String(activeScreen.subIndex)]: opt
                                    }));
                                    if (isCorrect) {
                                      confetti({ particleCount: 70, spread: 60 });
                                    }
                                  }}
                                  className={`p-3.5 rounded-2xl text-left text-sm font-black transition-all border-b-2 flex items-center justify-between ${
                                    isChosen
                                      ? isCorrect
                                        ? "bg-emerald-600 border-emerald-800 text-white"
                                        : "bg-rose-600 border-rose-800 text-white"
                                      : isBoardLight
                                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"
                                      : "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isChosen && (
                                    <span className="flex items-center space-x-1.5 font-black text-xs sm:text-sm shrink-0">
                                      {isCorrect ? (
                                        <>
                                          <Check className="w-4 h-4 stroke-[3.5] text-white" />
                                          <span>To'g'ri</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4 stroke-[3.5] text-white" />
                                          <span>Qayta urinib ko'ring</span>
                                        </>
                                      )}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 6: ERROR HUNT (Xato Ovchisi)                  */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "errorHunt" && (() => {
                    const itemKey = activeScreen.data.id || String(activeScreen.subIndex);
                    const isFound = !!errorHuntFound[itemKey];
                    const rawErrorWord = (activeScreen.data.errorWord || "").toLowerCase().trim();
                    const cleanTarget = rawErrorWord.replace(/[^a-zA-Z0-9']/g, "").trim();
                    const errorTokens = rawErrorWord
                      .split(/\s+/)
                      .map((w: string) => w.replace(/[^a-zA-Z0-9']/g, "").trim())
                      .filter(Boolean);

                    return (
                      <div className="flex flex-col justify-center max-w-3xl mx-auto w-full py-2 space-y-4 text-center">
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20 inline-flex items-center space-x-1">
                            <Search className="w-3.5 h-3.5" />
                            <span>Xato Ovchisi ({activeScreen.subIndex + 1}/{activeScreen.total})</span>
                          </span>
                          <p className="text-xs font-bold text-slate-400 mt-1">
                            Quyidagi gapda o'zbek o'quvchilari uchun xos bo'lgan grammatik xato bor. Xato so'zni bosing!
                          </p>
                        </div>

                        {/* Interactive Sentence Word Tokens */}
                        <div className={`flex flex-wrap items-center justify-center gap-2.5 p-6 rounded-3xl border shadow-2xl ${
                          isBoardLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/80 border-slate-700/80"
                        }`}>
                          {activeScreen.data.sentence.split(/\s+/).map((word: string, wIdx: number) => {
                            const cleanWord = word.replace(/[^a-zA-Z0-9']/g, "").toLowerCase().trim();
                            const isErrorWord =
                              cleanWord === cleanTarget ||
                              errorTokens.includes(cleanWord) ||
                              (cleanTarget.length > 2 && cleanWord.length > 2 && cleanTarget.includes(cleanWord));

                            const isWrongClicked = wrongWordToken === `${itemKey}_${wIdx}`;

                            return (
                              <button
                                key={wIdx}
                                onClick={() => {
                                  if (isErrorWord) {
                                    setErrorHuntFound((prev) => ({
                                      ...prev,
                                      [itemKey]: true
                                    }));
                                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                                    showToast(`🎯 Barakalla! Xato topildi: "${activeScreen.data.errorWord}"`);
                                  } else {
                                    setWrongWordToken(`${itemKey}_${wIdx}`);
                                    setTimeout(() => setWrongWordToken(null), 700);
                                    showToast(`💡 "${word}" to'g'ri so'z, gapdagi xatoni qidiring!`);
                                  }
                                }}
                                className={`px-3.5 py-2 rounded-xl text-base sm:text-xl font-black transition-all ${
                                  isFound && isErrorWord
                                    ? "bg-rose-600 text-white line-through scale-105 ring-4 ring-rose-400/40 shadow-lg"
                                    : isWrongClicked
                                    ? "bg-amber-500 text-white animate-pulse ring-2 ring-amber-300"
                                    : isBoardLight
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 active:scale-95"
                                    : "bg-white/10 hover:bg-[#5B3DF5] hover:text-white text-white border border-white/15 active:scale-95"
                                }`}
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>

                        {/* Reveal Button if not yet found */}
                        {!isFound && (
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                setErrorHuntFound((prev) => ({ ...prev, [itemKey]: true }));
                                showToast(`💡 To'g'ri javob ko'rsatildi!`);
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Javobni Ko'rsatish (Reveal)</span>
                            </button>
                          </div>
                        )}

                        {/* Caught Error Explanation Box */}
                        {isFound && (
                          <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold animate-fade-in ${
                            isBoardLight ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          }`}>
                            <div className="text-base font-black text-emerald-500 mb-1">
                              🎯 Xato topildi: "{activeScreen.data.errorWord}" ➔ To'g'ri shakl: "{activeScreen.data.correction}"
                            </div>
                            <p className="mt-1 leading-relaxed">{activeScreen.data.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 7: FILL THE GAP (Bo'shliqni To'ldirish)       */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "fillGap" && (
                    <div className="flex flex-col justify-center max-w-3xl mx-auto w-full py-2 space-y-4 text-center">
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20 inline-flex items-center space-x-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Bo'shliqni To'ldirish ({activeScreen.subIndex + 1}/{activeScreen.total})</span>
                        </span>
                      </div>

                      {/* Sentence with Gap */}
                      <div className={`p-6 rounded-3xl border shadow-2xl text-lg sm:text-2xl font-black leading-relaxed ${
                        isBoardLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-800/80 border-slate-700/80 text-white"
                      }`}>
                        <span>{activeScreen.data.sentenceBefore} </span>
                        <span className={`px-4 py-1 rounded-xl border-2 font-mono inline-block ${
                          fillGapSelected[activeScreen.data.id || String(activeScreen.subIndex)]
                            ? fillGapSelected[activeScreen.data.id || String(activeScreen.subIndex)] === activeScreen.data.correct
                              ? "bg-emerald-600 border-emerald-400 text-white"
                              : "bg-rose-600 border-rose-400 text-white"
                            : isBoardLight
                            ? "bg-indigo-50 border-dashed border-indigo-400 text-indigo-900"
                            : "bg-white/10 border-dashed border-indigo-400 text-indigo-300"
                        }`}>
                          {fillGapSelected[activeScreen.data.id || String(activeScreen.subIndex)] || " [ ? ] "}
                        </span>
                        <span> {activeScreen.data.sentenceAfter}</span>
                      </div>

                      {/* Word Chips */}
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {activeScreen.data.options.map((opt, oIdx) => {
                          const isSelected = fillGapSelected[activeScreen.data.id || String(activeScreen.subIndex)] === opt;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                setFillGapSelected((prev) => ({
                                  ...prev,
                                  [activeScreen.data.id || String(activeScreen.subIndex)]: opt
                                }));
                                if (opt === activeScreen.data.correct) {
                                  confetti({ particleCount: 80, spread: 60 });
                                }
                              }}
                              className={`px-5 py-2.5 rounded-2xl font-black text-sm sm:text-base transition-all border-b-4 ${
                                isSelected
                                  ? opt === activeScreen.data.correct
                                    ? "bg-emerald-600 border-emerald-800 text-white scale-105"
                                    : "bg-rose-600 border-rose-800 text-white"
                                  : isBoardLight
                                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                                  : "bg-[#5B3DF5] hover:bg-[#4C2FE0] border-[#3B1FBF] text-white"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {activeScreen.data.uzbekHint && (
                        <p className="text-xs font-bold text-slate-400">
                          💡 <b>Yordam:</b> {activeScreen.data.uzbekHint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* SCREEN TYPE 8: SUMMARY & RULES (Xulosa & Oltin Qoidalar) */}
                  {/* ======================================================== */}
                  {activeScreen?.type === "summary" && (
                    <div className="flex flex-col justify-center max-w-4xl mx-auto w-full py-1 space-y-3 text-center">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-flex items-center space-x-1.5">
                            <Trophy className="w-4 h-4 fill-amber-400" />
                            <span>Darsning Oltin Qoidalari & Xulosa</span>
                          </span>
                          <button
                            onClick={() => {
                              setCurrentScreenIndex(0);
                              setBoardStepReveal(0);
                            }}
                            className="px-3 py-1 rounded-full bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white font-bold text-xs flex items-center space-x-1 shadow transition-all hover:scale-105"
                            title="1-Slaydga o'tish"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Doskaga (1-Slayd)</span>
                          </button>
                        </div>
                        <h2 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${isBoardLight ? "text-slate-900" : "text-white"}`}>
                          {activeScreen.data.title}
                        </h2>
                        <p className={`text-xs sm:text-sm font-semibold max-w-2xl mx-auto ${isBoardLight ? "text-slate-700 font-medium" : "text-slate-300"}`}>
                          {activeScreen.data.takeaway}
                        </p>
                      </div>

                      {/* Rule Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-left">
                        {activeScreen.data.rules.map((rule, rIdx) => {
                          const cardThemes = [
                            { border: "border-indigo-500/40", badge: "bg-indigo-600 text-white", formulaBg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
                            { border: "border-purple-500/40", badge: "bg-purple-600 text-white", formulaBg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
                            { border: "border-amber-500/40", badge: "bg-amber-600 text-white", formulaBg: "bg-amber-500/15 text-amber-300 border-amber-500/30" }
                          ];
                          const theme = cardThemes[rIdx % cardThemes.length];

                          return (
                            <div
                              key={rIdx}
                              className={`p-4 rounded-2xl border-2 space-y-2 shadow-lg flex flex-col justify-between ${theme.border} ${
                                isBoardLight ? "bg-white text-slate-900" : "bg-[#121624]/90 text-white"
                              }`}
                            >
                              <div className="space-y-1.5">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badge}`}>
                                  {rule.tag}
                                </span>
                                <h4 className={`text-sm font-black tracking-tight ${isBoardLight ? "text-slate-950 font-black" : "text-white"}`}>
                                  {rule.title}
                                </h4>
                                {rule.formula && (
                                  <div className={`text-[11px] font-mono font-bold p-1.5 rounded-lg border ${
                                    isBoardLight ? "bg-slate-100 text-indigo-950 border-slate-300 font-black" : theme.formulaBg
                                  }`}>
                                    {rule.formula}
                                  </div>
                                )}
                                <div className={`text-xs font-medium p-2 rounded-lg border flex items-center justify-between ${
                                  isBoardLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/25 border-white/5 text-slate-200"
                                }`}>
                                  <span className="font-mono font-bold">"{rule.example}"</span>
                                  <button
                                    onClick={() => speak(rule.example)}
                                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white shrink-0 ml-1"
                                    title="Tinglash"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className={`text-[11px] font-bold ${isBoardLight ? "text-rose-900 font-black" : "text-rose-400"}`}>
                                ⚠️ <b>Tuzoq:</b> {rule.uzbekTrap}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Celebrate Completion Button */}
                      <div className="pt-1 flex items-center justify-center gap-3">
                        <button
                          onClick={() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })}
                          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                          🎉 Darsni Muvaffaqiyatli Tugatdik!
                        </button>
                        <button
                          onClick={() => {
                            setCurrentScreenIndex(0);
                            setBoardStepReveal(0);
                          }}
                          className="px-5 py-2 rounded-2xl bg-[#5B3DF5] text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>1-Slaydga Qaytish</span>
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                {/* 3. Whiteboard Bottom Navigation Bar */}
                <div className={`flex items-center justify-between pt-2.5 border-t shrink-0 ${isBoardLight ? "border-slate-200" : "border-white/10"}`}>
                  {/* Previous Button */}
                  <button
                    disabled={currentScreenIndex === 0}
                    onClick={() => {
                      setCurrentScreenIndex((prev) => Math.max(0, prev - 1));
                      setBoardStepReveal(0);
                    }}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black disabled:opacity-30 transition-all flex items-center space-x-1.5 hover-lift ${
                      isBoardLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.board_prev}</span>
                  </button>

                  {/* Center Dot Navigation & Category Label */}
                  <div className="flex flex-col items-center space-y-1">
                    <span className={`text-xs font-extrabold tracking-wide ${isBoardLight ? "text-indigo-900" : "text-[#A5B4FC]"}`}>
                      {activeCategory?.title} • {(activeScreen?.subIndex !== undefined ? activeScreen.subIndex + 1 : 1)} / {(activeCategory?.count || activeScreen?.total || 5)}
                    </span>

                    <div className="flex items-center space-x-1.5 py-0.5">
                      {Array.from({ length: activeCategory?.count || activeScreen?.total || 5 }).map((_, subIdx) => {
                        const isDotActive = (activeScreen?.subIndex ?? 0) === subIdx;
                        return (
                          <button
                            key={subIdx}
                            onClick={() => {
                              setCurrentScreenIndex((activeCategory?.startIndex ?? 0) + subIdx);
                              setBoardStepReveal(0);
                            }}
                            className={`h-2 rounded-full transition-all cursor-pointer hover-lift ${
                              isDotActive
                                ? "w-7 bg-[#5B3DF5] shadow-sm"
                                : isBoardLight
                                ? "w-2.5 bg-slate-300 hover:bg-slate-400"
                                : "w-2.5 bg-white/20 hover:bg-white/40"
                            }`}
                            title={`${activeCategory?.title || "Bo'lim"} ${subIdx + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                    {/* Next Button */}
                  {currentScreenIndex === totalScreens - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentScreenIndex(0);
                        setBoardStepReveal(0);
                      }}
                      className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center space-x-1.5 shadow-sm hover-lift"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{appLanguage === 'en' ? "Back to Slide 1" : appLanguage === 'ru' ? "К слайду 1" : "1-Slaydga Qaytish"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentScreenIndex((prev) => Math.min(totalScreens - 1, prev + 1));
                        setBoardStepReveal(0);
                      }}
                      className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 transition-all flex items-center space-x-1.5 shadow-sm hover-lift"
                    >
                      <span>{t.board_next}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* SEPARATED TOGGLE BUTTON: Between the slides block and right sidebar, closer to the right sidebar without touching either */}
              {!isFullscreen && (
                <div className="hidden md:flex items-center shrink-0 -mr-1.5 z-30">
                  <button
                    type="button"
                    onClick={() => setIsRightBarExpanded((prev) => !prev)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center text-xs font-black shadow-xl transition-all cursor-pointer hover-lift ${
                      isBoardLight
                        ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800 shadow-slate-200"
                        : "bg-[#18191E]/95 hover:bg-[#232734] border-white/20 text-slate-200 hover:text-white"
                    }`}
                    title={isRightBarExpanded ? "Bo'lim nomlarini yashirish (>)" : "Bo'lim nomlarini ko'rsatish (<)"}
                  >
                    {isRightBarExpanded ? ">" : "<"}
                  </button>
                </div>
              )}

              {/* RIGHT CATEGORY NAVIGATION TOOLBAR (Separated, flex sibling, never overlaps board) */}
              {!isFullscreen && (
                <aside
                  className={`hidden md:flex shrink-0 z-20 flex-col justify-between rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 relative ${
                    isBoardLight
                      ? "bg-white/95 border-slate-200 text-slate-700 shadow-slate-200/80"
                      : "bg-[#18191E]/95 border-white/10 text-slate-400"
                  } ${
                    isRightBarExpanded ? "w-60 p-3" : "w-14 p-2 items-center"
                  }`}
                >

                  {/* Section Jump Items */}
                  <div className={`flex flex-col space-y-1.5 w-full ${isRightBarExpanded ? "" : "items-center"}`}>
                    {isRightBarExpanded && (
                      <div className={`flex items-center justify-between pb-2 mb-1 border-b px-1 ${
                        isBoardLight ? "border-slate-200" : "border-white/10"
                      }`}>
                        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                          isBoardLight ? "text-slate-700" : "text-slate-400"
                        }`}>
                          Bo'limlar ({categories.length})
                        </span>
                        <span className="text-[10px] font-mono text-indigo-500 font-bold">
                          {totalScreens} qadam
                        </span>
                      </div>
                    )}

                    {categories.map((cat, idx) => {
                      const isCatActive = activeCategory?.key === cat.key;
                      const IconComp = cat.icon;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => {
                            setCurrentScreenIndex(cat.startIndex);
                            setBoardStepReveal(0);
                            showToast(`📌 ${cat.title} bo'limiga o'tildi`);
                          }}
                          className={`rounded-xl transition-all relative group flex items-center hover-lift ${
                            isRightBarExpanded
                              ? `w-full px-3 py-2 space-x-2.5 text-left ${
                                  isCatActive
                                    ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/30 font-bold"
                                    : isBoardLight
                                    ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                                }`
                              : `p-2.5 justify-center ${
                                  isCatActive
                                    ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/40 scale-105"
                                    : isBoardLight
                                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`
                          }`}
                          title={`${cat.title} (${cat.count} ta qadam)`}
                        >
                          {isRightBarExpanded ? (
                            <>
                              <span className="text-[11px] font-mono opacity-60 font-bold shrink-0">{idx + 1}.</span>
                              <IconComp className={`w-4 h-4 shrink-0 ${isCatActive ? "text-white" : isBoardLight ? "text-indigo-600 group-hover:text-indigo-800" : "text-indigo-400 group-hover:text-white"}`} />
                              <span className="text-xs font-medium truncate flex-1">{cat.title}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                isCatActive
                                  ? "bg-white/20 text-white font-bold"
                                  : isBoardLight
                                  ? "bg-slate-200/70 text-slate-700 font-bold"
                                  : "bg-white/10 opacity-75"
                              }`}>
                                {cat.count}
                              </span>
                            </>
                          ) : (
                            <>
                              <IconComp className="w-4 h-4" />
                              {/* Tooltip on Hover when collapsed */}
                              <span className={`absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-40 ${
                                isBoardLight
                                  ? "bg-white border-slate-300 text-slate-900 shadow-slate-300/50"
                                  : "bg-[#18191E] border-white/15 text-white"
                              }`}>
                                {cat.title} ({cat.count})
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom utility buttons */}
                  <div className={`w-full pt-2 border-t mt-2 flex flex-col space-y-1.5 ${
                    isBoardLight ? "border-slate-200" : "border-white/10"
                  } ${isRightBarExpanded ? "" : "items-center"}`}>
                    <button
                      onClick={() => {
                        setIsBoardLight((prev) => !prev);
                        showToast(isBoardLight ? "🌙 To'q doska yoqildi" : "☀️ Yorug' doska yoqildi");
                      }}
                      className={`rounded-xl transition-all flex items-center hover-lift ${
                        isRightBarExpanded
                          ? `w-full px-3 py-2 space-x-2.5 text-left ${
                              isBoardLight
                                ? "text-amber-600 bg-amber-50 hover:bg-amber-100 font-bold"
                                : "text-slate-300 hover:bg-white/10"
                            }`
                          : `p-2.5 justify-center ${
                              isBoardLight
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-slate-300 hover:bg-white/10"
                            }`
                      }`}
                      title={isBoardLight ? "To'q doskaga o'tkazish" : "Oq doskaga o'tkazish"}
                    >
                      {isBoardLight ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0" />}
                      {isRightBarExpanded && (
                        <span className="text-xs font-medium">
                          {isBoardLight ? "To'q doska" : "Yorug' doska"}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className={`rounded-xl transition-all flex items-center hover-lift ${
                        isRightBarExpanded
                          ? `w-full px-3 py-2 space-x-2.5 text-left ${
                              isBoardLight
                                ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                : "hover:text-white hover:bg-white/5 text-slate-300"
                            }`
                          : `p-2.5 justify-center ${
                              isBoardLight
                                ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                : "hover:text-white hover:bg-white/5 text-slate-300"
                            }`
                      }`}
                      title="Katta ekran (F)"
                    >
                      <Crop className="w-4 h-4 shrink-0" />
                      {isRightBarExpanded && (
                        <span className="text-xs font-medium">Katta ekran (F)</span>
                      )}
                    </button>
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </div>
      {/* End PUSH CONTAINER */}
    </div>

      {/* Fullscreen Interactive Visual Diagram Modal (For Classroom Visibility with Light & Dark Mode) */}
      {expandedVisual && (
        <div className={`fixed inset-0 z-50 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in ${
          isBoardLight
            ? "bg-[#F8FAFC]/98 text-slate-900 border-slate-200 board-light"
            : "bg-[#0B0D13]/98 text-white border-white/15"
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b max-w-6xl w-full mx-auto shrink-0 ${
            isBoardLight ? "border-slate-200" : "border-white/15"
          }`}>
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1.5 rounded-full bg-[#5B3DF5] text-white text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-md">
                <Sparkles className="w-4 h-4" />
                <span>Interaktiv Vizual Model (Katta Doska)</span>
              </span>
              <span className={`text-xs font-medium hidden sm:inline ${
                isBoardLight ? "text-slate-600" : "text-slate-400"
              }`}>
                Sinfdagi barcha o'quvchilar uchun aniq va katta ko'rinish
              </span>
            </div>

            <button
              type="button"
              onClick={() => setExpandedVisual(null)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer border hover-lift ${
                isBoardLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30"
              }`}
              title="Slaydga qaytish"
            >
              <span>Slaydga Qaytish</span>
              <X className="w-4 h-4 font-black" />
            </button>
          </div>

          <div className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center py-6 overflow-y-auto">
            <div className="w-full">
              <VisualDiagram diagram={expandedVisual} onSpeak={speak} isLight={isBoardLight} />
            </div>
          </div>

          <div className={`text-center text-xs py-2 border-t shrink-0 ${
            isBoardLight ? "text-slate-500 border-slate-200" : "text-slate-500 border-white/10"
          }`}>
            Esc yoki "Slaydga Qaytish" tugmasini bosing
          </div>
        </div>
      )}
    </div>
  );
}

