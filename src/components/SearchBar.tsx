'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
  initialCidade?: string;
  initialEstado?: string;
  locais?: {
    cidades: string[];
    estados: string[];
  };
}

export default function SearchBar({
  initialQuery = '',
  initialCidade = '',
  initialEstado = '',
  locais = { cidades: [], estados: [] }
}: SearchBarProps) {
  const [term, setTerm] = useState(initialQuery);
  const [locationInput, setLocationInput] = useState(() => {
    if (initialCidade) return initialCidade;
    if (initialEstado) return initialEstado;
    return '';
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLFormElement>(null);

  // Sync with initial props
  useEffect(() => {
    setTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialCidade) {
      setLocationInput(initialCidade);
    } else if (initialEstado) {
      setLocationInput(initialEstado);
    } else {
      setLocationInput('');
    }
  }, [initialCidade, initialEstado]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const removeAcentos = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (term.trim()) {
      params.set('q', term.trim());
    }
    
    const locTrimmed = locationInput.trim();
    if (locTrimmed) {
      const normLoc = removeAcentos(locTrimmed);
      
      const matchedCidade = locais.cidades.find(c => removeAcentos(c) === normLoc);
      const matchedEstado = locais.estados.find(e => removeAcentos(e) === normLoc);
      
      if (matchedCidade) {
        params.set('cidade', matchedCidade);
      } else if (matchedEstado) {
        params.set('estado', matchedEstado);
      } else {
        params.set('cidade', locTrimmed);
      }
    }
    
    const queryString = params.toString();
    if (queryString) {
      router.push(`/busca?${queryString}`);
    } else {
      router.push('/');
    }
    setIsDropdownOpen(false);
  };

  const handleReset = () => {
    setTerm('');
    setLocationInput('');
    router.push('/');
    setIsDropdownOpen(false);
  };

  // Client-side filtration for dropdown options
  const filterOptions = () => {
    const searchVal = removeAcentos(locationInput.trim());
    if (!searchVal) {
      return {
        cidades: locais.cidades,
        estados: locais.estados
      };
    }
    
    return {
      cidades: locais.cidades.filter(c => removeAcentos(c).includes(searchVal)),
      estados: locais.estados.filter(e => removeAcentos(e).includes(searchVal))
    };
  };

  const { cidades: filteredCidades, estados: filteredEstados } = filterOptions();
  const hasOptions = filteredCidades.length > 0 || filteredEstados.length > 0;

  return (
    <form
      ref={containerRef}
      onSubmit={handleSearch}
      className="w-full max-w-4xl bg-surface-card/45 backdrop-blur-lg border border-white/10 p-2.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch gap-2.5 transition-all hover:border-white/15 hover:bg-surface-card/50"
    >
      {/* Campo Cargo/Empresa */}
      <div className="flex-1 relative flex items-center min-h-[48px] px-3">
        <div className="text-text-muted mr-3 flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cargo, empresa ou palavra-chave..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full bg-transparent border-none text-text-primary placeholder:text-text-muted focus:outline-none text-[15px]"
        />
      </div>

      {/* Divisor Visual no Desktop */}
      <div className="hidden md:block w-[1px] bg-white/10 self-stretch my-2" />

      {/* Campo Localização */}
      <div className="flex-1 relative flex items-center min-h-[48px] px-3">
        <div className="text-text-muted mr-3 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cidade ou Estado..."
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full bg-transparent border-none text-text-primary placeholder:text-text-muted focus:outline-none text-[15px]"
        />
        
        {/* Dropdown de Autocompletar */}
        {isDropdownOpen && hasOptions && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-[calc(100%+12px)] md:top-[calc(100%+16px)] z-50 bg-surface-elevated/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto animate-scale-in scroll-hidden backdrop-blur-xl"
          >
            {filteredCidades.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <span className="text-[11px] font-bold text-text-muted tracking-wider uppercase px-3 py-1.5 block">
                  📍 Cidades
                </span>
                <div className="flex flex-col gap-0.5 mt-1">
                  {filteredCidades.map((cidade) => (
                    <button
                      key={cidade}
                      type="button"
                      onClick={() => {
                        setLocationInput(cidade);
                        setIsDropdownOpen(false);
                      }}
                      className="text-left w-full px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-hover/80 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors" />
                      {cidade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredEstados.length > 0 && (
              <div className="p-2">
                <span className="text-[11px] font-bold text-text-muted tracking-wider uppercase px-3 py-1.5 block">
                  🏢 Estados
                </span>
                <div className="flex flex-col gap-0.5 mt-1">
                  {filteredEstados.map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => {
                        setLocationInput(estado);
                        setIsDropdownOpen(false);
                      }}
                      className="text-left w-full px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-hover/80 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-light/40 group-hover:bg-primary-light transition-colors" />
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-2 px-1 py-1 md:py-0">
        {(term || locationInput) && (
          <button
            type="button"
            onClick={handleReset}
            className="text-text-muted hover:text-text-primary p-2.5 transition-colors rounded-full hover:bg-surface-elevated/70"
            title="Limpar filtros e reiniciar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white px-6 py-3 md:py-3.5 rounded-xl md:rounded-full font-semibold transition-all shadow-[0_4px_12px_rgba(108,99,255,0.25)] hover:shadow-[0_4px_16px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2 text-sm select-none"
        >
          <span>Buscar Vagas</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </form>
  );
}
