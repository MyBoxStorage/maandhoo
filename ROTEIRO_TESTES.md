# ROTEIRO DE TESTES — Maandhoo Club
## Antes de conectar gateway de pagamento

---

## PENDÊNCIAS NO SUPABASE (aplicar antes de testar)

### 1. Colunas de Backstage nos Lotes
Aplicar o arquivo `SUPABASE_BACKSTAGE.md` (1 bloco simples):
```sql
ALTER TABLE public.lotes
  ADD COLUMN IF NOT EXISTS preco_backstage_masc NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preco_backstage_fem  NUMERIC(10,2) DEFAULT NULL;
```

---

## FLUXO 1 — Cadastro e Recebimento de Ingresso via Camarote

**Pré-requisito:** Um evento ativo com pelo menos um camarote cadastrado.

1. Acessar `/admin/camarotes`
2. Clicar em **Gerar Links** no camarote desejado
3. Informar nome e email do responsável → clicar **Gerar e Enviar por Email**
4. ✅ Verificar: email recebido com N links individuais
5. Abrir um dos links (`/cadastro-ingresso/[token]`)
6. Preencher: Nome completo, Gênero, CPF, Email, WhatsApp → **Confirmar**
7. ✅ Verificar: email de ingresso recebido com QR Code
8. ✅ Verificar: ingresso aparece em `/admin/ingressos` com status `ativo`

---

## FLUXO 2 — Lista Amiga

**Pré-requisito:** Evento ativo com `lista_encerra_as` preenchido (data+hora futura).

1. Acessar `/eventos/[slug-do-evento]`
2. ✅ Verificar: botão "Entrar na Lista Amiga →" aparece no card de compra
3. Clicar no botão → vai para `/lista/[slug]`
4. Selecionar gênero, preencher Nome Completo e Email → **Entrar na Lista**
5. ✅ Verificar: mensagem de sucesso na tela
6. ✅ Verificar: email recebido com QR Code da lista
7. ✅ Verificar: entrada aparece em `/admin/listas`
8. Tentar cadastrar o mesmo email novamente → ✅ deve receber erro "email já inscrito"

---

## FLUXO 3 — Portaria (validação de QR Code)

**Pré-requisito:** Ter pelo menos 1 ingresso `ativo` (Fluxo 1) e 1 da lista (Fluxo 2).

### Setup porteiro (se ainda não existe):
```sql
-- Gerar hash da senha no Node.js: require('bcryptjs').hashSync('SuaSenha123', 12)
INSERT INTO public.porteiros (nome, email, senha_hash, nivel)
VALUES ('Porteiro Teste', 'porteiro@teste.com', '$2b$12$HASH_AQUI', 'porteiro');
```

### Teste:
1. Acessar `/portaria` no celular
2. Login com email/senha do porteiro cadastrado
3. ✅ Verificar: lista de eventos aparece
4. Selecionar o evento
5. **Ingresso normal:**
   - Abrir o email de ingresso recebido no Fluxo 1
   - Apontar câmera para o QR Code → ✅ deve mostrar "ENTRADA AUTORIZADA" com nome
   - Tentar escanear o mesmo QR novamente → ✅ deve mostrar "JÁ UTILIZADO"
6. **Lista amiga:**
   - Abrir o email de lista recebido no Fluxo 2
   - Escanear QR Code → ✅ deve mostrar "ENTRADA AUTORIZADA" com nome e tipo "lista_feminino/masculino"
7. **QR inválido:**
   - Digitar qualquer texto no campo manual → ✅ deve mostrar "QR CODE INVÁLIDO"

---

## FLUXO 4 — Painel Admin

1. Acessar `/admin` → ✅ dashboard com stats e receita total correta
2. `/admin/eventos` → criar evento com data, hora de abertura e "lista encerra às"
   - ✅ Verificar que data aparece corretamente (não um dia antes)
3. `/admin/eventos` → expandir lotes → adicionar lote com preços incluindo Backstage
4. `/admin/camarotes` → criar camarote para o evento
5. `/admin/listas` → após Fluxo 2, verificar inscrições, filtrar por evento/gênero, exportar CSV
6. `/admin/ingressos` → após Fluxo 1, verificar ingresso com status `ativo`

---

## CHECKLIST FINAL

- [ ] Email de camarote enviado com links individuais
- [ ] Página de cadastro abre via link e valida token
- [ ] Email de ingresso (QR Code) chegou após cadastro
- [ ] Lista amiga aceita inscrição e envia email com QR
- [ ] Portaria valida ingresso de camarote → "ENTRADA AUTORIZADA"
- [ ] Portaria valida ingresso de lista → "ENTRADA AUTORIZADA"
- [ ] Portaria bloqueia reuso → "JÁ UTILIZADO"
- [ ] Portaria bloqueia token inválido → "QR CODE INVÁLIDO"
- [ ] Datas aparecem corretamente em todos os lugares (sem 1 dia a menos)
- [ ] Admin Listas mostra inscrições da lista_amiga
- [ ] Receita no dashboard calcula todos os ingressos (não só os 6 recentes)
- [ ] Botão [DEV] de simulação NÃO aparece em produção (Vercel)

---

## PRÓXIMO PASSO APÓS TESTES

Quando todos os ✅ estiverem confirmados:
1. Conectar Mercado Pago na `/api/pagamentos`
2. Implementar webhook PATCH (confirmar pagamento → ativar ingresso → enviar email)
3. Remover lógica de simulação do `CompraIngressoModal`
4. Conectar botão "Comprar" ao fluxo real de pagamento
