import VagaCard from '@/components/VagaCard';
import AdSlot from '@/components/AdSlot';
import type { VagaCompleta } from '@/types/database';

interface VagasListProps {
  vagas: VagaCompleta[];
  emptyMessage?: string;
  emptySubMessage?: string;
}

export default function VagasList({ 
  vagas, 
  emptyMessage = 'Nenhuma vaga encontrada',
  emptySubMessage = 'Novas vagas serão publicadas em breve!' 
}: VagasListProps) {
  if (vagas.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-card flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-text-secondary text-lg font-medium">{emptyMessage}</p>
        <p className="text-text-muted text-sm mt-1">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-20">
      {vagas.map((vaga, i) => (
        <div key={vaga.id}>
          <VagaCard vaga={vaga} index={i} />
          {/* Ad slot a cada 4 vagas (Aggressive Monetization) */}
          {(i + 1) % 4 === 0 && i < vagas.length - 1 && (
            <AdSlot format="horizontal" label="Publicidade" className="my-3" />
          )}
        </div>
      ))}
    </div>
  );
}
