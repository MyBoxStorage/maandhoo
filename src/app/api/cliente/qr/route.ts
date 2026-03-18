import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'
import { gerarQRCodeBase64 } from '@/lib/qr-generator'

// GET /api/cliente/qr?ingresso_id=xxx
// Retorna o QR Code como base64 — só para o dono do ingresso.
// Verifica posse via cliente_id OU via email no cadastro (para ingressos
// cadastrados antes de criar conta — o cliente_id é vinculado em background).
export async function GET(req: NextRequest) {
  const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const payload = verificarTokenCliente(token)
  if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

  const ingressoId = req.nextUrl.searchParams.get('ingresso_id')
  if (!ingressoId) return NextResponse.json({ erro: 'ingresso_id obrigatório' }, { status: 400 })

  // ── Tenta pelo cliente_id primeiro (caminho rápido) ──────────
  let { data: ingresso, error } = await supabaseAdmin
    .from('ingressos')
    .select('id, qr_token, status, expira_em, cliente_id')
    .eq('id', ingressoId)
    .eq('cliente_id', payload.id)
    .maybeSingle()

  // ── Fallback: verifica pelo email no cadastro ─────────────────
  // Cobre o caso de ingressos registrados antes de a conta ser criada,
  // onde cliente_id ainda pode ser NULL na tabela de ingressos.
  if (!ingresso) {
    const emailNormalizado = payload.email.toLowerCase()

    const { data: cadastro } = await supabaseAdmin
      .from('cadastros')
      .select('ingresso_id')
      .eq('ingresso_id', ingressoId)
      .eq('email', emailNormalizado)
      .maybeSingle()

    if (cadastro) {
      const { data: ing } = await supabaseAdmin
        .from('ingressos')
        .select('id, qr_token, status, expira_em, cliente_id')
        .eq('id', ingressoId)
        .maybeSingle()

      if (ing) {
        ingresso = ing

        // Vincula cliente_id em background se ainda não estava vinculado
        if (!ing.cliente_id) {
          void supabaseAdmin
            .from('ingressos')
            .update({ cliente_id: payload.id })
            .eq('id', ingressoId)
        }
      }
    }
  }

  if (error && !ingresso) {
    console.error('[cliente/qr]', error)
  }

  if (!ingresso) {
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
