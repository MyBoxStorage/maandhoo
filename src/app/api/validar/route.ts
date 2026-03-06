import { NextRequest, NextResponse } from 'next/server'

// ============================================
// API: /api/validar
// Validação de QR Code na portaria
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { qrHash } = body

    if (!qrHash) {
      return NextResponse.json({ valido: false, motivo: 'QR Code não informado' }, { status: 400 })
    }

    // TODO: 1. Buscar ingresso por qrHash no Supabase
    // const { data: ingresso } = await supabase
    //   .from('ingressos')
    //   .select('*, evento:eventos(*)')
    //   .eq('qrHash', qrHash)
    //   .single()

    // TODO: 2. Verificar se existe
    // if (!ingresso) return NextResponse.json({ valido: false, motivo: 'Ingresso não encontrado' })

    // TODO: 3. Verificar se já foi usado
    // if (ingresso.status === 'usado') {
    //   return NextResponse.json({ valido: false, motivo: 'ja_usado', ingresso })
    // }

    // TODO: 4. Verificar se pagamento está confirmado
    // if (ingresso.status !== 'pago') {
    //   return NextResponse.json({ valido: false, motivo: 'pagamento_pendente' })
    // }

    // TODO: 5. Marcar como usado (invalidar QR)
    // await supabase.from('ingressos')
    //   .update({ status: 'usado', usadoEm: new Date() })
    //   .eq('id', ingresso.id)

    // TODO: 6. Registrar log de entrada

    // PLACEHOLDER
    return NextResponse.json({
      valido: true,
      ingresso: {
        nome: 'Configure Supabase para validação real',
        tipo: 'pista',
        genero: 'masculino',
        evento: 'Evento Teste',
        serial: qrHash,
      },
    })

  } catch (error) {
    console.error('[API Validar]', error)
    return NextResponse.json({ valido: false, motivo: 'Erro interno' }, { status: 500 })
  }
}
