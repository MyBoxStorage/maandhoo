# SQL — Tabela Lista Amiga + Ajuste lista_encerra_as
## Maandhoo Club — Aplicar no Supabase SQL Editor

---

## BLOCO 1 — Alterar tipo de lista_encerra_as (TIME → TIMESTAMPTZ)

O campo `lista_encerra_as` na tabela `eventos` foi definido como `TIME` no schema inicial,
mas precisa ser `TIMESTAMPTZ` para armazenar data + hora exata de encerramento das inscrições
(ex: "2025-06-14 00:00:00-03"), permitindo comparação direta com `NOW()`.

```sql
-- Converter coluna de TIME para TIMESTAMPTZ
-- Se já tiver dados, eles serão descartados (campo era novo, provavelmente NULL)
ALTER TABLE public.eventos
  ALTER COLUMN lista_encerra_as TYPE TIMESTAMPTZ
  USING NULL;

-- Remover valor default de TIME que não faz sentido para TIMESTAMPTZ
ALTER TABLE public.eventos
  ALTER COLUMN lista_encerra_as DROP DEFAULT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'eventos' AND column_name = 'lista_encerra_as';
-- Deve retornar: timestamp with time zone
```

---

## BLOCO 2 — Criar tabela lista_amiga

```sql
CREATE TABLE IF NOT EXISTS public.lista_amiga (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,

  -- Dados do inscrito
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL,
  genero          TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino', 'outro')),

  -- QR Code único para entrada
  qr_token        TEXT NOT NULL UNIQUE,

  -- Status da inscrição
  status          TEXT NOT NULL DEFAULT 'ativo'
                  CHECK (status IN ('ativo', 'utilizado', 'cancelado')),

  -- Rastreio de origem (pagina_lista, admin, importacao, etc.)
  origem          TEXT NOT NULL DEFAULT 'pagina_lista',

  -- Controle de envio do email
  qr_enviado      BOOLEAN NOT NULL DEFAULT false,
  qr_enviado_em   TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lista_amiga_evento   ON public.lista_amiga(evento_id);
CREATE INDEX idx_lista_amiga_email    ON public.lista_amiga(email);
CREATE INDEX idx_lista_amiga_qr_token ON public.lista_amiga(qr_token);
CREATE INDEX idx_lista_amiga_status   ON public.lista_amiga(status);

-- Unicidade: um email por evento
CREATE UNIQUE INDEX idx_lista_amiga_email_evento
  ON public.lista_amiga(evento_id, email);

-- Trigger updated_at
CREATE TRIGGER trg_lista_amiga_updated_at
  BEFORE UPDATE ON public.lista_amiga
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.lista_amiga ENABLE ROW LEVEL SECURITY;

-- Service role tem acesso total
CREATE POLICY "lista_amiga_service_all"
  ON public.lista_amiga FOR ALL
  USING (auth.role() = 'service_role');
```

---

## BLOCO 3 — Adicionar lista_amiga à função validar_ingresso

A portaria precisa conseguir validar QR Codes da lista amiga também.
Atualizar a função para checar também na tabela `lista_amiga`:

