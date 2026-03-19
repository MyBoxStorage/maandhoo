# SQL — Criar Tabela Leads
## Maandhoo Club — Executar no Supabase SQL Editor

A tabela `leads` não estava incluída na migration consolidada original.
Execute este bloco no SQL Editor do Supabase para criá-la.

---

## BLOCO ÚNICO — Criar tabela leads

```sql
-- ─────────────────────────────────────────────────────────────────
-- TABELA: leads
-- Captura contatos de todas as origens do site (lista, reservas, etc.)
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT NOT NULL,
  email               TEXT,
  whatsapp            TEXT,
  origem              TEXT NOT NULL
                      CHECK (origem IN (
                        'popup_lista', 'reserva_mesa', 'reserva_camarote',
                        'reserva_aniversario', 'compra_ingresso', 'contato'
                      )),
  evento_id           UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  evento_nome         TEXT,
  observacoes         TEXT,
  status              TEXT NOT NULL DEFAULT 'novo'
                      CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado')),
  consentimento_lgpd  BOOLEAN NOT NULL DEFAULT false,
  data_consentimento  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_status   ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_origem   ON public.leads (origem);
CREATE INDEX IF NOT EXISTS idx_leads_email    ON public.leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_created  ON public.leads (created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Apenas service_role acessa (insert pelo site anônimo passa pelo service_role key)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'leads_service_all'
  ) THEN
    CREATE POLICY "leads_service_all"
      ON public.leads FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Verificação
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'leads'
ORDER BY ordinal_position;
-- Deve retornar 14 colunas
```

---

## NOTAS

- A coluna `updated_at` usa a função `update_updated_at()` que já existe no banco
  (criada no Bloco 0A da migration consolidada).
- Após executar, recarregue a página `/admin/usuarios` — os leads já cadastrados
  (via reservas e lista) aparecerão imediatamente.
- Leads de reservas são inseridos automaticamente pela API `/api/reservas` ao receber
  um novo formulário no site.
- Leads da lista amiga são inseridos pela API `/api/lista`.
