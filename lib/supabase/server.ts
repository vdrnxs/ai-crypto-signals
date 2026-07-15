import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

// Singleton pattern - create once, reuse everywhere (server-side)
// Service role bypasses RLS - use only in server components/route handlers
export const supabaseServer = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);