import { Metadata } from 'next';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a missão do VagasHub e como ajudamos trabalhadores a encontrar oportunidades.',
};

export default function SobrePage() {
  return (
    <div className="container-app py-10 md:py-16">
      <div className="max-w-3xl mx-auto animate-fade-in glass-card p-6 md:p-10">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Sobre o VagasHub</h1>

        <div className="markdown-content space-y-6">
          <p className="text-lg">
            O <strong>VagasHub</strong> nasceu de uma necessidade real e urgente: organizar o fluxo de oportunidades de emprego que circulam freneticamente nas redes sociais e aplicativos de mensagens.
          </p>

          <AdSlot format="horizontal" label="Publicidade" className="my-6" />

          <h2>Nossa Missão</h2>
          <p>
            Nossa missão é democratizar o acesso à informação sobre o mercado de trabalho. Nós queremos conectar o trabalhador que precisa de uma oportunidade com a vaga ideal de maneira rápida, direta e com <strong>zero atrito</strong>.
          </p>

          <h2>A Filosofia "Zero Friction"</h2>
          <p>
            Nós acreditamos que procurar emprego não deveria ser um trabalho por si só. É por isso que o VagasHub foi desenhado sob o princípio de <em>"zero friction"</em> (zero fricção):
          </p>
          <ul>
            <li><strong>Sem necessidade de criar conta:</strong> Não queremos seus dados. Queremos que você encontre trabalho.</li>
            <li><strong>Acesso Direto:</strong> Achou a vaga interessante? Clique e seja redirecionado diretamente para a fonte da candidatura.</li>
          </ul>

          <h2>Como nos Mantemos?</h2>
          <p>
            O VagasHub é e sempre será <strong>100% gratuito para o trabalhador</strong>. Para cobrir os custos de hospedagem, infraestrutura de banco de dados e manutenção técnica do portal, nós utilizamos espaços publicitários discretos e parcerias através do Google AdSense.
          </p>
          <p>
            Essa estrutura permite que nosso projeto seja sustentável a longo prazo, sem repassar qualquer custo para quem já está na difícil jornada de buscar uma colocação profissional.
          </p>

          <AdSlot format="horizontal" label="Publicidade" className="my-6" />

          <h2>Transparência</h2>
          <p>
            Nós somos um hub de oportunidades. Organizamos as informações para facilitar a sua vida, mas reforçamos sempre que não temos controle direto sobre os processos seletivos. Nosso objetivo é ser a ponte mais curta entre você e o recrutador.
          </p>

          <p className="mt-8 font-semibold text-text-primary text-center">
            Obrigado por utilizar o VagasHub. Boa sorte na sua busca!
          </p>
        </div>
      </div>
    </div>
  );
}
