import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="container-app">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-lg group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-shadow">
              <img src="/logo.png" alt="VagasHub Logo" className="w-6 h-6 object-contain" />
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
