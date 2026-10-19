"use client";

import React, { useEffect, useRef, useState } from "react";

interface BezbetCatProps {
  isTyping?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  mood?: "happy" | "curious" | "teaching" | "sleepy";
  size?: number; // default 180
  onCatClick?: () => void;
}

export default function BezbetCat({
  isTyping = false,
  isSpeaking = false,
  isThinking = false,
  mood = "curious",
  size = 200,
  onCatClick
}: BezbetCatProps) {
  const catRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isPurring, setIsPurring] = useState<boolean>(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tracking calculation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // If student is actively typing, look straight into their eyes
      if (isTyping) {
        setPupilOffset({ x: 0, y: 0 });
        return;
      }

      if (!catRef.current) return;
      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height * 0.45; // eye height level

      const deltaX = e.clientX - catCenterX;
      const deltaY = e.clientY - catCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      const maxRadius = 9; // maximum pupil movement in pixels
      const clampedDist = Math.min(distance / 25, maxRadius);
      const angle = Math.atan2(deltaY, deltaX);

      setPupilOffset({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist
      });

      // Reset idle timer: if cursor stops for 2.8s, look straight forward at the student!
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setPupilOffset({ x: 0, y: 0 });
      }, 2800);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isTyping]);

  // Periodic natural cat blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Web Audio Purr Sound Effect on Click
  const handleCatInteraction = () => {
    setIsPurring(true);
    setTimeout(() => setIsPurring(false), 1200);

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.25);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}

    if (onCatClick) onCatClick();
  };

  return (
    <div
      ref={catRef}
      onClick={handleCatInteraction}
      className="relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 group"
      style={{ width: size, height: size }}
      title="Bezbet: AI Ingliz tili murabbiyi 🐾 (Menga bosing!)"
    >
      {/* Ambient Cat Aura Glow (only on large sizes) */}
      {size > 60 && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#635BFF]/30 to-[#38BDF8]/20 blur-2xl group-hover:blur-3xl transition-all pointer-events-none" />
      )}

      {/* Floating Sparkles when Thinking (only on large sizes) */}
      {isThinking && size > 60 && (
        <div className="absolute -top-4 flex items-center space-x-1.5 animate-bounce">
          <span className="text-amber-300 text-sm">✨</span>
          <span className="text-sky-300 text-xs font-mono font-bold bg-[#1b1d36]/90 border border-sky-400/40 px-2 py-0.5 rounded-full text-white shadow-md">
            O'ylayapman...
          </span>
          <span className="text-purple-300 text-sm">🐾</span>
        </div>
      )}

      {/* Cat SVG Illustration */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fur Gradient: Warm Playful Orange / Golden Tabby with Blue Smurf Collar */}
          <linearGradient id="bezbetFur" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.5" stopColor="#EA580C" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>

          {/* Inner Ear Pink */}
          <linearGradient id="bezbetEar" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FCA5A5" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>

          {/* Smurf Blue Collar Gradient */}
          <linearGradient id="smurfCollar" x1="50" y1="160" x2="150" y2="175" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>

          {/* Emerald Cat Eyes Gradient */}
          <radialGradient id="catEyeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>
        </defs>

        {/* 1. Left Ear */}
        <path
          d="M 38 75 Q 20 18 55 24 Q 78 30 82 65 Z"
          fill="url(#bezbetFur)"
          className="transition-transform duration-300"
        />
        {/* Left Inner Ear */}
        <path d="M 46 68 Q 36 32 58 36 Q 70 42 74 62 Z" fill="url(#bezbetEar)" opacity="0.9" />

        {/* 2. Right Ear */}
        <path
          d="M 162 75 Q 180 18 145 24 Q 122 30 118 65 Z"
          fill="url(#bezbetFur)"
          className="transition-transform duration-300"
        />
        {/* Right Inner Ear */}
        <path d="M 154 68 Q 164 32 142 36 Q 130 42 126 62 Z" fill="url(#bezbetEar)" opacity="0.9" />

        {/* 3. Cat Head Shape */}
        <path
          d="M 40 85 C 32 135 60 168 100 168 C 140 168 168 135 160 85 C 155 55 125 45 100 45 C 75 45 45 55 40 85 Z"
          fill="url(#bezbetFur)"
        />

        {/* Tabby Forehead Stripes */}
        <path d="M 100 48 L 100 64" stroke="#9A3412" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 88 52 Q 94 65 92 72" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 112 52 Q 106 65 108 72" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

        {/* 4. Cheeks (Soft highlight) */}
        <circle cx="58" cy="120" r="14" fill="#FEF08A" opacity="0.3" />
        <circle cx="142" cy="120" r="14" fill="#FEF08A" opacity="0.3" />

        {/* 5. Left Eye Socket (White Sclera) */}
        <g id="leftEye">
          <ellipse cx="68" cy="98" rx="16" ry="17" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.5" />
          {/* Eyeball / Iris */}
          {!isBlinking ? (
            <g
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transition: "transform 0.08s cubic-bezier(0.2, 0.9, 0.4, 1)"
              }}
            >
              <ellipse cx="68" cy="98" rx="12" ry="13" fill="url(#catEyeGrad)" />
              {/* Pupil (Slit / Circle that dilates when curious) */}
              <ellipse cx="68" cy="98" rx={isTyping ? 5.5 : 4.5} ry="10" fill="#022C22" />
              {/* Eye Catchlight (Sparkle) */}
              <circle cx="65" cy="93" r="3.2" fill="#FFFFFF" />
              <circle cx="71" cy="102" r="1.6" fill="#FFFFFF" opacity="0.8" />
            </g>
          ) : (
            // Blinking eyelid line
            <path d="M 52 98 Q 68 106 84 98" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* 6. Right Eye Socket (White Sclera) */}
        <g id="rightEye">
          <ellipse cx="132" cy="98" rx="16" ry="17" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.5" />
          {/* Eyeball / Iris */}
          {!isBlinking ? (
            <g
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transition: "transform 0.08s cubic-bezier(0.2, 0.9, 0.4, 1)"
              }}
            >
              <ellipse cx="132" cy="98" rx="12" ry="13" fill="url(#catEyeGrad)" />
              {/* Pupil */}
              <ellipse cx="132" cy="98" rx={isTyping ? 5.5 : 4.5} ry="10" fill="#022C22" />
              {/* Eye Catchlight */}
              <circle cx="129" cy="93" r="3.2" fill="#FFFFFF" />
              <circle cx="135" cy="102" r="1.6" fill="#FFFFFF" opacity="0.8" />
            </g>
          ) : (
            // Blinking eyelid line
            <path d="M 116 98 Q 132 106 148 98" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* 7. Cute Pink Nose */}
        <polygon points="100,118 93,110 107,110" fill="#FB7185" stroke="#9F1239" strokeWidth="1" />

        {/* 8. Mouth & Whiskers */}
        <path
          d="M 93 118 Q 86 128 78 123"
          stroke="#7C2D12"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 107 118 Q 114 128 122 123"
          stroke="#7C2D12"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Open mouth animation when speaking */}
        {isSpeaking && (
          <ellipse cx="100" cy="126" rx="5" ry="4" fill="#9F1239" className="animate-pulse" />
        )}

        {/* Left Whiskers */}
        <line x1="72" y1="116" x2="25" y2="108" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />
        <line x1="72" y1="121" x2="20" y2="122" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />
        <line x1="72" y1="126" x2="28" y2="136" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />

        {/* Right Whiskers */}
        <line x1="128" y1="116" x2="175" y2="108" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />
        <line x1="128" y1="121" x2="180" y2="122" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />
        <line x1="128" y1="126" x2="172" y2="136" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />

        {/* 9. Smurf Collar (Matching User's Smurf theme) */}
        <path
          d="M 64 162 Q 100 178 136 162 Q 138 174 134 178 Q 100 192 66 178 Q 62 174 64 162 Z"
          fill="url(#smurfCollar)"
          stroke="#0369A1"
          strokeWidth="1.5"
        />
        {/* Golden Bell / Medallion */}
        <circle cx="100" cy="182" r="8.5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="100" cy="184" r="1.5" fill="#78350F" />
      </svg>

      {/* Floating Purr / Speech Hearts when clicked */}
      {isPurring && (
        <div className="absolute -top-3 right-6 text-sm animate-ping pointer-events-none">
          ❤️ 🐾
        </div>
      )}
    </div>
  );
}
