"use client";

import React, { useState } from "react";
import {
  Clock,
  Volume2,
  Layers,
  Train,
  BookOpen,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw
} from "lucide-react";
import { VisualDiagram as VisualDiagramType } from "../lib/types";

interface Props {
  diagram: VisualDiagramType;
  onSpeak?: (text: string) => void;
  isLight?: boolean;
}

export default function VisualDiagram({ diagram, onSpeak, isLight = false }: Props) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formulaMode, setFormulaMode] = useState<"pos" | "neg" | "q">("pos");
  const [selectedAnatomyToken, setSelectedAnatomyToken] = useState<number | null>(null);
  const [timelineInterrupted, setTimelineInterrupted] = useState<boolean>(false);
  const [activePyramidLevel, setActivePyramidLevel] = useState<number>(0);
  const [decisionStep, setDecisionStep] = useState<number>(0);

  const speak = (text: string) => {
    if (onSpeak) {
      onSpeak(text);
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }
  };

  const cardBg = isLight ? "bg-white border-slate-200" : "bg-[#16181F] border-white/10";
  const headerBorder = isLight ? "border-slate-100" : "border-white/10";
  const titleColor = isLight ? "text-slate-900" : "text-white";
  const subColor = isLight ? "text-slate-500" : "text-slate-400";
  const axisTrack = isLight ? "bg-slate-200" : "bg-slate-800";

  // =========================================================================
  // 1. SENTENCE ANATOMY (Gap Tuzilishi & Interaktiv Sintaksis)
  // =========================================================================
  if (diagram.type === "sentence_anatomy") {
    const {
      sentence = "I was walking home when the phone rang.",
      tokens = [],
      rule = "Davom etayotgan harakat (Past Continuous) to'satdan sodir bo'lgan ish (Past Simple) bilan to'xtatildi.",
      translation = "Men uyga ketayotganimda telefon jiringladi."
    } = diagram.data || {};

    const defaultTokens = [
      { text: "I", role: "Ega (Subject)", color: "indigo", note: "Harakat bajaruvchisi" },
      { text: "was walking", role: "Davomiy fe'l (Past Continuous)", color: "purple", note: "O'tmishda ma'lum vaqt davomida bo'layotgan ish" },
      { text: "home", role: "O'rin holi (Place)", color: "sky", note: "Qayerga qarab harakatlanayotgani" },
      { text: "when", role: "Bog'lovchi (Conjunction)", color: "amber", note: "To'satdan sodir bo'lgan ishni bog'laydi" },
      { text: "the phone rang", role: "Qisqa harakat (Past Simple)", color: "rose", note: "Davomiy ishni to'xtatgan yoki o'rtasida sodir bo'lgan bir lahzalik voqea" }
    ];

    const activeTokens = tokens && tokens.length > 0 ? tokens : defaultTokens;

    const tokenColors: Record<string, { bg: string; border: string; text: string; badge: string }> = isLight
      ? {
          indigo: { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-950", badge: "bg-indigo-700 text-white" },
          purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-950", badge: "bg-purple-700 text-white" },
          sky: { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-950", badge: "bg-sky-700 text-white" },
          amber: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-950", badge: "bg-amber-700 text-white" },
          rose: { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-950", badge: "bg-rose-700 text-white" },
          emerald: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-950", badge: "bg-emerald-700 text-white" }
        }
      : {
          indigo: { bg: "bg-indigo-600/15", border: "border-indigo-500/40", text: "text-indigo-400", badge: "bg-indigo-600 text-white" },
          purple: { bg: "bg-purple-600/15", border: "border-purple-500/40", text: "text-purple-400", badge: "bg-purple-600 text-white" },
          sky: { bg: "bg-sky-600/15", border: "border-sky-500/40", text: "text-sky-400", badge: "bg-sky-600 text-white" },
          amber: { bg: "bg-amber-600/15", border: "border-amber-500/40", text: "text-amber-400", badge: "bg-amber-600 text-white" },
          rose: { bg: "bg-rose-600/15", border: "border-rose-500/40", text: "text-rose-400", badge: "bg-rose-600 text-white" },
          emerald: { bg: "bg-emerald-600/15", border: "border-emerald-500/40", text: "text-emerald-400", badge: "bg-emerald-600 text-white" }
        };

    const selectedToken = selectedAnatomyToken !== null ? activeTokens[selectedAnatomyToken] : null;

    return (
      <div className={`w-full my-1 p-2.5 sm:p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Gap Anatomiyasi & Bo'laklari"}
              </h4>
              <p className={`text-[10px] font-medium ${subColor}`}>
                {diagram.subtitle || "Har bir so'zning gapdagi roli va vazifasi"}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Sentence Bar */}
        <div className={`p-2.5 rounded-xl border my-1 ${
          isLight ? "bg-slate-100/80 border-slate-200" : "bg-black/25 border-white/5"
        }`}>
          <div className="text-[9px] uppercase font-bold mb-1.5 tracking-wider flex items-center justify-between">
            <span className={isLight ? "text-slate-700" : "text-slate-400"}>Interaktiv Gap (ustiga bosing):</span>
            <span className={`font-mono text-[10px] font-bold ${isLight ? "text-indigo-800" : "text-indigo-400"}`}>
              👆 Click to dissect
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {activeTokens.map((tok: any, idx: number) => {
              const theme = tokenColors[tok.color] || tokenColors.indigo;
              const isSelected = selectedAnatomyToken === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAnatomyToken(isSelected ? null : idx);
                    speak(tok.text);
                  }}
                  className={`group px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all text-left flex flex-col items-start ${
                    isSelected
                      ? "ring-2 ring-[#5B3DF5] scale-102 shadow-md bg-indigo-100/50"
                      : `${theme.bg} ${theme.border} hover:scale-102 hover:border-slate-400`
                  }`}
                >
                  <span className={`text-[8px] uppercase font-extrabold tracking-wider px-1 py-0.2 rounded ${theme.badge} mb-0.5`}>
                    {tok.role}
                  </span>
                  <span className={`text-xs sm:text-sm font-black ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    {tok.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Translation row */}
          <div className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[11px] ${
            isLight ? "text-slate-800 border-slate-200 font-semibold" : "text-slate-400 border-white/5 font-medium"
          }`}>
            <span className="italic">🇺🇿 "{translation}"</span>
          </div>
        </div>

        {/* Selected Token Detail Card or Default Rule */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          selectedToken
            ? isLight
              ? "bg-indigo-50 border-indigo-200 text-indigo-950"
              : "bg-indigo-950/40 border-indigo-500/30 text-white"
            : isLight
              ? "bg-slate-50 border-slate-200 text-slate-800"
              : "bg-white/5 border-white/10 text-slate-300"
        }`}>
          {selectedToken ? (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-600 text-white">
                    {selectedToken.role}
                  </span>
                  <span className={`font-bold text-xs ${isLight ? "text-indigo-900 font-black" : "text-indigo-300"}`}>
                    "{selectedToken.text}"
                  </span>
                </div>
                <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? "text-slate-800 font-medium" : "text-slate-200"}`}>
                  💡 <b>Qoida va Vazifa:</b> {selectedToken.note}
                </p>
              </div>
              <button
                onClick={() => speak(selectedToken.text)}
                className={`p-1 rounded-md shrink-0 ml-2 ${
                  isLight ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-900" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Talaffuz"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[11px] leading-snug">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className={isLight ? "text-slate-900 font-medium" : "text-slate-200"}>
                <b className={isLight ? "text-indigo-950 font-black" : "text-white"}>Asosiy Qoida:</b> {rule}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. INTERRUPTION & DURATION TIMELINE (Haqiqiy Ma'noli Vaqt O'qi)
  // =========================================================================
  if (diagram.type === "interruption_timeline" || (diagram.type === "timeline" && diagram.data?.interruption)) {
    const {
      continuousAction = "I was watching TV",
      continuousTime = "6:00 PM – 8:00 PM (Davomiy jarayon)",
      interruptingAction = "The power went out",
      interruptingTime = "7:15 PM (To'satdan bir lahzada)",
      tense1 = "Past Continuous",
      tense2 = "Past Simple",
      fullSentence = "I was watching TV when the power went out.",
      explanation = "Past Continuous davom etayotgan harakat fonida Past Simple to'satdan sodir bo'lib, jarayonni to'xtatadi."
    } = diagram.data || {};

    return (
      <div className={`w-full my-1 p-2.5 sm:p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Harakatlarning To'qnashuvi & Vaqt O'qi"}
              </h4>
              <p className={`text-[10px] font-medium ${subColor}`}>
                {diagram.subtitle || "Davomiy fon va to'satdan bo'lgan harakatning kesishuvi"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTimelineInterrupted((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-all text-[11px] font-bold flex items-center space-x-1"
          >
            {timelineInterrupted ? <RotateCcw className="w-3 h-3" /> : <Play className="w-3 h-3 fill-amber-400" />}
            <span>{timelineInterrupted ? "Qayta" : "Jonlantirish"}</span>
          </button>
        </div>

        {/* Visual Timeline Diagram */}
        <div className={`relative py-3 px-3 my-1 rounded-xl border overflow-hidden ${
          isLight ? "bg-slate-100/90 border-slate-200" : "bg-black/25 border-white/5"
        }`}>
          {/* Timeline Axis Base */}
          <div className={`h-1.5 w-full rounded-full relative ${isLight ? "bg-slate-300" : "bg-slate-800"}`}>
            <span className={`absolute left-0 -top-4 text-[8px] font-mono font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-400"}`}>
              ← O'tmish (Past)
            </span>
            <span className={`absolute right-0 -top-4 text-[8px] font-mono font-bold uppercase ${isLight ? "text-emerald-700 font-extrabold" : "text-emerald-400"}`}>
              Hozir (NOW) ➔
            </span>
          </div>

          {/* Continuous Action Wave / Ribbon */}
          <div className="relative mt-3">
            <div className={`flex items-center justify-between text-[9px] font-bold mb-1 ${isLight ? "text-purple-950" : "text-purple-300"}`}>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>{tense1}: {continuousTime}</span>
              </span>
            </div>

            <div className="h-8 w-full rounded-lg bg-gradient-to-r from-purple-900/70 via-purple-600/50 to-purple-900/70 border-2 border-purple-500 relative flex items-center px-3 overflow-hidden shadow-inner">
              <span className="font-mono text-xs font-black text-white drop-shadow z-10">
                "{continuousAction}"
              </span>

              {/* Interruption Lightning Marker */}
              <div className={`absolute left-1/2 -top-1 -bottom-1 -translate-x-1/2 flex flex-col items-center justify-center transition-all duration-500 ${
                timelineInterrupted ? "scale-110 opacity-100" : "opacity-85"
              }`}>
                <div className="w-1 h-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
                <div className="absolute -top-2.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg animate-bounce text-xs">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Interruption Label below */}
          <div className="mt-2 flex justify-center">
            <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center space-x-1.5 ${
              isLight ? "bg-rose-100 border-rose-300 text-rose-950" : "bg-rose-600/20 border-rose-500/50 text-rose-300"
            }`}>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{tense2} (To'satdan): <b>"{interruptingAction}"</b> ({interruptingTime})</span>
            </div>
          </div>
        </div>

        {/* Full Example Sentence & Speak */}
        <div className={`p-2 rounded-xl border flex items-center justify-between ${
          isLight ? "bg-indigo-50 border-indigo-200" : "bg-indigo-950/40 border-indigo-500/30"
        }`}>
          <div className="space-y-0.5">
            <div className={`text-[9px] uppercase font-bold ${isLight ? "text-indigo-900" : "text-indigo-300"}`}>Misol Jumla:</div>
            <div className={`text-xs font-mono font-bold ${isLight ? "text-slate-950" : "text-white"}`}>"{fullSentence}"</div>
          </div>
          <button
            onClick={() => speak(fullSentence)}
            className="p-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow shrink-0 ml-2"
            title="Tinglash"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className={`text-[10px] mt-1.5 italic text-center ${isLight ? "text-slate-800 font-medium" : "text-slate-400"}`}>
          💡 {explanation}
        </p>
      </div>
    );
  }

  // =========================================================================
  // 3. VISUAL CONTRAST & ERROR DIFF (To'g'ri vs Xato - Vizual Taqqoslash)
  // =========================================================================
  if (diagram.type === "visual_diff") {
    const {
      correct = "She visited Bukhara last summer.",
      correctLabel = "Past Simple (Aniq o'tgan vaqt)",
      correctWhy = "'last summer' aniq o'tmishdagi vaqtni bildiradi. Shuning uchun Past Simple qo'yiladi.",
      wrong = "She has visited Bukhara last summer.",
      wrongLabel = "Xato tuzoq (Present Perfect + Aniq vaqt)",
      wrongWhy = "Present Perfect bilan 'yesterday', 'last week', 'in 2020' kabi aniq tugagan vaqt ko'rsatkichlari QAT'IYAN ishlatilmaydi!"
    } = diagram.data || {};

    return (
      <div className={`w-full my-1 p-2.5 sm:p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${titleColor}`}>
                {diagram.title || "To'g'ri vs Xato: Vizual Taqqoslash"}
              </h4>
              <p className={`text-[10px] font-medium ${subColor}`}>
                {diagram.subtitle || "O'quvchilar eng ko'p qiladigan xato va uning to'g'ri shakli"}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
            isLight ? "bg-indigo-100 text-indigo-900 border-indigo-200" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
          }`}>
            DIAGNOSTIKA
          </span>
        </div>

        {/* Side-by-side cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1">
          {/* Correct Card */}
          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between shadow-sm ${
            isLight ? "bg-emerald-50 border-emerald-300 text-slate-900" : "bg-emerald-950/40 border-emerald-500/50 text-white"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>To'g'ri</span>
                </span>
                <span className={`text-[9px] font-bold ${isLight ? "text-emerald-900" : "text-emerald-300"}`}>{correctLabel}</span>
              </div>
              <div className={`font-mono text-xs sm:text-sm font-black p-2 rounded-lg border ${
                isLight ? "bg-white text-emerald-950 border-emerald-300" : "bg-black/25 text-white border-emerald-500/30"
              }`}>
                "{correct}"
              </div>
              <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? "text-slate-800 font-medium" : "text-emerald-200"}`}>
                ✅ <b>Nega to'g'ri?</b> {correctWhy}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-emerald-500/20 flex justify-end">
              <button
                onClick={() => speak(correct)}
                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Tinglash"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Wrong Card */}
          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between shadow-sm ${
            isLight ? "bg-rose-50 border-rose-300 text-slate-900" : "bg-rose-950/40 border-rose-500/50 text-white"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center space-x-1">
                  <XCircle className="w-2.5 h-2.5" />
                  <span>Xato Tuzoq</span>
                </span>
                <span className={`text-[9px] font-bold ${isLight ? "text-rose-900" : "text-rose-300"}`}>{wrongLabel}</span>
              </div>
              <div className={`font-mono text-xs sm:text-sm font-black line-through p-2 rounded-lg border ${
                isLight ? "bg-white text-rose-900 border-rose-300" : "bg-black/25 text-rose-300 border-rose-500/30"
              }`}>
                "{wrong}"
              </div>
              <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? "text-slate-800 font-medium" : "text-rose-200"}`}>
                ⚠️ <b>O'zbekcha qopqon:</b> {wrongWhy}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-rose-500/20 flex justify-end">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? "text-rose-800" : "text-rose-400"}`}>Tuzoqdan qoching!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. CONCEPT PYRAMID (Prepositions in/on/at, General to Specific)
  // =========================================================================
  if (diagram.type === "concept_pyramid") {
    const {
      levels = [
        { name: "IN", scope: "Umumiy & Katta (General & Big)", examples: ["in 2026", "in summer", "in Tashkent", "in the morning"], color: "indigo" },
        { name: "ON", scope: "O'rtacha & Yuzaki (More Specific / Days)", examples: ["on Monday", "on July 5th", "on the street", "on the bus"], color: "purple" },
        { name: "AT", scope: "Juda Aniq & Nuqta (Very Specific / Exact Time)", examples: ["at 8:30 AM", "at noon", "at home", "at the bus stop"], color: "emerald" }
      ],
      topic = "Prepositions of Time & Place"
    } = diagram.data || {};

    const activeLevel = levels[activePyramidLevel] || levels[0];

    return (
      <div className={`w-full my-1 p-2.5 sm:p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Piramida Modeli (Umumiydan Aniqqa)"}
              </h4>
              <p className={`text-[10px] font-medium ${subColor}`}>
                {diagram.subtitle || "Kattadan kichik doiraga qarab qoidalar"}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
            isLight ? "bg-indigo-100 text-indigo-900 border border-indigo-200" : "bg-indigo-500/20 text-indigo-300"
          }`}>
            {topic}
          </span>
        </div>

        {/* 3-Tier Visual Pyramid Blocks */}
        <div className="space-y-1.5 my-1">
          {levels.map((lvl: any, idx: number) => {
            const isSelected = activePyramidLevel === idx;
            const widths = ["w-full", "w-4/5 mx-auto", "w-3/5 mx-auto"];
            return (
              <div
                key={idx}
                onClick={() => setActivePyramidLevel(idx)}
                className={`p-2 rounded-xl cursor-pointer transition-all border text-center flex flex-col items-center justify-center ${widths[idx]} ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-102"
                    : isLight
                      ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm sm:text-base tracking-wider">{lvl.name}</span>
                  <span className="text-[9px] opacity-80">({lvl.scope})</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Level Examples Card */}
        <div className={`p-2.5 rounded-xl border mt-1.5 ${
          isLight ? "bg-indigo-50 border-indigo-200 text-slate-900" : "bg-indigo-950/40 border-indigo-500/30 text-white"
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold ${isLight ? "text-indigo-950" : "text-indigo-300"}`}>
              💡 <b>{activeLevel.name}</b> uchun namunalar:
            </span>
            <span className={`text-[9px] font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Bosing va tinglang</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(activeLevel.examples || []).map((ex: string, eIdx: number) => (
              <button
                key={eIdx}
                onClick={() => speak(ex)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono font-bold flex items-center space-x-1 transition-colors ${
                  isLight
                    ? "bg-white hover:bg-indigo-100 border-slate-300 text-slate-900"
                    : "bg-black/30 hover:bg-indigo-600/50 border-white/10 text-white"
                }`}
              >
                <span>{ex}</span>
                <Volume2 className={`w-2.5 h-2.5 ${isLight ? "text-indigo-700" : "text-indigo-400"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. TIMELINE & EVENT TILES (Existing upgraded)
  // =========================================================================
  if (diagram.type === "timeline") {
    const { events = [], tenseComparison = [] } = diagram.data;

    const tileThemes = [
      { bg: "bg-rose-600", border: "border-rose-700", labelBadge: "bg-rose-800/40", num: "1" },
      { bg: "bg-indigo-600", border: "border-indigo-700", labelBadge: "bg-indigo-800/40", num: "2" },
      { bg: "bg-emerald-600", border: "border-emerald-700", labelBadge: "bg-emerald-800/40", num: "3" },
      { bg: "bg-amber-600", border: "border-amber-700", labelBadge: "bg-amber-800/40", num: "4" }
    ];

    return (
      <div className={`w-full my-1 p-2.5 sm:p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Vaqt O'qi Modeli"}
              </h4>
              <p className={`text-[10px] font-medium ${subColor}`}>
                {diagram.subtitle || "Zamonlarning vaqt o'qidagi joylashuvi"}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isLight ? "bg-indigo-100 text-indigo-900 border border-indigo-200 font-black" : "bg-[#E8DEFF] text-[#5B3DF5]"
          }`}>
            Vaqt O'qi
          </span>
        </div>

        {/* Visual Line Axis */}
        <div className="relative py-2.5 px-3 my-1">
          <div className={`h-1.5 w-full rounded-full relative ${axisTrack}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-indigo-600 to-emerald-500 rounded-full opacity-90" />
            
            {/* Axis Nodes */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-rose-600 ring-2 ring-black/40 shadow border border-white flex items-center justify-center text-white text-[9px] font-black">
                1
              </div>
              <span className={`text-[9px] tracking-wider mt-1 uppercase ${isLight ? "text-rose-800 font-extrabold" : "text-rose-400 font-black"}`}>
                {events[0]?.label || "1-BOSQICH"}
              </span>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-indigo-600 ring-2 ring-black/40 shadow border border-white flex items-center justify-center text-white text-[9px] font-black">
                2
              </div>
              <span className={`text-[9px] tracking-wider mt-1 uppercase ${isLight ? "text-indigo-900 font-extrabold" : "text-indigo-400 font-black"}`}>
                {events[1]?.label || "2-BOSQICH"}
              </span>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-emerald-600 ring-2 ring-black/40 shadow border border-white flex items-center justify-center text-white text-[9px] font-black">
                3
              </div>
              <span className={`text-[9px] tracking-wider mt-1 uppercase ${isLight ? "text-emerald-800 font-extrabold" : "text-emerald-400 font-black"}`}>
                {events[2]?.label || "3-BOSQICH"}
              </span>
            </div>
          </div>
        </div>

        {/* 3D Chunky Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {events.map((ev: any, idx: number) => {
            const theme = tileThemes[idx % tileThemes.length];
            const isActive = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-2.5 sm:p-3 rounded-xl text-white cursor-pointer transition-all duration-150 ${theme.bg} border-b-4 ${theme.border} ${
                  isActive ? "shadow-lg brightness-110 -translate-y-0.5" : "hover:-translate-y-0.5 opacity-95 hover:opacity-100 shadow"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${theme.labelBadge}`}>
                    {ev.label}
                  </span>
                  {ev.example && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(ev.example);
                      }}
                      className="p-1 rounded-lg bg-black/20 hover:bg-black/35 text-white transition-colors"
                      title="Tinglash"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h5 className="font-black text-base text-white tracking-tight">{ev.tense}</h5>
                <p className="text-xs font-bold text-white/95 italic mt-1 font-mono bg-black/15 p-1.5 rounded-lg">
                  "{ev.example}"
                </p>
                <p className="text-[11px] text-white/90 font-medium mt-1 leading-snug">
                  {ev.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* True/False Comparison Callouts */}
        {tenseComparison && tenseComparison.length > 0 && (
          <div className={`mt-3 pt-3 border-t ${headerBorder} grid grid-cols-1 sm:grid-cols-2 gap-2.5`}>
            {tenseComparison.map((comp: any, cIdx: number) => (
              <div
                key={cIdx}
                className={`p-3 rounded-xl border-b-4 text-white shadow-sm ${
                  comp.isPositive
                    ? "bg-emerald-600 border-emerald-700"
                    : "bg-rose-600 border-rose-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs uppercase tracking-wider">
                    {comp.isPositive ? "✅ TO'G'RI" : "❌ TUZOQ"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-bold">
                    {comp.title || (comp.isPositive ? "To'g'ri shakl" : "Xato shakl")}
                  </span>
                </div>
                <div className="bg-black/15 p-2 rounded-lg font-mono text-xs font-bold flex items-center justify-between">
                  <span>{comp.text}</span>
                  <button onClick={() => speak(comp.text)} className="p-0.5 text-white hover:text-white/80">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] font-medium text-white/90 mt-1">{comp.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 6. FORMULA BLOCKS (Existing)
  // =========================================================================
  if (diagram.type === "formula") {
    const { positive = [], negative = [], question = [], modes = [] } = diagram.data || {};
    
    const resolvedQuestion = (question && question.length > 0)
      ? question
      : [
          { role: "aux", label: "Yordamchi", value: "Auxiliary" },
          { role: "subject", label: "Ega", value: "Subject" },
          { role: "verb", label: "Asosiy fe'l", value: "Verb" },
          { role: "object", label: "To'ldiruvchi", value: "Complement?" }
        ];

    const availableModes = (modes && modes.length > 0)
      ? modes
      : [
          { id: "pos", label: "(+) Ijobiy", theme: "bg-emerald-600 border-emerald-800", tokens: positive },
          { id: "neg", label: "(-) Inkor", theme: "bg-rose-600 border-rose-800", tokens: negative },
          { id: "q", label: "(?) So'roq", theme: "bg-indigo-600 border-indigo-800", tokens: resolvedQuestion }
        ];

    const activeModeObj = availableModes.find((m: any) => m.id === formulaMode) || availableModes[0];
    const currentTokens = activeModeObj?.tokens || [];

    const blockThemes = [
      { bg: "bg-indigo-600", border: "border-indigo-700", roleBadge: "bg-indigo-800/40" },
      { bg: "bg-rose-600", border: "border-rose-700", roleBadge: "bg-rose-800/40" },
      { bg: "bg-emerald-600", border: "border-emerald-700", roleBadge: "bg-emerald-800/40" },
      { bg: "bg-amber-600", border: "border-amber-700", roleBadge: "bg-amber-800/40" }
    ];

    const inactiveBtn = isLight
      ? "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 font-bold"
      : "bg-white/5 text-slate-400 hover:bg-white/10";

    return (
      <div className={`w-full my-3 p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-sm sm:text-base font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Grammatik Formula Bloklari"}
              </h4>
              <p className={`text-[11px] font-bold ${subColor}`}>Struktura va gap qurilishi</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {availableModes.map((m: any) => {
              const isSelected = activeModeObj?.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setFormulaMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    isSelected
                      ? `${m.theme || "bg-indigo-600 border-indigo-800"} text-white border-b-2 shadow-sm`
                      : inactiveBtn
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 py-2">
          {currentTokens.map((tok: any, tIdx: number) => {
            const bColor = blockThemes[tIdx % blockThemes.length];
            return (
              <React.Fragment key={tIdx}>
                <div
                  className={`px-4 py-2.5 rounded-xl text-white ${bColor.bg} border-b-4 ${bColor.border} shadow flex flex-col items-center hover:-translate-y-0.5 transition-all`}
                >
                  <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${bColor.roleBadge}`}>
                    {tok.label}
                  </span>
                  <span className="text-sm sm:text-base font-black mt-1 drop-shadow">
                    {tok.value}
                  </span>
                </div>
                {tIdx < currentTokens.length - 1 && (
                  <span className={`font-black text-xl ${isLight ? "text-slate-800" : "text-slate-500"}`}>+</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. COMPARISON MATRIX
  // =========================================================================
  if (diagram.type === "comparison" || (diagram.type === "verb_matrix" && diagram.data?.categories && !diagram.data?.verbs)) {
    const categories = diagram.data?.categories || [];
    return (
      <div className={`w-full my-3 p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg}`}>
        <div className={`flex items-center justify-between mb-3 pb-2 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-sm sm:text-base font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Taqqoslash & Farqlash Jadvali"}
              </h4>
              <p className={`text-[11px] font-bold ${subColor}`}>
                {diagram.subtitle || "To'g'ri qo'llash va xato tuzoqlar farqi"}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            isLight ? "bg-indigo-100 text-indigo-900 border border-indigo-300 font-black" : "bg-[#E8DEFF] text-[#5B3DF5]"
          }`}>
            Taqqoslash
          </span>
        </div>

        <div className={`grid grid-cols-1 ${categories.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
          {categories.map((cat: any, cIdx: number) => {
            const isFirst = cIdx === 0;
            const cardTheme = isFirst
              ? {
                  bg: isLight ? "bg-emerald-50/90 border-emerald-300 text-emerald-950" : "bg-emerald-950/40 border-emerald-600/40 text-white",
                  badge: "bg-emerald-600 text-white",
                  itemBg: isLight ? "bg-white border-emerald-200 text-slate-800 shadow-sm" : "bg-black/35 border-emerald-500/20 text-slate-200"
                }
              : {
                  bg: isLight ? "bg-rose-50/90 border-rose-300 text-rose-950" : "bg-rose-950/40 border-rose-600/40 text-white",
                  badge: "bg-rose-600 text-white",
                  itemBg: isLight ? "bg-white border-rose-200 text-slate-800 shadow-sm" : "bg-black/35 border-rose-500/20 text-slate-200"
                };

            return (
              <div key={cIdx} className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${cardTheme.bg}`}>
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${cardTheme.badge}`}>
                      {cat.title}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(cat.items || []).map((item: string, iIdx: number) => (
                      <div
                        key={iIdx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs sm:text-sm font-medium ${cardTheme.itemBg}`}
                      >
                        <span className="leading-snug">{item}</span>
                        <button
                          type="button"
                          onClick={() => speak(item)}
                          className="p-1 rounded-md hover:bg-black/10 transition-colors ml-2 shrink-0"
                          title="Tinglash"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. VERB MATRIX
  // =========================================================================
  if (diagram.type === "verb_matrix") {
    const { verbs = [] } = diagram.data || {};
    const tableBorder = isLight ? "border-slate-200" : "border-white/10";
    const theadBg = isLight ? "bg-slate-100 text-slate-900 border-b border-slate-200" : "bg-black/60 text-white";
    const rowHover = isLight ? "hover:bg-indigo-50/60" : "hover:bg-white/5";
    const uzColor = isLight ? "text-slate-800 font-semibold" : "text-slate-300";

    return (
      <div className={`w-full my-3 p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg}`}>
        <div className={`flex items-center justify-between mb-3 pb-2 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-sm sm:text-base font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Noto'g'ri Fe'llar Matritsasi"}
              </h4>
              <p className={`text-[11px] font-bold ${subColor}`}>3 ta shakl va talaffuz audiosi</p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            isLight ? "bg-indigo-100 text-indigo-900 border border-indigo-300 font-black" : "bg-[#E8DEFF] text-[#5B3DF5]"
          }`}>
            {verbs.length} ta fe'l
          </span>
        </div>

        <div className={`overflow-x-auto max-h-56 overflow-y-auto rounded-xl border ${tableBorder}`}>
          <table className="w-full text-left font-mono text-xs">
            <thead className={`sticky top-0 z-10 font-black uppercase text-[11px] ${theadBg}`}>
              <tr>
                <th className="py-2.5 px-3">V1 (Infinitive)</th>
                <th className="py-2.5 px-3">V2 (Past Simple)</th>
                <th className="py-2.5 px-3">V3 (Participle)</th>
                <th className="py-2.5 px-3">O'zbekcha</th>
                <th className="py-2.5 px-3 text-right">Tinglash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {verbs.map((vb: any, vIdx: number) => (
                <tr key={vIdx} className={`${rowHover} transition-colors font-bold`}>
                  <td className="py-2 px-3 text-[#5B3DF5]">{vb.v1}</td>
                  <td className="py-2 px-3 text-sky-500">{vb.v2}</td>
                  <td className="py-2 px-3 text-emerald-500">{vb.v3}</td>
                  <td className={`py-2 px-3 font-sans ${uzColor}`}>{vb.uz}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => speak(`${vb.v1}, ${vb.v2}, ${vb.v3}`)}
                      className="p-1 rounded-md bg-[#E8DEFF]/40 text-[#5B3DF5] hover:bg-[#5B3DF5] hover:text-white transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9. SCHEDULE BOARD
  // =========================================================================
  if (diagram.type === "schedule_board") {
    const { items = [], station = "Transit Terminal" } = diagram.data;
    const rowBg = isLight ? "bg-[#FAF8FF] border-[#E8DEFF]" : "bg-black/25 border-white/10";
    const destColor = isLight ? "text-slate-900" : "text-white";
    const sentColor = isLight ? "text-slate-600" : "text-slate-300";

    return (
      <div className={`w-full my-3 p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg}`}>
        <div className={`flex items-center justify-between mb-3 pb-2.5 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-sm sm:text-base font-black tracking-tight font-mono uppercase ${titleColor}`}>
                {station}
              </h4>
              <p className={`text-[11px] font-bold ${subColor}`}>
                Jadval va qatnovlar: <b className="text-indigo-500">Present Simple</b>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-rose-600 text-white uppercase tracking-wider animate-pulse">
            LIVE SCHEDULE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map((row: any, rIdx: number) => (
            <div
              key={rIdx}
              className={`p-3 rounded-xl border border-b-2 hover:border-[#5B3DF5] transition-all flex items-center justify-between shadow-sm ${rowBg}`}
            >
              <div>
                <span className="px-2 py-0.5 rounded-md bg-[#5B3DF5] text-white text-[11px] font-black font-mono">
                  {row.time}
                </span>
                <h5 className={`font-black text-sm mt-1 ${destColor}`}>{row.destination}</h5>
                <p className={`text-[11px] font-semibold italic font-mono mt-0.5 ${sentColor}`}>
                  "{row.sentence}"
                </p>
              </div>
              <button
                onClick={() => speak(row.sentence)}
                className="w-8 h-8 rounded-lg bg-[#5B3DF5] text-white hover:bg-[#4C2FE0] flex items-center justify-center shadow-sm shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 10. METAPHOR / CONCEPT TILES
  // =========================================================================
  if (diagram.type === "metaphor") {
    const { left, right, middle, metaphor, explanation, cards: customCards } = diagram.data || {};
    const cards = customCards || [left, middle, right].filter(Boolean);

    if (cards.length === 0 && (metaphor || explanation || diagram.title)) {
      return (
        <div className={`w-full my-3 p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className={`flex items-center justify-between mb-3 pb-2 border-b ${headerBorder}`}>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-sm sm:text-base font-black tracking-tight ${titleColor}`}>
                  {diagram.title || "Vizual Metafora & Eslab Qolish Kaliti"}
                </h4>
                <p className={`text-[11px] font-medium ${subColor}`}>
                  {diagram.subtitle || "Tushunchani eslab qolish uchun vizual tasavvur"}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
              isLight ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-amber-500/20 text-amber-400"
            }`}>
              Xulosa Kaliti
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-xl border shadow-sm ${
            isLight
              ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950"
              : "bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-500/30 text-white"
          }`}>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-xl">💡</span>
              <h5 className={`font-black text-base sm:text-lg ${isLight ? "text-indigo-900" : "text-amber-300"}`}>
                {metaphor || diagram.title || "Oltin Qoida"}
              </h5>
            </div>
            <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isLight ? "text-slate-800" : "text-slate-200"}`}>
              {explanation || "Ushbu tushunchani jonli nutqda qo'llash orqali mustahkamlang."}
            </p>
          </div>
        </div>
      );
    }

    const cardStyles = [
      { bg: "bg-rose-600", border: "border-rose-700", badge: "bg-rose-800/40" },
      { bg: "bg-indigo-600", border: "border-indigo-700", badge: "bg-indigo-800/40" },
      { bg: "bg-amber-600", border: "border-amber-700", badge: "bg-amber-800/40" },
      { bg: "bg-emerald-600", border: "border-emerald-700", badge: "bg-emerald-800/40" }
    ];

    return (
      <div className={`w-full my-3 p-4 sm:p-5 rounded-2xl border shadow-sm ${cardBg}`}>
        <div className={`flex items-center justify-between mb-4 pb-2 border-b ${headerBorder}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-sm sm:text-base font-black tracking-tight ${titleColor}`}>
                {diagram.title || "Vizual Qiyoslash"}
              </h4>
              <p className={`text-[11px] font-medium ${subColor}`}>
                {diagram.subtitle || "Tushunchalarni farqlash va eslab qolish"}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            isLight ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-[#E8DEFF] text-[#5B3DF5]"
          }`}>
            Qiyosiy Tahlil
          </span>
        </div>

        <div className={`grid grid-cols-1 ${cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
          {cards.map((card: any, idx: number) => {
            const style = cardStyles[idx % cardStyles.length];
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl text-white ${style.bg} border-b-4 ${style.border} shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${style.badge}`}>
                      {card.badge || `Bo'lim ${idx + 1}`}
                    </span>
                  </div>
                  <h5 className="font-black text-base tracking-tight text-white">{card.title}</h5>
                  <p className="text-xs font-medium text-white/90 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {card.examples && card.examples.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/20 space-y-1.5">
                    {card.examples.map((ex: any, eIdx: number) => (
                      <div
                        key={eIdx}
                        className="p-2 rounded-lg bg-black/15 flex items-center justify-between text-xs font-mono font-bold"
                      >
                        <span className="text-white">{ex.text}</span>
                        <button
                          onClick={() => speak(ex.text)}
                          className="p-1 rounded hover:bg-black/25 transition-colors ml-2"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
