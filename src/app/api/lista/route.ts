import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { gerarQRCodeBase64 } from '@/lib/qr-generator'
import { enviarEmailLista } from '@/lib/email-ingresso'
import { randomUUID } from 'crypto'

// ============================================
// API: /api/lista
// Inscrição na Lista Amiga + envio QR Code por email
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventoId, nome, email, genero, origem } = body

    if (!eventoId || !nome || !email || !genero) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // 1. Verificar se evento existe e lista está ativa
    const { data: evento, error: errEvento } = await supabaseAdmin
      .from('eventos')
      .select('id, nome, data_evento, hora_abertura, lista_encerra_as, ativo')
      .eq('id', eventoId)
      .single()

    if (errEvento || !evento) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    if (!evento.ativo) {
      return NextResponse.json({ error: 'Este evento não está disponível' }, { status: 410 })
    }

    // Verificar se lista ainda está aberta
    if (evento.lista_encerra_as) {
      const agora = new Date()
      const encerra = new Date(evento.lista_encerra_as)
      if (!isNaN(encerra.getTime()) && agora > encerra) {
        return NextResponse.json({ error: 'A lista de inscrições já está encerrada' }, { status: 410 })
      }
    }

    // 2. Verificar duplicata
    const { data: existente } = await supabaseAdmin
      .from('lista_amiga')
      .select('id')
      .eq('evento_id', eventoId)
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Este email já está inscrito na lista deste evento' }, { status: 409 })
    }

    // 3. Gerar QR token único
    const qrToken = `LISTA-${randomUUID().replace(/-/g, '').toUpperCase().slice(0, 20)}`

    // 4. Salvar na lista_amiga
    const { data: inscricao, error: errInsert } = await supabaseAdmin
      .from('lista_amiga')
      .insert({
        evento_id: eventoId,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        genero,
        qr_token: qrToken,
        status: 'ativo',
        origem: origem ?? 'pagina_lista',
      })
      .select()
      .single()

    if (errInsert) {
      console.error('[lista] Erro ao salvar inscrição:', errInsert)
      return NextResponse.json({ error: 'Erro ao salvar inscrição' }, { status: 500 })
    }

    // 5. Gerar QR Code em base64 (salvo no banco para uso no admin — NÃO enviado por email)
    const qrBase64 = await gerarQRCodeBase64(qrToken)
    await supabaseAdmin
      .from('lista_amiga')
      .update({ qr_base64: qrBase64 })
      .eq('id', inscricao.id)
      .then(() => {}) // fire-and-forget, não bloqueia o fluxo

    // 6. Enviar email com instrução de acesso (sem QR Code)
    let emailEnviado = false
    try {
      const resultado = await enviarEmailLista({
        para:          email.trim().toLowerCase(),
        nomeCompleto:  nome.trim(),
        eventoNome:    evento.nome,
        eventoData:    evento.data_evento,
        eventoHora:    evento.hora_abertura ?? '22:00',
        genero,
      })

      if (resultado.sucesso) {
        emailEnviado = true
        await supabaseAdmin
          .from('lista_amiga')
          .update({ email_enviado: true, email_enviado_em: new Date().toISOString() })
          .eq('id', inscricao.id)
      } else {
        console.error('[lista] Falha ao enviar email:', resultado.erro)
      }
    } catch (e) {
      console.error('[lista] Exceção ao enviar email:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Nome adicionado à lista com sucesso',
      qrToken,
      email_enviado: emailEnviado,
    })
  } catch (error) {
    console.error('[API Lista]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventoId = searchParams.get('eventoId')
  const genero   = searchParams.get('genero')

  if (!eventoId) {
    return NextResponse.json({ lista: [], total: 0 })
  }

  let query = supabaseAdmin
    .from('lista_amiga')
    .select('*')
    .eq('evento_id', eventoId)
    .order('nome', { ascending: true })

  if (genero) {
    query = query.eq('genero', genero)
  }

  const { data, error } = await query

  if (error) {
    console.error('[lista GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lista: data ?? [], total: data?.length ?? 0 })
}
