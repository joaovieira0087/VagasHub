import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import VagaCardSkeleton from '@/components/VagaCardSkeleton';
import CategoriaBar from '@/components/CategoriaBar';
import AdSlot from '@/components/AdSlot';
import VagasList from '@/components/VagasList';
import SearchBar from '@/components/SearchBar';
import type { VagaCompleta, CategoriaComContagem } from '@/types/database';

export async function buscarCategorias(): Promise<CategoriaComContagem[]> {
  const supabase = await createClient();

  // 1. Buscar todas as categorias
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*');

  // 2. Buscar junction data de vagas ativas
  const { data: vagas } = await supabase
    .from('vagas')
    .select('id, vagas_categorias(categoria_id)')
    .eq('status', 'ativa');

  if (!categorias) return [];

  // 3. Contar vagas por categoria via junction
  const countMap = new Map<string, number>();
  if (vagas) {
    for (const vaga of vagas) {
      const junctions = (vaga as any).vagas_categorias || [];
      for (const j of junctions) {
        countMap.set(j.categoria_id, (countMap.get(j.categoria_id) || 0) + 1);
      }
    }
  }

  // 4. Retornar com contagem, filtrado e ordenado por ranking
  return categorias
    .map((cat) => ({
      ...cat,
      vaga_count: countMap.get(cat.id) || 0,
    }))
    .filter((cat) => cat.vaga_count > 0)
    .sort((a, b) => b.vaga_count - a.vaga_count);
}

async function buscarTodasVagas(): Promise<VagaCompleta[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('status', 'ativa')
    .order('created_at', { ascending: false })
    .limit(50);

  return (data as VagaCompleta[]) || [];
}

async function VagasListWrapper() {
  const vagas = await buscarTodasVagas();
  return <VagasList vagas={vagas} />;
}

export default async function Home() {
  const categorias = await buscarCategorias();

  return (
    <>
      <div className="container-app py-6">
        {/* Hero minimal */}
        <section className="mt-8 sm:mt-12 mb-10 animate-fade-in flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-tight max-w-2xl">
            Vagas de Emprego
            <span className="text-primary-light"> Atualizadas</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg mt-3 max-w-xl mb-8">
            Encontre sua próxima oportunidade. Novas vagas todos os dias.
          </p>
          <SearchBar />
        </section>

        {/* Ad Slot 1 - Header */}
        <AdSlot format="horizontal" label="Publicidade — Header" className="mb-5" />

        {/* Categorias */}
        <section className="mb-5">
          <Suspense fallback={<div className="skeleton h-8 w-full rounded-full" />}>
            <CategoriaBar categorias={categorias} />
          </Suspense>
        </section>

        {/* Lista de Vagas */}
        <section>
          <Suspense fallback={<VagaCardSkeleton count={6} />}>
            <VagasListWrapper />
          </Suspense>
        </section>
      </div>

      {/* Ad Fixo no Rodapé (Aggressive Monetization) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 bg-background/90 backdrop-blur-lg border-t border-border-subtle shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <AdSlot format="horizontal" label="Publicidade" className="!my-0 !min-h-[60px]" />
      </div>
    </>
  );
}
