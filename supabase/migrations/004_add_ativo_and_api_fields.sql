-- ==========================================
-- MIGRATION 004: Adicionar ativo, api_external_id e origem
-- Execute este SQL no Supabase SQL Editor
-- ==========================================

-- 1. Adicionar novas colunas na tabela public.vagas
ALTER TABLE public.vagas 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS api_external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS nivel TEXT CHECK (nivel IN ('Estágio', 'Júnior'));

-- 2. Migrar dados existentes: setar ativo = false para vagas inativas
UPDATE public.vagas
SET ativo = false
WHERE status = 'inativa';

-- 3. Atualizar a Política RLS para leitura pública baseada na coluna ativo
DROP POLICY IF EXISTS "vagas_select_ativas" ON public.vagas;
CREATE POLICY "vagas_select_ativas" ON public.vagas
  FOR SELECT USING (ativo = true);

-- 4. Criar índices para performance nas novas colunas
CREATE INDEX IF NOT EXISTS idx_vagas_ativo ON public.vagas(ativo);
CREATE INDEX IF NOT EXISTS idx_vagas_api_external_id ON public.vagas(api_external_id);
