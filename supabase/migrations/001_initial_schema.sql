-- ==========================================
-- PORTAL DE VAGAS - Schema Inicial
-- Execute este SQL no Supabase SQL Editor
-- ==========================================

-- ==========================================
-- TABELA: categorias
-- ==========================================
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Leitura pública para todos
CREATE POLICY "categorias_select_public" ON public.categorias
  FOR SELECT USING (true);

-- ==========================================
-- TABELA: empresa
-- ==========================================
CREATE TABLE IF NOT EXISTS public.empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  vendas TEXT,        -- categorias extras/dinâmicas (texto livre)
  logo_url TEXT
);

ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;

-- Leitura pública para todos
CREATE POLICY "empresa_select_public" ON public.empresa
  FOR SELECT USING (true);

-- ==========================================
-- TABELA: vagas
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  id_categoria UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  id_empresa UUID REFERENCES public.empresa(id) ON DELETE SET NULL,
  link_externo TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

-- Leitura pública apenas para vagas ativas
CREATE POLICY "vagas_select_ativas" ON public.vagas
  FOR SELECT USING (status = 'ativa');

-- ==========================================
-- ÍNDICES DE PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_vagas_status ON public.vagas(status);
CREATE INDEX IF NOT EXISTS idx_vagas_slug ON public.vagas(slug);
CREATE INDEX IF NOT EXISTS idx_vagas_id_categoria ON public.vagas(id_categoria);
CREATE INDEX IF NOT EXISTS idx_vagas_created_at ON public.vagas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categorias_slug ON public.categorias(slug);

-- ==========================================
-- FUNÇÃO: Incrementar visualizações
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_visualizacoes(vaga_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.vagas
  SET visualizacoes = visualizacoes + 1
  WHERE id = vaga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- DADOS INICIAIS (Categorias padrão)
-- ==========================================
INSERT INTO public.categorias (nome, slug) VALUES
  ('Tecnologia', 'tecnologia'),
  ('Administrativo', 'administrativo'),
  ('Vendas', 'vendas'),
  ('Limpeza', 'limpeza'),
  ('Logística', 'logistica'),
  ('Saúde', 'saude'),
  ('Educação', 'educacao'),
  ('Construção Civil', 'construcao-civil'),
  ('Atendimento', 'atendimento'),
  ('Marketing', 'marketing')
ON CONFLICT (slug) DO NOTHING;
