import { NextRequest, NextResponse } from 'next/server'

// ============================================
// API: /api/reservas
// Recebe solicitações de mesa/camarote/aniversário
// Notifica equipe via WhatsApp
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, nome, email, whatsapp, numeroPessoas, areaDesejada, dataAniversario, observacoes } = body

    if (!tipo || !nome || !whatsapp) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // TODO: 1. Salvar reserva no Supabase
    // await supabase.from('reservas').insert({...})

    // 2. Captura lead automaticamente
    try {
      const origemMap: Record<string, string> = {
        mesa: 'reserva_mesa',
        camarote: 'reserva_camarote',
        aniversario: 'reserva_aniversario',
      }
      await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, email, whatsapp,
          origem: origemMap[tipo] || 'contato',
          observacoes: `Reserva ${tipo} · ${numeroPessoas} pessoas · ${areaDesejada || ''}`,
          consentimentoLGPD: true,
        }),
      })
    } catch (e) {
      console.warn('[Leads] Falha ao capturar lead da reserva:', e)
    }

    // TODO: 2. Enviar email para contato@maandhoo.com com os dados da reserva
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: 'contato@maandhoo.com',
    //   subject: `Nova reserva de ${tipo} — ${nome}`,
    //   html: `<b>${nome}</b><br>Tipo: ${tipo}<br>WhatsApp: ${whatsapp}<br>Pessoas: ${numeroPessoas}<br>Área: ${areaDesejada}<br>Obs: ${observacoes}`
    // })

    // TODO: 3. Enviar confirmação via WhatsApp para o cliente
    // Link de API do WhatsApp ou integração com Cloud API
    const whatsappLink = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=Olá! Recebi a solicitação de reserva de ${nome}. Entraremos em contato em breve!`

    return NextResponse.json({
      success: true,
      message: 'Solicitação de reserva recebida',
      whatsappLink,
    })
  } catch (error) {
    console.error('[API Reservas]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // TODO: listar reservas para o admin (com autenticação)
  return NextResponse.json({ reservas: [] })
}
