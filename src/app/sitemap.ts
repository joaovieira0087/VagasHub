import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const supabase = await createClient();

  // 1. Páginas estáticas principais
  const routes = ['', '/sobre', '/termos', '/privacidade'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Páginas de Categorias Dinâmicas
  const { data: categorias } = await supabase.from('categorias').select('slug');
  const categoryRoutes = (categorias || []).map((cat) => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 3. Páginas de Vagas Individuais
  const { data: vagas } = await supabase
    .from('vagas')
    .select('slug, updated_at')
    .eq('status', 'ativa');

  const vagaRoutes = (vagas || []).map((vaga) => ({
    url: `${baseUrl}/vaga/${vaga.slug}`,
    lastModified: vaga.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...categoryRoutes, ...vagaRoutes];
}
