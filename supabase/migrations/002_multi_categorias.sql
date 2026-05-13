-- ==========================================
-- MIGRATION 002: Multi-Categorias (N:N)
-- Execute este SQL no Supabase SQL Editor
-- ==========================================

-- Tabela de junção para relação N:N entre vagas e categorias
CREATE TABLE IF NOT EXISTS public.vagas_categorias (
  vaga_id UUID REFERENCES public.vagas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (vaga_id, categoria_id)
);

ALTER TABLE public.vagas_categorias ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "vagas_categorias_select_public" ON public.vagas_categorias
  FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_vc_vaga ON public.vagas_categorias(vaga_id);
CREATE INDEX IF NOT EXISTS idx_vc_categoria ON public.vagas_categorias(categoria_id);

-- Migrar dados existentes de id_categoria para a tabela de junção
INSERT INTO public.vagas_categorias (vaga_id, categoria_id)
SELECT id, id_categoria FROM public.vagas WHERE id_categoria IS NOT NULL
ON CONFLICT DO NOTHING;
