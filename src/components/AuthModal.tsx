'use client';

import React, { useState } from 'react';
import { Lock, User, Calendar, Shield, Sparkles, ArrowRight } from 'lucide-react';

export interface AuthUser {
  username: string;
  age: number | string;
  provider: 'local' | 'google' | 'apple';
  token?: string;
}

interface AuthModalProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError("Foydalanuvchi nomini kiriting");
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (!age || Number(age) < 6 || Number(age) > 120) {
      setError("Iltimos, haqiqiy yoshingizni kiriting (xavfsizlik uchun)");
      return;
    }

    const user: AuthUser = {
      username: username.trim(),
      age: Number(age),
      provider: 'local',
      token: `local_${Date.now()}`
    };

    localStorage.setItem('teacheros_auth_user', JSON.stringify(user));
    onLoginSuccess(user);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Generate clean persistent social user session
    const socialName = provider === 'google' ? 'Google Foydalanuvchisi' : 'Apple Foydalanuvchisi';
    const user: AuthUser = {
      username: socialName,
      age: 24,
      provider,
      token: `${provider}_${Date.now()}`
    };
    localStorage.setItem('teacheros_auth_user', JSON.stringify(user));
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/90 backdrop-blur-2xl">
      <div className="w-full max-w-md rounded-3xl bg-[#12141D] border border-white/15 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 animate-fade-in text-slate-100">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#5B3DF5]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5]" />
            <span>TeacherOS 2.0 • Avtorizatsiya</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {mode === 'login' ? 'Hisobingizga kiring' : "Ro'yxatdan o'ting"}
          </h2>
          <p className="text-xs text-slate-400">
            Bir marta kirsangiz, keyingi safar Canva kabi avtomatik eslab qoladi.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-pulse text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Foydalanuvchi nomi (Login)
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan: ulunur yoki ustoz_ali"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B3DF5] font-medium transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Parol
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B3DF5] font-medium transition-all"
              />
            </div>
          </div>

          {/* Age Input (Security requirement) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1 flex items-center justify-between">
              <span>Yoshingiz (Security & Level)</span>
              <span className="text-[10px] text-slate-500 font-normal">Haqiqiy yosh</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5" />
              <input
                type="number"
                min="6"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="masalan: 22"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B3DF5] font-medium transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white font-extrabold text-xs sm:text-sm shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer"
          >
            <span>{mode === 'login' ? 'Tizimga Kirish' : "Ro'yxatdan O'tish"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#12141D] px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Yoki
          </span>
        </div>

        {/* Social Logins: Google [G] & Apple [] */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all hover:border-red-400 active:scale-95 cursor-pointer"
            title="Google orqali kirish"
          >
            <span className="text-red-400 font-black text-sm">G</span>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
            title="Apple orqali kirish"
          >
            <span className="text-white font-black text-sm"></span>
            <span>Apple</span>
          </button>
        </div>

        {/* Switch Login / Signup */}
        <div className="text-center pt-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            {mode === 'login' ? (
              <span>Yangi hisob yaratish kerakmi? <b className="text-indigo-400">Ro'yxatdan o'tish</b></span>
            ) : (
              <span>Akkauntingiz bormi? <b className="text-indigo-400">Kirish</b></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
