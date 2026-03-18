-- ================================================================
-- MAANDHOO CLUB — SQL CONSOLIDADO PARA SUPABASE
-- Execute BLOCO POR BLOCO no SQL Editor do Supabase
-- Todos os blocos usam IF NOT EXISTS / idempotentes (pode reexecutar)
--
-- ORDEM RECOMENDADA:
--   Bloco 0A → 0B → 0C → 0D → 0E → 0F  (tabelas base)
--   Bloco 1 → 2 → 3 → 4                 (clientes + ingressos + backstage)
--   Bloco 5 → 6 → 7 → 8 → 9            (cardapio, galeria, lista, lgpd)
--   Bloco 10                             (função validar_ingresso)
--   Bloco 11                             (verificação final)
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- BLOCO 0A — Função auxiliar update_updated_at
-- Necessária para triggers de updated_at
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 0B — Tabela admin_users
-- Usuários do painel administrativo (separado de porteiros)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_users (
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

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users'
      AND policyname='Somente service_role acessa admin_users') THEN
    CREATE POLICY "Somente service_role acessa admin_users"
      ON public.admin_users FOR ALL USING (false);
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- USUÁRIO ADMIN INICIAL — descomente e ajuste após gerar o hash:
-- node -e "const b=require('bcryptjs'); b.hash('SUA_SENHA',12).then(h=>console.log(h))"
-- ──────────────────────────────────────────────────────────────
-- INSERT INTO public.admin_users (nome, email, senha_hash, role)
-- VALUES ('Administrador', 'admin@maandhoo.com', '$2a$12$HASH_AQUI', 'admin')
-- ON CONFLICT (email) DO NOTHING;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 0C — Tabela eventos
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.eventos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              TEXT NOT NULL,
  descricao         TEXT,
  data_evento       DATE NOT NULL,
  hora_abertura     TEXT NOT NULL DEFAULT '22:00',
  hora_fechamento   TEXT DEFAULT '06:00',
  flyer_url         TEXT,
  ativo             BOOLEAN NOT NULL DEFAULT false,
  capacidade_total  INTEGER DEFAULT 500,
  lista_encerra_as  TIMESTAMPTZ,    -- data+hora de encerramento da lista amiga
  casa_nome         TEXT DEFAULT 'Maandhoo Club',
  casa_logo_url     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eventos_data  ON public.eventos (data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_ativo ON public.eventos (ativo);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='eventos' AND policyname='eventos_public_read') THEN
    CREATE POLICY "eventos_public_read" ON public.eventos FOR SELECT USING (ativo = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='eventos' AND policyname='eventos_service_all') THEN
    CREATE POLICY "eventos_service_all" ON public.eventos FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 0D — Tabela lotes
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lotes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  numero        INTEGER NOT NULL DEFAULT 1,
  nome          TEXT,
  preco_masc    NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_fem     NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Preços backstage (NULL usa fallback do frontend: R$120/R$60)
  preco_backstage_masc NUMERIC(10,2) DEFAULT NULL,
  preco_backstage_fem  NUMERIC(10,2) DEFAULT NULL,
  limite_masc   INTEGER,
  limite_fem    INTEGER,
  vendidos_masc INTEGER NOT NULL DEFAULT 0,
  vendidos_fem  INTEGER NOT NULL DEFAULT 0,
  ativo         BOOLEAN NOT NULL DEFAULT false,
  data_inicio   TIMESTAMPTZ,
  data_fim      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lotes_evento ON public.lotes (evento_id);
CREATE INDEX IF NOT EXISTS idx_lotes_ativo  ON public.lotes (ativo);

ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lotes' AND policyname='lotes_public_read') THEN
    CREATE POLICY "lotes_public_read" ON public.lotes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lotes' AND policyname='lotes_service_all') THEN
    CREATE POLICY "lotes_service_all" ON public.lotes FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 0E — Tabela camarotes
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.camarotes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  identificador TEXT NOT NULL,    -- ex: "Camarote VIP 1"
  nome          TEXT,
  descricao     TEXT,
  capacidade    INTEGER NOT NULL DEFAULT 10,
  preco_total   NUMERIC(10,2),
  disponivel    BOOLEAN NOT NULL DEFAULT true,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  reservado_por TEXT,             -- nome do responsável
  reservado_em  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camarotes_evento     ON public.camarotes (evento_id);
