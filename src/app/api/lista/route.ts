import { NextRequest, NextResponse } from 'next/server'

// ============================================
// API: /api/lista
// Inscrição na Lista Amiga + envio QR Code por email
// Configurar: SUPABASE + NODEMAILER + QRCODE
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventoId, nome, email, genero } = body

    if (!eventoId || !nome || !email || !genero) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // TODO: 1. Verificar se evento existe e lista está ativa (Supabase)
    // TODO: 2. Verificar limite de vagas por gênero
    // TODO: 3. Verificar se email já está na lista
    // TODO: 4. Gerar QR hash único
    const qrHash = `QR-MAANDHOO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // TODO: 5. Salvar no banco (Supabase)
    // await supabase.from('lista_amiga').insert({ eventoId, nome, email, genero, qrHash, status: 'ativo' })

    // TODO: 6. Gerar imagem QR Code
    // const qrImage = await QRCode.toDataURL(qrHash)

    // TODO: 7. Enviar email com QR Code
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject: `Lista Amiga Maandhoo — Seu QR Code`,
    //   html: gerarEmailLista(nome, evento, qrHash, qrImage, genero),
    // })

    return NextResponse.json({
      success: true,
      message: 'Nome adicionado à lista com sucesso',
      qrHash,
    })
  } catch (error) {
    console.error('[API Lista]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventoId = searchParams.get('eventoId')
  const genero = searchParams.get('genero')

  // TODO: buscar lista do Supabase
  // const { data } = await supabase
  //   .from('lista_amiga')
  //   .select('*')
  //   .eq('eventoId', eventoId)
  //   .eq('genero', genero || '')
  //   .order('nome', { ascending: true })

  return NextResponse.json({ lista: [], total: 0 })
}
