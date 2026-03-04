import { supabase } from "./supabase";

export interface YdsQuestion {
  id: number;
  deneme: number;
  question: string;
  options: string[];
  correctAnswer: number;
  passage?: string | null;
}

interface YdsQuestionRow {
  id: number;
  deneme: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: number;
  passage: string | null;
}

function rowToQuestion(row: YdsQuestionRow): YdsQuestion {
  return {
    id: row.id,
    deneme: row.deneme,
    question: row.question,
    options: [row.option_a, row.option_b, row.option_c, row.option_d, row.option_e],
    correctAnswer: row.correct_answer,
    passage: row.passage,
  };
}

export async function fetchAllQuestions(): Promise<YdsQuestion[]> {
  const { data, error } = await supabase
    .from("yds_questions")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data as YdsQuestionRow[]).map(rowToQuestion);
}

export async function fetchQuestionsByIds(ids: number[]): Promise<YdsQuestion[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("yds_questions")
    .select("*")
    .in("id", ids)
    .order("id", { ascending: true });

  if (error) throw error;
  return (data as YdsQuestionRow[]).map(rowToQuestion);
}

export async function fetchWrongAnswerIds(sessionId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("yds_wrong_answers")
    .select("question_id")
    .eq("session_id", sessionId);

  if (error) throw error;
  return (data as { question_id: number }[]).map((r) => r.question_id);
}

export async function addWrongAnswer(questionId: number, sessionId: string): Promise<void> {
  await supabase
    .from("yds_wrong_answers")
    .upsert({ question_id: questionId, session_id: sessionId }, { onConflict: "question_id,session_id" });
}

export async function removeWrongAnswer(questionId: number, sessionId: string): Promise<void> {
  await supabase
    .from("yds_wrong_answers")
    .delete()
    .eq("question_id", questionId)
    .eq("session_id", sessionId);
}

export async function clearWrongAnswers(sessionId: string): Promise<void> {
  await supabase
    .from("yds_wrong_answers")
    .delete()
    .eq("session_id", sessionId);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sessionId = localStorage.getItem("yds-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("yds-session-id", sessionId);
  }
  return sessionId;
}
