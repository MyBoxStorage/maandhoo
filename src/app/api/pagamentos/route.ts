import { NextRequest, NextResponse } from 'next/server'

// ============================================
// API: /api/pagamentos
// Criação de pagamento Mercado Pago + Webhook
// Configurar: MERCADOPAGO_ACCESS_TOKEN (PJ)
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventoId, loteId, tipo, genero, compradorNome, compradorCpf, compradorEmail, compradorWhatsapp, metodo } = body

    if (!eventoId || !compradorNome || !compradorCpf || !compradorEmail || !metodo) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // TODO: 1. Buscar evento e lote no banco (verificar estoque)
    // TODO: 2. Reservar ingresso temporariamente (5min timeout)

    // === MERCADO PAGO — PIX ===
    // const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
    // const payment = new Payment(mpClient)
    //
    // if (metodo === 'pix') {
    //   const pagamento = await payment.create({
    //     body: {
    //       transaction_amount: preco,
    //       payment_method_id: 'pix',
    //       payer: {
    //         email: compradorEmail,
    //         first_name: compradorNome.split(' ')[0],
    //         identification: { type: 'CPF', number: compradorCpf.replace(/\D/g, '') },
    //       },
    //       description: `Ingresso Maandhoo — ${evento.nome}`,
    //       notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamentos/webhook`,
    //       metadata: { eventoId, loteId, tipo, genero, compradorEmail },
    //     }
    //   })
    //   return NextResponse.json({
    //     pagamentoId: pagamento.id,
    //     pixQrCode: pagamento.point_of_interaction?.transaction_data?.qr_code_base64,
    //     pixCopiaCola: pagamento.point_of_interaction?.transaction_data?.qr_code,
    //     status: pagamento.status,
    //   })
    // }

    // PLACEHOLDER — remova quando configurar o MP
    return NextResponse.json({
      pagamentoId: `MP_PLACEHOLDER_${Date.now()}`,
      pixQrCode: '',
      pixCopiaCola: 'Configure MERCADOPAGO_ACCESS_TOKEN no .env.local',
      status: 'pending',
      message: 'Configure as credenciais do Mercado Pago para gerar PIX real',
    })

  } catch (error) {
    console.error('[API Pagamentos]', error)
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 })
  }
}

// WEBHOOK — Mercado Pago notifica quando pagamento é confirmado
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    // TODO: Verificar assinatura HMAC do webhook (segurança)
    // const signature = req.headers.get('x-signature')
    // verificarAssinatura(signature, process.env.MERCADOPAGO_WEBHOOK_SECRET)

    // TODO: Buscar pagamento no Mercado Pago pela ID
    // TODO: Se status === 'approved':
    //   1. Marcar ingresso como pago no banco
    //   2. Gerar serial único + QR hash
    //   3. Gerar PDF do ingresso
    //   4. Enviar email com PDF
    //   5. Enviar WhatsApp de confirmação
    //   6. Emitir nota fiscal (se integrado)

    console.log('[Webhook MP] Pagamento:', data?.id, 'Tipo:', type)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Webhook MP]', error)
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 })
  }
}
