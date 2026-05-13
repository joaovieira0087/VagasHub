import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hubvagasbr.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/painel-exclusivo-gerar-vaga'], // Não indexar o painel admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
