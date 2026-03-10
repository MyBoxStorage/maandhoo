-- ============================================================
-- TABELA: admin_users
-- Usuários do painel administrativo (separado de porteiros)
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  senha_hash    TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'operador' CHECK (role IN ('admin', 'operador')),
  ativo         BOOLEAN NOT NULL DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para busca por email (login)
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- RLS: somente service_role acessa (nunca exposto ao cliente)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente service_role acessa admin_users"
  ON admin_users
  FOR ALL
  USING (false);  -- bloqueia acesso via anon/authenticated key

-- ============================================================
-- USUÁRIO INICIAL — troque a senha_hash abaixo!
-- Para gerar um hash bcrypt (rounds=12) use:
--   node -e "const b=require('bcryptjs'); b.hash('SUA_SENHA',12).then(h=>console.log(h))"
-- Ou acesse: https://bcrypt.online/  (rounds: 12)
-- ============================================================
-- INSERT INTO admin_users (nome, email, senha_hash, role)
-- VALUES (
--   'Administrador',
--   'admin@maandhoo.com',
--   '$2a$12$HASH_GERADO_AQUI',
--   'admin'
-- );
