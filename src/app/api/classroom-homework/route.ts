import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface ClassroomAssignment {
  id: string;
  classroomId: string;
  classroomName: string;
  topic: string;
  intensity: string;
  totalCount: number;
  sections: Array<{
    typeKey: string;
    title: string;
    instruction: string;
    items: Array<{
      id: number;
      question: string;
      options?: string[];
      keyWord?: string;
      promptSecond?: string;
      answer: string;
      explanation: string;
    }>;
  }>;
  vocabulary?: Array<{
    id: number;
    word: string;
    pos: string;
    translation: string;
    definition: string;
    example: string;
  }>;
  assignedAt: string;
  assignedBy?: string;
}

// In-memory store persistent across requests in runtime
const globalStore = (globalThis as any).__teacherOS_classroom_homeworks || new Map<string, ClassroomAssignment[]>();
(globalThis as any).__teacherOS_classroom_homeworks = globalStore;

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "classroom_homework.json");

function getStoredAssignments(): ClassroomAssignment[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to read classroom_homework.json:", e);
  }
  // Fallback to in-memory
  const all: ClassroomAssignment[] = [];
  globalStore.forEach((list: ClassroomAssignment[]) => {
    all.push(...list);
  });
  return all;
}

function saveStoredAssignments(assignments: ClassroomAssignment[]) {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(assignments, null, 2), "utf8");
  } catch (e) {
    console.warn("Failed to write to classroom_homework.json:", e);
  }
  // Always update in-memory
  assignments.forEach((hw) => {
    const key = (hw.classroomId || hw.classroomName || "default").toLowerCase();
    const existing = globalStore.get(key) || [];
    if (!existing.some((x: ClassroomAssignment) => x.id === hw.id)) {
      globalStore.set(key, [hw, ...existing]);
    }
  });
}

// GET: Retrieve assigned homework for classroom
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId")?.toLowerCase().trim();
    const classroomName = searchParams.get("classroomName")?.toLowerCase().trim();

    const all = getStoredAssignments();

    let filtered = all;
    if (classroomId && classroomId !== "solo" && classroomId !== "all") {
      filtered = all.filter(
        (h) =>
          h.classroomId?.toLowerCase() === classroomId ||
          (classroomName && h.classroomName?.toLowerCase() === classroomName)
      );
    } else if (classroomName && classroomName !== "all" && classroomName !== "solo") {
      filtered = all.filter((h) => h.classroomName?.toLowerCase() === classroomName);
    }

    // Sort by latest assigned
    filtered.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

    return NextResponse.json({
      success: true,
      count: filtered.length,
      homeworks: filtered
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Teacher assigns new homework to classroom
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classroomId, classroomName, topic, data, assignedBy } = body;

    if (!topic) {
      return NextResponse.json({ success: false, error: "Topic is required" }, { status: 400 });
    }

    const assignment: ClassroomAssignment = {
      id: `hw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      classroomId: classroomId || "solo",
      classroomName: classroomName || "Yakkaxon Rejim",
      topic: topic,
      intensity: data?.intensity || "medium",
      totalCount: data?.totalCount || (data?.sections?.reduce((acc: number, s: any) => acc + (s.items?.length || 0), 0) || 10),
      sections: data?.sections || [],
      vocabulary: data?.vocabulary || [],
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy || "Ustoz"
    };

    const current = getStoredAssignments();
    // Prepend new assignment
    const updated = [assignment, ...current.filter((x) => x.id !== assignment.id)];
    saveStoredAssignments(updated);

    return NextResponse.json({
      success: true,
      message: "Homework successfully assigned to classroom",
      homework: assignment
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
