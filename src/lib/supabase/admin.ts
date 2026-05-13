import { createClient } from '@supabase/supabase-js';

// Admin client com service_role key - bypassa RLS
// APENAS para uso em Server Actions / API Routes
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || url.includes('seu-projeto') || url === 'https://seu-projeto.supabase.co') {
    throw new Error(
      '[SUPABASE ADMIN] ❌ NEXT_PUBLIC_SUPABASE_URL não configurada! ' +
      'Abra .env.local e substitua pelo URL real do seu projeto Supabase.'
    );
  }

  if (!key || key.includes('aqui') || key === 'sua-service-role-key-aqui') {
    throw new Error(
      '[SUPABASE ADMIN] ❌ SUPABASE_SERVICE_ROLE_KEY não configurada! ' +
      'Abra .env.local e substitua pela service_role key real do Supabase.'
    );
  }

  // Remover barra final se existir (causa 404 na API)
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  return createClient(cleanUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
