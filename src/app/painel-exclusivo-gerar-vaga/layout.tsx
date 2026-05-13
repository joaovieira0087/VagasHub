import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Painel de Gestão',
  robots: { index: false, follow: false }, // Não indexar no Google
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-app py-6">
      {children}
    </div>
  );
}