```sql
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
  v_lista           public.lista_amiga%ROWTYPE;
  v_cadastro        public.cadastros%ROWTYPE;
  v_evento          public.eventos%ROWTYPE;
  v_resultado       resultado_validacao;
  v_mensagem        TEXT;
  v_agora           TIMESTAMPTZ := NOW();
  v_response        JSONB;
  v_fonte           TEXT := 'ingresso'; -- 'ingresso' ou 'lista'
BEGIN

  -- 1. Buscar primeiro em ingressos
  SELECT * INTO v_ingresso
  FROM public.ingressos
  WHERE qr_token = p_qr_token;

  -- 2. Se não encontrou em ingressos, buscar em lista_amiga
  IF NOT FOUND THEN
    SELECT * INTO v_lista
    FROM public.lista_amiga
    WHERE qr_token = p_qr_token;

    IF NOT FOUND THEN
      -- Token não existe em nenhuma tabela
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

    v_fonte := 'lista';
  END IF;

  -- 3. Buscar dados do evento (baseado na fonte)
  IF v_fonte = 'ingresso' THEN
    SELECT * INTO v_evento FROM public.eventos WHERE id = v_ingresso.evento_id;
  ELSE
    SELECT * INTO v_evento FROM public.eventos WHERE id = v_lista.evento_id;
  END IF;

  -- ─── VALIDAÇÕES PARA LISTA AMIGA ────────────────────────────────────────────
  IF v_fonte = 'lista' THEN

    -- Verificar se é o evento correto
    IF v_lista.evento_id <> p_evento_id THEN
      v_resultado := 'evento_errado';
      v_mensagem  := '⚠️ Lista de outro evento. Acesso negado.';

      INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    -- Verificar se já foi utilizado
    IF v_lista.status = 'utilizado' THEN
      v_resultado := 'ja_utilizado';
      v_mensagem  := '🚫 Lista já utilizada. Entrada não permitida.';

      INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    -- Verificar horário de encerramento da lista
    IF v_evento.lista_encerra_as IS NOT NULL AND v_agora > v_evento.lista_encerra_as THEN
      v_resultado := 'lista_expirada';
      v_mensagem  := '🕛 Lista encerrada. Dirija-se ao caixa para pagar o ingresso.';

      INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
      VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

      RETURN jsonb_build_object('aprovado', false, 'resultado', v_resultado, 'mensagem', v_mensagem);
    END IF;

    -- APROVADO — marcar lista como utilizada
    UPDATE public.lista_amiga
    SET status = 'utilizado', updated_at = NOW()
    WHERE id = v_lista.id;

    v_resultado := 'aprovado';
    v_mensagem  := '✅ ENTRADA LIBERADA';

    INSERT INTO public.validacoes(porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
    VALUES (p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

    UPDATE public.porteiros SET ultimo_acesso = NOW() WHERE id = p_porteiro_id;

    RETURN jsonb_build_object(
      'aprovado',       true,
      'resultado',      v_resultado,
      'mensagem',       v_mensagem,
      'nome',           v_lista.nome,
      'tipo_ingresso',  'lista_' || v_lista.genero,
      'evento_nome',    v_evento.nome
    );

  END IF;

  -- ─── VALIDAÇÕES PARA INGRESSOS NORMAIS ──────────────────────────────────────

  -- Verificar se é o evento correto
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
  UPDATE public.ingressos
  SET status = 'utilizado', updated_at = NOW()
  WHERE id = v_ingresso.id;

  v_resultado := 'aprovado';
  v_mensagem  := '✅ ENTRADA LIBERADA';

  SELECT * INTO v_cadastro FROM public.cadastros WHERE ingresso_id = v_ingresso.id;

  INSERT INTO public.validacoes(ingresso_id, porteiro_id, evento_id, qr_token_lido, resultado, mensagem)
  VALUES (v_ingresso.id, p_porteiro_id, p_evento_id, p_qr_token, v_resultado, v_mensagem);

  UPDATE public.porteiros SET ultimo_acesso = NOW() WHERE id = p_porteiro_id;

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

## BLOCO 4 — Verificação final

```sql
-- Confirmar que a tabela foi criada corretamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lista_amiga'
ORDER BY ordinal_position;

-- Confirmar tipo do campo lista_encerra_as
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'eventos' AND column_name = 'lista_encerra_as';

-- Deve retornar: timestamp with time zone
```

---

## NOTAS

- `lista_encerra_as` agora é `TIMESTAMPTZ`: ao criar/editar um evento no admin, salvar como
  timestamp completo (ex: `"2025-06-14T00:00:00-03:00"`), não apenas a hora.
- A função `validar_ingresso` agora verifica **tanto** `ingressos` quanto `lista_amiga`,
  retornando o resultado correto para cada tipo.
- QR Codes da lista expiram quando `lista_encerra_as` passa — a portaria verifica isso
  em tempo real.
