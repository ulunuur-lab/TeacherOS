'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Users, Trophy, Sparkles, RotateCcw, ArrowRight, Check, X, Flame } from 'lucide-react';

export interface QuizTile {
  id: number;
  points: number;
  question: string;
  answer: string;
  isSpecial?: boolean;
  specialType?: 'double' | 'lose' | 'bonus';
  opened: boolean;
  awardedTo?: number; // team index
}

interface BaamboozleQuizProps {
  topic: string;
  teamsCount: 2 | 3;
  onClose: () => void;
}

export default function BaamboozleQuiz({ topic, teamsCount, onClose }: BaamboozleQuizProps) {
  // Teams setup
  const [teams, setTeams] = useState<Array<{ name: string; score: number; color: string; border: string }>>([
    { name: 'Guruh 1 (Burgutlar)', score: 0, color: 'bg-emerald-600', border: 'border-emerald-400' },
    { name: 'Guruh 2 (Sherlar)', score: 0, color: 'bg-indigo-600', border: 'border-indigo-400' },
    ...(teamsCount === 3
      ? [{ name: 'Guruh 3 (Lochinlar)', score: 0, color: 'bg-amber-600', border: 'border-amber-400' }]
      : [])
  ]);

  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [selectedTile, setSelectedTile] = useState<QuizTile | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // 12 Authentic Baamboozle Tiles for the chosen topic
  const [tiles, setTiles] = useState<QuizTile[]>([
    { id: 1, points: 15, question: `"${topic}" mavzusidagi asosiy qoida nima?`, answer: "Qoida bo'yicha to'g'ri grammatik tuzilma va kontekst", opened: false },
    { id: 2, points: 20, question: `Xatoni toping: "She doesn't has a car"`, answer: "doesn't has ➔ doesn't have", opened: false },
    { id: 3, points: 10, question: `Tarjima qiling: "Men har kuni soat 7da uyg'onaman"`, answer: "I wake up at 7 o'clock every day", opened: false },
    { id: 4, points: 25, question: "🎁 BONUS! Guruhga qo'shimcha 25 ball beriladi!", answer: "Tabriklaymiz!", isSpecial: true, specialType: 'bonus', opened: false },
    { id: 5, points: 20, question: `Gapni to'ldiring: "They ______ (live) here since 2020."`, answer: "have lived / have been living", opened: false },
    { id: 6, points: 15, question: `Savol tuzing: "She speaks three languages."`, answer: "Does she speak three languages?", opened: false },
    { id: 7, points: 20, question: `To'g'ri fe'l shaklini ayting: "Go" ning 3-shakli (V3)?`, answer: "Go ➔ Went ➔ Gone", opened: false },
    { id: 8, points: 25, question: `⚡ TEZKOR SAVOL: "Yesterday" so'zi qaysi zamonda ishlatiladi?`, answer: "Past Simple", opened: false },
    { id: 9, points: 10, question: `Xatoni tuzating: "He go to school every day."`, answer: "He goes to school every day", opened: false },
    { id: 10, points: 20, question: "🔥 O'G'IRLIK! Raqib guruhdan 10 ball tortib olinadi!", answer: "Boshqa guruhdan -10 ball!", isSpecial: true, specialType: 'double', opened: false },
    { id: 11, points: 15, question: `Inkor gap tuzing: "We played tennis yesterday."`, answer: "We didn't play tennis yesterday.", opened: false },
    { id: 12, points: 30, question: `🏆 FINAL SAVOLI: "${topic}" mavzusida eng ko'p qilinadigan o'zbekcha xato?`, answer: "So'zma-so'z tarjima qilish va fe'l qo'shimchalarini unutish", opened: false }
  ]);

  const handleTileClick = (tile: QuizTile) => {
    if (tile.opened) return;
    setSelectedTile(tile);
    setShowAnswer(false);
  };

  const handleAwardPoints = (success: boolean) => {
    if (!selectedTile) return;

    if (success) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
      setTeams((prev) =>
        prev.map((team, idx) =>
          idx === currentTurn ? { ...team, score: team.score + selectedTile.points } : team
        )
      );
    }

    setTiles((prev) =>
      prev.map((t) =>
        t.id === selectedTile.id
          ? { ...t, opened: true, awardedTo: success ? currentTurn : undefined }
          : t
      )
    );

    setSelectedTile(null);
    setShowAnswer(false);
    // Switch turn to next team
    setCurrentTurn((prev) => (prev + 1) % teams.length);
  };

  const allDone = tiles.every((t) => t.opened);
  const leadingTeam = [...teams].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 rounded-3xl bg-[#12141D]/98 border border-white/15 shadow-2xl space-y-6 text-slate-100 animate-fade-in relative">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5B3DF5] to-emerald-500 flex items-center justify-center text-white shadow-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Baamboozle Group Quiz
              </span>
              <span className="text-xs text-slate-400">• {teamsCount} ta guruh</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {topic}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          ✕ Chiqish
        </button>
      </div>

      {/* TEAM SCOREBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {teams.map((team, idx) => {
          const isTurn = currentTurn === idx;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                isTurn
                  ? `${team.border} bg-white/10 shadow-xl scale-[1.02] ring-4 ring-white/10`
                  : 'border-white/10 bg-white/5 opacity-80'
              }`}
            >
              {isTurn && (
                <div className="absolute top-2 right-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 animate-pulse">
                  Navbat
                </div>
              )}
              <div className="text-xs font-extrabold text-slate-300 truncate">
                {team.name}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {team.score} <span className="text-xs font-bold text-slate-400">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* WINNER BANNER IF COMPLETED */}
      {allDone && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-indigo-500/20 border-2 border-amber-400 text-center space-y-2 animate-bounce">
          <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-xl font-black text-white">
            🏆 G'olib: {leadingTeam.name} ({leadingTeam.score} ball)!
          </h3>
          <p className="text-xs text-slate-300">
            Ajoyib o'yin bo'ldi! Barcha savollar muvaffaqiyatli yakunlandi.
          </p>
        </div>
      )}

      {/* BAAMBOOZLE 12-TILE GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
        {tiles.map((tile) => {
          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              disabled={tile.opened}
              className={`aspect-square rounded-2xl border-2 font-black text-base sm:text-xl flex flex-col items-center justify-center p-2 transition-all relative group cursor-pointer ${
                tile.opened
                  ? 'bg-slate-900/60 border-white/5 text-slate-600 scale-95'
                  : 'bg-gradient-to-br from-[#1C2030] to-[#252B42] border-indigo-500/40 hover:border-indigo-400 text-white shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {tile.opened ? (
                <span className="text-xs font-bold text-slate-500">✓ Ochildi</span>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black">{tile.id}</span>
                  <span className="text-[10px] font-mono text-indigo-300 font-bold mt-1">
                    {tile.points} pts
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* QUESTION MODAL */}
      {selectedTile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#181B26] border-2 border-[#5B3DF5] p-6 shadow-2xl space-y-5 text-center animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-slate-400">
              <span>#{selectedTile.id} raqamli savol</span>
              <span className="text-amber-400 font-black">{selectedTile.points} Ball</span>
            </div>

            <div className="text-lg sm:text-xl font-black text-white leading-relaxed">
              {selectedTile.question}
            </div>

            {showAnswer ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm font-bold animate-fade-in">
                ✅ <b>To'g'ri javob:</b> {selectedTile.answer}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                💡 Javobni Ko'rsatish
              </button>
            )}

            {/* Teacher Decision Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleAwardPoints(true)}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>To'g'ri (+{selectedTile.points})</span>
              </button>

              <button
                type="button"
                onClick={() => handleAwardPoints(false)}
                className="py-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Noto'g'ri (0 pts)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
