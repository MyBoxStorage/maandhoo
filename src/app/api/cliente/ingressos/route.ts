import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'

// GET /api/cliente/ingressos — lista ingressos do cliente logado
export async function GET(req: NextRequest) {
  const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const payload = verificarTokenCliente(token)
  if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('ingressos')
    .select(`
      id, tipo, status, qr_token, serial, expira_em, created_at,
      eventos ( id, nome, data_evento, hora_abertura, flyer_url ),
      cadastro:cadastros ( nome_completo, email )
    `)
    .eq('cliente_id', payload.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ ingressos: data ?? [] })
}
