-- ============================================================
-- Migration: cria tabela clientes com cpf
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Tabela de clientes (área do cliente / portadores de ingresso)
CREATE TABLE IF NOT EXISTS public.clientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  whatsapp      TEXT,
  cpf           TEXT UNIQUE,           -- só dígitos, ex: 12345678901
  senha_hash    TEXT NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_acesso TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf ON public.clientes (cpf);

-- RLS: só service_role acessa diretamente
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clientes' AND policyname = 'Somente service_role acessa clientes'
  ) THEN
    CREATE POLICY "Somente service_role acessa clientes"
      ON public.clientes FOR ALL USING (false);
  END IF;
END $$;

-- 2. Coluna cliente_id em ingressos (se ainda não existir)
ALTER TABLE public.ingressos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id);
CREATE INDEX IF NOT EXISTS idx_ingressos_cliente_id ON public.ingressos (cliente_id);

-- 3. Confirmar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clientes'
ORDER BY ordinal_position;
