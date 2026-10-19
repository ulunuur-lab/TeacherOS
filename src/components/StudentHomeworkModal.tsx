"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  Check,
  BookOpen,
  ChevronRight,
  Flame,
  HelpCircle
} from "lucide-react";

export interface StudentHomeworkItem {
  id: string;
  topic: string;
  assignedDate: string;
  isDone: boolean;
  score?: number;
  totalQuestions?: number;
  questions?: Array<{
    id: number;
    question: string;
    options?: string[];
    answer: string;
    explanation?: string;
    sectionTitle?: string;
  }>;
}

interface StudentHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: StudentHomeworkItem | null;
  onComplete: (hwId: string, score: number, total: number) => void;
  appLanguage?: "uz" | "en" | "ru";
  isEmbedded?: boolean;
  studentName?: string;
}

export default function StudentHomeworkModal({
  isOpen,
  onClose,
  homework,
  onComplete,
  appLanguage = "uz",
  isEmbedded = false,
  studentName = "O'quvchi"
}: StudentHomeworkModalProps) {
  if (!isOpen || !homework) return null;

  // Default fallback questions if specific payload is empty
  const questions =
    homework.questions && homework.questions.length > 0
      ? homework.questions
      : [
          {
            id: 1,
            question: `Which sentence correctly uses "${homework.topic}"?`,
            options: [
              `A) She had already finished the project before the bell rang.`,
              `B) She has finished the project yesterday night.`,
              `C) She finished already before the bell had rung.`,
              `D) She had finish the project on Monday.`
            ],
            answer: `A) She had already finished the project before the bell rang.`,
            explanation: `Past Perfect (had + V3) o'tmishdagi boshqa voqeadan oldin sodir bo'lgan ish-harakatni ifodalaydi.`,
            sectionTitle: "Grammatika qoidasi"
          },
          {
            id: 2,
            question: `Identify the mistake: "By the time we arrived at the cinema, the film already started."`,
            options: [
              `A) arrived -> had arrived`,
              `B) already started -> had already started`,
              `C) at the cinema -> to cinema`,
              `D) No mistake`
            ],
            answer: `B) already started -> had already started`,
            explanation: `Kino biz yetib borganimizdan oldin boshlangan edi, shuning uchun 'had already started' bo'lishi shart.`,
            sectionTitle: "Xatoni aniqlash"
          },
          {
            id: 3,
            question: `Fill in the gap: "They were exhausted because they _________ (travel) for 14 hours."`,
            options: [
              `A) had been traveling`,
              `B) have traveled`,
              `C) are traveling`,
              `D) were travel`
            ],
            answer: `A) had been traveling`,
            explanation: `O'tmishdagi sabab va davomiy jarayon uchun Past Perfect Continuous ishlatiladi.`,
            sectionTitle: "Bo'sh joyni to'ldirish"
          },
          {
            id: 4,
            question: `Choose the correct translation: "Men uyga kelganimda, ukam allaqachon uxlab qolgan edi."`,
            options: [
              `A) When I came home, my brother had already fallen asleep.`,
              `B) When I have come home, my brother already slept.`,
              `C) When I came home, my brother has already fallen asleep.`,
              `D) When I was coming home, my brother fell asleep.`
            ],
            answer: `A) When I came home, my brother had already fallen asleep.`,
            explanation: `To'g'ri ketma-ketlik: 'When I came home' (Past Simple) + 'had already fallen asleep' (Past Perfect).`,
            sectionTitle: "Tarjima amaliyoti"
          },
          {
            id: 5,
            question: `Complete: "He couldn't open the door because he ________ his keys at the office."`,
            options: [
              `A) had left`,
              `B) has left`,
              `C) leaves`,
              `D) was leaving`
            ],
            answer: `A) had left`,
            explanation: `Eshikni ocha olmaslik sababi undan avval kalitni qoldirib ketganlikdir ('had left').`,
            sectionTitle: "Sabab va oqibat"
          }
        ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showReview, setShowReview] = useState<boolean>(false);

  const currentQ = questions[currentIndex] || questions[0];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = selectedAnswers[currentIndex] || "";

  // Play subtle feedback sound
  const playBeep = (freq = 600) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    playBeep(650);
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const handleFinish = useCallback(() => {
    let correctCount = 0;
    const mistakesList: any[] = [];

    questions.forEach((q, idx) => {
      const chosen = (selectedAnswers[idx] || "").trim().toLowerCase();
      const ans = (q.answer || "").trim().toLowerCase();
      const isCorrect =
        chosen &&
        (chosen === ans ||
          chosen.startsWith(ans.charAt(0)) ||
          ans.includes(chosen) ||
          (ans.includes("->") &&
            ans.split("->").some((part) => chosen.includes(part.trim()))));

      if (isCorrect) {
        correctCount++;
      } else {
        mistakesList.push({
          question: q.question,
          studentAnswer: selectedAnswers[idx] || "Javob berilmagan",
          correctAnswer: q.answer,
          explanation: q.explanation || ""
        });
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });

    // Submit score to database + trigger teacher telegram alert
    try {
      fetch("/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          syllabus_level: "B1",
          topic_id: 1,
          topic_title: homework.topic,
          score: correctCount,
          total_questions: questions.length,
          percent: Math.round((correctCount / questions.length) * 100),
          mistakes: mistakesList
        })
      }).catch((e) => console.warn("Score report failed:", e));
    } catch (e) {}

    onComplete(homework.id, correctCount, questions.length);
  }, [questions, selectedAnswers, studentName, homework.topic, homework.id, onComplete]);

  // Keyboard navigation: 1-4 / A-D to select, Enter to proceed ("one comes after another")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted) return;

      // Enter to advance or finish
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentAnswer) {
          if (isLast) {
            handleFinish();
          } else {
            setCurrentIndex((p) => Math.min(questions.length - 1, p + 1));
          }
        }
        return;
      }

      // Left / Right arrows
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((p) => Math.max(0, p - 1));
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentAnswer && !isLast) {
          setCurrentIndex((p) => p + 1);
        }
        return;
      }

      // Keys 1, 2, 3, 4 or A, B, C, D
      if (currentQ.options && currentQ.options.length > 0) {
        let optIdx = -1;
        if (e.key === "1" || e.key.toLowerCase() === "a") optIdx = 0;
        else if (e.key === "2" || e.key.toLowerCase() === "b") optIdx = 1;
        else if (e.key === "3" || e.key.toLowerCase() === "c") optIdx = 2;
        else if (e.key === "4" || e.key.toLowerCase() === "d") optIdx = 3;

        if (optIdx >= 0 && optIdx < currentQ.options.length) {
          e.preventDefault();
          handleSelectOption(currentQ.options[optIdx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentAnswer, isLast, currentQ.options, isSubmitted, questions.length, handleFinish]);

  const percentCompleted = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Content body
  const content = (
    <div className="w-full flex-1 flex flex-col justify-between space-y-6">
      {/* 1. TOP HEADER (100% Width) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#635BFF]/20 text-[#818cf8] border border-[#635BFF]/30 font-mono">
              {appLanguage === "en" ? "Homework Assignment" : appLanguage === "ru" ? "Домашнее задание" : "Uyga Vazifa"}
            </span>
            <span className="text-xs text-slate-400 font-mono">📅 {homework.assignedDate}</span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
              {questions.length} ta savol
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {homework.topic}
          </h1>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer border border-white/10"
        >
          <span>✕</span>
          <span className="hidden sm:inline">
            {appLanguage === "en" ? "Exit" : appLanguage === "ru" ? "Выйти" : "Chiqish"}
          </span>
        </button>
      </div>

      {!isSubmitted ? (
        <>
          {/* 2. SLEEK CONTINUOUS PROGRESS BAR (Replaces the cramped 50 dots) */}
          <div className="w-full space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">
                  {appLanguage === "en" ? "Question" : appLanguage === "ru" ? "Вопрос" : "Savol"}{" "}
                  <span className="text-[#635BFF] font-black text-sm">{currentIndex + 1}</span> / {questions.length}
                </span>
                {currentQ.sectionTitle && (
                  <span className="text-slate-400 hidden sm:inline">• {currentQ.sectionTitle}</span>
                )}
              </div>
              <span className="text-[#818cf8] font-bold">
                {percentCompleted}% {appLanguage === "en" ? "completed" : appLanguage === "ru" ? "пройдено" : "bajarildi"}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden shadow-inner p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#635BFF] via-[#818cf8] to-emerald-400 transition-all duration-300"
                style={{ width: `${percentCompleted}%` }}
              />
            </div>
          </div>

          {/* 3. QUESTION PROMPT CARD (Widened to full right space) */}
          <div className="w-full p-6 sm:p-8 rounded-[24px] bg-[#1a1c36] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#818cf8] flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>
                  {currentQ.options && currentQ.options.length > 0
                    ? appLanguage === "en"
                      ? "Choose the correct option"
                      : appLanguage === "ru"
                      ? "Выберите правильный ответ"
                      : "To'g'ri variantni tanlang"
                    : appLanguage === "en"
                    ? "Type your answer"
                    : appLanguage === "ru"
                    ? "Введите ответ"
                    : "Javobingizni yozing"}
                </span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Savol {currentIndex + 1}
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* 4. ANSWER OPTIONS GRID (Widened, 2-columns on desktop) */}
          <div className="w-full">
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === opt;
                  const keyLetter = ["A", "B", "C", "D", "E", "F"][oIdx] || `${oIdx + 1}`;
                  const cleanText = opt.replace(/^[A-D]\)\s*/i, "");

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-5 rounded-[22px] border transition-all flex items-center justify-between cursor-pointer group shadow-lg hover:scale-[1.01] active:scale-[0.99] ${
                        isSelected
                          ? "bg-[#635BFF]/30 border-[#635BFF] text-white shadow-[0_0_25px_rgba(99,91,255,0.4)] ring-2 ring-[#635BFF]"
                          : "bg-[#181a34] hover:bg-white/10 border-white/10 text-slate-200 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-4 min-w-0 pr-2">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/50"
                              : "bg-white/10 text-slate-300 group-hover:bg-white/20"
                          }`}
                        >
                          {keyLetter}
                        </span>
                        <span className="text-base sm:text-lg font-medium leading-relaxed break-words">
                          {cleanText}
                        </span>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <CheckCircle2 className="w-6 h-6 text-[#818cf8]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={selectedAnswers[currentIndex] || ""}
                  onChange={(e) => handleSelectOption(e.target.value)}
                  placeholder={
                    appLanguage === "en"
                      ? "Type your answer and press Enter..."
                      : appLanguage === "ru"
                      ? "Введите ответ и нажмите Enter..."
                      : "Javobingizni bu yerga yozing va Enter bosing..."
                  }
                  className="w-full p-5 rounded-[22px] bg-[#181a34] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF] text-base font-medium shadow-inner"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 5. BOTTOM NAVIGATION BAR (Spanning full width) */}
          <div className="w-full flex items-center justify-between pt-6 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-3 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center space-x-2 border border-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{appLanguage === "en" ? "Previous" : appLanguage === "ru" ? "Назад" : "Oldingi"}</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-bold">1-4</span>
              <span>yoki</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-bold">A-D</span>
              <span>tanlash •</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-bold">Enter</span>
              <span>keyingisi</span>
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!selectedAnswers[currentIndex]}
                className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>{appLanguage === "en" ? "Submit Homework" : appLanguage === "ru" ? "Сдать задание" : "Vazifani topshirish"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                disabled={!selectedAnswers[currentIndex]}
                className="px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#635BFF] hover:bg-[#5248e3] text-white shadow-lg shadow-[#635BFF]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>{appLanguage === "en" ? "Next" : appLanguage === "ru" ? "Далее" : "Keyingisi"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* RESULTS & DETAILED REVIEW VIEW                           */
        /* ======================================================== */
        <div className="w-full py-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)]">
            <Trophy className="w-12 h-12 text-slate-950" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {appLanguage === "en"
                ? "Homework Completed Successfully!"
                : appLanguage === "ru"
                ? "Задание успешно выполнено!"
                : "Ajoyib natija! Vazifa topshirildi!"}
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              {appLanguage === "en"
                ? `You scored ${score} out of ${questions.length} questions.`
                : appLanguage === "ru"
                ? `Ваш результат: ${score} из ${questions.length} вопросов.`
                : `Siz ${questions.length} ta savoldan ${score} tasiga to'g'ri javob berdingiz.`}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="w-full max-w-xl p-5 rounded-[24px] bg-[#181a34] border border-white/10 grid grid-cols-3 gap-4 text-center font-mono">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Aniqlik</span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
            <div className="space-y-1 border-x border-white/10">
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Streak</span>
              <span className="text-2xl font-black text-amber-400 flex items-center justify-center space-x-1">
                <span>+1</span>
                <span>🔥</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Holat</span>
              <span className="text-2xl font-black text-sky-400">Done ✔</span>
            </div>
          </div>

          {/* Question Review Accordion */}
          <div className="w-full max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-[#818cf8]" />
                <span>Savollar va javoblar tahlili:</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowReview((p) => !p)}
                className="text-xs font-bold text-[#818cf8] hover:text-white transition-colors"
              >
                {showReview ? "Yashirish ∧" : "Barchasini ko'rish ∨"}
              </button>
            </div>

            {showReview && (
              <div className="space-y-3 pt-2">
                {questions.map((q, idx) => {
                  const studentAns = selectedAnswers[idx] || "Javob berilmagan";
                  const ans = q.answer || "";
                  const isCorrect =
                    studentAns &&
                    (studentAns.trim().toLowerCase() === ans.trim().toLowerCase() ||
                      studentAns.trim().toLowerCase().startsWith(ans.trim().toLowerCase().charAt(0)) ||
                      ans.trim().toLowerCase().includes(studentAns.trim().toLowerCase()));

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-[20px] border space-y-2 ${
                        isCorrect
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-red-950/20 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 font-mono">Savol #{idx + 1}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isCorrect
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {isCorrect ? "To'g'ri ✔" : "Xato ✕"}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-white">{q.question}</p>

                      <div className="text-xs font-mono space-y-1 pt-1">
                        <p className={isCorrect ? "text-emerald-400" : "text-red-400"}>
                          <b>Sizning javobingiz:</b> {studentAns}
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-400">
                            <b>To'g'ri javob:</b> {q.answer}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-slate-300 font-sans text-xs pt-1 border-t border-white/5">
                            💡 <b>Izoh:</b> {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#635BFF] to-[#2563eb] text-white font-bold text-sm shadow-xl hover:brightness-110 transition-all cursor-pointer"
            >
              {appLanguage === "en"
                ? "Back to Homework List"
                : appLanguage === "ru"
                ? "Вернуться к заданиям"
                : "Vazifalar ro'yxatiga qaytish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // If embedded directly inside the student right stage:
  if (isEmbedded) {
    return (
      <div className="w-full flex-1 flex flex-col justify-between animate-fade-in">
        {content}
      </div>
    );
  }

  // If called as a modal: render as full-stage expansive container
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-[28px] bg-[#121324] border border-white/10 shadow-2xl p-6 sm:p-10 flex flex-col min-h-[600px] my-auto">
        {content}
      </div>
    </div>
  );
}
