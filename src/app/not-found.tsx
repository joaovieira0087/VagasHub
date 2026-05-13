import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-app py-20 text-center animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border-subtle">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Página não encontrada
      </h1>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        A vaga que você procura pode ter sido encerrada ou o link está incorreto.
      </p>
      <Link href="/" className="btn-primary">
        ← Voltar para as vagas
      </Link>
    </div>
  );
}
