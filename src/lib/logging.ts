import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface LogEntry {
  guest_name: string;
  language: string;
  category: string | null;
  question: string;
  answer: string;
}

export async function logInteraction(entry: LogEntry) {
  if (!supabase) return;
  try {
    await supabase.from('coco_logs').insert(entry);
  } catch (err) {
    console.error('supabase log error', err);
  }
}
