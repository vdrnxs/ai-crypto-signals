import { createClient } from '@supabase/supabase-js';

// Singleton pattern - create once, reuse everywhere (browser-side)
// NEXT_PUBLIC_* vars must stay as literal process.env.X here for Next.js to inline them.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);