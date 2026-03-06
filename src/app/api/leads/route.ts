import { NextRequest, NextResponse } from 'next/server'
import { Lead, OrigemLead, StatusLead } from '@/types'

// ============================================
// API: /api/leads
// Captura e armazena leads com consentimento LGPD
// ============================================

// Simulação de banco em memória (substituir por Supabase)
// Em produção: await supabase.from('leads').insert(leadData)
const leadsDB: Lead[] = []

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

    if (!email && !whatsapp) {
      return NextResponse.json({ error: 'Email ou WhatsApp obrigatório' }, { status: 400 })
    }

    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      nome: nome.trim(),
      email: email?.trim().toLowerCase(),
      whatsapp: whatsapp?.trim(),
      origem: origem as OrigemLead,
      eventoId,
      eventoNome,
      observacoes,
      status: 'novo' as StatusLead,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    }

    // TODO: Supabase
    // const { error } = await supabase.from('leads').insert(lead)
    // if (error) throw error
    leadsDB.push(lead)

    console.log('[Lead Capturado]', { nome: lead.nome, origem: lead.origem, email: lead.email })

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('[API Leads POST]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // TODO: autenticação admin
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const origem = searchParams.get('origem')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let leads = [...leadsDB]

    if (origem) leads = leads.filter(l => l.origem === origem)
    if (status) leads = leads.filter(l => l.status === status)

    leads.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())

    const total = leads.length
    const paginated = leads.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ leads: paginated, total, page, limit })
  } catch (error) {
    console.error('[API Leads GET]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, status } = body

    const lead = leadsDB.find(l => l.id === leadId)
    if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

    lead.status = status
    lead.atualizadoEm = new Date()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Leads PATCH]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
