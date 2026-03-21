/**
 * sync-bc-connect.ts — sincronização retroativa Maandhoo → BC Connect
 * 
 * IMPORTANTE: NÃO filtra por email duplicado.
 * Cada registro gera um webhook independente — o BC Connect trata duplicatas
 * criando uma nova LeadInteraction (que alimenta frequência/PA score).
 */

import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://wqyexqbogqydxjednuvc.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeWV4cWJvZ3F5ZHhqZWRudXZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA5MjM5MSwiZXhwIjoyMDg4NjY4MzkxfQ.wpwIgrhA2NW2VquS8uT2gR4Tb-KF07PJB9J7rv-g85E'

const BC_URL  = 'https://bc-connect-api-v2.fly.dev'
const BC_KEY  = 'bcc_3c7e9e09-b752-450c-8aca-dec244efb561'
const BC_PID  = 'cmn0m62i70007l6xp1ohmzlkb'

const s = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } })

async function webhook(payload: object): Promise<string | null> {
  try {
    const r = await fetch(`${BC_URL}/api/webhook/partner/${BC_PID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': BC_KEY },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    })
    if (r.ok) {
      const d = await r.json()
      return d.webhookLogId ?? null
    }
    const err = await r.text()
    console.error(`    HTTP ${r.status}: ${err.slice(0, 100)}`)
    return null
  } catch (e: any) {
    console.error(`    Erro: ${e.message}`)
    return null
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('=== SYNC RETROATIVO MAANDHOO → BC CONNECT ===')
  console.log('Modo: envia TODOS os registros — BC Connect cria interação por evento\n')

  let enviados = 0, erros = 0

  // ── 1. CLIENTES (área do cliente) ──────────────────────────
  const { data: clientes, error: e1 } = await s
    .from('clientes')
    .select('nome, email, whatsapp, created_at')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })

  console.log(`Clientes cadastrados no Maandhoo: ${clientes?.length ?? 0}`)
  for (const c of clientes || []) {
    const id = await webhook({
      eventType: 'SIGNUP',
      occurredAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
      lead: { email: c.email.toLowerCase(), name: c.nome, phone: c.whatsapp ? String(c.whatsapp) : undefined },
      optinAccepted: true,
      metadata: { occasionType: 'area_cliente' },
    })
    if (id) {
      console.log(`  ✓ ${c.nome} <${c.email}>`)
      enviados++
    } else {
      console.log(`  ✗ ERRO: ${c.email}`)
      erros++
    }
    await sleep(300)
  }

  // ── 2. LEADS (lista amiga via popup, reservas) ──────────────
  const { data: leads, error: e2 } = await s
    .from('leads')
    .select('nome, email, whatsapp, origem, evento_nome, created_at')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })

  console.log(`\nLeads capturados no Maandhoo: ${leads?.length ?? 0}`)
  for (const l of leads || []) {
    const id = await webhook({
      eventType: 'SIGNUP',
      occurredAt: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString(),
      lead: { email: l.email.toLowerCase(), name: l.nome, phone: l.whatsapp ? String(l.whatsapp) : undefined },
      optinAccepted: true,
      metadata: { occasionType: l.origem || 'lead', eventName: l.evento_nome || undefined },
    })
    if (id) {
      console.log(`  ✓ ${l.nome} <${l.email}> [${l.origem}]`)
      enviados++
    } else {
      console.log(`  ✗ ERRO: ${l.email}`)
      erros++
    }
    await sleep(300)
  }

  // ── 3. LISTA AMIGA (tabela dedicada) ────────────────────────
  const { data: lista, error: e3 } = await s
    .from('lista_amiga')
    .select('nome, email, genero, created_at')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })

  console.log(`\nLista amiga no Maandhoo: ${lista?.length ?? 0}`)
  for (const item of lista || []) {
    const id = await webhook({
      eventType: 'SIGNUP',
      occurredAt: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      lead: { email: item.email.toLowerCase(), name: item.nome, gender: item.genero },
      optinAccepted: true,
      metadata: { occasionType: 'lista_amiga' },
    })
    if (id) {
      console.log(`  ✓ ${item.nome} <${item.email}>`)
      enviados++
    } else {
      console.log(`  ✗ ERRO: ${item.email}`)
      erros++
    }
    await sleep(300)
  }

  console.log(`\n=== RESULTADO ===`)
  console.log(`Enviados: ${enviados} webhooks`)
  console.log(`Erros:    ${erros}`)
  console.log(`\nCada envio criou uma LeadInteraction no BC Connect.`)
  console.log(`Leads que apareceram em múltiplos formulários agora têm PA score maior.`)
}

main().catch(console.error)


