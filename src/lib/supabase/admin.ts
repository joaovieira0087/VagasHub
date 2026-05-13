import { createClient } from '@supabase/supabase-js';

// Admin client com service_role key - bypassa RLS
// APENAS para uso em Server Actions / API Routes
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
