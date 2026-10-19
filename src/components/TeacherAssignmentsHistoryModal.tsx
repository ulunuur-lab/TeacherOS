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
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string; students: any[] }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);

  const isEn = appLanguage === "en";
  const isRu = appLanguage === "ru";

  // Fetch homework assignments, student submissions, and real classrooms
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

      // 3. Fetch real classrooms
      const clsRes = await fetch("/api/classrooms?all=true");
      if (clsRes.ok) {
        const clsData = await clsRes.json();
        if (clsData.success && Array.isArray(clsData.classrooms)) {
          setClassrooms(clsData.classrooms);
        }
      } else {
        try {
          const allKeys = Object.keys(localStorage);
          const clsKeys = allKeys.filter((k) => k.startsWith("teacheros_classrooms_"));
          const collected: any[] = [];
          clsKeys.forEach((k) => {
            const raw = localStorage.getItem(k);
            if (raw) {
              const p = JSON.parse(raw);
              if (Array.isArray(p)) collected.push(...p);
            }
          });
          setClassrooms(collected);
        } catch (e) {}
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

        {/* 3 Prominent Separated Block Cards (HW, Student Results, Class Sessions) */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 border-b shrink-0 ${
          isLight ? "border-slate-200 bg-slate-100/60" : "border-white/10 bg-[#0c0d1c]"
        }`}>
          {/* Block 1: Assigned Homework (HW) */}
          <button
            type="button"
            onClick={() => setActiveTab("homework")}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${
              activeTab === "homework"
                ? isLight
                  ? "bg-indigo-50 border-indigo-600 shadow-md text-indigo-950"
                  : "bg-gradient-to-br from-[#635BFF]/30 to-[#4F46E5]/15 border-[#635BFF] shadow-[0_0_25px_rgba(99,91,255,0.3)] text-white"
                : isLight
                  ? "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                activeTab === "homework"
                  ? "bg-gradient-to-tr from-[#635BFF] to-[#818cf8] text-white shadow-lg"
                  : isLight ? "bg-indigo-100 text-indigo-600" : "bg-white/10 text-indigo-400"
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-black text-xs sm:text-sm tracking-tight truncate">
                  {isEn ? "Assigned Homework" : isRu ? "Назначенные Д/З" : "Uyga Vazifalar"}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? "Class tasks" : isRu ? "Задания класса" : "Biriktirilgan topshiriqlar"}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black shrink-0 ${
              activeTab === "homework"
                ? "bg-indigo-500 text-white shadow"
                : isLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-slate-300"
            }`}>
              {assignments.length}
            </span>
          </button>

          {/* Block 2: Student Submissions / Level Checks */}
          <button
            type="button"
            onClick={() => setActiveTab("level_check")}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${
              activeTab === "level_check"
                ? isLight
                  ? "bg-amber-50 border-amber-600 shadow-md text-amber-950"
                  : "bg-gradient-to-br from-amber-500/30 to-yellow-600/15 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] text-white"
                : isLight
                  ? "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                activeTab === "level_check"
                  ? "bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-lg"
                  : isLight ? "bg-amber-100 text-amber-700" : "bg-white/10 text-amber-400"
              }`}>
                <Trophy className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-black text-xs sm:text-sm tracking-tight truncate">
                  {isEn ? "Student Results" : isRu ? "Результаты учеников" : "O'quvchilar Natijalari"}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? "Scores & checks" : isRu ? "Баллы и ответы" : "Topshirilgan natijalar"}
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black shrink-0 ${
              activeTab === "level_check"
                ? "bg-amber-500 text-slate-950 shadow"
                : isLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-slate-300"
            }`}>
              {submissions.length}
            </span>
          </button>

          {/* Block 3: Group Classroom Lessons */}
          <button
            type="button"
            onClick={() => setActiveTab("group_quiz")}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${
              activeTab === "group_quiz"
                ? isLight
                  ? "bg-emerald-50 border-emerald-600 shadow-md text-emerald-950"
                  : "bg-gradient-to-br from-emerald-500/30 to-teal-600/15 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] text-white"
                : isLight
                  ? "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                activeTab === "group_quiz"
                  ? "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg"
                  : isLight ? "bg-emerald-100 text-emerald-700" : "bg-white/10 text-emerald-400"
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-black text-xs sm:text-sm tracking-tight truncate">
                  {isEn ? "Class Sessions" : isRu ? "Сессии классов" : "Guruh Darslari"}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? "Live Baamboozle" : isRu ? "Викторины" : "Sinf bellashuvlari"}
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
              activeTab === "group_quiz"
                ? "bg-emerald-500 text-slate-950 shadow"
                : isLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-slate-300"
            }`}>
              Faol
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
                      className={`rounded-2xl border-2 transition-all overflow-hidden ${
                        isLight
                          ? "bg-white border-slate-200 hover:border-indigo-400 shadow-md hover:shadow-indigo-500/10"
                          : "bg-gradient-to-br from-[#171936] to-[#0f1024] border-white/15 hover:border-[#635BFF]/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                      }`}
                    >
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center space-x-1">
                              <span>🏫</span>
                              <span>{hw.classroomName || "Sinf"}</span>
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/35">
                              {hw.intensity || "MEDIUM"}
                            </span>
                            <span className={`text-xs font-mono flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
                              isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-slate-300"
                            }`}>
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{dateStr}</span>
                            </span>
                          </div>

                          {/* Topic Title */}
                          <h3 className={`text-lg sm:text-xl font-black tracking-tight ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}>
                            {hw.topic}
                          </h3>

                          {/* Summary Row */}
                          <p className={`text-xs flex items-center space-x-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            <span>📚 {hw.sections?.length || 1} ta bo'lim</span>
                            <span>•</span>
                            <span>🎯 {hw.totalCount || 5} ta mashq savoli</span>
                            <span>•</span>
                            <span>👤 Ustoz: <b className={isLight ? "text-indigo-700" : "text-indigo-300"}>{hw.assignedBy || "Siz"}</b></span>
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedHwId(isExpanded ? null : hw.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                              isExpanded
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                                : isLight
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                                  : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10"
                            }`}
                          >
                            <span>{isExpanded ? "Yashirish" : "Mashqlar"}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteAssignment(hw.id, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                            title="Vazifani o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section Preview */}
                      {isExpanded && (
                        <div className={`p-5 sm:p-6 border-t space-y-4 ${
                          isLight ? "border-slate-200 bg-slate-50/80" : "border-white/10 bg-black/40 backdrop-blur-md"
                        }`}>
                          <div className="space-y-3">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-black flex items-center space-x-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>O'quvchilarga Yuborilgan Mashqlar To'plami:</span>
                            </h4>

                            {hw.sections?.map((sec, sIdx) => (
                              <div
                                key={sIdx}
                                className={`p-4 rounded-2xl border space-y-3 ${
                                  isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#14152a] border-white/10"
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                                  <span>{sec.title}</span>
                                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    {sec.items?.length || 0} ta mashq
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400">{sec.instruction}</p>

                                <div className="space-y-2 pt-1">
                                  {sec.items?.slice(0, 5).map((item, qIdx) => (
                                    <div
                                      key={qIdx}
                                      className={`text-xs p-3 rounded-xl border flex items-start space-x-2.5 ${
                                        isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/30 border-white/5 text-slate-200"
                                      }`}
                                    >
                                      <span className="text-[#635BFF] font-black font-mono shrink-0">{qIdx + 1}.</span>
                                      <div className="space-y-1 flex-1">
                                        <p className="font-semibold">{item.question}</p>
                                        <p className="text-[11px] text-emerald-400 font-mono font-bold">✔ Javob: {item.answer}</p>
                                        {item.explanation && (
                                          <p className="text-[10px] text-slate-400 italic">💡 {item.explanation}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {(sec.items?.length || 0) > 5 && (
                                    <p className="text-xs text-slate-400 font-mono italic text-center pt-1">
                                      ...yana {(sec.items?.length || 0) - 5} ta mashq
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
            <div className="space-y-3.5">
              {submissions.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl text-amber-400 shadow-lg">
                    🏆
                  </div>
                  <h3 className={`text-base font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                    {isEn ? "No submissions yet" : isRu ? "Пока нет ответов учеников" : "Hozircha o'quvchilar natijalari yo'q"}
                  </h3>
                  <p className={`text-xs max-w-sm leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isEn
                      ? "When students complete homework in the student app or diagnostic level checks, their live scores sync here automatically."
                      : isRu
                      ? "Когда ученики выполнят задания, их баллы отобразятся здесь в реальном времени."
                      : "O'quvchilar ilovada vazifalarni yechganda ularning ballari va xatolari avtomatik shu yerda ko'rinadi."}
                  </p>
                </div>
              ) : (
                submissions.map((sub, idx) => {
                  const percent = sub.percent !== undefined ? sub.percent : Math.round((sub.score / (sub.total_questions || 1)) * 100);
                  const isPerfect = percent === 100;
                  const isGood = percent >= 80;

                  return (
                    <div
                      key={sub.id || idx}
                      className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isLight
                          ? "bg-white border-slate-200 hover:border-amber-400 shadow-sm"
                          : "bg-gradient-to-br from-[#181a34] to-[#121326] border-white/10 hover:border-amber-500/40 shadow-lg"
                      }`}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                          isPerfect
                            ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white"
                            : isGood
                              ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-white"
                              : "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white"
                        }`}>
                          {sub.student_name ? sub.student_name.slice(0, 2).toUpperCase() : "OQ"}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`font-black text-base truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                              {sub.student_name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                              {sub.syllabus_level || "B1"}
                            </span>
                          </div>

                          <p className={`text-xs truncate ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            📚 {sub.topic_title}
                            {sub.created_at && (
                              <span className="opacity-75"> • {new Date(sub.created_at).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                        <div className="text-right space-y-0.5">
                          <div className={`text-lg font-black font-mono ${
                            isPerfect ? "text-emerald-400" : isGood ? "text-amber-400" : "text-indigo-400"
                          }`}>
                            {sub.score} / {sub.total_questions} ({percent}%)
                          </div>
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Topshirildi</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: GROUP QUIZZES / SESSIONS */}
          {activeTab === "group_quiz" && (
            <div className="space-y-4 py-2">
              {classrooms.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400 shadow-lg">
                    👥
                  </div>
                  <h3 className={`text-base font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                    {isEn ? "No classrooms created yet" : isRu ? "Классы пока не созданы" : "Hozircha sinflar mavjud emas"}
                  </h3>
                  <p className={`text-xs max-w-sm leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isEn
                      ? "Create classrooms in the teacher sidebar to organize students and run live group quizzes."
                      : isRu
                      ? "Создайте классы в боковой панели, чтобы организовывать учеников."
                      : "O'quvchilarni guruhlarga ajratish va jonli musobaqalar o'tkazish uchun yangi sinf yarating."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.map((cls, idx) => {
                    const studentCount = Array.isArray(cls.students) ? cls.students.length : 0;
                    return (
                      <div
                        key={cls.id || idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#181a34] border-white/10"
                        }`}
                      >
                        <div className="text-xs uppercase font-bold text-slate-400">
                          {idx === 0 ? (isEn ? "Active Class" : "Faol Sinf") : (isEn ? "Class" : "Sinf")}
                        </div>
                        <div className="text-base font-black text-indigo-400 mt-1 truncate">
                          {cls.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {studentCount} {isEn ? "students" : "ta o'quvchi"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
              }`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center text-xl shadow-lg">
                  ⚡
                </div>
                <h4 className={`text-sm font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                  Baamboozle Guruh Musobaqalari Seansi
                </h4>
                <p className={`text-xs max-w-md mx-auto leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Dars vaqtida o'quvchilarni 2 yoki 4 jamoaga bo'lib interaktiv viktorina o'tkazishingiz mumkin. Barcha ballar shu yerda avtomatik jamlanadi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
