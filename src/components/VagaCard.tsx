import Link from 'next/link';
import { tempoRelativo } from '@/lib/utils/tempo';
import type { VagaCompleta } from '@/types/database';

interface VagaCardProps {
  vaga: VagaCompleta;
  index?: number;
}

export default function VagaCard({ vaga, index = 0 }: VagaCardProps) {
  const delay = Math.min(index * 60, 400);
  const categorias = vaga.vagas_categorias?.map((vc) => vc.categorias).filter(Boolean) || [];

  return (
    <Link
      href={`/vaga/${vaga.slug}`}
      className="glass-card block p-4 sm:p-5 animate-fade-in group"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
      id={`vaga-card-${vaga.slug}`}
    >
      <div className="flex items-start gap-3">
        {/* Logo da empresa */}
        {vaga.empresa?.logo_url ? (
          <img
            src={vaga.empresa.logo_url}
            alt={vaga.empresa.nome}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-surface-elevated"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 border border-border-subtle">
            <span className="text-primary-light font-bold text-sm">
              {vaga.empresa?.nome?.charAt(0).toUpperCase() || 'E'}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3 className="text-text-primary font-semibold text-[0.95rem] leading-snug group-hover:text-primary-light transition-colors line-clamp-2 break-words">
            {vaga.titulo}
          </h3>

          {/* Localização */}
          {(vaga.cidade || vaga.estado) && (
            <p className="text-text-secondary/70 text-[0.8rem] mt-0.5 font-medium">
              {vaga.cidade}{vaga.cidade && vaga.estado ? ' - ' : ''}{vaga.estado}
            </p>
          )}

          {/* Empresa */}
          {vaga.empresa && (
            <p className="text-text-secondary text-sm mt-0.5 truncate">
              {vaga.empresa.nome}
            </p>
          )}

          {/* Meta — Multi-categorias */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {categorias.slice(0, 3).map((cat) => (
              <span key={cat.slug} className="badge badge-primary text-[0.7rem] py-1 px-2.5">
                {cat.nome}
              </span>
            ))}
            {categorias.length > 3 && (
              <span className="text-text-muted text-xs">+{categorias.length - 3}</span>
            )}
            <span className="text-text-muted text-xs">
              {tempoRelativo(vaga.created_at)}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="text-text-muted group-hover:text-primary-light transition-colors flex-shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
