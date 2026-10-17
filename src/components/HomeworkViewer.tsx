'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Home, Copy, Send, CheckCircle2, Sparkles, BookOpen, PenTool } from 'lucide-react';

interface HomeworkViewerProps {
  topic: string;
  onClose: () => void;
}

export default function HomeworkViewer({ topic, onClose }: HomeworkViewerProps) {
  const [copied, setCopied] = useState(false);
  const [studentText, setStudentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const homeworkData = {
    title: `${topic} — Maxsus Kengaytirilgan Uyga Vazifa`,
    level: "A1 - B1 Intermediate",
    sections: [
      {
        title: "1-BO'LIM: Yangi Lug'atlar & Misollar (15 ta)",
        items: [
          "1. define (v) — ta'riflamoq",
          "2. explain (v) — tushuntirmoq",
          "3. accurate (adj) — aniq, to'g'ri",
          "4. structure (n) — tuzilma",
          "5. practice (v) — mashq qilmoq",
          "6. habit (n) — odat",
          "7. routine (n) — kun tartibi",
          "8. exception (n) — istisno",
          "9. auxiliary (adj) — yordamchi",
          "10. negative (adj) — inkor",
          "11. statement (n) — darak gap",
          "12. frequency (n) — takroriylik",
          "13. usually (adv) — odatda",
          "14. seldom (adv) — kamdan-kam",
          "15. master (v) — mukammal o'rganmoq"
        ]
      },
      {
        title: "2-BO'LIM: O'zbekchadan Inglizchaga Tarjima (6 ta gap)",
        items: [
          "1. U har kuni ertalab soat 8da maktabga boradi.",
          "2. Men bu qoidani juda yaxshi tushunaman.",
          "3. Ular yakshanba kunlari ishlamaydilar.",
          "4. Siz ingliz tilida erkin gaplashasizmi?",
          "5. Mening do'stim Toshkentda yashaydi.",
          "6. Biz haftada ikki marta kutubxonaga boramiz."
        ]
      },
      {
        title: "3-BO'LIM: Grammatik Xatolarni Toping va Tuzating (5 ta tuzoq)",
        items: [
          "• ❌ She don't like drinking cold water.",
          "• ❌ Does he works in a hospital?",
          "• ❌ We goes to the gym every morning.",
          "• ❌ My brother always wake up early.",
          "• ❌ They doesn't have enough time."
        ]
      },
      {
        title: "4-BO'LIM: Shaxsiy Yozma Insho (8-12 gap)",
        desc: `"${topic}" qoidalarini qo'llagan holda o'z kuningiz yoki shaxsiy tajribangiz haqida insho yozing. Kamida 5 ta yangi so'zni qo'llang.`
      }
    ]
  };

  const handleCopy = () => {
    const fullText = `📝 ${homeworkData.title}\n\n` +
      homeworkData.sections.map(s => `📌 ${s.title}\n` + (s.items ? s.items.join('\n') : s.desc)).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentText.trim()) return;
    setIsSubmitting(true);
    try {
      // Mock / Telegram sync
      await new Promise(r => setTimeout(r, 1200));
      setSubmitted(true);
      confetti({ particleCount: 70, spread: 60 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-7 rounded-3xl bg-[#12141D]/98 border border-indigo-500/30 shadow-2xl space-y-6 text-slate-100 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                To'liq Uyga Vazifa
              </span>
              <span className="text-xs text-slate-400">• {homeworkData.level}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {homeworkData.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Nusxalandi!" : "Nusxalash"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            ✕ Yopish
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {homeworkData.sections.map((sec, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-xs sm:text-sm font-black text-[#A5B4FC] flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5]" />
              <span>{sec.title}</span>
            </h4>
            {sec.items ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300 font-medium pt-1">
                {sec.items.map((it, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-black/20">
                    {it}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {sec.desc}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Student Submission Form */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-white/10 space-y-3">
        <label className="text-xs font-bold text-slate-300 block">
          ✍️ Vazifa javoblarini shu yerga yozing:
        </label>
        <textarea
          rows={4}
          value={studentText}
          onChange={(e) => setStudentText(e.target.value)}
          placeholder="Javoblaringizni yozing..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B3DF5]"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Javoblar to'g'ridan-to'g'ri o'qituvchiga yuboriladi.
          </span>
          <button
            type="submit"
            disabled={isSubmitting || submitted}
            className="px-5 py-2.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white text-xs font-black shadow-lg disabled:opacity-50 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Topshirildi!</span>
              </>
            ) : isSubmitting ? (
              <span>Yuborilmoqda...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ustozga Yuborish</span>
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
