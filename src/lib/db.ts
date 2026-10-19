// Supabase Client and Database Layer with graceful local fallback
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Check if valid Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================================
// Local DB Fallback (JSON-backed store for offline / dev mode)
// ==========================================================
const LOCAL_DB_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'local_db.json');

interface LocalDBData {
  profiles: Array<{ id: string; role: string; full_name: string; email?: string; telegram_username?: string; created_at: string }>;
  curriculums: Array<{ id: string; topic: string; level: string; data: any; created_at: string }>;
  submissions: Array<{
    id: string;
    student_name: string;
    syllabus_level: string;
    topic_id: number;
    topic_title: string;
    score: number;
    total_questions: number;
    percent: number;
    mistakes: any[];
    created_at: string;
  }>;
}

function getLocalDB(): LocalDBData {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    if (!fs.existsSync(LOCAL_DB_FILE)) {
      const initial: LocalDBData = { profiles: [], curriculums: [], submissions: [] };
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { profiles: [], curriculums: [], submissions: [] };
  }
}

function saveLocalDB(data: LocalDBData) {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write to local DB:', e);
  }
}

// ==========================================================
// Unified DB Methods
// ==========================================================

export async function recordSubmission(data: {
  student_name: string;
  syllabus_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  topic_id: number;
  topic_title: string;
  score: number;
  total_questions: number;
  percent: number;
  mistakes?: any[];
}) {
  const item = {
    ...data,
    mistakes: data.mistakes || [],
    created_at: new Date().toISOString()
  };

  // 1. Try Supabase first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('student_submissions')
        .insert([item])
        .select()
        .single();
      if (!error && inserted) return { success: true, data: inserted, source: 'supabase' };
      console.warn('Supabase insert failed, falling back to local store:', error?.message);
    } catch (e) {
      console.warn('Supabase error, falling back:', e);
    }
  }

  // 2. Fallback to Local DB
  const db = getLocalDB();
  const submissionWithId = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...item
  };
  db.submissions.unshift(submissionWithId);
  saveLocalDB(db);

  return { success: true, data: submissionWithId, source: 'local' };
}

export async function getSubmissions(limit = 100) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }

  const db = getLocalDB();
  return db.submissions.slice(0, limit);
}

export async function getStudentsSummary() {
  const submissions = await getSubmissions(500);
  const studentMap: Record<string, {
    name: string;
    totalSubmissions: number;
    highestPercent: number;
    averagePercent: number;
    levels: Set<string>;
    lastActive: string;
    topicsCount: number;
  }> = {};

  submissions.forEach(sub => {
    if (!sub.student_name || sub.student_name.startsWith('__')) return;
    const key = sub.student_name.trim();
    if (!studentMap[key]) {
      studentMap[key] = {
        name: key,
        totalSubmissions: 0,
        highestPercent: 0,
        averagePercent: 0,
        levels: new Set(),
        lastActive: sub.created_at,
        topicsCount: 0
      };
    }
    const entry = studentMap[key];
    entry.totalSubmissions++;
    entry.highestPercent = Math.max(entry.highestPercent, sub.percent);
    entry.levels.add(sub.syllabus_level);
    if (new Date(sub.created_at) > new Date(entry.lastActive)) {
      entry.lastActive = sub.created_at;
    }
  });

  return Object.values(studentMap).map(s => ({
    ...s,
    levels: Array.from(s.levels)
  }));
}
