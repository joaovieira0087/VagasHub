/**
 * Formata uma data em tempo relativo (ex: "há 2 horas", "há 3 dias")
 */
export function tempoRelativo(data: string): string {
  const agora = new Date();
  const publicacao = new Date(data);
  const diffMs = agora.getTime() - publicacao.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHoras < 24) return `há ${diffHoras}h`;
  if (diffDias === 1) return 'ontem';
  if (diffDias < 7) return `há ${diffDias} dias`;
  if (diffDias < 30) return `há ${Math.floor(diffDias / 7)} semanas`;
  if (diffDias < 365) return `há ${Math.floor(diffDias / 30)} meses`;
  return `há ${Math.floor(diffDias / 365)} anos`;
}

/**
 * Formata data para exibição legível
 */
export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
