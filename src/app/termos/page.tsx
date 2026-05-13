import { Metadata } from 'next';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e Condições de Uso do portal de vagas VagasHub.',
};

export default function TermosPage() {
  return (
    <div className="container-app pt-10 pb-32 md:pt-16 min-h-[calc(100vh-140px)]">
      <div className="max-w-3xl mx-auto animate-fade-in glass-card p-6 md:p-10">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Termos de Uso</h1>
        
        <div className="markdown-content space-y-6">
          <p>
            Ao acessar e utilizar o site VagasHub, você concorda com os presentes Termos e Condições de Uso. Se você não concorda com qualquer parte destes termos, não deve utilizar o nosso portal.
          </p>

          <AdSlot format="horizontal" label="Publicidade" className="my-6" />

          <h2>1. Natureza do Serviço</h2>
          <p>
            O VagasHub é um <strong>agregador e divulgador de vagas de emprego</strong>. Nosso objetivo é facilitar o acesso a oportunidades profissionais, compilando links e informações disponíveis na internet e em grupos de parceiros (como WhatsApp). Nós <strong>não somos</strong> uma agência de recrutamento, não contratamos candidatos e não cobramos taxas dos usuários pela busca de vagas.
          </p>

          <h2>2. Isenção de Responsabilidade</h2>
          <p>
            Embora nos esforcemos para divulgar apenas oportunidades legítimas, o VagasHub não garante a precisão, integridade ou atualidade das informações das vagas publicadas. 
          </p>
          <ul>
            <li>O VagasHub não possui vínculo empregatício ou parceria formal com a maioria das empresas cujas vagas são listadas.</li>
            <li>A responsabilidade pelo processo seletivo, entrevistas, feedbacks e contratação é <strong>exclusivamente da empresa anunciante</strong>.</li>
            <li>Recomendamos fortemente que os candidatos pesquisem as empresas antes de compartilhar dados pessoais ou comparecer a entrevistas. O VagasHub não se responsabiliza por eventuais danos, perdas ou prejuízos decorrentes do uso das informações contidas neste site.</li>
            <li>Nunca pague taxas ou boletos para participar de processos seletivos. Caso identifique uma vaga fraudulenta, denuncie-a para nós.</li>
          </ul>

          <h2>3. Propriedade Intelectual</h2>
          <p>
            A estrutura do site, o design, as marcas e os textos produzidos pela nossa equipe (exceto as descrições das vagas fornecidas por terceiros) são de propriedade exclusiva do VagasHub e são protegidos por leis de direitos autorais. É proibida a reprodução, cópia ou extração automatizada de dados (web scraping) do nosso portal sem autorização prévia.
          </p>

          <h2>4. Uso Indevido</h2>
          <p>
            Os usuários concordam em usar o VagasHub apenas para o propósito legal de buscar emprego e informação sobre o mercado de trabalho. É expressamente proibido:
          </p>
          <ul>
            <li>Utilizar o site para disseminar spam, vírus ou qualquer código malicioso.</li>
            <li>Tentar burlar a segurança ou acessar áreas administrativas (painel de controle) sem a devida autorização.</li>
            <li>Utilizar nossas vagas para construir bases de dados concorrentes de forma não autorizada.</li>
          </ul>

          <AdSlot format="horizontal" label="Publicidade" className="my-6" />

          <h2>5. Alterações nos Termos</h2>
          <p>
            O VagasHub reserva-se o direito de modificar estes termos a qualquer momento, sem aviso prévio. O uso contínuo do site após quaisquer alterações constitui a sua aceitação dos novos Termos de Uso.
          </p>

          <p className="text-sm text-text-muted mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
