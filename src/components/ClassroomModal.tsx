'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  GraduationCap, 
  Trash2, 
  ArrowRight, 
  ExternalLink,
  UserPlus,
  Send,
  UserCheck
} from 'lucide-react';
import { TeacherClassroom } from '../lib/types';
import { AppLanguage } from '../lib/translations';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classrooms: TeacherClassroom[];
  activeClassroomId: string | null;
  onSelectClassroom: (classroom: TeacherClassroom | null) => void;
  onCreateClassroom: (name: string, studentUsernames: string[]) => void;
  onAddStudentsToClassroom: (classroomId: string, studentUsernames: string[]) => void;
  onDeleteClassroom?: (classroomId: string) => void;
  isLight: boolean;
  appLanguage: AppLanguage;
  botUsername?: string;
  initialViewMode?: 'create' | 'list';
}

export default function ClassroomModal({
  isOpen,
  onClose,
  classrooms,
  activeClassroomId,
  onSelectClassroom,
  onCreateClassroom,
  onAddStudentsToClassroom,
  onDeleteClassroom,
  isLight,
  appLanguage,
  botUsername = 'english_ulunur_bot',
  initialViewMode = 'create'
}: ClassroomModalProps) {
  const [viewMode, setViewMode] = useState<'create' | 'list'>(initialViewMode);
  const [classNameInput, setClassNameInput] = useState('');
  const [studentUsernames, setStudentUsernames] = useState<string[]>(['', '']);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<TeacherClassroom | null>(null);
  const [newStudentInput, setNewStudentInput] = useState('');

  // Sync viewMode whenever initialViewMode or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setViewMode(initialViewMode);
    }
  }, [isOpen, initialViewMode]);

  if (!isOpen) return null;

  const handleAddStudentRow = () => {
    setStudentUsernames((prev) => [...prev, '']);
  };

  const handleRemoveStudentRow = (index: number) => {
    if (studentUsernames.length <= 1) {
      setStudentUsernames(['']);
      return;
    }
    setStudentUsernames((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleStudentChange = (index: number, value: string) => {
    setStudentUsernames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) {
      alert(appLanguage === 'en' ? 'Please enter a classroom name' : appLanguage === 'ru' ? 'Введите название класса' : 'Iltimos, sinfxona nomini kiriting');
      return;
    }

    const cleanedStudents = studentUsernames
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
      .map((u) => (u.startsWith('@') ? u : `@${u}`));

    onCreateClassroom(classNameInput.trim(), cleanedStudents);
    setClassNameInput('');
    setStudentUsernames(['', '']);
    onClose();
  };

  const handleAddMoreToExisting = (classroomId: string) => {
    if (!newStudentInput.trim()) return;
    const cleaned = newStudentInput
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
      .map((u) => (u.startsWith('@') ? u : `@${u}`));

    if (cleaned.length > 0) {
      onAddStudentsToClassroom(classroomId, cleaned);
      setNewStudentInput('');
    }
  };

  // Generate real invite link for bot
  const sampleInviteCode = `cls_${Date.now().toString(36)}`;
  const inviteLink = `https://t.me/${botUsername}?start=${sampleInviteCode}`;

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl relative transition-all duration-300 my-auto ${
          isLight
            ? "bg-[#FAFBFD] border-slate-200 text-slate-800 shadow-slate-300/60"
            : "bg-[#0F111A] border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
        }`}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-all cursor-pointer ${
            isLight
              ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              : "hover:bg-white/10 text-slate-400 hover:text-white"
          }`}
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Switcher Tabs if existing classrooms exist */}
        {classrooms.length > 0 && (
          <div className="flex items-center space-x-2 mb-6 border-b pb-4 border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setViewMode('create');
                setSelectedClassForDetails(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'create'
                  ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/30"
                  : isLight
                  ? "hover:bg-slate-200 text-slate-600"
                  : "hover:bg-white/5 text-slate-400"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{appLanguage === 'en' ? 'New Classroom' : appLanguage === 'ru' ? 'Новый класс' : 'Yangi Sinfxona'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/30"
                  : isLight
                  ? "hover:bg-slate-200 text-slate-600"
                  : "hover:bg-white/5 text-slate-400"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {appLanguage === 'en' ? `All Classrooms (${classrooms.length})` : appLanguage === 'ru' ? `Все классы (${classrooms.length})` : `Barcha Sinflar (${classrooms.length})`}
              </span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 1: CREATE NEW CLASSROOM (EXACT USER SKETCH / IMAGE 2)   */}
        {/* ============================================================ */}
        {viewMode === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            {/* Header: 3-people / Group Icon + "New Classroom" */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5B3DF5] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-[#5B3DF5]/25">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {appLanguage === 'en' ? "New Classroom" : appLanguage === 'ru' ? "Новый класс" : "New Classroom"}
                </h2>
                <p className={`text-xs mt-0.5 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {appLanguage === 'en' 
                    ? "Create an interactive group for your students" 
                    : appLanguage === 'ru' 
                    ? "Создайте интерактивную группу для ваших учеников" 
                    : "O'quvchilaringiz uchun alohida interaktiv sinf guruhi yarating"}
                </p>
              </div>
            </div>

            {/* Field 1: Name of the Classroom */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block flex items-center justify-between">
                <span>{appLanguage === 'en' ? "Name of the classroom" : appLanguage === 'ru' ? "Название класса" : "Name of the classroom"}</span>
                <span className="text-[10px] text-indigo-400 font-semibold">{appLanguage === 'en' ? "Required" : "Majburiy"}</span>
              </label>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all ${
                isLight
                  ? "bg-white border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-sm"
                  : "bg-white/5 border-white/10 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
              }`}>
                <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="e.g. IELTS 7.0 Intensive, B1 Grammar Group, Elementary 14:00..."
                  className={`w-full bg-transparent text-sm sm:text-base font-semibold focus:outline-none placeholder-slate-400 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Field 2: Add Students */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {appLanguage === 'en' ? "Add Students" : appLanguage === 'ru' ? "Добавить учеников" : "Add Students"}
                </label>
                <span className={`text-[11px] font-mono ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  Telegram @username
                </span>
              </div>

              {/* Dynamic Student Username Input Rows in a Polished Card */}
              <div className={`p-2.5 rounded-2xl border space-y-2 max-h-56 overflow-y-auto ${
                isLight ? "bg-slate-50/80 border-slate-200" : "bg-black/25 border-white/10"
              }`}>
                {studentUsernames.map((username, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl border transition-all ${
                      isLight
                        ? "bg-white border-slate-200 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400/30"
                        : "bg-white/5 border-white/10 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400/30"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex items-center space-x-1 text-sky-400 pointer-events-none shrink-0">
                      <Send className="w-3.5 h-3.5 fill-[#229ED9]" />
                      <span className="text-xs font-bold">@</span>
                    </div>
                    <input
                      type="text"
                      value={username.replace(/^@/, '')}
                      onChange={(e) => handleStudentChange(idx, e.target.value)}
                      placeholder="telegram_username"
                      className={`flex-1 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-400 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    />
                    {studentUsernames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStudentRow(idx)}
                        className={`p-1 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0 ${
                          isLight ? "hover:bg-red-50" : "hover:bg-red-500/10"
                        }`}
                        title="O'chirish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Button: + Add More */}
              <button
                type="button"
                onClick={handleAddStudentRow}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer border border-dashed ${
                  isLight
                    ? "bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200 hover:border-indigo-400"
                    : "bg-white/5 hover:bg-white/10 text-indigo-300 border-indigo-500/30 hover:border-indigo-400"
                }`}
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>{appLanguage === 'en' ? "Add More Student" : appLanguage === 'ru' ? "Добавить ещё ученика" : "Yana o'quvchi qo'shish (+)"}</span>
              </button>
            </div>

            {/* Super Convenient Pro Tip: Direct Telegram Group Invite Link */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? "bg-sky-50/70 border-sky-200 text-sky-900" : "bg-sky-500/10 border-sky-500/20 text-sky-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-sky-500">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {appLanguage === 'en' ? "Fast & Simple Invite Link" : appLanguage === 'ru' ? "Быстрая ссылка-приглашение" : "Tezkor havola orqali ulash"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inviteLink)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (appLanguage === 'en' ? "Copied!" : "Nusxalandi!") : (appLanguage === 'en' ? "Copy Link" : "Nusxalash")}</span>
                </button>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                {appLanguage === 'en'
                  ? "You can also simply paste this link into your Telegram classroom group. Students can click it once to automatically link their account to this classroom!"
                  : appLanguage === 'ru'
                  ? "Вы также можете отправить эту ссылку в Telegram-группу класса. Ученики перейдут по ней и сразу подключатся к этому классу!"
                  : "O'quvchilarni bittalab kiritish o'rniga ushbu havolani sinf Telegram guruhiga tashlab bersangiz, o'quvchilar 1 marta /start bosib sinfga avtomatik ulanadi!"}
              </p>
            </div>

            {/* Bottom Button: Create Classroom */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5B3DF5] via-[#7C3AED] to-[#4C2FE0] hover:from-[#4C2FE0] hover:to-[#3719C9] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#5B3DF5]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>
                  {appLanguage === 'en' ? "Create Classroom" : appLanguage === 'ru' ? "Создать класс" : "Create Classroom (Sinfxona Yaratish)"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: ALL CLASSROOMS LIST & MANAGEMENT                     */}
        {/* ============================================================ */}
        {viewMode === 'list' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {appLanguage === 'en' ? "Your Classrooms" : appLanguage === 'ru' ? "Ваши классы" : "Mavjud Sinfxonalar"}
                </h2>
                <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {appLanguage === 'en' ? "Switch or manage your student groups" : appLanguage === 'ru' ? "Переключайтесь между группами" : "Sinfni tanlang yoki talabalarni boshqaring"}
                </p>
              </div>

              {/* Solo Mode Switcher */}
              <button
                type="button"
                onClick={() => {
                  onSelectClassroom(null);
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeClassroomId === null
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                    : isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                {appLanguage === 'en' ? "Solo Mode (No class)" : appLanguage === 'ru' ? "Без класса" : "Yakkaxon Rejim (Sinfsiz)"}
              </button>
            </div>

            {/* Classrooms Cards Grid */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {classrooms.map((cls) => {
                const isActive = activeClassroomId === cls.id;
                return (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isActive
                        ? "bg-[#5B3DF5]/15 border-[#5B3DF5] shadow-[0_0_20px_rgba(91,61,245,0.2)]"
                        : isLight
                        ? "bg-white border-slate-200 hover:border-slate-300"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isActive
                            ? "bg-[#5B3DF5] text-white shadow"
                            : isLight
                            ? "bg-slate-100 text-slate-700"
                            : "bg-white/10 text-slate-300"
                        }`}>
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                            <span>{cls.name}</span>
                            {isActive && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {appLanguage === 'en' ? 'Active' : 'Faol'}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                            {cls.students.length} {appLanguage === 'en' ? 'students' : appLanguage === 'ru' ? 'учеников' : "ta o'quvchi"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectClassroom(cls);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4C2FE0] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                          >
                            {appLanguage === 'en' ? 'Select' : 'Tanlash'}
                          </button>
                        ) : (
                          <span className="px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>{appLanguage === 'en' ? 'Current' : 'Tanlangan'}</span>
                          </span>
                        )}

                        {onDeleteClassroom && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(appLanguage === 'en' ? `Delete "${cls.name}"?` : `"${cls.name}" sinfini o'chirmoqchimisiz?`)) {
                                onDeleteClassroom(cls.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Students Preview & Quick Add */}
                    <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                      isLight ? "border-slate-100" : "border-white/5"
                    }`}>
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {cls.students.slice(0, 4).map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                              isLight ? "bg-slate-100 text-slate-700" : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {s.username}
                          </span>
                        ))}
                        {cls.students.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{cls.students.length - 4} yana
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Quick add student input */}
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            placeholder="+ @username"
                            value={selectedClassForDetails?.id === cls.id ? newStudentInput : ''}
                            onFocus={() => setSelectedClassForDetails(cls)}
                            onChange={(e) => {
                              setSelectedClassForDetails(cls);
                              setNewStudentInput(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddMoreToExisting(cls.id);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] w-28 focus:outline-none focus:ring-1 focus:ring-[#5B3DF5] ${
                              isLight ? "bg-slate-50 border-slate-300" : "bg-white/5 border-white/10 text-white"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddMoreToExisting(cls.id)}
                            className="p-1 rounded-lg bg-[#5B3DF5]/20 hover:bg-[#5B3DF5]/30 text-[#5B3DF5] dark:text-[#A5B4FC] transition-colors cursor-pointer"
                            title="O'quvchini qo'shish"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Copy invite link button */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`https://t.me/${botUsername}?start=join_${cls.id}`)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                          }`}
                          title="Telegram havola nusxalash"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Create Button */}
            <button
              type="button"
              onClick={() => setViewMode('create')}
              className={`w-full py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                  : "bg-white/5 hover:bg-white/10 text-white border-white/15"
              }`}
            >
              <Plus className="w-4 h-4 text-[#5B3DF5]" />
              <span>{appLanguage === 'en' ? "+ Add Another Classroom" : appLanguage === 'ru' ? "+ Добавить ещё класс" : "+ Yangi Sinfxona Qo'shish"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
