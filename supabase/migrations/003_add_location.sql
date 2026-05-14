-- Adicionar colunas de localização opcionais na tabela vagas
ALTER TABLE public.vagas 
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text;
