import { Metadata } from 'next';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como o VagasHub protege seus dados e a sua privacidade.',
};

export default function PrivacidadePage() {
  return (
    <div className="container-app pt-10 pb-32 md:pt-16 min-h-[calc(100vh-140px)]">
      <div className="max-w-3xl mx-auto animate-fade-in glass-card p-6 md:p-10">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Política de Privacidade</h1>
        
        <div className="markdown-content space-y-6">
          <p>
            Bem-vindo ao VagasHub. Nós valorizamos a sua privacidade e estamos comprometidos em proteger as suas informações pessoais. Esta Política de Privacidade explica como lidamos com os seus dados quando você utiliza o nosso portal.
          </p>

          <AdSlot format="horizontal" label="Publicidade" className="my-6" />

          <h2>1. Coleta e Uso de Dados</h2>
          <p>
            O VagasHub foi projetado para operar com <strong>zero fricção</strong>. Nós não exigimos cadastro, criação de conta ou login para que você possa buscar vagas de emprego. Consequentemente, <strong>não coletamos dados pessoais identificáveis</strong> (como nome, e-mail, telefone ou currículo) diretamente em nossos servidores.
          </p>
          <p>
            As candidaturas às vagas são realizadas em plataformas externas de terceiros. Ao clicar em "Candidatar-se", você é redirecionado, e a política de privacidade desse parceiro ou empresa passará a ser aplicada.
          </p>

          <h2>2. Cookies e Tecnologias de Rastreamento (Google AdSense)</h2>
          <p>
            Para manter o VagasHub gratuito, nós exibimos anúncios do Google AdSense. 
          </p>
          <ul>
            <li>Fornecedores de terceiros, incluindo o Google, usam cookies para veicular anúncios com base em visitas anteriores do usuário ao nosso website ou a outros websites na internet.</li>
            <li>O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios para os usuários com base nas visitas feitas aos seus sites e/ou a outros sites na internet.</li>
            <li>Os usuários podem desativar a publicidade personalizada acessando as <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Configurações de anúncios do Google</a>.</li>
          </ul>

          <h2>3. Informações de Navegação Anônimas</h2>
          <p>
            Podemos coletar informações de navegação não identificáveis (como páginas visitadas, tempo de permanência, modelo do dispositivo e localização aproximada) através de ferramentas de analytics. Estes dados são agregados e utilizados exclusivamente para entender o comportamento do público e melhorar a experiência de uso (mobile-first) do nosso portal.
          </p>

          <h2>4. Links Externos</h2>
          <p>
            O VagasHub atua como um agregador. Nosso site contém links para sites externos (para aplicação nas vagas). Não nos responsabilizamos pelas práticas de privacidade ou pelo conteúdo desses outros sites. Recomendamos que você leia as políticas de privacidade de cada site visitado.
          </p>

          <h2>5. Alterações nesta Política</h2>
          <p>
            Podemos atualizar nossa Política de Privacidade periodicamente. Quaisquer alterações serão publicadas nesta página. Recomendamos que os usuários revisem esta página regularmente para se manterem informados sobre como estamos protegendo as informações que coletamos.
          </p>

          <AdSlot format="horizontal" label="Publicidade" className="my-6" />

          <h2>6. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelas nossas redes sociais ou através dos canais de comunicação disponíveis nas nossas comunidades de WhatsApp.
          </p>
          
          <p className="text-sm text-text-muted mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
