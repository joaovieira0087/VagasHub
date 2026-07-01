import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AdSlot from '@/components/AdSlot';
import VagaCard from '@/components/VagaCard';
import SearchBar from '@/components/SearchBar';
import { formatarData, tempoRelativo } from '@/lib/utils/tempo';
import { formatarTopicos } from '@/lib/utils/formatador';
import type { VagaCompleta } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function buscarVaga(slug: string): Promise<VagaCompleta | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('slug', slug)
    .eq('ativo', true)
    .single();

  return data as VagaCompleta | null;
}

async function incrementarVisualizacoes(vagaId: string) {
  const supabase = await createClient();
  await supabase.rpc('increment_visualizacoes', { vaga_id: vagaId });
}

async function buscarRelacionadas(vagaId: string, categoriaIds: string[]): Promise<VagaCompleta[]> {
  if (categoriaIds.length === 0) return [];

  const supabase = await createClient();

  // Buscar vagas que compartilham qualquer categoria
  const { data: junctions } = await supabase
    .from('vagas_categorias')
    .select('vaga_id')
    .in('categoria_id', categoriaIds)
    .neq('vaga_id', vagaId);

  if (!junctions || junctions.length === 0) return [];

  const vagaIds = [...new Set(junctions.map((j) => j.vaga_id))];

  const { data } = await supabase
    .from('vagas')
    .select('*, vagas_categorias(categorias(*)), empresa(*)')
    .eq('ativo', true)
    .in('id', vagaIds)
    .order('created_at', { ascending: false })
    .limit(6);

  return (data as VagaCompleta[]) || [];
}

// SEO dinâmico
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vaga = await buscarVaga(slug);

  if (!vaga) {
    return { title: 'Vaga não encontrada' };
  }

  const descricaoLimpa = vaga.descricao
    ? vaga.descricao.replace(/[#*_\[\]()]/g, '').slice(0, 160)
    : `Confira os detalhes desta oportunidade e candidate-se agora no portal VagasHub.`;

  const ogImageUrl = vaga.empresa?.logo_url || '/logooriginal.png';

  return {
    title: `${vaga.titulo} - VagasHub`,
    description: descricaoLimpa,
    openGraph: {
      title: `${vaga.titulo} - VagasHub`,
      description: `Confira os detalhes desta oportunidade e candidate-se agora no portal VagasHub.`,
      type: 'article',
      locale: 'pt_BR',
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 600,
          alt: `Vaga de ${vaga.titulo}`,
        },
      ],
    },
  };
}

