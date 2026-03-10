import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'
import { gerarQRCodeBase64 } from '@/lib/qr-generator'

// GET /api/cliente/qr?ingresso_id=xxx
// Retorna o QR Code como base64 — só para o dono do ingresso
export async function GET(req: NextRequest) {
  const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const payload = verificarTokenCliente(token)
  if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

  const ingressoId = req.nextUrl.searchParams.get('ingresso_id')
  if (!ingressoId) return NextResponse.json({ erro: 'ingresso_id obrigatório' }, { status: 400 })

  // Verifica que o ingresso pertence ao cliente logado
  const { data: ingresso, error } = await supabaseAdmin
    .from('ingressos')
    .select('id, qr_token, status, expira_em')
    .eq('id', ingressoId)
    .eq('cliente_id', payload.id)   // ← segurança: só o dono acessa
    .single()

  if (error || !ingresso) {
    return NextResponse.json({ erro: 'Ingresso não encontrado' }, { status: 404 })
  }

  if (ingresso.status === 'cancelado') {
    return NextResponse.json({ erro: 'Ingresso cancelado' }, { status: 410 })
  }

  if (ingresso.status === 'utilizado') {
    return NextResponse.json({ erro: 'Ingresso já utilizado', utilizado: true }, { status: 410 })
  }

  const qrBase64 = await gerarQRCodeBase64(ingresso.qr_token)
  return NextResponse.json({ qr: qrBase64, status: ingresso.status })
}
