'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, ArrowRight, X, RefreshCw, QrCode, Smartphone, Sparkles, ShieldCheck, User } from 'lucide-react';

export interface AuthUser {
  username: string;
  telegram_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  age?: number | string;
  provider: 'telegram' | 'local' | 'google' | 'apple';
  token?: string;
}

interface AuthModalProps {
  onLoginSuccess: (user: AuthUser) => void;
  onClose?: () => void;
}

export default function AuthModal({ onLoginSuccess, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'bot' | 'code' | 'username'>('bot');
  const [sessionId, setSessionId] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('https://t.me/english_ulunur_bot');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [inputCode, setInputCode] = useState<string>('');
  const [manualUsername, setManualUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const pollTimerRef = useRef<any>(null);

  // Initialize Telegram Auth Session
  const initSession = async () => {
    setIsLoadingSession(true);
    setError('');
    try {
      const res = await fetch('/api/auth/telegram-session?action=create');
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setDeepLink(data.deepLink);
        setQrCodeUrl(data.qrCodeUrl);
        setSessionCode(data.code);
        setIsPolling(true);
      } else {
        setError('Telegram sessiyasini yaratib bo\'lmadi');
      }
    } catch (e: any) {
      setError(e.message || 'Tarmoq xatosi');
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    initSession();
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Polling loop to detect when teacher taps Start in Telegram
  useEffect(() => {
    if (!sessionId || !isPolling) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram-session?action=poll&sessionId=${sessionId}`);
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          setIsPolling(false);
          clearInterval(pollTimerRef.current);

          const authUser: AuthUser = {
            username: data.user.username || `@Ustoz_${data.user.telegram_id}`,
            telegram_id: data.user.telegram_id,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            avatar_url: data.user.avatar_url,
            provider: 'telegram',
            token: `tg_${data.user.telegram_id}_${Date.now()}`
          };

          localStorage.setItem('teacheros_auth_user', JSON.stringify(authUser));
          onLoginSuccess(authUser);
        }
      } catch (err) {
        // Silently retry on next poll interval
      }
    }, 2000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [sessionId, isPolling]);

  // Handle Manual OTP Code Submit
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setError('Tasdiqlash kodini kiriting');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      const res = await fetch('/api/auth/telegram-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: inputCode.trim() })
      });
      const data = await res.json();

      if (data.success && data.user) {
        const authUser: AuthUser = {
          username: data.user.username || `@Ustoz_${inputCode}`,
          telegram_id: data.user.telegram_id || `tg_${inputCode}`,
          first_name: data.user.first_name || 'Ustoz',
          avatar_url: data.user.avatar_url,
          provider: 'telegram',
          token: `otp_${Date.now()}`
        };
        localStorage.setItem('teacheros_auth_user', JSON.stringify(authUser));
        onLoginSuccess(authUser);
      } else {
        setError(data.error || 'Noto\'g\'ri tasdiqlash kodi');
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Manual Username Submit (Quick teacher login)
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUsername.trim()) {
      setError('Telegram username kiriting (masalan: @ustoz_nodir)');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      const res = await fetch('/api/auth/telegram-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, manualUsername: manualUsername.trim() })
      });
      const data = await res.json();

      if (data.success && data.user) {
        const authUser: AuthUser = {
          username: data.user.username,
          telegram_id: data.user.telegram_id,
          first_name: data.user.first_name,
          avatar_url: data.user.avatar_url,
          provider: 'telegram',
          token: `usr_${Date.now()}`
        };
        localStorage.setItem('teacheros_auth_user', JSON.stringify(authUser));
        onLoginSuccess(authUser);
      } else {
        setError(data.error || 'Kirishda xatolik');
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#0F121C] border border-white/15 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5 text-slate-100">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#229ED9]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#5B3DF5]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all z-20 cursor-pointer"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Branding */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#229ED9]/15 border border-[#229ED9]/30 text-xs font-bold text-[#38bdf8]">
            <Send className="w-3.5 h-3.5 text-[#229ED9]" />
            <span>Telegram Orqali Avtorizatsiya</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            Ustoz Hisobiga Kirish
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Barcha dars taqdimotlari va o'quvchilar natijalari shaxsiy Telegram hisobingizga sinxronlashadi.
          </p>
        </div>

        {/* Tab switchers: Bot Deep-Link / QR Code / OTP / Username */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold relative z-10">
          <button
            type="button"
            onClick={() => setTab('bot')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              tab === 'bot' ? 'bg-[#229ED9] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Bot orqali</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('code')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              tab === 'code' ? 'bg-[#229ED9] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tasdiq kodi</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('username')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              tab === 'username' ? 'bg-[#229ED9] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>@Username</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium text-center animate-shake relative z-10">
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: ONE-CLICK BOT DEEP LINK & QR CODE */}
        {tab === 'bot' && (
          <div className="space-y-4 relative z-10 text-center animate-fade-in">
            {isLoadingSession ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 text-[#229ED9] animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Telegram havola yaratilmoqda...</span>
              </div>
            ) : (
              <>
                {/* 1-Tap Deep Link Button */}
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#2ba6e3] hover:to-[#0094de] text-white font-extrabold text-sm shadow-xl shadow-[#229ED9]/30 flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-white" />
                  <span>Telegram Botda Ochish (@english_ulunur_bot)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>

                {/* Live Polling Status Indicator */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-2.5 text-xs text-slate-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                  </span>
                  <span>Bot ochilgach <b>Start</b> tugmasini bosing... Tizim avtomatik kiritadi</span>
                </div>

                {/* QR Code Collapsible or Visual */}
                <div className="pt-2 flex flex-col items-center space-y-2">
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl inline-block">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Telegram Login QR Code"
                        className="w-36 h-36 rounded-xl object-contain block"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-xl">
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Smartboard yoki telefondan kamerada skanerlang</span>
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL OTP CODE VERIFICATION */}
        {tab === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4 relative z-10 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kod olish usuli:</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Telegramda <b className="text-white">@english_ulunur_bot</b> ga kiring va <b>/login</b> yoki <b>/start</b> deb yozing. Bot sizga 4 xonali tasdiq kodini yuboradi.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                4-Xonali Tasdiqlash Kodi
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="masalan: 4829"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-[#229ED9] transition-all font-bold"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-2xl bg-[#229ED9] hover:bg-[#0088cc] text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isVerifying ? 'Tekshirilmoqda...' : 'Kodni Tasdiqlash'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: USERNAME QUICK LOGIN */}
        {tab === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-4 relative z-10 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-sky-400 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Tezkor Ustoz Kirishi:</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Telegram username orqali darhol shaxsiy o'qituvchi profilingizga kiring.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Telegram Foydalanuvchi Nomi
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  placeholder="ulunur yoki ustoz_ali"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#229ED9] transition-all font-bold"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-2xl bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isVerifying ? 'Kiritilmoqda...' : 'Ustoz Profiliga Kirish'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center pt-1 border-t border-white/10 relative z-10">
          <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Faqat tasdiqlangan o'qituvchilar va dars yaratuvchilar uchun</span>
          </div>
        </div>

      </div>
    </div>
  );
}