CREATE INDEX IF NOT EXISTS idx_camarotes_disponivel ON public.camarotes (disponivel);

ALTER TABLE public.camarotes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='camarotes' AND policyname='camarotes_service_all') THEN
    CREATE POLICY "camarotes_service_all" ON public.camarotes FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 0F — Tabelas ingressos, cadastros, porteiros, validacoes
-- ────────────────────────────────────────────────────────────────

-- Tabela ingressos
CREATE TABLE IF NOT EXISTS public.ingressos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  lote_id       UUID REFERENCES public.lotes(id),
  camarote_id   UUID REFERENCES public.camarotes(id),
  tipo          TEXT NOT NULL DEFAULT 'pista_masc'
                CHECK (tipo IN ('pista_masc','pista_fem','lista_masc','lista_fem','camarote','cortesia')),
  status        TEXT NOT NULL DEFAULT 'aguardando_cadastro'
                CHECK (status IN ('aguardando_cadastro','pendente_pagamento','ativo','utilizado','expirado','cancelado')),
  qr_token      TEXT NOT NULL UNIQUE,
  serial        TEXT,
  preco_pago    NUMERIC(10,2) DEFAULT 0,
  expira_em     TIMESTAMPTZ,
  -- Campos para fluxo de link único (camarotes)
  link_token    TEXT UNIQUE,
  link_usado    BOOLEAN NOT NULL DEFAULT false,
  -- Vínculo com cliente registrado
  cliente_id    UUID,             -- FK adicionada após criar tabela clientes
  qr_enviado    BOOLEAN NOT NULL DEFAULT false,
  gerado_por    UUID,             -- porteiro que gerou (opcional)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingressos_evento     ON public.ingressos (evento_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_qr_token   ON public.ingressos (qr_token);
CREATE INDEX IF NOT EXISTS idx_ingressos_status     ON public.ingressos (status);
CREATE INDEX IF NOT EXISTS idx_ingressos_camarote   ON public.ingressos (camarote_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_cliente_id ON public.ingressos (cliente_id);

ALTER TABLE public.ingressos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ingressos' AND policyname='ingressos_service_all') THEN
    CREATE POLICY "ingressos_service_all" ON public.ingressos FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Tabela cadastros (dados pessoais do portador do ingresso)
CREATE TABLE IF NOT EXISTS public.cadastros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingresso_id     UUID NOT NULL REFERENCES public.ingressos(id) ON DELETE CASCADE,
  nome_completo   TEXT NOT NULL,
  cpf             TEXT NOT NULL,
  cpf_hash        TEXT,
  email           TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,
  genero          TEXT NOT NULL CHECK (genero IN ('masculino','feminino','outro')),
  email_enviado   TEXT,           -- email para o qual foi enviado
  qr_enviado      BOOLEAN NOT NULL DEFAULT false,
  qr_enviado_em   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cadastros_ingresso ON public.cadastros (ingresso_id);
CREATE INDEX IF NOT EXISTS idx_cadastros_email    ON public.cadastros (email);
CREATE INDEX IF NOT EXISTS idx_cadastros_cpf_hash ON public.cadastros (cpf_hash);

ALTER TABLE public.cadastros ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cadastros' AND policyname='cadastros_service_all') THEN
    CREATE POLICY "cadastros_service_all" ON public.cadastros FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Tabela porteiros
CREATE TABLE IF NOT EXISTS public.porteiros (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT NOT NULL,
  email               TEXT NOT NULL UNIQUE,
  senha_hash          TEXT NOT NULL,
  nivel               TEXT NOT NULL DEFAULT 'porteiro'
                      CHECK (nivel IN ('porteiro','supervisor','admin_saida')),
  ativo               BOOLEAN NOT NULL DEFAULT true,
  eventos_permitidos  UUID[],     -- NULL = acesso a todos os eventos ativos
  ultimo_acesso       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_porteiros_email ON public.porteiros (email);

ALTER TABLE public.porteiros ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='porteiros' AND policyname='porteiros_service_all') THEN
    CREATE POLICY "porteiros_service_all" ON public.porteiros FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- PORTEIRO DE TESTE — descomente e ajuste após gerar o hash:
-- node -e "const b=require('bcryptjs'); b.hash('SUA_SENHA',12).then(h=>console.log(h))"
-- ──────────────────────────────────────────────────────────────
-- INSERT INTO public.porteiros (nome, email, senha_hash, nivel)
-- VALUES ('Porteiro Teste', 'porteiro@maandhoo.com', '$2b$12$HASH_AQUI', 'porteiro')
-- ON CONFLICT (email) DO NOTHING;

-- Tabela validacoes (log de cada scan na portaria)
CREATE TABLE IF NOT EXISTS public.validacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingresso_id     UUID REFERENCES public.ingressos(id),
  porteiro_id     UUID REFERENCES public.porteiros(id),
  evento_id       UUID REFERENCES public.eventos(id),
  qr_token_lido   TEXT NOT NULL,
  resultado       TEXT NOT NULL,
  mensagem        TEXT,
  ip_origem       TEXT,
  dispositivo     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_validacoes_ingresso  ON public.validacoes (ingresso_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_porteiro  ON public.validacoes (porteiro_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_evento    ON public.validacoes (evento_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_resultado ON public.validacoes (resultado);

ALTER TABLE public.validacoes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='validacoes' AND policyname='validacoes_service_all') THEN
    CREATE POLICY "validacoes_service_all" ON public.validacoes FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Adiciona FK de ingressos → clientes (depois que ambas as tabelas existem)
ALTER TABLE public.ingressos
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id);


-- ────────────────────────────────────────────────────────────────
-- BLOCO 1 — Tabela clientes (base)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  whatsapp      TEXT,
  senha_hash    TEXT NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_acesso TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes (email);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clientes'
      AND policyname = 'Somente service_role acessa clientes'
  ) THEN
    CREATE POLICY "Somente service_role acessa clientes"
      ON public.clientes FOR ALL USING (false);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 2 — Colunas adicionais em clientes
-- (CPF, dados pessoais, LGPD, Quiz, Badge, Tema)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS cpf              TEXT,
  ADD COLUMN IF NOT EXISTS data_nascimento  DATE,
  ADD COLUMN IF NOT EXISTS estado           TEXT,
  ADD COLUMN IF NOT EXISTS cidade           TEXT,
  ADD COLUMN IF NOT EXISTS lgpd_aceito          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lgpd_aceito_em        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_versao_termo     TEXT,
  ADD COLUMN IF NOT EXISTS lgpd_ip               TEXT,
  ADD COLUMN IF NOT EXISTS termos_aceitos        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS termos_aceitos_em     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS termos_versao         TEXT,
  ADD COLUMN IF NOT EXISTS quiz_feito            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiz_feito_em         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quiz_respostas        JSONB,
  ADD COLUMN IF NOT EXISTS quiz_perfil_id        TEXT,
  ADD COLUMN IF NOT EXISTS quiz_perfil_nome      TEXT,
  ADD COLUMN IF NOT EXISTS badge_ativo           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tema_ativo            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS playlist_url          TEXT,
  ADD COLUMN IF NOT EXISTS playlist_nome         TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf
  ON public.clientes (cpf)
  WHERE cpf IS NOT NULL;

-- Remove coluna cpf_hash antiga se existir
ALTER TABLE public.clientes DROP COLUMN IF EXISTS cpf_hash;

CREATE INDEX IF NOT EXISTS idx_clientes_quiz_perfil ON public.clientes (quiz_perfil_id);
CREATE INDEX IF NOT EXISTS idx_clientes_lgpd        ON public.clientes (lgpd_aceito);


-- ────────────────────────────────────────────────────────────────
-- BLOCO 3 — cliente_id e link_token em ingressos
-- (já criados no bloco 0F, este bloco é idempotente para bancos existentes)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.ingressos
  ADD COLUMN IF NOT EXISTS cliente_id  UUID REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS link_token  TEXT,
  ADD COLUMN IF NOT EXISTS link_usado  BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ingressos_cliente_id ON public.ingressos (cliente_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ingressos_link_token
  ON public.ingressos (link_token)
  WHERE link_token IS NOT NULL;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 4 — Preços de Backstage nos lotes
-- NULL = usa fallback do frontend (R$120 masc / R$60 fem)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.lotes
  ADD COLUMN IF NOT EXISTS preco_backstage_masc NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preco_backstage_fem  NUMERIC(10,2) DEFAULT NULL;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 5 — Tabela cardapio
-- ────────────────────────────────────────────────────────────────

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

CREATE INDEX IF NOT EXISTS idx_cardapio_categoria  ON public.cardapio(categoria);
CREATE INDEX IF NOT EXISTS idx_cardapio_disponivel ON public.cardapio(disponivel);
CREATE INDEX IF NOT EXISTS idx_cardapio_ordem      ON public.cardapio(ordem);

ALTER TABLE public.cardapio ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cardapio' AND policyname='cardapio_public_read') THEN
    CREATE POLICY "cardapio_public_read" ON public.cardapio FOR SELECT USING (disponivel = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cardapio' AND policyname='cardapio_service_all') THEN
    CREATE POLICY "cardapio_service_all" ON public.cardapio FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 6 — Tabela galeria
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.galeria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  url         TEXT NOT NULL,
  alt         TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galeria_evento ON public.galeria(evento_id);
CREATE INDEX IF NOT EXISTS idx_galeria_ordem  ON public.galeria(ordem);

ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='galeria' AND policyname='galeria_public_read') THEN
    CREATE POLICY "galeria_public_read" ON public.galeria FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='galeria' AND policyname='galeria_service_all') THEN
    CREATE POLICY "galeria_service_all" ON public.galeria FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 7 — lista_encerra_as: TIME → TIMESTAMPTZ
-- Só necessário se o campo foi criado como TIME anteriormente
-- ────────────────────────────────────────────────────────────────

DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'eventos'
    AND column_name = 'lista_encerra_as';

  IF col_type = 'time without time zone' THEN
    ALTER TABLE public.eventos
      ALTER COLUMN lista_encerra_as TYPE TIMESTAMPTZ USING NULL;
    ALTER TABLE public.eventos
      ALTER COLUMN lista_encerra_as DROP DEFAULT;
    RAISE NOTICE 'lista_encerra_as convertido para TIMESTAMPTZ';
  ELSE
    RAISE NOTICE 'lista_encerra_as já é % — nenhuma alteração necessária', col_type;
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 8 — Tabela lista_amiga
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lista_amiga (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id        UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome             TEXT NOT NULL,
  email            TEXT NOT NULL,
  genero           TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino', 'outro')),
  qr_token         TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'ativo'
                   CHECK (status IN ('ativo', 'utilizado', 'cancelado')),
  origem           TEXT NOT NULL DEFAULT 'pagina_lista',
  qr_enviado       BOOLEAN NOT NULL DEFAULT false,
  qr_enviado_em    TIMESTAMPTZ,
  email_enviado    BOOLEAN NOT NULL DEFAULT false,
  email_enviado_em TIMESTAMPTZ,
  qr_base64        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Colunas extras — idempotente para bancos que já tinham a tabela
ALTER TABLE public.lista_amiga
  ADD COLUMN IF NOT EXISTS email_enviado    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_enviado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qr_base64        TEXT;

CREATE INDEX IF NOT EXISTS idx_lista_amiga_evento   ON public.lista_amiga(evento_id);
CREATE INDEX IF NOT EXISTS idx_lista_amiga_email    ON public.lista_amiga(email);
CREATE INDEX IF NOT EXISTS idx_lista_amiga_qr_token ON public.lista_amiga(qr_token);
CREATE INDEX IF NOT EXISTS idx_lista_amiga_status   ON public.lista_amiga(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lista_amiga_email_evento
  ON public.lista_amiga(evento_id, email);

ALTER TABLE public.lista_amiga ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lista_amiga' AND policyname='lista_amiga_service_all') THEN
    CREATE POLICY "lista_amiga_service_all"
      ON public.lista_amiga FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 9 — Tabela de log de consentimentos LGPD (auditoria)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.consentimentos_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL,     -- 'lgpd' | 'termos'
  acao         TEXT NOT NULL,     -- 'aceite' | 'revogacao'
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


-- ────────────────────────────────────────────────────────────────
-- BLOCO 10 — Função validar_ingresso (portaria)
-- Valida QR Codes de ingressos normais E lista amiga
-- CREATE OR REPLACE é seguro de reexecutar
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.validar_ingresso(
  p_qr_token    TEXT,
  p_porteiro_id UUID,
  p_evento_id   UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ingresso  public.ingressos%ROWTYPE;
  v_lista     public.lista_amiga%ROWTYPE;
  v_cadastro  public.cadastros%ROWTYPE;
  v_evento    public.eventos%ROWTYPE;
  v_resultado TEXT;
  v_mensagem  TEXT;
  v_agora     TIMESTAMPTZ := NOW();
  v_fonte     TEXT := 'ingresso';
BEGIN

  -- 1. Buscar em ingressos
  SELECT * INTO v_ingresso
  FROM public.ingressos
  WHERE qr_token = p_qr_token;

  -- 2. Fallback: buscar em lista_amiga
  IF NOT FOUND THEN
    SELECT * INTO v_lista
    FROM public.lista_amiga
    WHERE qr_token = p_qr_token;

    IF NOT FOUND THEN
      v_resultado := 'ingresso_invalido';
      v_mensagem  := '❌ QR Code inválido. Token não reconhecido.';

      INSERT INTO public.validacoes(qr_token_lido, porteiro_id, evento_id, resultado, mensagem)
      VALUES (p_qr_token, p_porteiro_id, p_evento_id, v_resultado, v_mensagem);

      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    v_fonte := 'lista';
  END IF;

  -- 3. Buscar evento
  IF v_fonte = 'ingresso' THEN
    SELECT * INTO v_evento FROM public.eventos WHERE id = v_ingresso.evento_id;
  ELSE
    SELECT * INTO v_evento FROM public.eventos WHERE id = v_lista.evento_id;
  END IF;

  -- ── LISTA AMIGA ──────────────────────────────────────────────
  IF v_fonte = 'lista' THEN

    IF v_lista.evento_id <> p_evento_id THEN
      v_resultado := 'evento_errado';
      v_mensagem  := '⚠️ Lista de outro evento. Acesso negado.';
      INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    IF v_lista.status = 'utilizado' THEN
      v_resultado := 'ja_utilizado';
      v_mensagem  := '🚫 Lista já utilizada. Entrada não permitida.';
      INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    IF v_evento.lista_encerra_as IS NOT NULL AND v_agora > v_evento.lista_encerra_as THEN
      v_resultado := 'lista_expirada';
      v_mensagem  := '🕛 Lista encerrada. Dirija-se ao caixa para pagar o ingresso.';
      INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    UPDATE public.lista_amiga SET status = 'utilizado', updated_at = NOW() WHERE id = v_lista.id;
    UPDATE public.porteiros SET ultimo_acesso = NOW() WHERE id = p_porteiro_id;

    v_resultado := 'aprovado';
    v_mensagem  := '✅ ENTRADA LIBERADA';

    INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

    RETURN jsonb_build_object(
      'aprovado',      true,
      'resultado',     v_resultado,
      'mensagem',      v_mensagem,
      'nome',          v_lista.nome,
      'tipo_ingresso', 'lista_' || v_lista.genero,
      'evento_nome',   v_evento.nome
    );
  END IF;

  -- ── INGRESSO NORMAL ──────────────────────────────────────────

  IF v_ingresso.evento_id <> p_evento_id THEN
    v_resultado := 'evento_errado';
    v_mensagem  := '⚠️ Ingresso de outro evento. Acesso negado.';
    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  IF v_ingresso.status = 'utilizado' THEN
    v_resultado := 'ja_utilizado';
    v_mensagem  := '🚫 Ingresso já utilizado. Entrada não permitida.';
    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  IF v_ingresso.status = 'cancelado' THEN
    v_resultado := 'ingresso_cancelado';
    v_mensagem  := '❌ Ingresso cancelado. Contate a organização.';
    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  IF v_ingresso.expira_em IS NOT NULL AND v_agora > v_ingresso.expira_em THEN
    UPDATE public.ingressos SET status = 'expirado' WHERE id = v_ingresso.id;
    v_resultado := 'ingresso_expirado';
    v_mensagem  := '⏰ Ingresso expirado. A casa encerrou às 06h.';
    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);
    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  -- APROVADO
  UPDATE public.ingressos SET status = 'utilizado', updated_at = NOW() WHERE id = v_ingresso.id;
  UPDATE public.porteiros SET ultimo_acesso = NOW() WHERE id = p_porteiro_id;

  v_resultado := 'aprovado';
  v_mensagem  := '✅ ENTRADA LIBERADA';

  SELECT * INTO v_cadastro FROM public.cadastros WHERE ingresso_id = v_ingresso.id;

  INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
  VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

  RETURN jsonb_build_object(
    'aprovado',      true,
    'resultado',     v_resultado,
    'mensagem',      v_mensagem,
    'nome',          COALESCE(v_cadastro.nome_completo, 'N/A'),
    'tipo_ingresso', v_ingresso.tipo::TEXT,
    'evento_nome',   v_evento.nome,
    'ingresso_id',   v_ingresso.id::TEXT
  );

END;
$$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 11 — Função gerar_ingressos_camarote
-- Chamada pela API /api/ingressos/camarote ao gerar links
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.gerar_ingressos_camarote(
  p_camarote_id UUID,
  p_gerado_por  UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_camarote   public.camarotes%ROWTYPE;
  v_evento     public.eventos%ROWTYPE;
  v_links      JSONB := '[]'::JSONB;
  v_link_token TEXT;
  v_qr_token   TEXT;
  v_ingresso_id UUID;
  i            INTEGER;
BEGIN
  -- Buscar camarote
  SELECT * INTO v_camarote FROM public.camarotes WHERE id = p_camarote_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('erro', 'Camarote não encontrado');
  END IF;

  IF NOT v_camarote.disponivel THEN
    RETURN jsonb_build_object('erro', 'Camarote já está reservado');
  END IF;

  -- Buscar evento
  SELECT * INTO v_evento FROM public.eventos WHERE id = v_camarote.evento_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('erro', 'Evento não encontrado');
  END IF;

  -- Gerar um ingresso por vaga
  FOR i IN 1..v_camarote.capacidade LOOP
    v_link_token  := 'CAM-' || replace(gen_random_uuid()::TEXT, '-', '');
    v_qr_token    := 'QR-'  || replace(gen_random_uuid()::TEXT, '-', '');

    INSERT INTO public.ingressos (
      evento_id, camarote_id, tipo, status,
      qr_token, link_token, link_usado, gerado_por
    )
    VALUES (
      v_camarote.evento_id, p_camarote_id, 'camarote', 'aguardando_cadastro',
      v_qr_token, v_link_token, false, p_gerado_por
    )
    RETURNING id INTO v_ingresso_id;

    v_links := v_links || jsonb_build_object(
      'numero',      i,
      'link_token',  v_link_token,
      'ingresso_id', v_ingresso_id
    );
  END LOOP;

  -- Marcar camarote como reservado
  UPDATE public.camarotes
  SET disponivel = false, reservado_em = NOW(), updated_at = NOW()
  WHERE id = p_camarote_id;

  RETURN jsonb_build_object(
    'camarote',       v_camarote.identificador,
    'evento',         v_evento.nome,
    'total_ingressos', v_camarote.capacidade,
    'links',          v_links
  );
END;
$$;


-- ────────────────────────────────────────────────────────────────
-- BLOCO 12 — Verificação final
-- ────────────────────────────────────────────────────────────────

SELECT
  table_name,
  COUNT(*) AS total_colunas
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'admin_users', 'eventos', 'lotes', 'camarotes',
    'ingressos', 'cadastros', 'porteiros', 'validacoes',
    'clientes', 'lista_amiga', 'cardapio', 'galeria', 'consentimentos_log'
  )
GROUP BY table_name
ORDER BY table_name;
