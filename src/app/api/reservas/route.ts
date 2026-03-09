import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ============================================
// API: /api/reservas
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, nome, email, whatsapp, numeroPessoas, areaDesejada, dataAniversario, observacoes } = body

    if (!tipo || !nome || !whatsapp) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // Salvar reserva no Supabase
    const { data: reserva, error } = await supabaseAdmin
      .from('reservas')
      .insert({
        tipo,
        nome: nome.trim(),
        email: email?.trim()?.toLowerCase() ?? null,
        whatsapp: whatsapp.replace(/\D/g, ''),
        numero_pessoas: numeroPessoas ?? 1,
        area_desejada: areaDesejada ?? null,
        data_aniversario: dataAniversario ?? null,
        observacoes: observacoes ?? null,
        status: 'pendente',
      })
      .select()
      .single()

    if (error) {
      console.error('[reservas] Erro ao salvar:', error)
      // Não bloquear o usuário por erro de DB — captura lead mesmo assim
    }

    // Capturar lead automaticamente
    try {
      const origemMap: Record<string, string> = {
        mesa: 'reserva_mesa',
        camarote: 'reserva_camarote',
        aniversario: 'reserva_aniversario',
      }
      await supabaseAdmin.from('leads').insert({
        nome: nome.trim(),
        email: email?.trim()?.toLowerCase() ?? null,
        whatsapp: whatsapp.replace(/\D/g, ''),
        origem: origemMap[tipo] ?? 'contato',
        observacoes: `Reserva ${tipo} · ${numeroPessoas} pessoas · ${areaDesejada ?? ''}`,
        consentimento_lgpd: true,
        status: 'novo',
      })
    } catch (e) {
      console.warn('[Leads] Falha ao capturar lead da reserva:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de reserva recebida',
      reservaId: reserva?.id ?? null,
    })
  } catch (error) {
    console.error('[API Reservas]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ reservas: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  const { id, status, observacoes_admin } = await req.json()
  if (!id || !status) return NextResponse.json({ erro: 'id e status são obrigatórios' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ status, observacoes_admin: observacoes_admin ?? null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ reserva: data })
}
