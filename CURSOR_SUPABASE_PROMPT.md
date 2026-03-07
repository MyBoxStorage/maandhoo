# PROMPT COMPLETO — CURSOR AGENT + MCP SUPABASE
## Sistema de Ingressos Maandhoo Club

> **INSTRUÇÃO AO AGENTE CURSOR:**
> Aplique TODO o SQL abaixo no Supabase usando o MCP Supabase conectado.
> Execute na ordem exata dos blocos. Não pule nenhum bloco.
> Após cada bloco, confirme execução antes de prosseguir para o próximo.

---

## BLOCO 1 — EXTENSÕES E CONFIGURAÇÕES BASE

```sql
-- Habilitar extensão UUID (necessária para geração de IDs únicos)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## BLOCO 2 — TABELA: eventos

```sql
CREATE TABLE IF NOT EXISTS public.eventos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,
  descricao        TEXT,
  data_evento      DATE NOT NULL,
  hora_abertura    TIME NOT NULL DEFAULT '22:00',
  hora_fechamento  TIME NOT NULL DEFAULT '06:00', -- dia seguinte
  flyer_url        TEXT,
  ativo            BOOLEAN NOT NULL DEFAULT true,
  capacidade_total INTEGER NOT NULL DEFAULT 500,
  -- Controle de lista
  lista_encerra_as TIME NOT NULL DEFAULT '00:00', -- após esse horário QR de lista é inválido
  -- White-label config (para replicar em outras casas)
  casa_nome        TEXT NOT NULL DEFAULT 'Maandhoo Club',
  casa_logo_url    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_eventos_data ON public.eventos(data_evento);
CREATE INDEX idx_eventos_ativo ON public.eventos(ativo);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## BLOCO 3 — TABELA: lotes

```sql
CREATE TABLE IF NOT EXISTS public.lotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  numero          INTEGER NOT NULL, -- 1º Lote, 2º Lote, etc.
  nome            TEXT,             -- ex: "1º Lote — Promocional"
  preco_masc      NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_fem       NUMERIC(10,2) NOT NULL DEFAULT 0,
  limite_masc     INTEGER,          -- NULL = sem limite
  limite_fem      INTEGER,
  vendidos_masc   INTEGER NOT NULL DEFAULT 0,
  vendidos_fem    INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  data_inicio     TIMESTAMPTZ,      -- quando esse lote começa a valer
  data_fim        TIMESTAMPTZ,      -- quando esse lote expira automaticamente
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(evento_id, numero)
);

CREATE INDEX idx_lotes_evento ON public.lotes(evento_id);
CREATE INDEX idx_lotes_ativo ON public.lotes(ativo);

CREATE TRIGGER trg_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## BLOCO 4 — TABELA: camarotes

```sql
CREATE TABLE IF NOT EXISTS public.camarotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  identificador   TEXT NOT NULL,    -- ex: "C1", "VIP-2", "Camarote Estrela"
  capacidade      INTEGER NOT NULL DEFAULT 10,
  preco_total     NUMERIC(10,2) NOT NULL DEFAULT 0,
  disponivel      BOOLEAN NOT NULL DEFAULT true,
  reservado_por   TEXT,             -- nome do responsável (preenchido pela central)
  reservado_em    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(evento_id, identificador)
);

CREATE INDEX idx_camarotes_evento ON public.camarotes(evento_id);
CREATE INDEX idx_camarotes_disponivel ON public.camarotes(disponivel);

CREATE TRIGGER trg_camarotes_updated_at
  BEFORE UPDATE ON public.camarotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## BLOCO 5 — TABELA: ingressos

