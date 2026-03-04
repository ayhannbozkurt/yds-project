import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database table: wheels
 *
 * CREATE TABLE wheels (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   title TEXT NOT NULL,
 *   mode TEXT NOT NULL CHECK (mode IN ('simple', 'questions')),
 *   data JSONB NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 */

export interface SavedWheel {
  id: string;
  title: string;
  mode: "simple" | "questions";
  data: unknown; // SimpleWheelItem[] or QuestionItem[]
  created_at: string;
}
