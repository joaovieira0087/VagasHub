/**
 * Gera texto formatado para compartilhamento no WhatsApp.
 */
export function gerarTextoWhatsApp(titulo: string, url: string): string {
  return `🔥 *${titulo}*\n\n✅ Confira a vaga completa:\n${url}`;
}

/**
 * Gera a URL completa da vaga para compartilhamento.
 */
export function gerarUrlVaga(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/vaga/${slug}`;
}

/**
 * Copia texto para a área de transferência.
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Fallback para navegadores mais antigos
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
