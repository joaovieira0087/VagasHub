import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import VagaCardSkeleton from '@/components/VagaCardSkeleton';
import AdSlot from '@/components/AdSlot';
import VagasList from '@/components/VagasList';
import SearchBar from '@/components/SearchBar';
import { buscarLocaisExistentes } from '@/lib/actions/vagas';
import type { VagaCompleta } from '@/types/database';

interface BuscaProps {
  searchParams: Promise<{ q?: string; cidade?: string; estado?: string }>;
}

export async function generateMetadata({ searchParams }: BuscaProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const cidade = params.cidade || '';
  const estado = params.estado || '';
  
  let searchTitle = '';
  if (query) {
    searchTitle = `Resultados para "${query}"`;
  }
  
  const location = cidade || estado;
  if (location) {
    if (searchTitle) {
      searchTitle += ` em ${location}`;
    } else {
      searchTitle = `Vagas em ${location}`;
    }
  }
  
  if (!searchTitle) {
    searchTitle = 'Busca de Vagas';
  }
  
  return {
    title: `${searchTitle} - VagasHub`,
    description: `Buscando vagas de emprego para "${query || location}". Encontre sua próxima oportunidade no VagasHub.`,
  };
}

// Função utilitária para remover acentos e normalizar strings
function removeAcentos(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function buscarVagasPorTermo(termo: string, cidade?: string, estado?: string): Promise<VagaCompleta[]> {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('ativo', true);

  if (cidade) {
    queryBuilder = queryBuilder.eq('cidade', cidade);
  }
  if (estado) {
    queryBuilder = queryBuilder.eq('estado', estado);
  }

  const { data } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(300);

  if (!data) return [];

  const vagasCompletas = data as VagaCompleta[];

  if (termo.trim()) {
    const termoNormalizado = removeAcentos(termo);
    return vagasCompletas.filter((vaga) => {
      const tituloMatch = removeAcentos(vaga.titulo).includes(termoNormalizado);
      const empresaMatch = vaga.empresa?.nome && removeAcentos(vaga.empresa.nome).includes(termoNormalizado);
      const vendasMatch = vaga.empresa?.vendas && removeAcentos(vaga.empresa.vendas).includes(termoNormalizado);
      
      const categoriasMatch = vaga.vagas_categorias?.some((vc) => 
        vc.categorias && removeAcentos(vc.categorias.nome).includes(termoNormalizado)
      );

      return tituloMatch || empresaMatch || vendasMatch || categoriasMatch;
    });
  }

  return vagasCompletas;
}

async function buscarRecomendacoes(): Promise<VagaCompleta[]> {
  const supabase = await createClient();
  
  // Buscar vagas recentes em categorias populares ou título contendo junior/estagio
  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('ativo', true)
    .or('titulo.ilike.%junior%,titulo.ilike.%júnior%,titulo.ilike.%estágio%,titulo.ilike.%estagio%')
    .order('created_at', { ascending: false })
    .limit(4);

  // Se não encontrar por título, busca as 4 últimas genéricas
  if (!data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from('vagas')
      .select('*, vagas_categorias(categorias(*)), empresa(*)')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(4);
    
    return (fallbackData as VagaCompleta[]) || [];
  }

  return (data as VagaCompleta[]) || [];
}

async function ResultadosBusca({ query, cidade, estado }: { query: string; cidade?: string; estado?: string }) {
  const vagas = await buscarVagasPorTermo(query, cidade, estado);

  if (vagas.length > 0) {
    return <VagasList vagas={vagas} />;
  }

  // Fallback State - Talvez te interesse
  const recomendacoes = await buscarRecomendacoes();
  
  // Custom message if location was used
  const locationText = cidade || estado ? ` em "${cidade || estado}"` : '';
  const fullSearchText = query ? ` para "${query}"${locationText}` : ` em "${cidade || estado}"`;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center py-10 glass-card rounded-2xl border border-border-subtle bg-surface/30 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-card flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-text-secondary text-lg font-semibold">
          Nenhuma vaga encontrada{locationText ? ' nesta região' : fullSearchText}
        </p>
        <p className="text-text-muted text-sm mt-1.5 max-w-md mx-auto">
          Experimente buscar por termos mais abrangentes, verificar se digitou corretamente ou limpar os filtros para recomeçar.
        </p>
        {(query || cidade || estado) && (
          <div className="mt-6">
            <Link 
              href="/busca" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 text-primary-light hover:bg-primary/30 transition-colors text-sm font-semibold border border-primary/30 shadow-md"
            >
              Limpar Filtros
            </Link>
          </div>
        )}
      </div>

      {recomendacoes.length > 0 && (
        <section className="mt-4 mb-10 animate-slide-up">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
            Talvez te interesse:
          </h2>
          <VagasList vagas={recomendacoes} />
        </section>
      )}
    </div>
  );
}

export default async function BuscaPage({ searchParams }: BuscaProps) {
  const params = await searchParams;
  const query = params.q || '';
  const cidade = params.cidade || '';
  const estado = params.estado || '';

  const locais = await buscarLocaisExistentes();
  const temFiltro = !!(query || cidade || estado);
  const locationDisplay = cidade || estado;

  return (
    <>
      <div className="container-app py-6 min-h-[calc(100vh-140px)]">
        <section className="mt-8 sm:mt-12 mb-10 animate-fade-in flex flex-col items-center text-center">
          <SearchBar initialQuery={query} initialCidade={cidade} initialEstado={estado} locais={locais} />
          
          {temFiltro && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-text-secondary text-base">
                Resultados para: {query && <strong className="text-primary-light">"{query}"</strong>}
                {query && locationDisplay && ' em '}
                {locationDisplay && <strong className="text-accent">"{locationDisplay}"</strong>}
              </span>
              <Link 
                href="/busca" 
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 bg-surface-card px-3.5 py-1.5 rounded-full border border-border-subtle hover:border-primary/50 shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Limpar Filtros
              </Link>
            </div>
          )}
        </section>

        {/* Ad Slot 1 - Topo da Busca */}
        <AdSlot format="horizontal" label="Publicidade — Busca" className="mb-5" />

        {/* Resultados */}
        <section>
          {temFiltro ? (
            <Suspense fallback={<VagaCardSkeleton count={4} />}>
              <ResultadosBusca query={query} cidade={cidade} estado={estado} />
            </Suspense>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-text-secondary">Digite algo ou selecione uma localização na barra de pesquisa para começar.</p>
            </div>
          )}
        </section>
      </div>

      {/* Ad Fixo no Rodapé */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 bg-background/90 backdrop-blur-lg border-t border-border-subtle shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <AdSlot format="horizontal" label="Publicidade" className="!my-0 !min-h-[60px]" />
      </div>
    </>
  );
}
