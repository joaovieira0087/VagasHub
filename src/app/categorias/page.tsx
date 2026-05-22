import type { Metadata } from 'next';
import Link from 'next/link';
import { buscarCategorias } from '@/app/page';
import CategoriaBar from '@/components/CategoriaBar';

export const metadata: Metadata = {
  title: 'Todas as Categorias',
  description:
    'Explore todas as categorias de vagas de emprego disponíveis no VagasHub. Encontre oportunidades em Tecnologia, Vendas, Saúde, Logística e muito mais.',
  openGraph: {
    title: 'Todas as Categorias — VagasHub',
    description:
      'Navegue por todas as áreas profissionais e encontre a vaga ideal para você.',
  },
};

export default async function CategoriasPage() {
  const categorias = await buscarCategorias();

  return (
    <div className="container-app py-8 sm:py-12 animate-fade-in">
      {/* Botão Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary-light transition-colors mb-8 group"
        id="categorias-voltar-home"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Voltar para a Home
      </Link>

      {/* Cabeçalho da Página */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Todas as Categorias
        </h1>
        <p className="text-text-secondary mt-2 text-base sm:text-lg max-w-2xl leading-relaxed">
          Navegue por todas as áreas profissionais disponíveis e encontre as vagas ideais para o seu perfil.
        </p>
      </div>

      {/* Grid Completo de Categorias (sem slice — mostra tudo) */}
      <CategoriaBar categorias={categorias} linkVerTodas="/categorias" />
    </div>
  );
}
