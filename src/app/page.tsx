import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import VagaCard from '@/components/VagaCard';
import VagaCardSkeleton from '@/components/VagaCardSkeleton';
import CategoriaBar from '@/components/CategoriaBar';
import AdSlot from '@/components/AdSlot';
import type { VagaCompleta, CategoriaUnificada } from '@/types/database';

interface HomeProps {
  searchParams: Promise<{ categoria?: string }>;
}

async function buscarCategoriasUnificadas(): Promise<CategoriaUnificada[]> {
  const supabase = await createClient();

  // 1. Buscar categorias com contagem de vagas ativas
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nome, slug');

  const { data: vagas } = await supabase
    .from('vagas')
    .select('id_categoria, empresa(vendas)')
    .eq('status', 'ativa');

  if (!categorias || !vagas) return [];

  // Contagem por categoria
  const contagemMap = new Map<string, number>();
  for (const vaga of vagas) {
    if (vaga.id_categoria) {
      contagemMap.set(vaga.id_categoria, (contagemMap.get(vaga.id_categoria) || 0) + 1);
    }
  }

  // Categorias principais com contagem
  const categoriasUnificadas: CategoriaUnificada[] = categorias
    .map((cat) => ({
      nome: cat.nome,
      slug: cat.slug,
      count: contagemMap.get(cat.id) || 0,
      origem: 'categoria' as const,
    }))
    .filter((cat) => cat.count > 0);

  // 2. Buscar categorias dinâmicas do campo "vendas" das empresas
  const { data: empresas } = await supabase
    .from('empresa')
    .select('vendas');

  if (empresas) {
    const vendasMap = new Map<string, number>();

    for (const emp of empresas) {
      if (emp.vendas && emp.vendas.trim()) {
        const nomeVenda = emp.vendas.trim();
        const slugVenda = nomeVenda
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');

        // Verificar se já não é uma categoria principal
        const jaExiste = categoriasUnificadas.some(
          (c) => c.slug === slugVenda || c.nome.toLowerCase() === nomeVenda.toLowerCase()
        );

        if (!jaExiste) {
          vendasMap.set(slugVenda, (vendasMap.get(slugVenda) || 0) + 1);

          // Adicionar se não existir no array ainda
          if (!categoriasUnificadas.some((c) => c.slug === slugVenda)) {
            categoriasUnificadas.push({
              nome: nomeVenda,
              slug: slugVenda,
              count: vendasMap.get(slugVenda) || 1,
              origem: 'vendas',
            });
          }
        }
      }
    }
  }

  // Ranking: mais vagas primeiro
  return categoriasUnificadas.sort((a, b) => b.count - a.count);
}

async function buscarVagas(categoriaSlug?: string): Promise<VagaCompleta[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vagas')
    .select('*, categorias(*), empresa(*)')
    .eq('status', 'ativa')
    .order('created_at', { ascending: false })
    .limit(50);

  if (categoriaSlug) {
    // Buscar categoria pelo slug
    const { data: categoria } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', categoriaSlug)
      .single();

    if (categoria) {
      query = query.eq('id_categoria', categoria.id);
    }
  }

  const { data } = await query;
  return (data as VagaCompleta[]) || [];
}

async function VagasList({ categoriaSlug }: { categoriaSlug?: string }) {
  const vagas = await buscarVagas(categoriaSlug);

  if (vagas.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-card flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-text-secondary text-lg font-medium">Nenhuma vaga encontrada</p>
        <p className="text-text-muted text-sm mt-1">
          {categoriaSlug ? 'Tente outra categoria.' : 'Novas vagas serão publicadas em breve!'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {vagas.map((vaga, i) => (
        <div key={vaga.id}>
          <VagaCard vaga={vaga} index={i} />
          {/* Ad slot a cada 5 vagas */}
          {(i + 1) % 5 === 0 && i < vagas.length - 1 && (
            <AdSlot format="horizontal" label="Publicidade" className="my-3" />
          )}
        </div>
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const categoriaAtiva = params.categoria;
  const categorias = await buscarCategoriasUnificadas();

  return (
    <div className="container-app py-6">
      {/* Hero minimal */}
      <section className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
          Vagas de Emprego
          <span className="text-primary-light"> Atualizadas</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base mt-1.5">
          Encontre sua próxima oportunidade. Novas vagas todos os dias.
        </p>
      </section>

      {/* Ad Slot 1 - Header */}
      <AdSlot format="horizontal" label="Publicidade — Header" className="mb-5" />

      {/* Categorias */}
      <section className="mb-5">
        <Suspense fallback={<div className="skeleton h-8 w-full rounded-full" />}>
          <CategoriaBar categorias={categorias} categoriaAtiva={categoriaAtiva} />
        </Suspense>
      </section>

      {/* Lista de Vagas */}
      <section>
        <Suspense fallback={<VagaCardSkeleton count={6} />}>
          <VagasList categoriaSlug={categoriaAtiva} />
        </Suspense>
      </section>
    </div>
  );
}
