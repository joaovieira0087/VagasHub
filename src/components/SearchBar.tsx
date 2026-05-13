'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const [term, setTerm] = useState(initialQuery);
  const router = useRouter();

  // Atualizar term se initialQuery mudar
  useEffect(() => {
    setTerm(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      router.push(`/busca?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleReset = () => {
    setTerm('');
    router.push('/');
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl w-full">
      <input
        type="text"
        placeholder="Buscar por cargo, empresa ou categoria..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full pl-12 pr-[160px] sm:pr-[200px] py-4 rounded-2xl bg-surface/50 border border-border/50 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm transition-all placeholder:text-text-muted shadow-lg"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {term && (
          <button 
            type="button" 
            onClick={handleReset}
            className="text-text-muted hover:text-text-primary p-2 transition-colors rounded-full hover:bg-surface-elevated"
            title="Refazer busca (Voltar ao Início)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <button 
          type="submit" 
          className="bg-primary hover:bg-primary-hover text-white px-4 sm:px-5 py-2 rounded-xl transition-colors font-medium shadow-md flex items-center gap-2"
        >
          <span className="hidden sm:inline">Pesquisar</span>
          <svg className="sm:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </form>
  );
}
