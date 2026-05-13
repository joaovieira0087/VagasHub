import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import VagaCardSkeleton from '@/components/VagaCardSkeleton';
import CategoriaBar from '@/components/CategoriaBar';
import AdSlot from '@/components/AdSlot';
import VagasList from '@/components/VagasList';
import { buscarCategorias } from '@/app/page';
import type { VagaCompleta } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoriaInfo(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categorias')
    .select('id, nome, slug')
    .eq('slug', slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await getCategoriaInfo(slug);

  if (!categoria) {
    return { title: 'Categoria não encontrada' };
  }

  return {
    title: `Vagas de ${categoria.nome}`,
    description: `Encontre as melhores oportunidades e vagas de emprego na área de ${categoria.nome}.`,
  };
}

async function buscarVagasPorCategoria(categoriaId: string): Promise<VagaCompleta[]> {
  const supabase = await createClient();

  // 1. Buscar vaga_ids da junction table
  const { data: junctions } = await supabase
    .from('vagas_categorias')
    .select('vaga_id')
    .eq('categoria_id', categoriaId);

  if (!junctions || junctions.length === 0) return [];

  const vagaIds = junctions.map((j) => j.vaga_id);

  // 2. Buscar vagas completas
  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('status', 'ativa')
    .in('id', vagaIds)
    .order('created_at', { ascending: false })
    .limit(50);

  return (data as VagaCompleta[]) || [];
}

async function VagasListWrapper({ categoriaId }: { categoriaId: string }) {
  const vagas = await buscarVagasPorCategoria(categoriaId);
  return <VagasList vagas={vagas} />;
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;
  const categoria = await getCategoriaInfo(slug);

  if (!categoria) {
    notFound();
  }

  const categorias = await buscarCategorias();

  return (
    <>
      <div className="container-app py-6">
        {/* Hero minimal */}
        <section className="mb-6 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
            Vagas de <span className="text-primary-light">{categoria.nome}</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1.5">
            Oportunidades recentes para {categoria.nome.toLowerCase()}.
          </p>
        </section>

        {/* Ad Slot 1 - Header (Aggressive Monetization) */}
        <AdSlot format="horizontal" label="Publicidade — Topo Categoria" className="mb-5" />

        {/* Categorias Bar */}
        <section className="mb-5">
          <Suspense fallback={<div className="skeleton h-8 w-full rounded-full" />}>
            <CategoriaBar categorias={categorias} categoriaAtiva={slug} />
          </Suspense>
        </section>

        {/* Lista de Vagas */}
        <section>
          <Suspense fallback={<VagaCardSkeleton count={6} />}>
            <VagasListWrapper categoriaId={categoria.id} />
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
