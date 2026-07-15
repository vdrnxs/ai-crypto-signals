/**
 * Centralized environment configuration. Single source of truth for process.env access.
 */

export const config = {
  // NEXT_PUBLIC_* vars are excluded here: Next.js inlines them at build time
  // only when referenced as full `process.env.NEXT_PUBLIC_X` literals at
  // their call site. Re-exporting them through this module breaks that.
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
  cronSecret: process.env.CRON_SECRET,
  logLevel: process.env.LOG_LEVEL?.toUpperCase() ?? 'INFO',
} as const;