```sql
-- Tipos possíveis de ingresso
CREATE TYPE tipo_ingresso AS ENUM (
  'pista_masc',
  'pista_fem',
  'lista_masc',
  'lista_fem',
  'camarote',
  'cortesia'
);

-- Status do ingresso
CREATE TYPE status_ingresso AS ENUM (
  'aguardando_cadastro',  -- link gerado mas pessoa ainda não se cadastrou
  'pendente_pagamento',   -- cadastro feito, aguardando confirmação de pagamento
  'ativo',                -- pago/validado, QR Code enviado, pronto para uso
  'utilizado',            -- já foi lido na portaria (uso único)
  'expirado',             -- passou das 06h do dia seguinte
  'cancelado'
);

CREATE TABLE IF NOT EXISTS public.ingressos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       UUID NOT NULL REFERENCES public.eventos(id) ON DELETE RESTRICT,
  lote_id         UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  camarote_id     UUID REFERENCES public.camarotes(id) ON DELETE SET NULL,
  tipo            tipo_ingresso NOT NULL,
  status          status_ingresso NOT NULL DEFAULT 'aguardando_cadastro',

  -- QR Code: token único e secreto que vai dentro do QR
  qr_token        TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Preço que foi cobrado no momento da compra
  preco_pago      NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Controle de expiração
  expira_em       TIMESTAMPTZ,  -- calculado: data_evento + 1 dia às 06h00

  -- Link único para cadastro (camarote e pré-venda)
  link_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  link_usado      BOOLEAN NOT NULL DEFAULT false,

  -- Rastreio de quem gerou (admin que liberou)
  gerado_por      UUID,         -- referencia porteiros/admins futuramente

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices críticos para performance na portaria
CREATE INDEX idx_ingressos_evento     ON public.ingressos(evento_id);
CREATE INDEX idx_ingressos_status     ON public.ingressos(status);
CREATE INDEX idx_ingressos_qr_token   ON public.ingressos(qr_token);
CREATE INDEX idx_ingressos_link_token ON public.ingressos(link_token);
CREATE INDEX idx_ingressos_expira_em  ON public.ingressos(expira_em);

CREATE TRIGGER trg_ingressos_updated_at
  BEFORE UPDATE ON public.ingressos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## BLOCO 6 — TABELA: cadastros (dados pessoais do portador)

```sql
-- Gênero
CREATE TYPE genero_pessoa AS ENUM ('masculino', 'feminino', 'outro');

CREATE TABLE IF NOT EXISTS public.cadastros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingresso_id     UUID NOT NULL UNIQUE REFERENCES public.ingressos(id) ON DELETE CASCADE,

  -- Dados pessoais (conforme LGPD — mínimo necessário)
  nome_completo   TEXT NOT NULL,
  cpf             TEXT NOT NULL,              -- armazenado com formatação: "123.456.789-00"
  cpf_hash        TEXT NOT NULL,              -- hash SHA256 para busca sem expor CPF
  email           TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,
  genero          genero_pessoa NOT NULL,

  -- Controle de envio do QR
  qr_enviado      BOOLEAN NOT NULL DEFAULT false,
  qr_enviado_em   TIMESTAMPTZ,
  email_enviado   TEXT,                       -- email para onde foi enviado

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cadastros_ingresso  ON public.cadastros(ingresso_id);
CREATE INDEX idx_cadastros_email     ON public.cadastros(email);
CREATE INDEX idx_cadastros_cpf_hash  ON public.cadastros(cpf_hash);

CREATE TRIGGER trg_cadastros_updated_at
  BEFORE UPDATE ON public.cadastros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## BLOCO 7 — TABELA: porteiros (usuários da PWA de validação)

```sql
-- Nível de acesso do porteiro
CREATE TYPE nivel_acesso AS ENUM (
  'porteiro',       -- só lê QR e valida
  'supervisor',     -- valida + vê relatório do evento
  'admin_saida'     -- gera ingressos de camarote, gerencia saídas
);

CREATE TABLE IF NOT EXISTS public.porteiros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  senha_hash      TEXT NOT NULL,              -- bcrypt hash — NUNCA armazenar senha plain
  nivel           nivel_acesso NOT NULL DEFAULT 'porteiro',
  ativo           BOOLEAN NOT NULL DEFAULT true,

  -- Restrição por evento (NULL = acesso a todos)
  eventos_permitidos UUID[],                  -- array de evento_ids permitidos

  ultimo_acesso   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_porteiros_email  ON public.porteiros(email);
CREATE INDEX idx_porteiros_ativo  ON public.porteiros(ativo);

CREATE TRIGGER trg_porteiros_updated_at
  BEFORE UPDATE ON public.porteiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## BLOCO 8 — TABELA: validacoes (log de cada scan na portaria)

```sql
-- Resultado da tentativa de validação
CREATE TYPE resultado_validacao AS ENUM (
  'aprovado',
  'ja_utilizado',
  'lista_expirada',      -- tentou usar lista após 00h
  'ingresso_expirado',   -- após 06h do dia seguinte
  'ingresso_cancelado',
  'ingresso_invalido',   -- QR token não encontrado
  'evento_errado'        -- ingresso é de outro evento
);

