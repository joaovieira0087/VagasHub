import Link from 'next/link';
import type { CategoriaComContagem } from '@/types/database';

interface CategoriaBarProps {
  categorias: CategoriaComContagem[];
  categoriaAtiva?: string;
}

export default function CategoriaBar({ categorias, categoriaAtiva }: CategoriaBarProps) {
  const isAtiva = (slug: string | null) => {
    if (slug === null) return !categoriaAtiva;
    return categoriaAtiva === slug;
  };

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-2 overflow-x-auto scroll-hidden py-1 px-1">
        {/* Chip "Todas" */}
        <Link
          href="/"
          className={`badge flex-shrink-0 cursor-pointer transition-all duration-200 ${
            isAtiva(null) ? 'badge-active' : 'badge-primary hover:bg-primary/20'
          }`}
          id="categoria-todas"
        >
          Todas
        </Link>

        {categorias.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className={`badge flex-shrink-0 cursor-pointer transition-all duration-200 ${
              isAtiva(cat.slug) ? 'badge-active' : 'badge-primary hover:bg-primary/20'
            }`}
            id={`categoria-${cat.slug}`}
          >
            {cat.nome}
            <span className="ml-1 opacity-60 text-[0.65rem]">{cat.vaga_count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
