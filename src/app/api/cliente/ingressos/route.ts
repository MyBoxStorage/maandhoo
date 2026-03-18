import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'

// GET /api/cliente/ingressos — lista ingressos do cliente logado
export async function GET(req: NextRequest) {
  const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const payload = verificarTokenCliente(token)
  if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

  const email = payload.email.toLowerCase()

  // ── 1. Busca IDs dos ingressos cadastrados com este email ────
  //    (cobre o caso: usuário confirmou o link antes de criar a conta)
  const { data: cadastrosComEmail } = await supabaseAdmin
    .from('cadastros')
    .select('ingresso_id')
    .eq('email', email)

  const idsPorEmail = (cadastrosComEmail ?? [])
    .map((c: { ingresso_id: string }) => c.ingresso_id)
    .filter(Boolean)

  // ── 2. Busca todos os ingressos: pelo cliente_id OU pelos ids encontrados ──
  let query = supabaseAdmin
    .from('ingressos')
    .select(`
      id, tipo, status, qr_token, serial, expira_em, created_at,
      eventos ( id, nome, data_evento, hora_abertura, flyer_url ),
      cadastro:cadastros ( nome_completo, email )
    `)
    .order('created_at', { ascending: false })

  if (idsPorEmail.length > 0) {
    // OR: cliente_id = payload.id OU id IN (idsPorEmail)
    query = query.or(`cliente_id.eq.${payload.id},id.in.(${idsPorEmail.join(',')})`)
  } else {
    query = query.eq('cliente_id', payload.id)
  }

  const { data: ingressos, error } = await query

  if (error) {
    console.error('[cliente/ingressos]', error)
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  // ── 3. Vincula em background os ingressos ainda sem cliente_id ──
  //    (para que na próxima consulta o caminho 1 já funcione)
  const semCliente = (ingressos ?? [])
    .filter((i: { id: string; cliente_id?: string | null }) => !i.cliente_id)
    .map((i: { id: string }) => i.id)

  if (semCliente.length > 0) {
    void supabaseAdmin
      .from('ingressos')
      .update({ cliente_id: payload.id })
      .in('id', semCliente)
  }

  // Remove duplicatas (por segurança)
  const vistos = new Set<string>()
  const unicos = (ingressos ?? []).filter((i: { id: string }) => {
    if (vistos.has(i.id)) return false
    vistos.add(i.id)
    return true
  })

  return NextResponse.json({ ingressos: unicos })
}
