import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600; // ISR: revalida a cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hubvagasbr.com.br';
  const supabase = await createClient();

  // 1. Home
  const homeRoute = {
    url: `${baseUrl}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  };

  // 2. Busca
  const buscaRoute = {
    url: `${baseUrl}/busca`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  };

  // 3. Páginas estáticas institucionais
  const institutionalRoutes = ['/sobre', '/termos', '/privacidade'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 4. Páginas de Categorias Dinâmicas
  const { data: categorias } = await supabase.from('categorias').select('slug');
  const categoryRoutes = (categorias || []).map((cat) => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 5. Páginas de Vagas Individuais
  const { data: vagas } = await supabase
    .from('vagas')
    .select('slug, created_at')
    .eq('ativo', true);

  const vagaRoutes = (vagas || []).map((vaga) => ({
    url: `${baseUrl}/vaga/${vaga.slug}`,
    lastModified: vaga.created_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [homeRoute, buscaRoute, ...institutionalRoutes, ...categoryRoutes, ...vagaRoutes];
}
