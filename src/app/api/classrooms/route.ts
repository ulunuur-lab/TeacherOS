import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

import { supabase, isSupabaseConfigured } from "@/lib/db";

export interface ClassroomStudentEntry {
  username: string;
  addedAt: number;
}

export interface StoredClassroom {
  id: string;
  name: string;
  teacherId?: string;
  teacherName?: string;
  students: ClassroomStudentEntry[];
  inviteCode?: string;
  createdAt: number;
}

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "classrooms.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), "teacheros_classrooms.json");

// In-memory store persistent across requests in runtime
const globalStore: Map<string, StoredClassroom> =
  (globalThis as any).__teacherOS_classrooms_store || new Map<string, StoredClassroom>();
(globalThis as any).__teacherOS_classrooms_store = globalStore;

function readLocalFile(): StoredClassroom[] {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      const raw = fs.readFileSync(TMP_DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return [];
}

function writeLocalFile(classrooms: StoredClassroom[]) {
  const jsonStr = JSON.stringify(classrooms, null, 2);
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DATA_FILE, jsonStr, "utf8");
  } catch (e) {}

  try {
    const dir = path.dirname(TMP_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TMP_DATA_FILE, jsonStr, "utf8");
  } catch (e) {}
}

async function loadAllClassrooms(): Promise<StoredClassroom[]> {
  const map = new Map<string, StoredClassroom>();

  // 1. Memory
  globalStore.forEach((c) => {
    if (c && c.id) map.set(c.id, c);
  });

  // 2. File
  const fileItems = readLocalFile();
  fileItems.forEach((c) => {
    if (c && c.id) {
      if (!map.has(c.id) || (map.get(c.id)!.students.length < c.students.length)) {
        map.set(c.id, c);
      }
    }
  });

  // 3. Supabase Cloud Database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: supaRows } = await supabase
        .from("student_submissions")
        .select("*")
        .eq("student_name", "__CLASSROOM_META__")
        .order("created_at", { ascending: false })
        .limit(50);
      if (supaRows && Array.isArray(supaRows)) {
        supaRows.forEach((row: any) => {
          const payload = row.mistakes?.[0];
          if (payload && payload.id) {
            if (!map.has(payload.id) || (map.get(payload.id)!.students.length < (payload.students || []).length)) {
              map.set(payload.id, payload);
            }
          }
        });
      }
    } catch (e) {}
  }

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

async function saveAllClassrooms(list: StoredClassroom[]) {
  list.forEach((c) => {
    if (c && c.id) globalStore.set(c.id, c);
  });
  writeLocalFile(list);

  // Cloud Supabase Persistence
  if (isSupabaseConfigured && supabase) {
    try {
      for (const c of list) {
        await supabase.from("student_submissions").insert({
          student_name: "__CLASSROOM_META__",
          syllabus_level: c.name || "Classroom",
          topic_id: 998,
          topic_title: c.name,
          score: (c.students || []).length,
          total_questions: (c.students || []).length,
          percent: 100,
          mistakes: [c]
        });
      }
    } catch (e) {}
  }
}

// GET: Query classrooms or search for student enrollment
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentUsername = searchParams.get("studentUsername")?.trim().toLowerCase().replace("@", "");
    const teacherId = searchParams.get("teacherId")?.trim().toLowerCase();
    const isAll = searchParams.get("all") === "true";

    const all = await loadAllClassrooms();

    // 1. If searching for student's assigned classroom
    if (studentUsername) {
      const matched = all.find((cls) =>
        Array.isArray(cls.students) &&
        cls.students.some((s) => (s.username || "").trim().toLowerCase().replace("@", "") === studentUsername)
      );

      return NextResponse.json({
        success: true,
        classroom: matched || null
      });
    }

    // 2. If filtered by teacher
    if (teacherId) {
      const teacherClasses = all.filter(
        (c) => (c.teacherId || "").toLowerCase() === teacherId
      );
      return NextResponse.json({
        success: true,
        classrooms: teacherClasses
      });
    }

    // 3. Return all classrooms
    return NextResponse.json({
      success: true,
      classrooms: all
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create classroom, add students, or sync full classroom array
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, classroom, classrooms, classroomId, students, teacherId } = body;

    const currentList = await loadAllClassrooms();
    const map = new Map<string, StoredClassroom>(currentList.map((c) => [c.id, c]));

    if (action === "create" && classroom && classroom.id) {
      map.set(classroom.id, {
        id: classroom.id,
        name: classroom.name || "Yangi sinf",
        teacherId: classroom.teacherId || teacherId || "user",
        teacherName: classroom.teacherName || "Ustoz",
        students: Array.isArray(classroom.students) ? classroom.students : [],
        inviteCode: classroom.inviteCode || `cls_${Date.now().toString(36)}`,
        createdAt: classroom.createdAt || Date.now()
      });
    } else if (action === "add_students" && classroomId && Array.isArray(students)) {
      const target = map.get(classroomId);
      if (target) {
        const existing = new Set((target.students || []).map((s) => s.username.toLowerCase().replace("@", "")));
        const newItems: ClassroomStudentEntry[] = [];
        students.forEach((u: string) => {
          const clean = (u || "").trim().replace("@", "");
          if (clean && !existing.has(clean.toLowerCase())) {
            existing.add(clean.toLowerCase());
            newItems.push({ username: clean, addedAt: Date.now() });
          }
        });
        target.students = [...(target.students || []), ...newItems];
        map.set(classroomId, target);
      }
    } else if (action === "sync" && Array.isArray(classrooms)) {
      classrooms.forEach((c: any) => {
        if (c && c.id) {
          map.set(c.id, {
            id: c.id,
            name: c.name,
            teacherId: c.teacherId || teacherId || "user",
            teacherName: c.teacherName || "Ustoz",
            students: Array.isArray(c.students)
              ? c.students.map((s: any) => typeof s === "string" ? { username: s.replace("@", ""), addedAt: Date.now() } : { username: (s.username || "").replace("@", ""), addedAt: s.addedAt || Date.now() })
              : [],
            inviteCode: c.inviteCode || `cls_${Date.now().toString(36)}`,
            createdAt: c.createdAt || Date.now()
          });
        }
      });
    }

    const updatedList = Array.from(map.values());
    await saveAllClassrooms(updatedList);

    return NextResponse.json({
      success: true,
      classrooms: updatedList
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove classroom
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const currentList = (await loadAllClassrooms()).filter((c) => c.id !== id);
    globalStore.delete(id);
    await saveAllClassrooms(currentList);

    return NextResponse.json({ success: true, count: currentList.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
