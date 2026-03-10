# SQL — Colunas de Backstage nos Lotes
## Maandhoo Club — Aplicar no Supabase SQL Editor

---

## BLOCO 1 — Adicionar preços de Backstage na tabela lotes

O sistema exibia preços de Backstage hardcoded no frontend (R$120 masc / R$60 fem).
Agora esses valores vêm do banco, por lote. Essa migração adiciona as colunas.

```sql
-- Adicionar colunas de preço backstage (nullable — NULL usa o fallback do frontend)
ALTER TABLE public.lotes
  ADD COLUMN IF NOT EXISTS preco_backstage_masc NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preco_backstage_fem  NUMERIC(10,2) DEFAULT NULL;

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'lotes'
  AND column_name IN ('preco_backstage_masc', 'preco_backstage_fem');
-- Deve retornar 2 linhas com numeric
```

---

## NOTAS

- Colunas são `NULL` por padrão — o frontend usa fallback de R$120/R$60 quando NULL.
- Para definir preços específicos por lote, edite o lote no painel Admin (campo aparecerá
  automaticamente na tela de edição de lotes).
- O campo será exibido no `LotesEditor` da página `/admin/eventos` a partir da próxima
  atualização do painel admin.
