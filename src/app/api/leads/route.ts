import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ============================================
// API: /api/leads — Supabase
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, email, whatsapp, origem, eventoId, eventoNome, observacoes, consentimentoLGPD } = body

    if (!nome || !origem) {
      return NextResponse.json({ error: 'Nome e origem são obrigatórios' }, { status: 400 })
    }

    if (!consentimentoLGPD) {
      return NextResponse.json({ error: 'Consentimento LGPD obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        nome: nome.trim(),
        email: email?.trim()?.toLowerCase() ?? null,
        whatsapp: whatsapp?.replace(/\D/g, '') ?? null,
        origem,
        evento_id: eventoId ?? null,
        evento_nome: eventoNome ?? null,
        observacoes: observacoes ?? null,
        status: 'novo',
        consentimento_lgpd: true,
        data_consentimento: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[leads] Erro ao salvar:', error)
      // Não bloquear o usuário por erro de DB
      return NextResponse.json({ success: true, leadId: null })
    }

    return NextResponse.json({ success: true, leadId: data.id })
  } catch (error) {
    console.error('[API Leads POST]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const origem = searchParams.get('origem')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (origem) query = query.eq('origem', origem)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    // Normalizar campos para compatibilidade com o frontend
    const leads = (data ?? []).map(l => ({
      id: l.id,
      nome: l.nome,
      email: l.email,
      whatsapp: l.whatsapp,
      origem: l.origem,
      evento_nome: l.evento_nome,
      eventoId: l.evento_id,
      observacoes: l.observacoes,
      status: l.status,
      consentimento_lgpd: l.consentimento_lgpd,
      created_at: l.created_at,
    }))

    return NextResponse.json({ leads, total: leads.length })
  } catch (error) {
    console.error('[API Leads GET]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, id, status } = body
    const resolvedId = id ?? leadId

    if (!resolvedId || !status) {
      return NextResponse.json({ error: 'id e status são obrigatórios' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', resolvedId)

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Leads PATCH]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
