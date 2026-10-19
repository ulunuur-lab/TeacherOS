export type LessonLength = "short" | "medium" | "long";

export interface VisualDiagram {
  type: "timeline" | "metaphor" | "formula" | "verb_matrix" | "schedule_board" | "comparison" | "sentence_anatomy" | "interruption_timeline" | "concept_pyramid" | "decision_tree" | "visual_diff";
  title?: string;
  subtitle?: string;
  data: any;
}

export interface Slide {
  id: string;
  tag: string;
  title: string;
  body: string;
  audioText?: string;
  visual?: VisualDiagram;
  imagePrompt?: string;
  imageUrl?: string;
  steps?: string[];
}

export interface Flashcard {
  word: string;
  pos: string;
  uz: string;
  ex: string;
  audio?: string;
  imagePrompt?: string;
  imageUrl?: string;
  hint?: string;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  ans: string;
  expl: string;
}

export interface QuickQuestion {
  id?: string;
  q: string;
  ans: string;
  opts?: string[];
  expl: string;
  hint?: string;
  question?: string;
  options?: string[];
  correct?: string;
  explanation?: string;
}

export interface DialogTurn {
  id?: string;
  speaker: string;
  role: "teacher" | "student" | "characterA" | "characterB";
  text: string;
  uz: string;
  promptQuestion?: string;
  userOptions?: string[];
  correctOption?: string;
}

export interface ErrorHuntItem {
  id?: string;
  sentence: string;
  errorWord: string;
  correction: string;
  explanation: string;
}

export interface FillGapItem {
  id?: string;
  sentenceBefore: string;
  blank: string;
  sentenceAfter: string;
  options: string[];
  correct: string;
  uzbekHint: string;
}

export interface SummaryRule {
  tag: string;
  title: string;
  formula?: string;
  example: string;
  uzbekTrap: string;
}

export interface HomeworkModule {
  title: string;
  instructions: string;
  type: "mcq" | "translate" | "error_correct" | "fill_blank" | "free_text";
  items: Array<{
    prompt: string;
    answer?: string;
    options?: string[];
    explanation?: string;
    hint?: string;
  }>;
}

export interface Curriculum {
  id: string;
  topic: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  length?: LessonLength;
  category: string;
  description: string;
  slides: Slide[];
  quickQuestions?: QuickQuestion[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  dialog?: DialogTurn[];
  errorHunt?: ErrorHuntItem[];
  fillGap?: FillGapItem[];
  summary?: {
    title: string;
    takeaway: string;
    rules: SummaryRule[];
  };
  homework: HomeworkModule[];
  telegramBotToken?: string;
  teacherChatId?: string;
}

export interface ClassroomStudent {
  username: string;
  addedAt: number;
}

export interface TeacherClassroom {
  id: string;
  name: string;
  createdAt: number;
  students: ClassroomStudent[];
  inviteCode: string;
}
