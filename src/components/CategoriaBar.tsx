'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoriaUnificada } from '@/types/database';

interface CategoriaBarProps {
  categorias: CategoriaUnificada[];
  categoriaAtiva?: string;
}

export default function CategoriaBar({ categorias, categoriaAtiva }: CategoriaBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (slug: string | null) => {
    if (slug === null) {
      router.push('/');
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('categoria', slug);
      router.push(`/?${params.toString()}`);
    }
  };

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
        <button
          onClick={() => handleClick(null)}
          className={`badge flex-shrink-0 cursor-pointer transition-all duration-200 ${
            isAtiva(null) ? 'badge-active' : 'badge-primary hover:bg-primary/20'
          }`}
          id="categoria-todas"
        >
          Todas
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleClick(cat.slug)}
            className={`badge flex-shrink-0 cursor-pointer transition-all duration-200 ${
              isAtiva(cat.slug) ? 'badge-active' : 'badge-primary hover:bg-primary/20'
            }`}
            id={`categoria-${cat.slug}`}
          >
            {cat.nome}
            <span className="ml-1 opacity-60 text-[0.65rem]">{cat.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
