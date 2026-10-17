'use client';

import React from 'react';
import { Users, Ban, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

interface ClassroomSelectorProps {
  onSelectMode: (mode: 'classroom' | 'solo', classroomName?: string, studentCount?: number) => void;
}

export default function ClassroomSelector({ onSelectMode }: ClassroomSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/95 backdrop-blur-2xl">
      <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in text-slate-100">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <Sparkles className="w-4 h-4 text-[#5B3DF5]" />
            <span>Ish maydonini tanlang</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Qanday formatda davom etamiz?
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Siz sinf o'quvchilari uchun alohida guruh bilan ishlashingiz yoki sinfsiz shaxsiy dars yaratishingiz mumkin.
          </p>
        </div>

        {/* The Two Main Cards from User Sketch (Photo 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left max-w-xl mx-auto">
          {/* Card 1: Classroom */}
          <button
            type="button"
            onClick={() => onSelectMode('classroom', 'Intermediate', 10)}
            className="group p-6 rounded-3xl bg-gradient-to-br from-[#121626] to-[#1C1F38] border-2 border-[#5B3DF5]/50 hover:border-[#5B3DF5] shadow-2xl hover:shadow-[#5B3DF5]/20 hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between space-y-6 cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#5B3DF5]/20 border border-[#5B3DF5]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-[#A5B4FC]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-[#A5B4FC] transition-colors">
                  Classroom
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sinf o'quvchilari, maxsus guruh tarixi va darsliklar bitta joyda jamlanadi.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-[#A5B4FC]">
              <span>Intermediate (10 o'quvchi)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Without Classroom */}
          <button
            type="button"
            onClick={() => onSelectMode('solo')}
            className="group p-6 rounded-3xl bg-gradient-to-br from-[#13151D] to-[#1D202A] border-2 border-white/10 hover:border-slate-400 shadow-2xl hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between space-y-6 cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Ban className="w-7 h-7 text-slate-400 group-hover:text-slate-200" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-slate-200 transition-colors">
                  Without Classroom
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Hech qanday sinfsiz mustaqil dars yaratish, testlar va tezkor tayyorgarlik.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-slate-400">
              <span>Shaxsiy Studiya</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
