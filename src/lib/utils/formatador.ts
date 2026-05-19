// ============================================
// Utilidade de Parsing — Formata texto bruto em tópicos
// ============================================

/**
 * Recebe uma string de texto puro (ex: vinda do Supabase) e transforma
 * num array de tópicos limpos, removendo marcadores manuais e linhas vazias.
 *
 * @param texto - Texto bruto com quebras de linha
 * @returns Array de strings limpas (tópicos), ou [] se texto for nulo/vazio
 */
export function formatarTopicos(texto: string | null | undefined): string[] {
  if (!texto) return [];

  return texto
    .split(/\r?\n/)                      // Divide por quebras de linha
    .map((linha) =>
      linha
        .trim()                           // Remove espaços no início/fim
        .replace(/^[-•*]+\s*/, '')        // Remove marcadores manuais (-, •, *)
        .trim()                           // Limpa espaço residual após marcador
    )
    .filter((linha) => linha.length > 0); // Remove linhas vazias
}
