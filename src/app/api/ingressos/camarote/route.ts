import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendBcEvent } from '@/lib/bcconnect'
import { enviarEmailCamarote } from '@/lib/email-ingresso'
import type { GerarCamarotePayload } from '@/types/ingressos'

/**
 * POST /api/ingressos/camarote
 * Gera N ingressos de camarote, reserva o camarote e retorna os links únicos
 * Aceita gerado_por opcional — se não enviado, usa service_role direto
 */
export async function POST(req: NextRequest) {
  try {
    const body: Partial<GerarCamarotePayload> & { email_responsavel?: string; nome_responsavel?: string } = await req.json()
    const { camarote_id, gerado_por, reservado_por, email_responsavel, nome_responsavel } = body

    if (!camarote_id) {
      return NextResponse.json({ erro: 'camarote_id é obrigatório' }, { status: 400 })
    }

    if (!email_responsavel) {
      return NextResponse.json({ erro: 'email_responsavel é obrigatório' }, { status: 400 })
    }

    const { data: camaroteData } = await supabaseAdmin
      .from('camarotes')
      .select('evento_id, identificador, eventos(nome, data_evento)')
      .eq('id', camarote_id)
      .single()

    // Se gerado_por foi enviado, verificar permissão
    if (gerado_por) {
      const { data: porteiro } = await supabaseAdmin
        .from('porteiros')
        .select('nivel, ativo')
        .eq('id', gerado_por)
        .single()

      if (!porteiro || !porteiro.ativo || porteiro.nivel === 'porteiro') {
        return NextResponse.json({ erro: 'Sem permissão para gerar ingressos de camarote' }, { status: 403 })
      }
    }

    // Chama função SQL que gera os ingressos
    const { data, error } = await supabaseAdmin.rpc('gerar_ingressos_camarote', {
      p_camarote_id: camarote_id,
      p_gerado_por: gerado_por ?? null,
    })

    if (error || !data) {
      console.error('[camarote] Erro RPC:', error)
      return NextResponse.json({ erro: 'Erro ao gerar ingressos. Verifique se o camarote existe e não está reservado.' }, { status: 500 })
    }

    if (data.erro) {
      return NextResponse.json({ erro: data.erro }, { status: 400 })
    }

    // Salvar quem reservou (se informado)
    if (reservado_por) {
      await supabaseAdmin
        .from('camarotes')
        .update({ reservado_por })
        .eq('id', camarote_id)
    }

    // Montar URLs de cadastro para cada link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const linksArray = Array.isArray(data.links) ? data.links : []
    const linksComUrl = linksArray.map((l: { numero: number; link_token: string; ingresso_id: string }) => ({
      numero: l.numero,
      url: `${baseUrl}/cadastro-ingresso/${l.link_token}`,
    }))

    // Disparar email com os links
    const linksParaEmail = linksComUrl.map((l: { numero: number; url: string }) => ({
      numero: l.numero,
      url: l.url,
    }))

    const resultadoEmail = await enviarEmailCamarote({
      para: email_responsavel,
      nomeResponsavel: nome_responsavel ?? 'Responsável',
      eventoNome: data.evento,
      eventoData: (camaroteData as { eventos?: { data_evento?: string } | null })?.eventos?.data_evento ?? new Date().toISOString(),
      camaroteId: camarote_id,
      links: linksParaEmail,
    })

    if (!resultadoEmail.sucesso) {
      console.error('[camarote] Falha no email:', resultadoEmail.erro)
    } else {
      console.log('[camarote] Email enviado para:', email_responsavel)
    }

    sendBcEvent({
      eventType: 'TICKET_PURCHASE',
      occurredAt: new Date().toISOString(),
      lead: {
        email: email_responsavel.trim().toLowerCase(),
        name: (nome_responsavel ?? 'Responsável').trim(),
      },
      optinAccepted: true,
      metadata: {
        eventName: typeof data.evento === 'string' ? data.evento : undefined,
        occasionType: 'camarote',
        groupSize: typeof data.total_ingressos === 'number' ? data.total_ingressos : undefined,
      },
    })

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
 * PATCH /api/ingressos/camarote
 * Reenviar email com links já gerados para um camarote já reservado
 */
export async function PATCH(req: NextRequest) {
  try {
    const { camarote_id, email_responsavel, nome_responsavel } = await req.json()

    if (!camarote_id || !email_responsavel) {
      return NextResponse.json({ erro: 'camarote_id e email_responsavel são obrigatórios' }, { status: 400 })
    }

    // Buscar camarote + evento
    const { data: camarote } = await supabaseAdmin
      .from('camarotes')
      .select('identificador, evento_id, eventos(nome, data_evento)')
      .eq('id', camarote_id)
      .single()

    if (!camarote) return NextResponse.json({ erro: 'Camarote não encontrado' }, { status: 404 })

    // Buscar ingressos gerados para esse camarote
    const { data: ingressos } = await supabaseAdmin
      .from('ingressos')
      .select('id, link_token, status')
      .eq('camarote_id', camarote_id)
      .order('created_at', { ascending: true })

    if (!ingressos || ingressos.length === 0) {
      return NextResponse.json({ erro: 'Nenhum ingresso encontrado para este camarote' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const links = ingressos.map((ing, i) => ({
      numero: i + 1,
      url: `${baseUrl}/cadastro-ingresso/${ing.link_token}`,
    }))

    const eventoData = (camarote as { eventos?: { nome?: string; data_evento?: string } | null })
    const resultadoEmail = await enviarEmailCamarote({
      para: email_responsavel,
      nomeResponsavel: nome_responsavel ?? 'Responsável',
      eventoNome: eventoData?.eventos?.nome ?? 'Evento Maandhoo',
      eventoData: eventoData?.eventos?.data_evento ?? new Date().toISOString(),
      camaroteId: camarote_id,
      links,
    })

    if (!resultadoEmail.sucesso) {
      return NextResponse.json({ erro: `Falha no envio: ${resultadoEmail.erro}` }, { status: 500 })
    }

    sendBcEvent({
      eventType: 'TICKET_PURCHASE',
      occurredAt: new Date().toISOString(),
      lead: {
        email: email_responsavel.trim().toLowerCase(),
        name: (nome_responsavel ?? 'Responsável').trim(),
      },
      optinAccepted: true,
      metadata: {
        eventName: eventoData?.eventos?.nome,
        occasionType: 'camarote_reenvio',
        groupSize: links.length,
      },
    })

    return NextResponse.json({ sucesso: true, total_links: links.length })
  } catch (err) {
    console.error('[camarote PATCH] Erro:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

/**
 * GET /api/ingressos/camarote?evento_id=xxx
 * Lista camarotes com stats de ingressos
 */
export async function GET(req: NextRequest) {
  const evento_id = req.nextUrl.searchParams.get('evento_id')

  if (!evento_id) {
    // Sem evento_id: retorna todos para o admin
    const { data, error } = await supabaseAdmin
      .from('camarotes')
      .select('*, evento:eventos(id, nome, data_evento), ingressos(id, status)')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    const camarotes = (data || []).map(c => ({
      ...c,
      total_ingressos: c.ingressos?.length ?? 0,
      cadastros_completos: c.ingressos?.filter((i: { status: string }) => i.status !== 'aguardando_cadastro' && i.status !== 'pendente_pagamento').length ?? 0,
      ingressos: undefined,
    }))

    return NextResponse.json({ camarotes })
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
