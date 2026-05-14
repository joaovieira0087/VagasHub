import Link from 'next/link';

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-auto bg-surface">
      <div className="container-app py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-sm">
                <img src="/logooriginal.png" alt="VagasHub Logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-text-primary font-bold text-lg tracking-tight">
                Vagas<span className="text-primary-light">Hub</span>
              </span>
            </div>
            <span className="text-text-muted text-sm text-center md:text-left mt-2">
              Democratizando o acesso a oportunidades.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/sobre" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Sobre Nós
            </Link>
            <Link href="/termos" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
        
        <div className="border-t border-border-subtle mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-text-muted text-xs text-center sm:text-left">
            © {ano} VagasHub. Todos os direitos reservados.
          </span>
          <span className="text-text-muted text-xs flex items-center gap-1">
            Feito com <span className="text-primary">💜</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
