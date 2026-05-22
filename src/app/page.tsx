import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import VagaCardSkeleton from '@/components/VagaCardSkeleton';
import CategoriaBar from '@/components/CategoriaBar';
import AdSlot from '@/components/AdSlot';
import VagasList from '@/components/VagasList';
import SearchBar from '@/components/SearchBar';
import { buscarLocaisExistentes } from '@/lib/actions/vagas';
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
  const locais = await buscarLocaisExistentes();

  return (
    <>
      {/* Banner Hero Premium (Full Width!) */}
      <section className="relative w-full overflow-hidden border-b border-border-subtle bg-[#0B0D1A]">
        {/* Imagem de Fundo Profissional */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80')` }}
        />
        
        {/* Overlay Escuro com Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D1A]/80 via-[#0B0D1A]/95 to-[#0B0D1A]" />
        
        {/* Detalhes de Brilho de Fundo (Glow Effects) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        
        {/* Conteúdo Centralizado */}
        <div className="relative z-10 container-app py-16 sm:py-24 flex flex-col items-center text-center animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary-light border border-primary/20 mb-6 backdrop-blur-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Vagas Atualizadas Diariamente
          </span>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-[1.15] max-w-3xl drop-shadow-sm tracking-tight">
            Encontre sua próxima <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-light via-purple-300 to-accent bg-clip-text text-transparent drop-shadow-sm">
              Oportunidade Profissional
            </span>
          </h1>
          
          <p className="text-text-secondary text-base sm:text-lg md:text-xl mt-4 max-w-xl mb-10 leading-relaxed">
            As melhores vagas de emprego de forma simples e direta, sem burocracia. Candidate-se com um clique!
          </p>
          
          <div className="w-full flex justify-center px-2">
            <SearchBar locais={locais} />
          </div>
        </div>
      </section>

      <div className="container-app py-6">
        {/* Ad Slot 1 - Header */}
        <AdSlot format="horizontal" label="Publicidade — Header" className="mb-5" />

        {/* Categorias */}
        <section className="mb-8">
          <Suspense fallback={
            <div className="w-full animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="skeleton h-7 w-44 rounded-lg" />
                <div className="skeleton h-5 w-16 rounded-lg" />
              </div>
              <div className="flex gap-4 overflow-hidden pb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[145px] sm:w-[160px] h-[140px] sm:h-[155px] skeleton rounded-2xl" />
                ))}
              </div>
            </div>
          }>
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
