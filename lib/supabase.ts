import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser/client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations (scraper, admin) - uses Secret key
export function createSecretClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createClient(supabaseUrl, secretKey);
}
