"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { X, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Trophy, Award, Sparkles } from "lucide-react";

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
  }>;
}

interface StudentHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: StudentHomeworkItem | null;
  onComplete: (hwId: string, score: number, total: number) => void;
  appLanguage?: "uz" | "en" | "ru";
}

export default function StudentHomeworkModal({
  isOpen,
  onClose,
  homework,
  onComplete,
  appLanguage = "uz"
}: StudentHomeworkModalProps) {
  if (!isOpen || !homework) return null;

  // Default mock questions if specific payload is empty
  const questions = homework.questions && homework.questions.length > 0
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
          explanation: `Past Perfect (had + V3) o'tmishdagi boshqa voqeadan oldin sodir bo'lgan ish-harakatni ifodalaydi.`
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
          explanation: `Kino biz yetib borganimizdan oldin boshlangan edi, shuning uchun 'had already started' bo'lishi shart.`
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
          explanation: `O'tmishdagi sabab va davomiy jarayon uchun Past Perfect Continuous ishlatiladi.`
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
          explanation: `To'g'ri ketma-ketlik: 'When I came home' (Past Simple) + 'had already fallen asleep' (Past Perfect).`
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
          explanation: `Eshikni ocha olmaslik sababi undan avval kalitni qoldirib ketganlikdir ('had left').`
        }
      ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const handleFinish = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const chosen = (selectedAnswers[idx] || "").trim().toLowerCase();
      const ans = (q.answer || "").trim().toLowerCase();
      if (chosen && (chosen === ans || chosen.startsWith(ans.charAt(0)) || ans.includes(chosen) || (ans.includes("->") && ans.split("->").some(part => chosen.includes(part.trim()))))) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

    onComplete(homework.id, correctCount, questions.length);
  };

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-[24px] bg-[#1a1c36] border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#635BFF]/20 text-[#818cf8] border border-[#635BFF]/30">
                {appLanguage === "en" ? "Homework Assignment" : appLanguage === "ru" ? "Домашнее задание" : "Uyga Vazifa"}
              </span>
              <span className="text-xs text-slate-400 font-mono">📅 {homework.assignedDate}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{homework.topic}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <>
            {/* Progress indicators */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                {appLanguage === "en" ? "Question" : appLanguage === "ru" ? "Вопрос" : "Savol"} {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center space-x-1.5">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentIndex
                        ? "bg-[#635BFF] scale-125"
                        : selectedAnswers[i]
                        ? "bg-emerald-500"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#131428] border border-white/5 space-y-2">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options or Text Input */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#635BFF]/25 border-[#635BFF] text-white shadow-[0_0_15px_rgba(99,91,255,0.35)]"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#818cf8] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={selectedAnswers[currentIndex] || ""}
                  onChange={(e) => handleSelectOption(e.target.value)}
                  placeholder={appLanguage === "en" ? "Type your answer here..." : appLanguage === "ru" ? "Введите ваш ответ здесь..." : "Javobingizni bu yerga yozing..."}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] text-base"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← {appLanguage === "en" ? "Previous" : appLanguage === "ru" ? "Назад" : "Oldingi"}
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all flex items-center space-x-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{appLanguage === "en" ? "Submit Homework" : appLanguage === "ru" ? "Сдать задание" : "Vazifani topshirish"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#635BFF] hover:bg-[#5248e3] text-white shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>{appLanguage === "en" ? "Next" : appLanguage === "ru" ? "Далее" : "Keyingisi"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results View */
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                {appLanguage === "en" ? "Homework Completed!" : appLanguage === "ru" ? "Задание выполнено!" : "Ajoyib natija! Vazifa topshirildi!"}
              </h3>
              <p className="text-sm text-slate-400">
                {appLanguage === "en"
                  ? `Your score: ${score} out of ${questions.length}`
                  : appLanguage === "ru"
                  ? `Твой результат: ${score} из ${questions.length}`
                  : `Sizning to'plagan ballingiz: ${score} / ${questions.length}`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full max-w-sm flex items-center justify-around font-mono text-xs">
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase">Natija</span>
                <span className="text-lg font-bold text-emerald-400">{Math.round((score / questions.length) * 100)}%</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase">Streak</span>
                <span className="text-lg font-bold text-amber-400">+1 🔥</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="text-slate-400 block text-[10px] uppercase">Holat</span>
                <span className="text-lg font-bold text-sky-400">Done ✔</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#2563eb] text-white font-bold text-sm shadow-xl hover:brightness-110 transition-all cursor-pointer"
            >
              {appLanguage === "en" ? "Back to Dashboard" : appLanguage === "ru" ? "Вернуться на главную" : "Asosiy oynaga qaytish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
