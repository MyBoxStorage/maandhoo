-- ================================================================
-- TABELA galeria_home — Slots fixos para a seção Experiência da home
-- 7 slots: posições 1-3 = verticais (portrait), 4-7 = horizontais (landscape)
-- Execute no Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.galeria_home (
  slot        INTEGER PRIMARY KEY CHECK (slot BETWEEN 1 AND 7),
  galeria_id  UUID REFERENCES public.galeria(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir os 7 slots vazios (sem mídia)
INSERT INTO public.galeria_home (slot, galeria_id)
VALUES (1, NULL),(2, NULL),(3, NULL),(4, NULL),(5, NULL),(6, NULL),(7, NULL)
ON CONFLICT (slot) DO NOTHING;

-- RLS
ALTER TABLE public.galeria_home ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='galeria_home' AND policyname='galeria_home_service_all') THEN
    CREATE POLICY "galeria_home_service_all"
      ON public.galeria_home FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Verificar
SELECT slot, galeria_id FROM public.galeria_home ORDER BY slot;
