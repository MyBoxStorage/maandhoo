import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/validar
 * Chamada pelo PWA da portaria para validar um QR Code
 * Chama a função SQL validar_ingresso() que contém toda a lógica de negócio
 */
export async function POST(req: NextRequest) {
  try {
    const { qr_token, porteiro_id, evento_id } = await req.json()

    if (!qr_token || !porteiro_id || !evento_id) {
      return NextResponse.json(
        { aprovado: false, resultado: 'ingresso_invalido', mensagem: '❌ Dados incompletos na requisição' },
        { status: 400 }
      )
    }

    // Coleta IP e dispositivo para o log
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'desconhecido'
    const dispositivo = req.headers.get('user-agent') ?? 'desconhecido'

    // Chama a função SQL que concentra toda a lógica de validação
    const { data, error } = await supabaseAdmin.rpc('validar_ingresso', {
      p_qr_token: qr_token,
      p_porteiro_id: porteiro_id,
      p_evento_id: evento_id,
    })

    if (error) {
      console.error('[validar] Erro RPC:', error)
      return NextResponse.json(
        { aprovado: false, resultado: 'ingresso_invalido', mensagem: '❌ Erro ao processar validação' },
        { status: 500 }
      )
    }

    // Atualiza ip e dispositivo na última validação registrada (best-effort)
    if (data?.ingresso_id) {
      await supabaseAdmin
        .from('validacoes')
        .update({ ip_origem: ip, dispositivo })
        .eq('ingresso_id', data.ingresso_id)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[validar] Erro inesperado:', err)
    return NextResponse.json(
      { aprovado: false, resultado: 'ingresso_invalido', mensagem: '❌ Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/validar?token=xxx
 * Redirecionamento de QR Code escaneado por câmera genérica
 * (quando o porteiro abre pelo app de câmera e não pela PWA)
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/portaria', req.url))
  }
  // Redireciona para a PWA da portaria com o token na URL
  return NextResponse.redirect(new URL(`/portaria?qr=${encodeURIComponent(token)}`, req.url))
}