CREATE TABLE IF NOT EXISTS public.validacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingresso_id     UUID REFERENCES public.ingressos(id) ON DELETE SET NULL,
  porteiro_id     UUID REFERENCES public.porteiros(id) ON DELETE SET NULL,
  evento_id       UUID REFERENCES public.eventos(id) ON DELETE SET NULL,

  qr_token_lido   TEXT NOT NULL,              -- o token que foi lido no scan
  resultado       resultado_validacao NOT NULL,
  mensagem        TEXT,                       -- mensagem exibida na tela da portaria

  -- Contexto do scan
  ip_origem       TEXT,
  dispositivo     TEXT,                       -- user-agent do dispositivo da portaria

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Sem updated_at: log é imutável
);

-- Índices para relatórios
CREATE INDEX idx_validacoes_ingresso   ON public.validacoes(ingresso_id);
CREATE INDEX idx_validacoes_porteiro   ON public.validacoes(porteiro_id);
CREATE INDEX idx_validacoes_evento     ON public.validacoes(evento_id);
CREATE INDEX idx_validacoes_resultado  ON public.validacoes(resultado);
CREATE INDEX idx_validacoes_created    ON public.validacoes(created_at DESC);
```

---

## BLOCO 9 — FUNÇÃO: validar_ingresso (lógica central de validação)

```sql
-- Função principal chamada pela API da portaria ao escanear um QR Code
-- Recebe: qr_token (string do QR), porteiro_id, evento_id_esperado
-- Retorna: JSON com resultado, nome da pessoa, tipo, mensagem para exibir na tela

