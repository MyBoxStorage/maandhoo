-- ================================================================
-- TABELA: cookie_consents
-- Registra consentimento do banner de cookies (anônimo, sem PII)
-- Maandhoo Club — Executar no Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_aceito BOOLEAN NOT NULL DEFAULT false,
  marketing_aceito BOOLEAN NOT NULL DEFAULT false,
  versao_politica  TEXT NOT NULL DEFAULT '1.0',
  ip_origem        TEXT,
  user_agent       TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_criado ON public.cookie_consents (criado_em DESC);

ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cookie_consents'
      AND policyname = 'cookie_consents_service_all'
  ) THEN
    CREATE POLICY "cookie_consents_service_all"
      ON public.cookie_consents FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Verificação
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'cookie_consents'
ORDER BY ordinal_position;
-- Deve retornar 7 colunas
