import Link from 'next/link';
import type { CategoriaComContagem } from '@/types/database';

interface CategoriaBarProps {
  categorias: CategoriaComContagem[];
  categoriaAtiva?: string;
  linkVerTodas?: string;
}

// Mapeamento de Cores e Estilos Premium para cada categoria
const CATEGORIA_ESTILOS: Record<string, { colorClass: string; bgClass: string; activeBgClass: string }> = {
  tecnologia: {
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-500/15',
    activeBgClass: 'bg-sky-500/20 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]',
  },
  administrativo: {
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/15',
    activeBgClass: 'bg-purple-500/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
  },
  vendas: {
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/15',
    activeBgClass: 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]',
  },
  limpeza: {
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15',
    activeBgClass: 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]',
  },
  logistica: {
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15',
    activeBgClass: 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]',
  },
  saude: {
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/15',
    activeBgClass: 'bg-rose-500/20 border-rose-400 shadow-[0_0_20px_rgba(248,113,113,0.2)]',
  },
  educacao: {
    colorClass: 'text-fuchsia-400',
    bgClass: 'bg-fuchsia-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/15',
    activeBgClass: 'bg-fuchsia-500/20 border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.2)]',
  },
  'construcao-civil': {
    colorClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/15',
    activeBgClass: 'bg-orange-500/20 border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.2)]',
  },
  atendimento: {
    colorClass: 'text-teal-400',
    bgClass: 'bg-teal-500/10 border-teal-500/20 hover:border-teal-500/40 hover:bg-teal-500/15',
    activeBgClass: 'bg-teal-500/20 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.2)]',
  },
  marketing: {
    colorClass: 'text-pink-400',
    bgClass: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/15',
    activeBgClass: 'bg-pink-500/20 border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.2)]',
  },
};

const DEFAULT_ESTILO = {
  colorClass: 'text-blue-400',
  bgClass: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15',
  activeBgClass: 'bg-blue-500/20 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.2)]',
};

// Componente Interno para renderizar SVGs Inline Dinâmicos
function CategoriaIcon({ slug, className }: { slug: string; className?: string }) {
  switch (slug) {
    case 'tecnologia':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'administrativo':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'vendas':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case 'limpeza':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-.877a.5.5 0 0 1 0-.972l6.135-.877A2 2 0 0 0 9.937 9.937l.877-6.135a.5.5 0 0 1 .972 0l.877 6.135a2 2 0 0 0 1.438 1.438l6.135.877a.5.5 0 0 1 0 .972l-6.135.877a2 2 0 0 0-1.438 1.438l-.877 6.135a.5.5 0 0 1-.972 0z" />
          <path d="M20 3v4M18 5h4M5 19v2M4 20h2" />
        </svg>
      );
    case 'logistica':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
          <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
          <polygon points="12 12 21 6.92 21 17.08 12 22.08" />
          <polygon points="12 2 21 6.92 12 12 3 6.92 12 2" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'saude':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          <path d="M6 12h3l2-3 2 6 2-3h3" />
        </svg>
      );
    case 'educacao':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      );
    case 'construcao-civil':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 0-7.94-7.94L11 3.2" />
          <path d="M21 21l-6-6" />
          <circle cx="7.5" cy="16.5" r="4.5" />
        </svg>
      );
    case 'atendimento':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    case 'marketing':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
  }
}

export default function CategoriaBar({ categorias, categoriaAtiva, linkVerTodas = '/' }: CategoriaBarProps) {
  const isAtiva = (slug: string | null) => {
    if (slug === null) return !categoriaAtiva;
    return categoriaAtiva === slug;
  };

  return (
    <div className="w-full">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Explore por categoria
        </h2>
        <Link
          href={linkVerTodas}
          className="text-xs sm:text-sm font-semibold text-primary-light hover:text-primary transition-colors flex items-center gap-1 group"
          id="categoria-ver-todas"
        >
          Ver todas
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* Grid no Desktop / Row com Scroll no Mobile */}
      <div className="relative">
        <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x md:snap-none scrollbar-none gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-4 md:pb-0 scroll-smooth px-1">
          {categorias.map((cat) => {
            const estilo = CATEGORIA_ESTILOS[cat.slug] || DEFAULT_ESTILO;
            const ativa = isAtiva(cat.slug);

            return (
              <Link
                key={cat.slug}
                // Se clicar em um card que já está ativo, volta para "/" (reseta o filtro)
                href={ativa ? '/' : `/categoria/${cat.slug}`}
                className={`flex-shrink-0 w-[145px] sm:w-[160px] md:w-auto md:flex-shrink snap-start group relative flex flex-col items-center justify-center p-5 text-center transition-all duration-300 ease-out border rounded-2xl cursor-pointer select-none backdrop-blur-md active:scale-[0.98] md:active:scale-95 hover:-translate-y-1.5 ${
                  ativa
                    ? `${estilo.activeBgClass} bg-surface-card/90`
                    : `${estilo.bgClass} bg-[#12152B]/40`
                }`}
                id={`categoria-${cat.slug}`}
              >
                {/* Indicador de Status Ativo (Glow sutil) */}
                {ativa && (
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                )}

                {/* Container do Ícone */}
                <div className={`p-3 rounded-xl mb-4 transition-all duration-300 group-hover:scale-110 ${
                  ativa ? 'bg-background/80' : 'bg-background/40 group-hover:bg-background/80'
                }`}>
                  <CategoriaIcon
                    slug={cat.slug}
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-300 ${
                      ativa ? estilo.colorClass : 'text-text-secondary group-hover:' + estilo.colorClass
                    }`}
                  />
                </div>

                {/* Nome da Categoria */}
                <span className={`text-sm sm:text-base font-bold tracking-wide transition-colors duration-300 line-clamp-1 w-full ${
                  ativa ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                }`}>
                  {cat.nome}
                </span>

                {/* Contagem de Vagas */}
                <span className={`text-[0.7rem] sm:text-xs mt-1.5 transition-colors duration-300 ${
                  ativa ? 'text-accent font-semibold' : 'text-text-muted group-hover:text-text-secondary'
                }`}>
                  {cat.vaga_count.toLocaleString('pt-BR')} {cat.vaga_count === 1 ? 'vaga' : 'vagas'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
