# PROMPT PARA O CURSOR — Aplicar Migration V2 via MCP Supabase

Cole este prompt exatamente no Cursor para ele aplicar a migration usando o MCP do Supabase:

---

Use the Supabase MCP tool to execute the following SQL on the project database.
Run each block separately and confirm success before proceeding to the next.

**Block 1 — Add new columns to clientes table:**

```sql
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS data_nascimento      DATE,
  ADD COLUMN IF NOT EXISTS estado               TEXT,
  ADD COLUMN IF NOT EXISTS cidade               TEXT,
  ADD COLUMN IF NOT EXISTS lgpd_aceito          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lgpd_aceito_em       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_versao_termo    TEXT,
  ADD COLUMN IF NOT EXISTS lgpd_ip              TEXT,
  ADD COLUMN IF NOT EXISTS termos_aceitos       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS termos_aceitos_em    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS termos_versao        TEXT,
  ADD COLUMN IF NOT EXISTS quiz_feito           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiz_feito_em        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quiz_respostas       JSONB,
  ADD COLUMN IF NOT EXISTS quiz_perfil_id       TEXT,
  ADD COLUMN IF NOT EXISTS quiz_perfil_nome     TEXT,
  ADD COLUMN IF NOT EXISTS badge_ativo          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tema_ativo           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS playlist_url         TEXT,
  ADD COLUMN IF NOT EXISTS playlist_nome        TEXT;
```

**Block 2 — Create indexes:**

```sql
CREATE INDEX IF NOT EXISTS idx_clientes_quiz_perfil ON public.clientes (quiz_perfil_id);
CREATE INDEX IF NOT EXISTS idx_clientes_lgpd ON public.clientes (lgpd_aceito);
```

**Block 3 — Create consent audit log table:**

```sql
CREATE TABLE IF NOT EXISTS public.consentimentos_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL,
  acao         TEXT NOT NULL,
  versao_termo TEXT NOT NULL,
  ip           TEXT,
  user_agent   TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consentimentos_cliente
  ON public.consentimentos_log (cliente_id, tipo);

ALTER TABLE public.consentimentos_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente service_role acessa consentimentos"
  ON public.consentimentos_log FOR ALL USING (false);
```

**Block 4 — Verify columns exist:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clientes'
ORDER BY ordinal_position;
```

After running all blocks, confirm that all columns are present and the consentimentos_log table was created successfully.

---

Arquivo SQL completo também disponível em:
`src/lib/migration-v2-perfil-quiz-lgpd.sql`
