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
  Flame
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
  SummaryRule
} from "../lib/types";
import { MASTER_CURRICULUMS, enrichCurriculumWithSections } from "../lib/curriculums";
import VisualDiagram from "../components/VisualDiagram";
import AuthModal, { AuthUser } from "../components/AuthModal";
import ClassroomSelector from "../components/ClassroomSelector";
import BaamboozleQuiz from "../components/BaamboozleQuiz";
import HomeworkViewer from "../components/HomeworkViewer";
import {
  compressCurriculumToHash,
  decompressCurriculumFromHash,
  dispatchSubmissionToTelegram,
  generateStandaloneHtml,
  DEFAULT_TEACHER_CHAT_ID
} from "../lib/share";
import { getSlideImageUrl, getVocabImageUrl } from "../lib/pollinations";

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
  className = "h-8 max-w-[160px] object-contain"
}: {
  isLight?: boolean;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string>(isLight ? "/logo-blue.png" : "/logo-white.png");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setImgSrc(isLight ? "/logo-blue.png" : "/logo-white.png");
    setLoadError(false);
  }, [isLight]);

  if (loadError) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B3DF5] to-[#8B5CF6] flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-all">
          OS
        </div>
        <span className={`font-bold text-sm tracking-tight hidden sm:inline ${isLight ? "text-slate-900" : "text-white"}`}>
          TeacherOS
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt="TeacherOS Logo"
      className={`${className} transition-transform group-hover:scale-105`}
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
  );
}

