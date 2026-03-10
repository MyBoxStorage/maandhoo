-- ============================================================
-- Migration: adiciona coluna cpf na tabela clientes
-- Execute no Supabase SQL Editor
-- ============================================================

-- Adiciona coluna cpf (texto, só dígitos, único)
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Índice único para evitar CPF duplicado
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf ON public.clientes (cpf);

-- Remove a coluna cpf_hash antiga (se existir) — não era usada
ALTER TABLE public.clientes
  DROP COLUMN IF EXISTS cpf_hash;

-- Confirmar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
