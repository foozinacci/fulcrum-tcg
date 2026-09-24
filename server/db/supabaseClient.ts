/**
 * FULCRUM TCG — Supabase Cloud Database Client
 *
 * To enable cloud persistence, create a `.env` file in the project root:
 *   SUPABASE_URL=https://your-project-ref.supabase.co
 *   SUPABASE_ANON_KEY=your_anon_key_here
 *
 * If these environment variables are absent, `supabase` will be `null` and
 * the server falls back to the in-memory store without any code change needed.
 *
 * NOTE: import 'dotenv/config' (or dotenv.config()) must be called before
 * this module is loaded so that process.env is populated.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export { supabase };
