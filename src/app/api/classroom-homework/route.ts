import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { supabase, isSupabaseConfigured } from "@/lib/db";

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
const globalStore: Map<string, ClassroomAssignment> =
  (globalThis as any).__teacherOS_classroom_homeworks || new Map<string, ClassroomAssignment>();
(globalThis as any).__teacherOS_classroom_homeworks = globalStore;

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "classroom_homework.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), "classroom_homework.json");

function readLocalFile(): ClassroomAssignment[] {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      const raw = fs.readFileSync(TMP_DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return [];
}

function writeLocalFile(assignments: ClassroomAssignment[]) {
  const jsonStr = JSON.stringify(assignments, null, 2);
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

// GET: Retrieve assigned homework for classroom
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId")?.toLowerCase().trim();
    const classroomName = searchParams.get("classroomName")?.toLowerCase().trim();
    const isAll = searchParams.get("all") === "true";

    const allMap = new Map<string, ClassroomAssignment>();

    // 1. Load from In-Memory
    globalStore.forEach((item) => {
      if (item && item.id) allMap.set(item.id, item);
    });

    // 2. Load from Local/TMP files
    const fileItems = readLocalFile();
    fileItems.forEach((item) => {
      if (item && item.id && !allMap.has(item.id)) {
        allMap.set(item.id, item);
      }
    });

    // 3. Load from Cloud Supabase Database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaRows, error } = await supabase
          .from("student_submissions")
          .select("*")
          .eq("student_name", "__CLASSROOM_ASSIGNMENT__")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && Array.isArray(supaRows)) {
          supaRows.forEach((row: any) => {
            const payload = row.mistakes?.[0];
            if (payload && payload.id) {
              allMap.set(payload.id, {
                id: payload.id,
                classroomId: payload.classroomId || "solo",
                classroomName: payload.classroomName || "Yakkaxon Rejim",
                topic: payload.topic || row.topic_title,
                intensity: payload.intensity || "medium",
                totalCount: payload.totalCount || row.total_questions || 10,
                sections: payload.sections || [],
                vocabulary: payload.vocabulary || [],
                assignedAt: payload.assignedAt || row.created_at,
                assignedBy: payload.assignedBy || "Ustoz"
              });
            }
          });
        }
      } catch (err) {
        console.warn("Supabase fetch assignment warning:", err);
      }
    }

    const allAssignments = Array.from(allMap.values()).sort(
      (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );

    let filtered = allAssignments;

    if (!isAll && (classroomId || classroomName)) {
      const matched = allAssignments.filter((h) => {
        const cId = (h.classroomId || "").toLowerCase().trim();
        const cName = (h.classroomName || "").toLowerCase().trim();
        return (
          (classroomId && classroomId !== "solo" && classroomId !== "all" && cId === classroomId) ||
          (classroomName && classroomName !== "all" && classroomName !== "solo" && cName === classroomName)
        );
      });

      // If matched items found, return them. If classroom has no specific homework, return all recent homeworks so the student is never left with an empty state!
      filtered = matched.length > 0 ? matched : allAssignments;
    }

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
      totalCount:
        data?.totalCount ||
        data?.sections?.reduce((acc: number, s: any) => acc + (s.items?.length || 0), 0) ||
        10,
      sections: data?.sections || [],
      vocabulary: data?.vocabulary || [],
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy || "Ustoz"
    };

    // 1. Update in-memory
    globalStore.set(assignment.id, assignment);

    // 2. Update local / tmp file
    const existing = readLocalFile().filter((x) => x.id !== assignment.id);
    writeLocalFile([assignment, ...existing]);

    // 3. Persist to Cloud Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("student_submissions").insert([
          {
            student_name: "__CLASSROOM_ASSIGNMENT__",
            syllabus_level: "B1",
            topic_id: 999,
            topic_title: topic,
            score: assignment.totalCount,
            total_questions: assignment.totalCount,
            percent: 100,
            mistakes: [assignment],
            created_at: assignment.assignedAt
          }
        ]);
      } catch (e) {
        console.warn("Supabase assignment insert warning:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Homework successfully assigned to classroom",
      homework: assignment
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove an assignment by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    globalStore.delete(id);
    const existing = readLocalFile().filter((x) => x.id !== id);
    writeLocalFile(existing);

    return NextResponse.json({ success: true, message: "Assignment removed" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