export default async function VagaDetalhes({ params }: PageProps) {
  const { slug } = await params;
  const vaga = await buscarVaga(slug);

  if (!vaga) {
    notFound();
  }

  // Incrementar visualizações (fire and forget)
  incrementarVisualizacoes(vaga.id);

  // Extrair IDs de categorias para buscar relacionadas
  const categoriaIds = vaga.vagas_categorias
    ?.map((vc) => vc.categorias?.id)
    .filter(Boolean) as string[] || [];

  const categorias = vaga.vagas_categorias?.map((vc) => vc.categorias).filter(Boolean) || [];
  const relacionadas = await buscarRelacionadas(vaga.id, categoriaIds);

  return (
    <div className="container-app py-6">
      <article className="animate-fade-in">
        {/* Empresa Header */}
        <div className="flex items-center gap-3 mb-5">
          {vaga.empresa?.logo_url ? (
            <img
              src={vaga.empresa.logo_url}
              alt={vaga.empresa.nome}
              className="w-12 h-12 rounded-xl object-cover bg-surface-elevated border border-border-subtle"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border-subtle">
              <span className="text-primary-light font-bold text-lg">
                {vaga.empresa?.nome?.charAt(0).toUpperCase() || 'E'}
              </span>
            </div>
          )}
          <div>
            <p className="text-text-primary font-semibold text-sm">
              {vaga.empresa?.nome || 'Empresa'}
            </p>
            <p className="text-text-muted text-xs">
              {tempoRelativo(vaga.created_at)} • {vaga.visualizacoes} visualizações
            </p>
          </div>
        </div>

        {/* Ad Slot 1 - Header */}
        <AdSlot format="horizontal" label="Publicidade" />

        {/* Título */}
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight mt-5 mb-1">
          {vaga.titulo}
        </h1>

        {/* Localização */}
        {(vaga.cidade || vaga.estado) && (
          <p className="text-text-secondary/80 text-sm mb-3 flex items-center gap-1 font-medium">
            <span className="text-base">📍</span> {vaga.cidade}{vaga.cidade && vaga.estado ? ' - ' : ''}{vaga.estado}
          </p>
        )}

        {/* Meta info — Multi-categorias */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {categorias.map((cat) => (
            <span key={cat.slug} className="badge badge-primary">
              {cat.nome}
            </span>
          ))}
          <span className="badge badge-accent">
            {vaga.status === 'ativa' ? '🟢 Ativa' : '⚪ Encerrada'}
          </span>
          <span className="text-text-muted text-xs">
            Publicada em {formatarData(vaga.created_at)}
          </span>
        </div>

        {/* Descrição (Texto Puro Formatado) */}
        <div className="glass-card p-5 sm:p-6 mb-5 hover:transform-none w-full block h-auto mt-6">
          <div 
            className="whitespace-pre-wrap break-words text-gray-200 text-base sm:text-lg leading-relaxed w-full block" 
            style={{ overflowWrap: 'anywhere' }}
          >
            {vaga.descricao ? (
              vaga.descricao
            ) : (
              <p className="text-text-secondary">
                Sem descrição detalhada disponível. Clique em &quot;Candidatar-se&quot; para mais informações.
              </p>
            )}
          </div>
        </div>

        {/* Requisitos — Exibição Condicional */}
        {(() => {
          const topicosRequisitos = formatarTopicos(vaga.requisitos);
          return topicosRequisitos.length > 0 ? (
            <div className="glass-card p-5 sm:p-6 mb-5 hover:transform-none w-full block h-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                Requisitos
              </h2>
              <ul className="space-y-2 pl-1">
                {topicosRequisitos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-gray-200 text-base sm:text-lg leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                    <span className="break-words" style={{ overflowWrap: 'anywhere' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}

        {/* Benefícios — Exibição Condicional */}
        {(() => {
          const topicosBeneficios = formatarTopicos(vaga.beneficios);
          return topicosBeneficios.length > 0 ? (
            <div className="glass-card p-5 sm:p-6 mb-5 hover:transform-none w-full block h-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-accent to-green-400 rounded-full" />
                Benefícios
              </h2>
              <ul className="space-y-2 pl-1">
                {topicosBeneficios.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-gray-200 text-base sm:text-lg leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                    <span className="break-words" style={{ overflowWrap: 'anywhere' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}

        {/* Ad Slot 2 - Between content and CTA */}
        <AdSlot format="rectangle" label="Publicidade — Conteúdo" />

        {/* CTA - Candidatar-se */}
        <div className="mt-6 mb-8">
          {vaga.link_externo ? (
            <a
              href={vaga.link_externo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta"
              id="btn-candidatar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Candidatar-se Agora
            </a>
          ) : (
            <button disabled className="btn-cta opacity-50 cursor-not-allowed">
              Link indisponível
            </button>
          )}
        </div>

        {/* CTA de Busca (Conversão) */}
        <div className="mt-10 mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface to-surface-card border border-border-subtle flex flex-col items-center text-center shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
            Ainda não é a vaga <span className="text-primary-light">ideal?</span>
          </h3>
          <p className="text-text-secondary mb-6 max-w-md">
            Ache a oportunidade perfeita para você. Pesquise por empresas, cargos ou áreas de atuação.
          </p>
          <SearchBar />
        </div>

        {/* Vagas Relacionadas */}
        {relacionadas.length > 0 && (
          <section className="mt-8 mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
              Vagas Relacionadas
            </h2>
            <div className="flex flex-col gap-3">
              {relacionadas.map((v, i) => (
                <VagaCard key={v.id} vaga={v} index={i} />
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Ad Slot 3 - Sticky Bottom (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 bg-background/90 backdrop-blur-lg border-t border-border-subtle sm:hidden">
        <AdSlot format="horizontal" label="Publicidade" className="!my-0 !min-h-[50px]" />
      </div>

      {/* Spacer for sticky ad */}
      <div className="h-16 sm:hidden" />
    </div>
  );
}
