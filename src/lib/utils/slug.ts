/**
 * Gera um slug URL-friendly a partir de uma string.
 * Remove acentos, caracteres especiais, converte para lowercase.
 * Adiciona um sufixo numérico curto para garantir unicidade.
 */
export function gerarSlug(texto: string): string {
  const slug = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços → hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início/fim

  // Adiciona sufixo curto para unicidade
  const sufixo = Date.now().toString(36).slice(-4);
  return `${slug}-${sufixo}`;
}

/**
 * Gera slug para categoria (sem sufixo - categorias são únicas por nome)
 */
export function gerarSlugCategoria(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
