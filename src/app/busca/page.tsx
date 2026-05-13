import { Suspense } from 'react';
import { Metadata } from 'next';
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

async function buscarVagasPorTermo(termo: string): Promise<VagaCompleta[]> {
  if (!termo.trim()) return [];

  const supabase = await createClient();
  const q = `%${termo}%`;

  // 1. Buscar IDs de Vagas por Título
  const { data: vagasPorTitulo } = await supabase
    .from('vagas')
    .select('id')
    .ilike('titulo', q);

  // 2. Buscar IDs de Empresas por Nome ou Vendas (tags_extras)
  const { data: empresasPorNome } = await supabase
    .from('empresa')
    .select('id')
    .or(`nome.ilike.${q},vendas.ilike.${q}`);

  // 3. Buscar IDs de Categorias por Nome
  const { data: categoriasPorNome } = await supabase
    .from('categorias')
    .select('id')
    .ilike('nome', q);

  const empresaIds = empresasPorNome?.map(e => e.id) || [];
  const categoriaIds = categoriasPorNome?.map(c => c.id) || [];

  // 4. Buscar Vagas relacionadas às Categorias encontradas
  let vagasCategoriasIds: string[] = [];
  if (categoriaIds.length > 0) {
    const { data: vc } = await supabase
      .from('vagas_categorias')
      .select('vaga_id')
      .in('categoria_id', categoriaIds);
    vagasCategoriasIds = vc?.map(v => v.vaga_id) || [];
  }

  // 5. Consolidar IDs de Vagas diretas (Título ou Categoria)
  const vagaIdsToFetch = [
    ...(vagasPorTitulo?.map(v => v.id) || []),
    ...vagasCategoriasIds
  ];

  // 6. Construir a query final
  if (empresaIds.length === 0 && vagaIdsToFetch.length === 0) {
    return []; // Nada encontrado
  }

  let finalQuery = supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('status', 'ativa')
    .order('created_at', { ascending: false })
    .limit(50);

  if (empresaIds.length > 0 && vagaIdsToFetch.length > 0) {
    finalQuery = finalQuery.or(`id.in.(${vagaIdsToFetch.join(',')}),id_empresa.in.(${empresaIds.join(',')})`);
  } else if (empresaIds.length > 0) {
    finalQuery = finalQuery.in('id_empresa', empresaIds);
  } else if (vagaIdsToFetch.length > 0) {
    finalQuery = finalQuery.in('id', vagaIdsToFetch);
  }

  const { data } = await finalQuery;
  return (data as VagaCompleta[]) || [];
}

async function ResultadosBusca({ query }: { query: string }) {
  const vagas = await buscarVagasPorTermo(query);

  return (
    <VagasList 
      vagas={vagas} 
      emptyMessage="Nenhuma vaga encontrada para sua busca." 
      emptySubMessage={`Não encontramos resultados exatos para "${query}". Tente buscar por termos mais genéricos ou acesse nossas categorias.`}
    />
  );
}

export default async function BuscaPage({ searchParams }: BuscaProps) {
  const params = await searchParams;
  const query = params.q || '';

  return (
    <>
      <div className="container-app py-6 min-h-[calc(100vh-140px)]">
        <section className="mb-8 animate-fade-in flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
            Resultados da <span className="text-primary-light">Busca</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1.5 mb-6">
            Mostrando resultados para: <span className="font-medium text-text-primary">"{query}"</span>
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