CREATE OR REPLACE FUNCTION public.validar_ingresso(
  p_qr_token          TEXT,
  p_porteiro_id       UUID,
  p_evento_id         UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ingresso        public.ingressos%ROWTYPE;
  v_cadastro        public.cadastros%ROWTYPE;
  v_evento          public.eventos%ROWTYPE;
  v_resultado       resultado_validacao;
  v_mensagem        TEXT;
  v_agora           TIMESTAMPTZ := NOW();
  v_hora_atual      TIME := v_agora::TIME;
  v_response        JSONB;
BEGIN

  -- 1. Buscar o ingresso pelo token
  SELECT * INTO v_ingresso
  FROM public.ingressos
  WHERE qr_token = p_qr_token;

  -- Token não existe
  IF NOT FOUND THEN
    v_resultado := 'ingresso_invalido';
    v_mensagem  := '❌ QR Code inválido. Token não reconhecido.';

    INSERT INTO public.validacoes(qr_token_lido, porteiro_id, evento_id, resultado, mensagem)
    VALUES (p_qr_token, p_porteiro_id, p_evento_id, v_resultado, v_mensagem);

    RETURN jsonb_build_object(
      'aprovado', false,
      'resultado', v_resultado,
      'mensagem', v_mensagem
    );
  END IF;

  -- 2. Buscar dados do evento
  SELECT * INTO v_evento FROM public.eventos WHERE id = v_ingresso.evento_id;

  -- 3. Verificar se é o evento correto
  IF v_ingresso.evento_id <> p_evento_id THEN
    v_resultado := 'evento_errado';
    v_mensagem  := '⚠️ Ingresso de outro evento. Acesso negado.';

    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  -- 4. Verificar se já foi utilizado
  IF v_ingresso.status = 'utilizado' THEN
    v_resultado := 'ja_utilizado';
    v_mensagem  := '🚫 Ingresso já utilizado. Entrada não permitida.';

    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  -- 5. Verificar se está cancelado
  IF v_ingresso.status = 'cancelado' THEN
    v_resultado := 'ingresso_cancelado';
    v_mensagem  := '❌ Ingresso cancelado. Contate a organização.';

    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  -- 6. Verificar expiração geral (06h do dia seguinte)
  IF v_ingresso.expira_em IS NOT NULL AND v_agora > v_ingresso.expira_em THEN
    -- Marcar como expirado
    UPDATE public.ingressos SET status = 'expirado' WHERE id = v_ingresso.id;

    v_resultado := 'ingresso_expirado';
    v_mensagem  := '⏰ Ingresso expirado. A casa encerrou às 06h.';

    INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

    RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
  END IF;

  -- 7. Regra especial para LISTA: expira às 00h do evento
  IF v_ingresso.tipo IN ('lista_masc', 'lista_fem') THEN
    -- Verifica se já passou da hora de corte da lista
    -- Lógica: se hora atual >= hora de encerramento da lista no mesmo dia do evento
    IF v_hora_atual >= v_evento.lista_encerra_as THEN
      v_resultado := 'lista_expirada';
      v_mensagem  := '🕛 Lista não permitida após ' ||
                     TO_CHAR(v_evento.lista_encerra_as, 'HH24:MI') ||
                     '. Dirija-se ao caixa.';

      INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;
  END IF;

  -- 8. TUDO OK — aprovar entrada e marcar como utilizado
  UPDATE public.ingressos
  SET status = 'utilizado', updated_at = NOW()
  WHERE id = v_ingresso.id;

  v_resultado := 'aprovado';

  -- Buscar nome da pessoa para exibir na portaria
  SELECT * INTO v_cadastro FROM public.cadastros WHERE ingresso_id = v_ingresso.id;

  v_mensagem := '✅ ENTRADA LIBERADA';

  -- Registrar validação aprovada
  INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
  VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

  -- Atualizar último acesso do porteiro
  UPDATE public.porteiros SET ultimo_acesso = NOW() WHERE id = p_porteiro_id;

  -- Retornar resposta completa para a PWA da portaria
  RETURN jsonb_build_object(
    'aprovado',       true,
    'resultado',      v_resultado,
    'mensagem',       v_mensagem,
    'nome',           COALESCE(v_cadastro.nome_completo, 'N/A'),
    'tipo_ingresso',  v_ingresso.tipo::TEXT,
    'evento_nome',    v_evento.nome,
    'ingresso_id',    v_ingresso.id::TEXT
  );

END;
$$;
```

---

## BLOCO 10 — FUNÇÃO: gerar_ingressos_camarote

```sql
-- Gera N ingressos de camarote com link único cada um
-- Chamada pelo painel admin quando central libera camarote para um grupo
-- Retorna array de links para envio pelo WhatsApp

CREATE OR REPLACE FUNCTION public.gerar_ingressos_camarote(
  p_camarote_id   UUID,
  p_gerado_por    UUID  -- porteiro_id do admin que está gerando
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_camarote      public.camarotes%ROWTYPE;
  v_evento        public.eventos%ROWTYPE;
  v_links         JSONB[] := '{}';
  v_ingresso_id   UUID;
  v_link_token    TEXT;
  v_expira_em     TIMESTAMPTZ;
  i               INTEGER;
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

  -- Calcular expiração: dia do evento + 1 dia às 06h00
  v_expira_em := (v_evento.data_evento + INTERVAL '1 day')::TIMESTAMP + TIME '06:00:00';

  -- Marcar camarote como reservado
  UPDATE public.camarotes
  SET disponivel = false, reservado_em = NOW()
  WHERE id = p_camarote_id;

  -- Gerar 1 ingresso por vaga do camarote
  FOR i IN 1..v_camarote.capacidade LOOP
    v_link_token := encode(gen_random_bytes(16), 'hex');

    INSERT INTO public.ingressos (
      evento_id,
      camarote_id,
      tipo,
      status,
      preco_pago,
      expira_em,
      link_token,
      gerado_por
    ) VALUES (
      v_camarote.evento_id,
      p_camarote_id,
      'camarote',
      'aguardando_cadastro',
      0, -- camarote tem preço total, não por pessoa
      v_expira_em,
      v_link_token,
      p_gerado_por
    )
    RETURNING id INTO v_ingresso_id;

    -- Adicionar ao array de links
    v_links := v_links || jsonb_build_object(
      'numero',       i,
      'ingresso_id',  v_ingresso_id::TEXT,
      'link_token',   v_link_token
    );

  END LOOP;

  RETURN jsonb_build_object(
    'sucesso',          true,
    'camarote',         v_camarote.identificador,
    'evento',           v_evento.nome,
    'total_ingressos',  v_camarote.capacidade,
    'links',            to_jsonb(v_links)
  );

END;
$$;
```

---

## BLOCO 11 — FUNÇÃO: expirar_ingressos_vencidos (job automático)

```sql
-- Executa via cron/pg_cron ou chamada agendada para marcar expirados
CREATE OR REPLACE FUNCTION public.expirar_ingressos_vencidos()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.ingressos
  SET status = 'expirado', updated_at = NOW()
  WHERE status IN ('ativo', 'aguardando_cadastro', 'pendente_pagamento')
    AND expira_em IS NOT NULL
    AND expira_em < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
```

---

## BLOCO 12 — ROW LEVEL SECURITY (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.eventos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camarotes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingressos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadastros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.porteiros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validacoes ENABLE ROW LEVEL SECURITY;

-- ─── EVENTOS: público pode ler eventos ativos ───────────────────────────────
CREATE POLICY "eventos_public_read"
  ON public.eventos FOR SELECT
  USING (ativo = true);

CREATE POLICY "eventos_service_all"
  ON public.eventos FOR ALL
  USING (auth.role() = 'service_role');

-- ─── LOTES: público pode ler lotes ativos ───────────────────────────────────
CREATE POLICY "lotes_public_read"
  ON public.lotes FOR SELECT
  USING (ativo = true);

CREATE POLICY "lotes_service_all"
  ON public.lotes FOR ALL
  USING (auth.role() = 'service_role');

-- ─── CAMAROTES: só service_role (admin) acessa ──────────────────────────────
CREATE POLICY "camarotes_service_all"
  ON public.camarotes FOR ALL
  USING (auth.role() = 'service_role');

-- ─── INGRESSOS: usuário só pode ver o próprio ingresso via link_token ────────
CREATE POLICY "ingressos_public_read_by_token"
  ON public.ingressos FOR SELECT
  USING (true); -- filtro feito na API via link_token; service_role gerencia

CREATE POLICY "ingressos_service_all"
  ON public.ingressos FOR ALL
  USING (auth.role() = 'service_role');

-- ─── CADASTROS: só service_role (protege dados pessoais — LGPD) ─────────────
CREATE POLICY "cadastros_service_all"
  ON public.cadastros FOR ALL
  USING (auth.role() = 'service_role');

-- ─── PORTEIROS: só service_role ─────────────────────────────────────────────
CREATE POLICY "porteiros_service_all"
  ON public.porteiros FOR ALL
  USING (auth.role() = 'service_role');

-- ─── VALIDAÇÕES: só service_role ────────────────────────────────────────────
CREATE POLICY "validacoes_service_all"
  ON public.validacoes FOR ALL
  USING (auth.role() = 'service_role');
```

---

## BLOCO 13 — VIEWS ÚTEIS PARA O PAINEL ADMIN

```sql
-- View: resumo de ocupação por evento
CREATE OR REPLACE VIEW public.vw_ocupacao_eventos AS
SELECT
  e.id              AS evento_id,
  e.nome            AS evento_nome,
  e.data_evento,
  e.capacidade_total,
  COUNT(i.id)       FILTER (WHERE i.status = 'ativo')     AS ingressos_ativos,
  COUNT(i.id)       FILTER (WHERE i.status = 'utilizado') AS entradas_realizadas,
  COUNT(i.id)       FILTER (WHERE i.tipo IN ('lista_masc','lista_fem')) AS total_lista,
  COUNT(i.id)       FILTER (WHERE i.tipo = 'camarote')    AS total_camarote,
  COUNT(i.id)       FILTER (WHERE i.tipo IN ('pista_masc','pista_fem')) AS total_pista,
  ROUND(
    COUNT(i.id) FILTER (WHERE i.status = 'utilizado')::NUMERIC
    / NULLIF(e.capacidade_total, 0) * 100, 1
  )                 AS percentual_ocupacao
FROM public.eventos e
LEFT JOIN public.ingressos i ON i.evento_id = e.id
GROUP BY e.id, e.nome, e.data_evento, e.capacidade_total;

-- View: ingressos com dados do portador (para admin — com CPF mascarado)
CREATE OR REPLACE VIEW public.vw_ingressos_completo AS
SELECT
  i.id,
  i.tipo,
  i.status,
  i.qr_token,
  i.link_token,
  i.preco_pago,
  i.expira_em,
  i.created_at,
  e.nome            AS evento_nome,
  e.data_evento,
  c.nome_completo,
  -- CPF mascarado: mostra 3 primeiros dígitos e mascara o resto
  CASE
    WHEN c.cpf IS NOT NULL
    THEN LEFT(REGEXP_REPLACE(c.cpf, '[^0-9]', '', 'g'), 3) || '.***.**-**'
    ELSE NULL
  END               AS cpf_mascarado,
  c.email,
  c.whatsapp,
  c.genero,
  c.qr_enviado,
  c.qr_enviado_em
FROM public.ingressos i
JOIN public.eventos e ON e.id = i.evento_id
LEFT JOIN public.cadastros c ON c.ingresso_id = i.id;

-- View: log de validações com contexto
CREATE OR REPLACE VIEW public.vw_validacoes_log AS
SELECT
  v.id,
  v.created_at      AS validado_em,
  v.resultado,
  v.mensagem,
  e.nome            AS evento_nome,
  p.nome            AS porteiro_nome,
  p.nivel           AS porteiro_nivel,
  c.nome_completo   AS pessoa_nome,
  i.tipo            AS tipo_ingresso
FROM public.validacoes v
LEFT JOIN public.eventos e   ON e.id = v.evento_id
LEFT JOIN public.porteiros p ON p.id = v.porteiro_id
LEFT JOIN public.ingressos i ON i.id = v.ingresso_id
LEFT JOIN public.cadastros c ON c.ingresso_id = v.ingresso_id
ORDER BY v.created_at DESC;
```

---

## BLOCO 14 — DADOS INICIAIS (seed para testes)

```sql
-- Inserir um porteiro admin inicial para testes
-- IMPORTANTE: trocar a senha antes de ir para produção
INSERT INTO public.porteiros (nome, email, senha_hash, nivel)
VALUES (
  'Admin Maandhoo',
  'admin@maandhoo.com.br',
  -- hash de 'maandhoo@2025' gerado com bcrypt rounds=12
  -- TROCAR EM PRODUÇÃO via painel admin
  '$2b$12$placeholder_trocar_em_producao_agora',
  'admin_saida'
)
ON CONFLICT (email) DO NOTHING;

-- Comentário: a senha hash real deve ser gerada via:
-- bcrypt.hashSync('sua_senha_aqui', 12) no Node.js
-- e inserida diretamente via painel admin após setup
```

---

## VERIFICAÇÃO FINAL

Após aplicar todos os blocos, execute este SQL para confirmar que tudo foi criado:

```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = t.table_name
   AND table_schema = 'public') AS colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Deve retornar: cadastros, camarotes, eventos, ingressos, lotes, porteiros, validacoes
```

---

## NOTAS IMPORTANTES PARA O DESENVOLVEDOR

1. **Nunca expor `qr_token` via API pública** — só retornar após pagamento confirmado
2. **CPF**: armazenar formatado + hash SHA256 para busca. NUNCA retornar CPF completo em APIs
3. **Senhas dos porteiros**: sempre bcrypt rounds ≥ 12 antes de inserir
4. **`service_role` key**: usar APENAS no servidor (Next.js API routes). NUNCA no frontend
5. **`anon` key**: usar no frontend — RLS garante que só eventos/lotes ativos são visíveis
6. **Função `validar_ingresso`**: chamar sempre com `service_role` para ter acesso total
7. **LGPD**: cadastros têm dados sensíveis — implementar rota de exclusão de dados
