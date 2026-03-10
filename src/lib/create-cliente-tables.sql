-- ============================================================
-- NOVA ARQUITETURA: Área do Cliente
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Tabela de clientes (portadores de ingresso)
CREATE TABLE IF NOT EXISTS clientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  whatsapp      TEXT,
  cpf_hash      TEXT,                      -- hash para evitar duplicatas, nunca exposto
  senha_hash    TEXT NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_acesso TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes (email);

-- RLS: só service_role acessa diretamente
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Somente service_role acessa clientes"
  ON clientes FOR ALL USING (false);

-- 2. Adicionar coluna cliente_id em ingressos (se ainda não existir)
ALTER TABLE ingressos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
CREATE INDEX IF NOT EXISTS idx_ingressos_cliente_id ON ingressos (cliente_id);

-- 3. Tokens de sessão do cliente (stateless via JWT, mas podemos revogar)
CREATE TABLE IF NOT EXISTS cliente_sessoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,   -- hash do JWT para revogação
  expira_em   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cliente_sessoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Somente service_role acessa cliente_sessoes"
  ON cliente_sessoes FOR ALL USING (false);

-- Confirmar
SELECT 'clientes' AS tabela, COUNT(*) FROM clientes
UNION ALL SELECT 'cliente_sessoes', COUNT(*) FROM cliente_sessoes;
