import Link from 'next/link';

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle mt-auto">
      <div className="container-app py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
              V
            </div>
            <span className="text-text-muted text-sm">
              © {ano} VagasHub. Todos os direitos reservados.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-text-muted text-xs hover:text-text-secondary transition-colors">
              Início
            </Link>
            <span className="text-border text-xs">•</span>
            <span className="text-text-muted text-xs">
              Feito com 💜
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
