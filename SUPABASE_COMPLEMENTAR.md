# SQL COMPLEMENTAR — Tabelas Cardápio e Galeria
## Maandhoo Club — Projeto: hrprcdbkgujvcrppmtcv
## Aplicar no Supabase SQL Editor

---

## TABELA: cardapio

```sql
CREATE TABLE IF NOT EXISTS public.cardapio (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria   TEXT NOT NULL CHECK (categoria IN ('drinks','longneck','doses','soft','combos','espumantes','outros')),
  nome        TEXT NOT NULL,
  descricao   TEXT,
  preco       NUMERIC(10,2) NOT NULL DEFAULT 0,
  disponivel  BOOLEAN NOT NULL DEFAULT true,
  destaque    BOOLEAN NOT NULL DEFAULT false,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cardapio_categoria  ON public.cardapio(categoria);
CREATE INDEX idx_cardapio_disponivel ON public.cardapio(disponivel);
CREATE INDEX idx_cardapio_ordem      ON public.cardapio(ordem);

CREATE TRIGGER trg_cardapio_updated_at
  BEFORE UPDATE ON public.cardapio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.cardapio ENABLE ROW LEVEL SECURITY;

-- Público pode ler itens disponíveis
CREATE POLICY "cardapio_public_read"
  ON public.cardapio FOR SELECT
  USING (disponivel = true);

-- Service role tem acesso total
CREATE POLICY "cardapio_service_all"
  ON public.cardapio FOR ALL
  USING (auth.role() = 'service_role');
```

---

## TABELA: galeria

```sql
CREATE TABLE IF NOT EXISTS public.galeria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  url         TEXT NOT NULL,
  alt         TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_galeria_evento ON public.galeria(evento_id);
CREATE INDEX idx_galeria_ordem  ON public.galeria(ordem);

-- RLS
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

-- Público pode ler todas as fotos
CREATE POLICY "galeria_public_read"
  ON public.galeria FOR SELECT
  USING (true);

-- Service role tem acesso total
CREATE POLICY "galeria_service_all"
  ON public.galeria FOR ALL
  USING (auth.role() = 'service_role');
```

---

## VERIFICAÇÃO

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cardapio', 'galeria');
-- Deve retornar 2 linhas
```
