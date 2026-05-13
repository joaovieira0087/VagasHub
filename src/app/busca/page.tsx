import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import VagaCardSkeleton from '@/components/VagaCardSkeleton';
import AdSlot from '@/components/AdSlot';
import VagasList from '@/components/VagasList';
import SearchBar from '@/components/SearchBar';
import type { VagaCompleta } from '@/types/database';

interface BuscaProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: BuscaProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  
  return {
    title: `Resultados para "${query}" - VagasHub`,
    description: `Buscando vagas de emprego para "${query}". Encontre sua próxima oportunidade no VagasHub.`,
  };
}

// Função utilitária para remover acentos e normalizar strings
function removeAcentos(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function buscarVagasPorTermo(termo: string): Promise<VagaCompleta[]> {
  if (!termo.trim()) return [];

  const supabase = await createClient();
  const termoNormalizado = removeAcentos(termo);

  // Como não temos acesso garantido à extensão 'unaccent' no Postgres,
  // fazemos um fetch mais amplo das vagas ativas e filtramos no servidor Next.js
  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('status', 'ativa')
    .order('created_at', { ascending: false })
    .limit(300);

  if (!data) return [];

  const vagasCompletas = data as VagaCompleta[];

  const vagasFiltradas = vagasCompletas.filter((vaga) => {
    const tituloMatch = removeAcentos(vaga.titulo).includes(termoNormalizado);
    const empresaMatch = vaga.empresa?.nome && removeAcentos(vaga.empresa.nome).includes(termoNormalizado);
    const vendasMatch = vaga.empresa?.vendas && removeAcentos(vaga.empresa.vendas).includes(termoNormalizado);
    
    const categoriasMatch = vaga.vagas_categorias?.some((vc) => 
      vc.categorias && removeAcentos(vc.categorias.nome).includes(termoNormalizado)
    );

    return tituloMatch || empresaMatch || vendasMatch || categoriasMatch;
  });

  return vagasFiltradas;
}

async function buscarRecomendacoes(): Promise<VagaCompleta[]> {
  const supabase = await createClient();
  
  // Buscar vagas recentes em categorias populares ou título contendo junior/estagio
  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('status', 'ativa')
    .or('titulo.ilike.%junior%,titulo.ilike.%júnior%,titulo.ilike.%estágio%,titulo.ilike.%estagio%')
    .order('created_at', { ascending: false })
    .limit(4);

  // Se não encontrar por título, busca as 4 últimas genéricas
  if (!data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from('vagas')
      .select('*, vagas_categorias(categorias(*)), empresa(*)')
      .eq('status', 'ativa')
      .order('created_at', { ascending: false })
      .limit(4);
    
    return (fallbackData as VagaCompleta[]) || [];
  }

  return (data as VagaCompleta[]) || [];
}

async function ResultadosBusca({ query }: { query: string }) {
  const vagas = await buscarVagasPorTermo(query);

  if (vagas.length > 0) {
    return <VagasList vagas={vagas} />;
  }

  // Fallback State - Talvez te interesse
  const recomendacoes = await buscarRecomendacoes();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center py-10 glass-card rounded-2xl border border-border-subtle bg-surface/30">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-card flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-text-secondary text-lg font-medium">Nenhuma vaga encontrada para "{query}"</p>
        <p className="text-text-muted text-sm mt-1 max-w-md mx-auto">
          Experimente buscar por termos mais genéricos, verificar a ortografia ou explorar nossas categorias.
        </p>
      </div>

      {recomendacoes.length > 0 && (
        <section className="mt-4 mb-10">
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

  return (
    <>
      <div className="container-app py-6 min-h-[calc(100vh-140px)]">
        <section className="mb-8 animate-fade-in flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight mb-2 flex items-center flex-wrap justify-center gap-3">
            Resultado para <span className="text-primary-light">"{query}"</span>
            {query && (
              <Link 
                href="/" 
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1 bg-surface-card px-3 py-1.5 rounded-full border border-border-subtle hover:border-primary/50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Desfazer
              </Link>
            )}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1.5 mb-6">
            Refine sua pesquisa utilizando a barra abaixo.
          </p>
          <SearchBar initialQuery={query} />
        </section>

        {/* Ad Slot 1 - Topo da Busca */}
        <AdSlot format="horizontal" label="Publicidade — Busca" className="mb-5" />

        {/* Resultados */}
        <section>
          {query ? (
            <Suspense fallback={<VagaCardSkeleton count={4} />}>
              <ResultadosBusca query={query} />
            </Suspense>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-secondary">Digite algo na barra de pesquisa para começar.</p>
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
