import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hubvagasbr.com.br'),
  title: {
    default: "VagasHub — Vagas de Emprego Atualizadas",
    template: "%s | VagasHub",
  },
  description:
    "Encontre as melhores vagas de emprego. Oportunidades atualizadas diariamente em diversas categorias. Candidate-se com um clique!",
  keywords: ["vagas", "emprego", "trabalho", "oportunidades", "candidatar"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "VagasHub",
    images: [
      {
        url: '/logooriginal.png',
        width: 800,
        height: 600,
        alt: 'VagasHub Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#0B0D1A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
