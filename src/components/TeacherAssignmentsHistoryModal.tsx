"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Trophy,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Layers,
  GraduationCap
} from "lucide-react";
import { ClassroomAssignment } from "@/app/api/classroom-homework/route";

interface TeacherAssignmentsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  appLanguage?: "uz" | "en" | "ru";
  activeClassroomName?: string;
}

export default function TeacherAssignmentsHistoryModal({
  isOpen,
  onClose,
  isLight = false,
  appLanguage = "uz",
  activeClassroomName = "Sinf"
}: TeacherAssignmentsHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"homework" | "level_check" | "group_quiz">("homework");
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);

  const isEn = appLanguage === "en";
  const isRu = appLanguage === "ru";

  // Fetch homework assignments and student submissions
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch assigned homework
      const hwRes = await fetch("/api/classroom-homework?all=true");
      if (hwRes.ok) {
        const hwData = await hwRes.json();
        if (hwData.success && Array.isArray(hwData.homeworks)) {
          setAssignments(hwData.homeworks);
        }
      }

      // 2. Fetch student submissions / level checks
      const subRes = await fetch("/api/submissions?limit=50");
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success && Array.isArray(subData.submissions)) {
          setSubmissions(subData.submissions.filter((s: any) => s.student_name !== "__CLASSROOM_ASSIGNMENT__"));
        }
      }
    } catch (e) {
      console.warn("Error fetching assignments history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleDeleteAssignment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isEn ? "Delete this assignment?" : isRu ? "Удалить это задание?" : "Ushbu biriktirilgan vazifani o'chirmoqchimisiz?")) return;

    try {
      await fetch(`/api/classroom-homework?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      // Also update localStorage
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("teacheros_homeworks_"));
        keys.forEach((k) => {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              localStorage.setItem(k, JSON.stringify(parsed.filter((item: any) => item.id !== id)));
            }
          }
        });
      } catch (err) {}
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-[28px] border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight ? "bg-white border-slate-200" : "bg-[#131428] border-white/10"
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between shrink-0 ${
            isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30">
                TeacherOS Activity Hub
              </span>
              <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                • {activeClassroomName}
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center space-x-2 ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              <span>
                {isEn ? "Assignments & Class History" : isRu ? "История заданий и классов" : "Topshiriqlar & Sinf Faoliyati Tarixi"}
              </span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
              title="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center px-6 pt-3 border-b gap-3 shrink-0 ${
          isLight ? "border-slate-200 bg-white" : "border-white/10 bg-[#0f1020]"
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab("homework")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "homework"
                ? "border-[#635BFF] text-[#635BFF]"
                : isLight
                ? "border-transparent text-slate-500 hover:text-slate-900"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {isEn ? "Assigned Homework" : isRu ? "Назначенные Д/З" : "Biriktirilgan Uyga Vazifalar"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10">
              {assignments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("level_check")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "level_check"
                ? "border-amber-400 text-amber-400"
                : isLight
                ? "border-transparent text-slate-500 hover:text-slate-900"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>
              {isEn ? "Student Submissions" : isRu ? "Результаты учеников" : "O'quvchilar Natijalari"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10">
              {submissions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("group_quiz")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "group_quiz"
                ? "border-emerald-400 text-emerald-400"
                : isLight
                ? "border-transparent text-slate-500 hover:text-slate-900"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {isEn ? "Classroom Sessions" : isRu ? "Сессии классов" : "Guruh Darslari"}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 scrollbar-thin">
          {/* TAB 1: ASSIGNED HOMEWORK */}
          {activeTab === "homework" && (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-slate-400">
                    📚
                  </div>
                  <h3 className={`text-base font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                    {isEn ? "No homework assigned yet" : isRu ? "Заданий пока не назначено" : "Hozircha biriktirilgan vazifalar yo'q"}
                  </h3>
                  <p className={`text-xs max-w-sm leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isEn
                      ? "When you generate and click 'ASSIGN' on any homework, it will be saved here and appear in the students' app."
                      : isRu
                      ? "Когда вы создадите и нажмете «ASSIGN», задание сохранится здесь и отобразится у учеников."
                      : "Uyga vazifani generatsiya qilib 'ASSIGN' tugmasini bosganingizda u shu yerda saqlanadi va o'quvchilar ilovasida paydo bo'ladi."}
                  </p>
                </div>
              ) : (
                assignments.map((hw) => {
                  const isExpanded = expandedHwId === hw.id;
                  const dateStr = hw.assignedAt
                    ? new Date(hw.assignedAt).toLocaleString(appLanguage === "ru" ? "ru-RU" : "uz-UZ", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Yaqinda";

                  return (
                    <div
                      key={hw.id}
                      className={`rounded-2xl border transition-all ${
                        isLight
                          ? "bg-slate-50 border-slate-200 hover:border-indigo-300"
                          : "bg-white/[0.03] border-white/10 hover:border-[#635BFF]/40"
                      }`}
                    >
                      <div
                        onClick={() => setExpandedHwId(isExpanded ? null : hw.id)}
                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="space-y-1.5 pr-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30">
                              🏫 {hw.classroomName || "Sinf"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                              {hw.intensity || "medium"}
                            </span>
                            <span className={`text-xs font-mono flex items-center space-x-1 ${
                              isLight ? "text-slate-500" : "text-slate-400"
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{dateStr}</span>
                            </span>
                          </div>

                          <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}>
                            {hw.topic}
                          </h3>

                          <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            {hw.sections?.length || 0} ta bo'lim • {hw.totalCount || 10} ta mashq savollari • Ustoz: {hw.assignedBy || "Siz"}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAssignment(hw.id, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="p-2 rounded-xl bg-white/5 text-slate-300">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Section Preview */}
                      {isExpanded && (
                        <div className={`p-4 sm:p-5 border-t space-y-4 ${
                          isLight ? "border-slate-200 bg-white" : "border-white/5 bg-black/20"
                        }`}>
                          <div className="space-y-3">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#818cf8] font-bold">
                              Mashqlar va Savollar Ro'yxati:
                            </h4>

                            {hw.sections?.map((sec, sIdx) => (
                              <div
                                key={sIdx}
                                className={`p-3.5 rounded-xl border space-y-2 ${
                                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                                  <span>{sec.title}</span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {sec.items?.length || 0} ta savol
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">{sec.instruction}</p>

                                <div className="space-y-1.5 pt-1">
                                  {sec.items?.slice(0, 3).map((item, qIdx) => (
                                    <div
                                      key={qIdx}
                                      className="text-xs p-2 rounded-lg bg-black/20 text-slate-200 font-mono flex items-start space-x-2"
                                    >
                                      <span className="text-[#635BFF] font-bold">{qIdx + 1}.</span>
                                      <div className="space-y-0.5">
                                        <p>{item.question}</p>
                                        <p className="text-[10px] text-emerald-400">Javob: {item.answer}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {(sec.items?.length || 0) > 3 && (
                                    <p className="text-[10px] text-slate-500 font-mono italic">
                                      ...yana {(sec.items?.length || 0) - 3} ta savol
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: STUDENT SUBMISSIONS */}
          {activeTab === "level_check" && (
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-slate-400">
                    🏆
                  </div>
                  <h3 className={`text-base font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                    {isEn ? "No submissions yet" : isRu ? "Пока нет ответов учеников" : "Hozircha o'quvchilar natijalari yo'q"}
                  </h3>
                  <p className={`text-xs max-w-sm leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isEn
                      ? "When students complete homework or diagnostic level checks, their live scores will sync here automatically."
                      : isRu
                      ? "Когда ученики выполнят задания, их баллы отобразятся здесь в реальном времени."
                      : "O'quvchilar topshiriqlarni yoki testlarni yechganda ularning ballari avtomatik shu yerda ko'rinadi."}
                  </p>
                </div>
              ) : (
                submissions.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.03] border-white/10"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                          {sub.student_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {sub.syllabus_level || "B1"}
                        </span>
                      </div>
                      <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        {sub.topic_title} • {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-base font-black text-emerald-400 font-mono">
                        {sub.score} / {sub.total_questions} ({sub.percent}%)
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Topshirildi ✔</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: GROUP QUIZZES / SESSIONS */}
          {activeTab === "group_quiz" && (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-400">
                ⚡
              </div>
              <h3 className={`text-base font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                Guruh Viktorinalari & Dars Seanslari
              </h3>
              <p className={`text-xs max-w-sm leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Dars vaqtida o'tkazilgan Baamboozle uslubidagi guruh bellashuvlari va g'olib jamoalar statistikasi shu yerda qayd etiladi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
