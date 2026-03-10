-- ================================================================
-- MIGRATION V2 — Perfil Quiz, LGPD, Badge, Tema, Playlist
-- Aplique via MCP Supabase ou SQL Editor
-- ================================================================

-- ── 1. NOVAS COLUNAS NA TABELA clientes ─────────────────────────

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS data_nascimento  DATE,
  ADD COLUMN IF NOT EXISTS estado           TEXT,
  ADD COLUMN IF NOT EXISTS cidade           TEXT,

  -- LGPD (obrigatório por lei: data, versão e IP do aceite)
  ADD COLUMN IF NOT EXISTS lgpd_aceito          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lgpd_aceito_em        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_versao_termo     TEXT,
  ADD COLUMN IF NOT EXISTS lgpd_ip               TEXT,

  -- Termos de uso (aceite obrigatório no cadastro)
  ADD COLUMN IF NOT EXISTS termos_aceitos        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS termos_aceitos_em     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS termos_versao         TEXT,

  -- Quiz
  ADD COLUMN IF NOT EXISTS quiz_feito            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiz_feito_em         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quiz_respostas        JSONB,
  ADD COLUMN IF NOT EXISTS quiz_perfil_id        TEXT,
  ADD COLUMN IF NOT EXISTS quiz_perfil_nome      TEXT,

  -- Badge e Tema
  ADD COLUMN IF NOT EXISTS badge_ativo           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tema_ativo            BOOLEAN NOT NULL DEFAULT false,

  -- Playlist
  ADD COLUMN IF NOT EXISTS playlist_url          TEXT,
  ADD COLUMN IF NOT EXISTS playlist_nome         TEXT;

-- ── 2. ÍNDICES ÚTEIS ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_clientes_quiz_perfil
  ON public.clientes (quiz_perfil_id);

CREATE INDEX IF NOT EXISTS idx_clientes_lgpd
  ON public.clientes (lgpd_aceito);

-- ── 3. TABELA DE LOG DE CONSENTIMENTOS (auditoria LGPD) ─────────
-- Guarda TODOS os aceites e revogações com registro imutável

CREATE TABLE IF NOT EXISTS public.consentimentos_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL,           -- 'lgpd' | 'termos'
  acao         TEXT NOT NULL,           -- 'aceite' | 'revogacao'
  versao_termo TEXT NOT NULL,
  ip           TEXT,
  user_agent   TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consentimentos_cliente
  ON public.consentimentos_log (cliente_id, tipo);

ALTER TABLE public.consentimentos_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'consentimentos_log'
      AND policyname = 'Somente service_role acessa consentimentos'
  ) THEN
    CREATE POLICY "Somente service_role acessa consentimentos"
      ON public.consentimentos_log FOR ALL USING (false);
  END IF;
END $$;

-- ── 4. CONFIRMAÇÃO ──────────────────────────────────────────────

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clientes'
ORDER BY ordinal_position;
