import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser/client-side usage - typed with Database schema
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// For server-side operations (scraper, admin) - uses Secret key
export function createSecretClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createClient<Database>(supabaseUrl, secretKey);
}

// Re-export useful types from supabase.types
export type { Database } from "./supabase.types";
export type { Tables, TablesInsert, TablesUpdate } from "./supabase.types";
