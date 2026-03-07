import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/ingressos/validar-link?token=xxx
 * Verifica se um link_token é válido e retorna dados do evento/ingresso
 * Usado pela página de cadastro antes de mostrar o formulário
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ erro: 'Token não informado' }, { status: 400 })
  }

  const { data: ingresso, error } = await supabaseAdmin
    .from('ingressos')
    .select(`
      id,
      tipo,
      status,
      link_usado,
      expira_em,
      eventos (
        id,
        nome,
        data_evento,
        hora_abertura,
        flyer_url
      ),
      lotes (
        numero,
        nome,
        preco_masc,
        preco_fem
      )
    `)
    .eq('link_token', token)
    .single()

  if (error || !ingresso) {
    return NextResponse.json({ erro: 'Link inválido ou não encontrado' }, { status: 404 })
  }

  if (ingresso.link_usado) {
    return NextResponse.json({ erro: 'Este link já foi utilizado' }, { status: 410 })
  }

  if (ingresso.status === 'cancelado') {
    return NextResponse.json({ erro: 'Este ingresso foi cancelado' }, { status: 410 })
  }

  if (ingresso.expira_em && new Date(ingresso.expira_em) < new Date()) {
    return NextResponse.json({ erro: 'Este link expirou' }, { status: 410 })
  }

  return NextResponse.json({ ingresso })
}
