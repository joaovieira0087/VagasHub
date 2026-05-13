import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="container-app">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-[0_0_15px_rgba(108,99,255,0.4)] transition-shadow">
              V
            </div>
            <span className="text-text-primary font-bold text-lg tracking-tight">
              Vagas<span className="text-primary-light">Hub</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="text-text-secondary text-sm hover:text-text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-surface-card"
            >
              Início
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
