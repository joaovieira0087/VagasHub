'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  // Remover barra final se existir
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  return createBrowserClient(cleanUrl, key);
}
