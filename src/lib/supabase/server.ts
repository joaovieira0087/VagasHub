import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || url.includes('seu-projeto')) {
    console.error('[SUPABASE SERVER] ❌ NEXT_PUBLIC_SUPABASE_URL não configurada!');
    throw new Error('Supabase URL não configurada. Verifique .env.local');
  }

  if (!key || key.includes('aqui')) {
    console.error('[SUPABASE SERVER] ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada!');
    throw new Error('Supabase ANON KEY não configurada. Verifique .env.local');
  }

  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const cookieStore = await cookies();

  return createServerClient(cleanUrl, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}