export default function StitchTeacherOS() {
  // 1. Persistent User Auth & Auto-Login Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 2. Classroom Workspace Mode ('classroom' | 'solo' | null)
  const [workspaceMode, setWorkspaceMode] = useState<'classroom' | 'solo' | null>(null);
  const [currentClassroom, setCurrentClassroom] = useState<{ id: string; name: string; students: number }>({
    id: 'intermediate',
    name: 'Intermediate',
    students: 10
  });

  // 3. Studio Mode: 'lesson' | 'others_picker' | 'homework' | 'group_quiz' | 'level_check'
  const [studioMode, setStudioMode] = useState<'lesson' | 'others_picker' | 'homework' | 'group_quiz' | 'level_check'>('lesson');

  // 4. Interactive Group Quiz & Homework State
  const [quizTeamsCount, setQuizTeamsCount] = useState<2 | 3>(2);
  const [activeGroupQuizTopic, setActiveGroupQuizTopic] = useState<string | null>(null);
  const [activeHomeworkTopic, setActiveHomeworkTopic] = useState<string | null>(null);
  const [levelCheckTopics, setLevelCheckTopics] = useState<string[]>(['Present Simple', 'Past Simple']);

  // Load persistent user auth & workspace on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('teacheros_auth_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedMode = localStorage.getItem('teacheros_workspace_mode') as 'classroom' | 'solo' | null;
      if (savedMode) {
        setWorkspaceMode(savedMode);
      }
      const savedClass = localStorage.getItem('teacheros_classroom');
      if (savedClass) {
        setCurrentClassroom(JSON.parse(savedClass));
      }
    } catch (e) {
      console.warn('Error reading saved session', e);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacheros_auth_user');
    localStorage.removeItem('teacheros_workspace_mode');
    setCurrentUser(null);
    setWorkspaceMode(null);
    showToast("Tizimdan chiqildi");
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
  const [lessonHistory, setLessonHistory] = useState<Array<{ topic: string; time: string }>>([
    { topic: "Present Perfect", time: "8h" },
    { topic: "Past continuous", time: "1d" },
    { topic: "Past simple", time: "2d" },
    { topic: "Present continuous", time: "3d" },
    { topic: "Present simple", time: "4d" },
    { topic: "To be", time: "5d" }
  ]);

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
    clean = clean.replace(/^(create|make|generate|build|write)\s+(a\s+|an\s+)?(interactive\s+)?(lesson|curriculum|class|presentation|topic)\s+(about|on|for|regarding)\s+/i, "");
    clean = clean.replace(/^(lesson|topic|class)\s+(about|on|for)\s+/i, "");
    clean = clean.replace(/^(please\s+)?(can\s+you\s+)?(create|make|give\s+me)\s+(a\s+)?/i, "");
    clean = clean.replace(/^(haqida\s+)?(darslik|dars|mavzu)\s+(yarat|tuz|tayyorla|qil)\s*/i, "");
    clean = clean.replace(/\s+(haqida|boyicha|to'g'risida)\s+(dars|darslik|mavzu)\s*(yarat|tuz|tayyorla)?$/i, "");
    clean = clean.trim();
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
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
  const [penTool, setPenTool] = useState<"pen" | "highlighter" | "text" | "eraser">("pen");
  const [penColor, setPenColor] = useState<string>("#ef4444");
  const [penSize, setPenSize] = useState<number>(3);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [typedAnnotationText, setTypedAnnotationText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const pageDrawingsRef = useRef<Record<number, ImageData>>({});
  const prevScreenIndexRef = useRef<number>(0);

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
  }, [isFullscreen]);

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
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEndDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
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

  // Speech-to-text recording (Wispr Flow style)
  const handleVoiceRecord = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTopicInput((prev: string) => prev ? prev + ' ' + transcript : transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
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

  // Live AI Generation (Instant Preset Matching + Gemini Fast Cascade)
  const handleGenerate = async (customTopic?: string, customLength?: LessonLength) => {
    const rawQuery = (customTopic || topicInput).trim();
    const lengthToUse = customLength || lessonLength;

    if (!rawQuery && attachedFiles.length === 0) {
      showToast("Iltimos, dars mavzusini yozing yoki rasm yuklang...");
      return;
    }

    const query = cleanTopicTitle(rawQuery) || rawQuery || (attachedFiles.length > 0 ? "Textbook Lesson" : "");

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
      const steps = [
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
          files: attachedFiles
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
          setLessonHistory((prev) => [{ topic: data.curriculum.topic, time: "Just now" }, ...prev]);
          const modelTag = data.modelUsed ? ` (${data.modelUsed})` : "";
          showToast(`✨ Google Gemini AI darslikni to'liq yaratdi!${modelTag}`);
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
          if (stepInterval) clearInterval(stepInterval);
          setIsGenerating(false);
          return;
        }
      }

      // Offline / Synthesized Fallback if API returned non-ok
      console.warn("Gemini API returned non-ok, generating enriched curriculum...");
      const norm = query.toLowerCase();
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
          topic: query,
          level,
          category: "Grammar & Communication",
          description: `${query} bo'yicha interaktiv vizual darslik paketi (${lengthToUse} format).`,
          slides: [
            {
              id: "s1",
              tag: "MOHIYAT",
              title: `${query} — Asosiy Tushuncha`,
              body: isArticleTopic
                ? `<p class="font-bold text-slate-300"><b>${query}</b> — ingliz tilida otlarning qaysi biri haqida gap ketayotganini aniq ko'rsatuvchi muhim vosita.</p><br>• <b>'A'</b> — undosh tovushdan boshlangan so'zlar oldidan (a book, a car)<br>• <b>'An'</b> — unli tovushdan boshlangan so'zlar oldidan (an apple, an hour)<br><div style='margin-top:10px; padding:10px 14px; background:rgba(99,102,241,0.15); border-left:3px solid #6366f1; border-radius:6px; font-size:0.9rem;'>💡 <b>Oltin qoida:</b> Harfga emas, balki TOVUSHGA e'tibor bering! 'an hour' (h aytilmaydi), 'a university' (yu tovushi).</div>`
                : `<p class="font-bold text-slate-300">Ushbu darsda <b>${query}</b> mavzusining amaliy qo'llanishi va qoidalarini ko'rib chiqamiz.</p>`,
              imagePrompt: `minimalist educational illustration of ${query} concept`,
              ...(isTenseTopic ? {
                visual: {
                  type: "timeline",
                  title: `${query} Vaqt Chizig'i`,
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
      <div className="w-full h-screen bg-[#0D0F14] flex flex-col items-center justify-center space-y-4 text-slate-100 stitch-grid select-none">
        <Sparkles className="w-8 h-8 text-[#5B3DF5] animate-spin" />
        <span className="text-slate-400 font-mono text-xs">TeacherOS yuklanmoqda...</span>
      </div>
    );
  }

  // 2. Persistent Login / Sign-up System Gate (Photo 3)
  if (!currentUser) {
    return (
      <AuthModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Xush kelibsiz, ${user.username}!`);
        }}
      />
    );
  }

  // 3. Workspace Selection Gate (Classroom vs Without Classroom - Photo 3)
  if (!workspaceMode) {
    return (
      <ClassroomSelector
        onSelectMode={(mode, classroomName, studentCount) => {
          setWorkspaceMode(mode);
          localStorage.setItem('teacheros_workspace_mode', mode);
          if (mode === 'classroom' && classroomName) {
            const classObj = {
              id: classroomName.toLowerCase(),
              name: classroomName,
              students: studentCount || 10
            };
            setCurrentClassroom(classObj);
            localStorage.setItem('teacheros_classroom', JSON.stringify(classObj));
          }
          showToast(mode === 'classroom' ? `Classroom: ${classroomName || 'Intermediate'} tanlandi` : "Yakkaxon rejim tanlandi");
        }}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-[#0D0F14] text-slate-100 flex flex-col overflow-hidden font-sans select-none stitch-grid">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1F222E]/95 border border-[#5B3DF5]/50 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#5B3DF5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Baamboozle Group Quiz Modal */}
      {activeGroupQuizTopic && (
        <div className="fixed inset-0 z-50 bg-[#0D0F14]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <BaamboozleQuiz
            topic={activeGroupQuizTopic}
            teamsCount={quizTeamsCount}
            onClose={() => setActiveGroupQuizTopic(null)}
          />
        </div>
      )}

      {/* Interactive Homework Generator & Viewer Modal */}
      {activeHomeworkTopic && (
        <div className="fixed inset-0 z-50 bg-[#0D0F14]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <HomeworkViewer
            topic={activeHomeworkTopic}
            onClose={() => setActiveHomeworkTopic(null)}
          />
        </div>
      )}

      {/* TOP HEADER */}
      {!isFullscreen && (
        <header className="relative h-14 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-[#0D0F14]/90 backdrop-blur-md z-30">
          {/* Brand & Under-Logo 3-Line Hamburger Menu Button (Photo 2) */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-start justify-center">
              <div
                onClick={() => {
                  setCurriculum(null);
                  setStudioMode('lesson');
                  setIsPromptCollapsed(false);
                }}
                className="flex items-center space-x-2 cursor-pointer group"
                title="Yangi mavzu kiritish"
              >
                <BrandLogo isLight={false} />
              </div>

              {/* Three lines placed on top of each other right under the logo */}
              <button
                type="button"
                onClick={() => setIsHistoryOpen((prev) => !prev)}
                className="mt-0.5 flex flex-col justify-center items-center w-6 h-4.5 rounded bg-white/10 hover:bg-white/25 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer group shadow-sm"
                title="Menyu & Tarix (☰)"
              >
                <div className="w-3.5 h-[2px] bg-slate-200 group-hover:bg-white rounded-full mb-[2px] transition-colors" />
                <div className="w-3.5 h-[2px] bg-slate-200 group-hover:bg-white rounded-full mb-[2px] transition-colors" />
                <div className="w-3.5 h-[2px] bg-slate-200 group-hover:bg-white rounded-full transition-colors" />
              </button>
            </div>

            {/* History Toggle Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer ${
                isHistoryOpen
                  ? "bg-[#5B3DF5] border-[#5B3DF5] text-white shadow-lg"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
              title="Darslar tarixi"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline text-[11px]">Tarix</span>
            </button>

            {curriculum && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[160px] sm:max-w-xs">
                    {curriculum.topic}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {curriculum.level}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#5B3DF5]/20 text-[#A5B4FC] border border-[#5B3DF5]/30">
                    {curriculum.length === "short" ? "Qisqa (4)" : curriculum.length === "long" ? "To'liq (8)" : "O'rtacha (6)"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* MIDDLE: AI STUDIO COCKPIT IN TOP BAR (Centered precisely in entire header) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-40 pointer-events-auto">
            {isGenerating ? (
              /* During generation: Clean AI Studio button with pulse */
              <div className="px-4 py-1.5 rounded-full bg-[#18191E]/95 border border-[#5B3DF5]/50 shadow-xl text-white text-xs font-bold flex items-center space-x-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5] animate-spin" />
                <span className="text-[#A5B4FC]">AI Studio</span>
              </div>
            ) : isPromptCollapsed ? (
              /* Collapsed AI Studio Pill with chevron \/ */
              <button
                onClick={() => setIsPromptCollapsed(false)}
                className="px-3.5 py-1.5 rounded-full bg-[#18191E]/95 border border-[#5B3DF5]/40 shadow-xl backdrop-blur-xl text-white text-xs font-bold flex items-center space-x-2 hover:bg-[#5B3DF5]/20 hover:scale-105 transition-all group"
                title="AI Darslik Studiyasini ochish"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5] group-hover:rotate-12 transition-transform" />
                <span>AI Studio</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              /* Expanded Popover directly in the center */
              <div className="relative">
                <button
                  onClick={() => setIsPromptCollapsed(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#5B3DF5]/25 border border-[#5B3DF5] shadow-xl text-white text-xs font-bold flex items-center space-x-2 transition-all"
                  title="Yopish"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5]" />
                  <span>AI Studio</span>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setIsPromptCollapsed(true)}
                />

                {/* Dropdown panel */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-84 rounded-2xl bg-[#18191E]/98 border border-[#5B3DF5]/40 p-3.5 shadow-2xl backdrop-blur-2xl space-y-2.5 z-50 text-left animate-fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#A5B4FC] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5]" />
                      <span>Yangi Mavzu Yaratish</span>
                    </span>
                    <button
                      onClick={() => setIsPromptCollapsed(true)}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all flex items-center space-x-1 text-[10px] font-bold border border-white/10"
                      title="Kichraytirish va doskani ko'rish"
                    >
                      <ChevronUp className="w-3 h-3 text-[#A5B4FC]" />
                      <span>Yopish (▲)</span>
                    </button>
                  </div>

                  {/* Input with Mic */}
                  <div className="relative">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleGenerate();
                          setIsPromptCollapsed(true);
                        }
                      }}
                      placeholder="Yangi mavzu (masalan: Second Conditional)..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#5B3DF5] font-medium pr-8 transition-colors"
                    />
                    <button
                      onClick={handleVoiceRecord}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all ${
                        isRecording
                          ? "text-red-400 animate-pulse bg-red-500/20"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title={isRecording ? "Yozishni to'xtatish" : "Ovoz bilan yozish"}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Length toggles */}
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLessonLength("short")}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        lessonLength === "short"
                          ? "bg-[#5B3DF5] text-white shadow-sm"
                          : "bg-white/5 hover:bg-white/10 text-slate-400"
                      }`}
                    >
                      ⚡ Qisqa
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonLength("medium")}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        lessonLength === "medium"
                          ? "bg-[#5B3DF5] text-white shadow-sm"
                          : "bg-white/5 hover:bg-white/10 text-slate-400"
                      }`}
                    >
                      🎯 O'rtacha
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonLength("long")}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        lessonLength === "long"
                          ? "bg-[#5B3DF5] text-white shadow-sm"
                          : "bg-white/5 hover:bg-white/10 text-slate-400"
                      }`}
                    >
                      🚀 Uzun
                    </button>
                  </div>

                  {/* Level + Generate button */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as any)}
                        className="bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer"
                      >
                        {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
                          <option key={lvl} value={lvl} className="bg-[#1A1C23] text-white">
                            Daraja: {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        handleGenerate();
                        setIsPromptCollapsed(true);
                      }}
                      disabled={isGenerating}
                      className="h-7 px-3 rounded-lg bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white font-bold flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-50 text-[11px]"
                    >
                      {isGenerating ? (
                        <>
                          <RotateCw className="w-3 h-3 animate-spin" />
                          <span>Sintez...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Yaratish</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 text-xs">
            {workspaceMode === 'classroom' ? (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode(null);
                  localStorage.removeItem('teacheros_workspace_mode');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-500/25 transition-all cursor-pointer"
                title="Sinfxonani almashtirish"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">{currentClassroom.name}</span>
                <span className="text-[10px] opacity-75">({currentClassroom.students})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode(null);
                  localStorage.removeItem('teacheros_workspace_mode');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-white/10 transition-all cursor-pointer"
                title="Sinfxona rejimiga o'tish"
              >
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Yakkaxon</span>
              </button>
            )}

            {curriculum && (
              <>
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 font-bold transition-all"
                  title="To'liq doska rejimi (F)"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  <span className="hidden sm:inline">Present</span>
                </button>

                <button
                  onClick={handleDownloadHtml}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center space-x-1 font-medium transition-all"
                  title="HTML Yuklab Olish"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center space-x-1 font-medium transition-all"
                  title="Havolani Nusxalash"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </>
            )}

            {/* User Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-white truncate max-w-[90px]">{currentUser.username}</span>
              <span className="text-[10px] text-slate-400 font-mono">({currentUser.age})</span>
            </div>

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
          </div>
        </header>
      )}

      {/* HISTORY & NAVIGATION DRAWER MODAL (Matching Photo 2 Handwritten Sketch) */}
      {isHistoryOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsHistoryOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-[#12141D]/98 border-r border-white/10 p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between animate-fade-in">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <BrandLogo isLight={false} className="h-7 max-w-[140px] object-contain" />
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  title="Yopish"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Classroom Context Badge */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#A5B4FC] flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{workspaceMode === 'classroom' ? currentClassroom.name : 'Yakkaxon Rejim'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {workspaceMode === 'classroom' ? `${currentClassroom.students} talaba` : 'Sinfsiz'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceMode(null);
                    localStorage.removeItem('teacheros_workspace_mode');
                    setIsHistoryOpen(false);
                  }}
                  className="w-full text-left text-[11px] text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  ⇄ Sinfxonani almashtirish
                </button>
              </div>

              {/* Photo 2 Action Buttons: + New Lesson, Homework, Level, Jack Rock Quiz */}
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
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ New Lesson</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurriculum(null);
                    setStudioMode('homework');
                    setIsHistoryOpen(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30 text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>🏠 Homework</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurriculum(null);
                    setStudioMode('level_check');
                    setIsHistoryOpen(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/5 hover:border-amber-500/30 text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>📖 Level Check</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurriculum(null);
                    setStudioMode('group_quiz');
                    setIsHistoryOpen(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-200 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>👥 Jack Rock Quiz (Group)</span>
                </button>
              </div>

              {/* Photo 2 History List Section */}
              <div className="pt-2">
                <div className="flex items-center space-x-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span>↺ Tarix (Darslar ro'yxati)</span>
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {lessonHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTopicInput(item.topic);
                        handleGenerate(item.topic);
                        setIsHistoryOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-left flex items-center justify-between group transition-all cursor-pointer border border-transparent hover:border-white/5"
                    >
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate max-w-[180px]">
                        {item.topic}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-indigo-400 font-semibold">
                        {item.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Profile & Settings Section */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#5B3DF5] to-[#7C3AED] flex items-center justify-center font-bold text-white text-[11px]">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white leading-none">{currentUser.username}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{currentUser.age} yosh • {currentUser.provider}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Chiqish"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* MAIN CANVAS */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        {/* ============================================================ */}
        {/* GENERATING STATE: ONLY CLEAN PROCESS CARD IN CENTER          */}
        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* GENERATING STATE: HIGH-TECH PEDAGOGICAL SYNTHESIS STUDIO     */}
        {/* ============================================================ */}
        {isGenerating && (
          <div className="w-full max-w-4xl px-4 z-20 flex flex-col items-center justify-center animate-fade-in">
            {/* High-Tech Studio Blueprint Card */}
            <div className="w-full rounded-3xl bg-[#12141D]/95 border border-[#5B3DF5]/35 shadow-[0_25px_70px_-15px_rgba(91,61,245,0.35)] backdrop-blur-2xl p-5 sm:p-7 flex flex-col space-y-5 overflow-hidden relative">
              {/* Ambient background glows */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#5B3DF5]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header Telemetry */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    AI SYNTHESIS LAB • ACTIVE
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-slate-400 font-mono text-[11px]">Gemini 3.5 Engine</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-[#5B3DF5]/20 text-[#A5B4FC] border border-[#5B3DF5]/40 font-bold text-xs flex items-center space-x-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5] animate-spin" />
                    <span className="truncate max-w-[200px]">Mavzu: {topicInput || "Yangi Dars"}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-mono font-bold text-[11px]">
                    {level}
                  </span>
                </div>
              </div>

              {/* Shimmer Blueprint 16:9 Slide Preview */}
              <div className="w-full aspect-[16/9] max-h-52 sm:max-h-60 rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
                {/* Laser shimmer animation wave traversing skeleton */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-laser-shimmer pointer-events-none" />

                {/* Top skeleton header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-4 rounded-md bg-white/15 animate-pulse" />
                    <div className="w-36 h-5 rounded-md bg-white/20 animate-pulse" />
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-6 h-6 rounded-lg bg-white/10" />
                    <div className="w-6 h-6 rounded-lg bg-white/10" />
                  </div>
                </div>

                {/* Center skeleton dual columns */}
                <div className="grid grid-cols-12 gap-4 items-center my-auto">
                  {/* Left: rule skeleton */}
                  <div className="col-span-6 space-y-2.5">
                    <div className="w-3/4 h-3.5 rounded bg-white/20 animate-pulse" />
                    <div className="w-full h-3 rounded bg-white/10 animate-pulse" />
                    <div className="w-5/6 h-3 rounded bg-white/10 animate-pulse" />
                    <div className="w-full h-9 rounded-xl bg-[#5B3DF5]/15 border border-[#5B3DF5]/30 flex items-center px-3 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#5B3DF5] animate-pulse" />
                      <div className="w-44 h-2.5 rounded bg-white/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Right: visual diagram skeleton */}
                  <div className="col-span-6 h-28 sm:h-32 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-24 h-3 rounded bg-white/15" />
                      <div className="w-12 h-3 rounded-full bg-[#5B3DF5]/30" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-12 rounded-lg bg-indigo-600/20 border border-indigo-500/30 animate-pulse" />
                      <div className="flex-1 h-12 rounded-lg bg-purple-600/20 border border-purple-500/30 animate-pulse" />
                      <div className="flex-1 h-12 rounded-lg bg-emerald-600/20 border border-emerald-500/30 animate-pulse" />
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Bottom slide dots */}
                <div className="flex items-center justify-center space-x-2 pt-2 border-t border-white/5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div
                      key={d}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        d <= generationStage
                          ? "w-8 bg-[#5B3DF5] shadow-[0_0_8px_#5B3DF5]"
                          : "w-2 bg-white/15"
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
                          ? "bg-[#5B3DF5]/20 border-[#5B3DF5] shadow-[0_0_15px_rgba(91,61,245,0.25)] scale-102"
                          : isDone
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : "bg-white/5 border-white/5 text-slate-500 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{st.icon}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isCurrent ? (
                          <RotateCw className="w-3.5 h-3.5 text-[#5B3DF5] animate-spin" />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">#{st.num}</span>
                        )}
                      </div>
                      <div className={`text-xs font-black ${isCurrent ? "text-white" : isDone ? "text-emerald-200" : "text-slate-400"}`}>
                        {st.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{st.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Active Telemetry text */}
              <div className="text-center space-y-1 pt-1">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center justify-center space-x-2">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-[#5B3DF5]" />
                  <span>{generationStep}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
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
          <div
            className={`w-full max-w-2xl px-6 flex flex-col items-center text-center space-y-6 z-20 ${
              isAnimatingUp ? "pointer-events-none" : "animate-fade-in"
            }`}
          >
            {/* Minimalist Hero Branding (ONLY shown in standard lesson mode) */}
            {studioMode === 'lesson' && (
              <div
                className={`space-y-3 transition-all duration-400 ease-out ${
                  isAnimatingUp ? "opacity-0 -translate-y-8 scale-95 pointer-events-none" : "opacity-100 translate-y-0"
                }`}
              >
                <div className="flex items-center justify-center space-x-3 mb-1">
                  <BrandLogo isLight={false} className="h-14 sm:h-16 max-w-[220px] object-contain" />
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-slate-300 shadow-md">
                    <Sparkles className="w-4 h-4 text-[#5B3DF5]" />
                    <span>TeacherOS • Interaktiv Doska Studiyasi</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                  Darslikni sun'iy intellekt bilan yarating
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Mavzuni kiriting — Google Gemini AI 16:9 interaktiv doska, tezkor savollar, xato ovchisi va muloqot mashqlarini sintez qiladi.
                </p>
              </div>
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
                {/* + Image: Navy Blue with electric cyan glow */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0c1f3d] via-[#1e3a8a] to-[#172554] border-2 border-[#38bdf8] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer backdrop-blur-md"
                >
                  <span className="text-[#38bdf8] text-lg font-black leading-none">+</span>
                  <ImageIcon className="w-5 h-5 text-[#38bdf8] shrink-0" />
                  <span className="tracking-wide">+ Image</span>
                </button>

                {/* Others: Navy Orange with vibrant amber glow */}
                <button
                  type="button"
                  onClick={() => setStudioMode('others_picker')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#361605] via-[#7c2d12] to-[#431407] border-2 border-[#fb923c] text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-[0_0_25px_rgba(251,146,60,0.35)] hover:shadow-[0_0_35px_rgba(251,146,60,0.55)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer backdrop-blur-md"
                >
                  <MoreHorizontal className="w-5 h-5 text-[#fb923c] shrink-0" />
                  <span className="tracking-wide">Others</span>
                </button>
              </div>
            )}

            {/* OTHERS PICKER: 3 BLOCKS SCREEN (Photo 4 & 5) */}
            {studioMode === 'others_picker' && (
              <div className="w-full max-w-xl mx-auto space-y-4 animate-fade-in text-left">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#fb923c]" />
                    <span>Others • Maxsus Rejimlar</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStudioMode('lesson')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Oddiy darsga qaytish</span>
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
                        HOMEWORK
                      </h3>
                      <p className="text-[11px] text-emerald-200/70 mt-1 leading-snug">
                        Kengaytirilgan uy vazifasi va lug'atlar
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
                        GROUP QUIZ
                      </h3>
                      <p className="text-[11px] text-indigo-200/70 mt-1 leading-snug">
                        Baamboozle 2 yoki 3 guruhli bellashuv
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
                        LEVEL CHECK
                      </h3>
                      <p className="text-[11px] text-amber-200/70 mt-1 leading-snug">
                        Ko'p mavzuli diagnostik sinov
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
                <span className="text-xs font-black tracking-wide text-emerald-200">HOMEWORK REJIMI</span>
                <button
                  type="button"
                  onClick={() => setStudioMode('others_picker')}
                  className="p-1 rounded-md hover:bg-white/20 text-emerald-300 hover:text-white transition-all ml-1 cursor-pointer"
                  title="Boshqa rejim tanlash"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {studioMode === 'group_quiz' && (
              <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-950 to-purple-900 border-2 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black tracking-wide text-indigo-200">GROUP QUIZ (Baamboozle)</span>
                  <button
                    type="button"
                    onClick={() => setStudioMode('others_picker')}
                    className="p-1 rounded-md hover:bg-white/20 text-indigo-300 hover:text-white transition-all ml-1 cursor-pointer"
                    title="Boshqa rejim tanlash"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Team Count Selector (2 or 3 Groups) */}
                <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white/10 border border-white/15">
                  <span className="text-[11px] font-bold text-slate-300 px-2">Guruhlar:</span>
                  <button
                    type="button"
                    onClick={() => setQuizTeamsCount(2)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      quizTeamsCount === 2
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    2 Guruh
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
                    3 Guruh
                  </button>
                </div>
              </div>
            )}

            {studioMode === 'level_check' && (
              <div className="w-full max-w-xl mx-auto space-y-2 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-950 to-orange-900 border-2 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black tracking-wide text-amber-200">LEVEL CHECK (Ko'p mavzuli)</span>
                    <button
                      type="button"
                      onClick={() => setStudioMode('others_picker')}
                      className="p-1 rounded-md hover:bg-white/20 text-amber-300 hover:text-white transition-all ml-1 cursor-pointer"
                      title="Boshqa rejim tanlash"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400">
                    {levelCheckTopics.length} ta mavzu tanlandi
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
              className={`w-full rounded-2xl bg-[#1A1C23]/95 border border-white/15 p-4 shadow-2xl backdrop-blur-2xl space-y-3.5 focus-within:border-[#5B3DF5] text-left capcut-slide-up ${
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
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all shrink-0 cursor-pointer border border-white/10"
                  title="Rasm yoki PDF yuklash (+)"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (studioMode === 'homework') {
                        setActiveHomeworkTopic(topicInput || "Present Perfect");
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
                      ? "Uyga vazifa mavzusi (masalan: Present Perfect, 10 ta savol)..."
                      : studioMode === 'group_quiz'
                      ? "Guruhlar musobaqasi mavzusi (masalan: Irregular Verbs, Animals, Tenses)..."
                      : studioMode === 'level_check'
                      ? "Qo'shimcha talablar yoki mavzular (masalan: 15 ta test, 10 ta ochiq savol)..."
                      : attachedFiles.length > 0
                      ? "Rasm bo'yicha ko'rsatma yozing (ixtiyoriy)..."
                      : "Bugun qaysi mavzuni o'tamiz? (masalan: Present Perfect, History of Sports)..."
                  }
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-medium px-1 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleVoiceRecord}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={isRecording ? "Yozishni to'xtatish" : "Ovoz bilan yozish"}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Attached file chips */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
                  {attachedFiles.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-xs text-indigo-200 font-medium"
                    >
                      <span>📎 {f.name}</span>
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
              )}

              {/* DARS UZUNLIGI (Lesson Length Selector: Short / Medium / Long) */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Dars Uzunligi:</span>
                  
                  <button
                    type="button"
                    onClick={() => setLessonLength("short")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all ${
                      lessonLength === "short"
                        ? "bg-[#5B3DF5] text-white shadow-md"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <span>⚡ Qisqa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonLength("medium")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all ${
                      lessonLength === "medium"
                        ? "bg-[#5B3DF5] text-white shadow-md"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <span>🎯 O'rtacha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonLength("long")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all ${
                      lessonLength === "long"
                        ? "bg-[#5B3DF5] text-white shadow-md"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <span>🚀 Uzun</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Level Pill */}
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer"
                    >
                      {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
                        <option key={lvl} value={lvl} className="bg-[#1A1C23] text-white">
                          Level: {lvl}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>

                  <button
                    onClick={() => {
                      if (studioMode === 'homework') {
                        setActiveHomeworkTopic(topicInput || "Present Perfect");
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
                      {studioMode === 'homework'
                        ? "Vazifa Yaratish"
                        : studioMode === 'group_quiz'
                        ? "Musobaqani Boshlash"
                        : studioMode === 'level_check'
                        ? "Sinovni Boshlash"
                        : "Yaratish"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ACTIVE STUDIO STATE: ZERO-SCROLL INTERACTIVE WHITEBOARD      */}
        {/* ============================================================ */}
        {curriculum && (
          <>
            {/* MAIN PRESENTATION WRAPPER: Board and Right Toolbar as Flex Siblings (Photo 1: shifted right with ample gap-8 mr-4 sm:mr-6) */}
            <div className="w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-3 md:p-4 gap-8 mr-4 sm:mr-6 overflow-hidden">
              <div
                ref={boardRef}
                className={`transition-all duration-200 relative flex flex-col justify-between shadow-2xl ${
                  isFullscreen
                    ? "w-screen h-screen rounded-none p-3 sm:p-5 md:p-6 z-50 fixed inset-0 overflow-hidden"
                    : "flex-1 max-w-5xl xl:max-w-6xl h-full max-h-[calc(100vh-4.25rem)] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border overflow-hidden min-w-0"
                } ${
                  isBoardLight
                    ? "bg-white text-slate-900 border-slate-200 board-light"
                    : "bg-[#16181F] text-white border-white/15"
                }`}
              >
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
                      className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center space-x-1 shadow-md transition-all hover:scale-105 disabled:opacity-50"
                      title="Yana bitta savol yoki element qo'shish (+)"
                    >
                      {isAddingItem ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span className="hidden sm:inline text-[11px] font-bold">
                        {isAddingItem ? "Qo'shilmoqda..." : "Qo'shish"}
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
                      className="p-1.5 sm:p-2 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 transition-all shadow-sm"
                      title="Talaffuzni tinglash"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Pen / Annotation Tool Toggle */}
                    <button
                      onClick={() => setIsAnnotating((prev) => !prev)}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm ${
                        isAnnotating
                          ? "bg-[#5B3DF5] text-white ring-2 ring-[#5B3DF5]/50 scale-105"
                          : isBoardLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title={isAnnotating ? "Qalam rejimini yopish" : "Doskaga chizish & Qalam (Pen)"}
                    >
                      <PenTool className="w-4 h-4" />
                    </button>

                    {/* Dark/Light toggle */}
                    <button
                      onClick={() => setIsBoardLight((prev) => !prev)}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm ${
                        isBoardLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 hover:bg-white/20 text-amber-300"
                      }`}
                      title={isBoardLight ? "To'q rejim" : "Yorug' rejim"}
                    >
                      {isBoardLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>

                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all shadow-sm ${
                        isBoardLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title={isFullscreen ? "Chiqish (Esc)" : "Katta Ekran (F)"}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Whiteboard Center Interactive Stage */}
                <div className="flex-1 min-h-0 overflow-y-auto my-1.5 sm:my-2 px-1 relative custom-scrollbar flex flex-col">
                  {/* Floating Whiteboard Annotation Toolbar */}
                  {isAnnotating && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 z-40 bg-[#16181F]/95 backdrop-blur-xl border border-white/20 px-3 py-2 rounded-2xl shadow-2xl flex items-center space-x-2 text-white animate-in fade-in slide-in-from-top-2">
                      {/* Pen */}
                      <button
                        onClick={() => setPenTool("pen")}
                        className={`p-2 rounded-xl transition-all ${
                          penTool === "pen" ? "bg-[#5B3DF5] text-white shadow-md scale-105" : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Qalam (Pen)"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>

                      {/* Highlighter */}
                      <button
                        onClick={() => setPenTool("highlighter")}
                        className={`p-2 rounded-xl transition-all ${
                          penTool === "highlighter" ? "bg-[#5B3DF5] text-white shadow-md scale-105" : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Marker (Highlighter)"
                      >
                        <Highlighter className="w-4 h-4" />
                      </button>

                      {/* Text Note */}
                      <button
                        onClick={() => setPenTool("text")}
                        className={`p-2 rounded-xl transition-all ${
                          penTool === "text" ? "bg-[#5B3DF5] text-white shadow-md scale-105" : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="Matn yozish (Doskaga bosing)"
                      >
                        <Type className="w-4 h-4" />
                      </button>

                      {/* Eraser */}
                      <button
                        onClick={() => setPenTool("eraser")}
                        className={`p-2 rounded-xl transition-all ${
                          penTool === "eraser" ? "bg-[#5B3DF5] text-white shadow-md scale-105" : "hover:bg-white/10 text-slate-300"
                        }`}
                        title="O'chirg'ich (Eraser)"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>

                      <div className="h-5 w-[1px] bg-white/20 my-auto" />

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
                            className={`w-5 h-5 rounded-full border-2 transition-transform ${
                              penColor === c.color ? "scale-125 border-white ring-2 ring-[#5B3DF5]" : "border-white/30 hover:scale-110"
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>

                      <div className="h-5 w-[1px] bg-white/20 my-auto" />

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
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all ${
                              penSize === s.size ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      <div className="h-5 w-[1px] bg-white/20 my-auto" />

                      {/* Undo */}
                      <button
                        onClick={handleUndo}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
                        title="Bekor qilish (Undo)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Clear Canvas */}
                      <button
                        onClick={handleClearCanvas}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                        title="Barchasini tozalash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Close */}
                      <button
                        onClick={() => setIsAnnotating(false)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
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
                      style={{ left: Math.min(textInputPos.x, 600), top: Math.min(textInputPos.y, 400) }}
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
                              <div className="lg:col-span-6 flex flex-col justify-center">
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
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black disabled:opacity-30 transition-all flex items-center space-x-1.5 ${
                      isBoardLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Oldingi</span>
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
                            className={`h-2 rounded-full transition-all cursor-pointer ${
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
                      className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center space-x-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>1-Slaydga Qaytish</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentScreenIndex((prev) => Math.min(totalScreens - 1, prev + 1));
                        setBoardStepReveal(0);
                      }}
                      className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Keyingi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT CATEGORY NAVIGATION TOOLBAR (Separated, flex sibling, never overlaps board) */}
              {!isFullscreen && (
                <aside
                  className={`hidden md:flex shrink-0 z-20 flex-col justify-between rounded-2xl bg-[#18191E]/95 border border-white/10 shadow-2xl backdrop-blur-xl text-slate-400 transition-all duration-300 relative ${
                    isRightBarExpanded ? "w-60 p-3" : "w-14 p-2 items-center"
                  }`}
                >
                  {/* "<" or ">" toggle button between board and bar */}
                  <button
                    type="button"
                    onClick={() => setIsRightBarExpanded((prev) => !prev)}
                    className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1F222A] hover:bg-[#2B2F3A] border border-white/20 text-slate-200 hover:text-white flex items-center justify-center text-xs font-black shadow-xl hover:scale-110 active:scale-95 transition-all z-30 cursor-pointer"
                    title={isRightBarExpanded ? "Bo'lim nomlarini yashirish (>)" : "Bo'lim nomlarini ko'rsatish (<)"}
                  >
                    {isRightBarExpanded ? ">" : "<"}
                  </button>

                  {/* Section Jump Items */}
                  <div className={`flex flex-col space-y-1.5 w-full ${isRightBarExpanded ? "" : "items-center"}`}>
                    {isRightBarExpanded && (
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/10 px-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          Bo'limlar ({categories.length})
                        </span>
                        <span className="text-[10px] font-mono text-[#A5B4FC] font-bold">
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
                          className={`rounded-xl transition-all relative group flex items-center ${
                            isRightBarExpanded
                              ? `w-full px-3 py-2 space-x-2.5 text-left ${
                                  isCatActive
                                    ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/30 font-bold"
                                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                                }`
                              : `p-2.5 justify-center ${
                                  isCatActive
                                    ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/40 scale-105"
                                    : "hover:text-white hover:bg-white/5"
                                }`
                          }`}
                          title={`${cat.title} (${cat.count} ta qadam)`}
                        >
                          {isRightBarExpanded ? (
                            <>
                              <span className="text-[11px] font-mono opacity-60 font-bold shrink-0">{idx + 1}.</span>
                              <IconComp className="w-4 h-4 shrink-0 text-indigo-400 group-hover:text-white" />
                              <span className="text-xs font-medium truncate flex-1">{cat.title}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 opacity-75 shrink-0">
                                {cat.count}
                              </span>
                            </>
                          ) : (
                            <>
                              <IconComp className="w-4 h-4" />
                              {/* Tooltip on Hover when collapsed */}
                              <span className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#18191E] border border-white/15 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-40">
                                {cat.title} ({cat.count})
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom utility buttons */}
                  <div className={`w-full pt-2 border-t border-white/10 mt-2 flex flex-col space-y-1.5 ${isRightBarExpanded ? "" : "items-center"}`}>
                    <button
                      onClick={() => {
                        setIsBoardLight((prev) => !prev);
                        showToast(isBoardLight ? "🌙 To'q doska yoqildi" : "☀️ Yorug' doska yoqildi");
                      }}
                      className={`rounded-xl transition-all flex items-center ${
                        isRightBarExpanded
                          ? `w-full px-3 py-2 space-x-2.5 text-left ${
                              isBoardLight ? "text-amber-400 bg-amber-400/10" : "text-slate-300 hover:bg-white/10"
                            }`
                          : `p-2.5 justify-center ${
                              isBoardLight ? "text-amber-400 hover:bg-amber-400/10" : "text-slate-300 hover:bg-white/10"
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
                      className={`rounded-xl transition-all flex items-center ${
                        isRightBarExpanded
                          ? "w-full px-3 py-2 space-x-2.5 text-left hover:text-white hover:bg-white/5 text-slate-300"
                          : "p-2.5 justify-center hover:text-white hover:bg-white/5 text-slate-300"
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
    </div>
  );
}
