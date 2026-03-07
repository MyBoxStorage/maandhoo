import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { enviarEmailCamarote } from '@/lib/email-ingresso'
import type { GerarCamarotePayload } from '@/types/ingressos'

/**
 * POST /api/ingressos/camarote
 * Gera N ingressos de camarote, reserva o camarote e envia email com links
 * Apenas admins autorizados (verificado via porteiro_id + nivel)
 */
export async function POST(req: NextRequest) {
  try {
    const body: GerarCamarotePayload = await req.json()
    const { camarote_id, gerado_por, reservado_por } = body

    if (!camarote_id || !gerado_por || !reservado_por) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 })
    }

    // ── Verificar se quem gerou tem permissão de admin_saida ────
    const { data: porteiro } = await supabaseAdmin
      .from('porteiros')
      .select('nivel, ativo')
      .eq('id', gerado_por)
      .single()

    if (!porteiro || !porteiro.ativo || porteiro.nivel === 'porteiro') {
      return NextResponse.json({ erro: 'Sem permissão para gerar ingressos de camarote' }, { status: 403 })
    }

    // ── Chama função SQL que gera os ingressos ──────────────────
    const { data, error } = await supabaseAdmin.rpc('gerar_ingressos_camarote', {
      p_camarote_id: camarote_id,
      p_gerado_por: gerado_por,
    })

    if (error || !data) {
      console.error('[camarote] Erro RPC:', error)
      return NextResponse.json({ erro: data?.erro ?? 'Erro ao gerar ingressos' }, { status: 500 })
    }

    if (data.erro) {
      return NextResponse.json({ erro: data.erro }, { status: 400 })
    }

    // ── Salvar quem reservou ────────────────────────────────────
    await supabaseAdmin
      .from('camarotes')
      .update({ reservado_por })
      .eq('id', camarote_id)

    // ── Montar URLs de cadastro para cada link ──────────────────
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const linksComUrl = (data.links as Array<{ numero: number; link_token: string; ingresso_id: string }>)
      .map(l => ({
        numero: l.numero,
        url: `${baseUrl}/cadastro-ingresso/${l.link_token}`,
      }))

    // ── Buscar email do camarote para envio (se disponível) ─────
    // Por enquanto retorna os links — o admin envia manualmente via WhatsApp
    // O email será enviado quando implementarmos o campo de email do responsável

    return NextResponse.json({
      sucesso: true,
      camarote: data.camarote,
      evento: data.evento,
      total_ingressos: data.total_ingressos,
      links: linksComUrl,
    })
  } catch (err) {
    console.error('[camarote] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

/**
 * GET /api/ingressos/camarote?evento_id=xxx
 * Lista camarotes de um evento (disponíveis e reservados)
 */
export async function GET(req: NextRequest) {
  const evento_id = req.nextUrl.searchParams.get('evento_id')

  if (!evento_id) {
    return NextResponse.json({ erro: 'evento_id obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('camarotes')
    .select('*')
    .eq('evento_id', evento_id)
    .order('identificador')

  if (error) {
    return NextResponse.json({ erro: 'Erro ao buscar camarotes' }, { status: 500 })
  }

  return NextResponse.json({ camarotes: data })
}
