import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { gerarQRCodeBase64 } from '@/lib/qr-generator'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { randomUUID } from 'crypto'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

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
    // lista_encerra_as é do tipo TIMESTAMPTZ no banco (data + hora exata de encerramento)
    if (evento.lista_encerra_as) {
      const agora = new Date()
      const encerra = new Date(evento.lista_encerra_as)
      // Só bloqueia se a data de encerramento for válida e já passou
      if (!isNaN(encerra.getTime()) && agora > encerra) {
        return NextResponse.json({ error: 'A lista de inscrições já está encerrada' }, { status: 410 })
      }
    }

    // 2. Verificar se email já está na lista para este evento
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

    // 4. Salvar na tabela lista_amiga
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

    // 5. Gerar QR Code em base64
    const qrBase64 = await gerarQRCodeBase64(qrToken)

    // 6. Enviar email com QR Code
    const dataEvento = format(new Date(`${evento.data_evento}T00:00:00`), "EEEE, dd 'de' MMMM", { locale: ptBR })
    const dataAbrev  = format(new Date(`${evento.data_evento}T00:00:00`), "dd/MM/yyyy", { locale: ptBR })
    const generoLabel = genero === 'feminino'
      ? 'Feminino — Entrada Gratuita'
      : 'Masculino — R$ 50,00'

    const htmlEmail = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><title>Lista Amiga — ${evento.nome}</title></head>
<body style="margin:0;padding:0;background:#0d0a07;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1208,#0d0a07);border:1px solid rgba(201,168,76,0.3);padding:32px 36px 24px;text-align:center;border-radius:4px 4px 0 0;">
            <div style="font-size:9px;letter-spacing:6px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:8px;">Maandhoo Club</div>
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);margin:14px 0;"></div>
            <div style="font-size:22px;color:#e8ddd0;letter-spacing:1px;">LISTA AMIGA</div>
            <div style="font-size:12px;color:rgba(232,221,208,0.45);margin-top:6px;">Guarde este QR Code para a entrada</div>
          </td>
        </tr>

        <!-- CORPO -->
        <tr>
          <td style="background:#0f0c06;border:1px solid rgba(201,168,76,0.2);border-top:none;padding:28px 36px;text-align:center;">

            <!-- EVENTO -->
            <div style="margin-bottom:24px;">
              <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:8px;">Evento</div>
              <div style="font-size:22px;color:#e8ddd0;">${evento.nome}</div>
              <div style="font-size:12px;color:rgba(232,221,208,0.45);margin-top:4px;text-transform:capitalize;">${dataEvento} · ${evento.hora_abertura}</div>
            </div>

            <!-- QR CODE -->
            <div style="background:#fdf8f0;padding:14px;display:inline-block;border-radius:4px;margin-bottom:20px;">
              <img src="${qrBase64}" width="180" height="180" alt="QR Code Lista" style="display:block;"/>
            </div>
            <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.45);text-transform:uppercase;margin-bottom:24px;">Apresente na entrada</div>

            <!-- DADOS -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(201,168,76,0.12);padding-top:20px;">
              <tr>
                <td style="padding:8px 12px;text-align:left;">
                  <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:4px;">Portador</div>
                  <div style="font-size:14px;color:#e8ddd0;">${nome.trim()}</div>
                </td>
                <td style="padding:8px 12px;text-align:right;">
                  <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:4px;">Categoria</div>
                  <div style="font-size:13px;color:#C9A84C;">${generoLabel}</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:8px 12px;border-top:1px solid rgba(255,255,255,0.05);">
                  <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:4px;">Válido</div>
                  <div style="font-size:12px;color:rgba(232,221,208,0.55);">${dataAbrev} · Até 00:00 · Entrada única</div>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- AVISO -->
        <tr>
          <td style="background:#0d0a07;border:1px solid rgba(201,168,76,0.15);border-top:none;padding:16px 36px 20px;border-radius:0 0 4px 4px;">
            <div style="font-size:10px;color:rgba(232,221,208,0.35);line-height:1.7;text-align:center;">
              Este QR Code é pessoal e intransferível · Válido apenas até 00:00 do dia do evento<br/>
              Dúvidas? WhatsApp: (47) 99930-0283
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 0 0;text-align:center;">
            <div style="font-size:9px;color:rgba(232,221,208,0.15);letter-spacing:2px;">MAANDHOO CLUB · BALNEÁRIO CAMBORIÚ</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    let emailEnviado = false
    try {
      const { error: errEmail } = await getResend().emails.send({
        from: process.env.EMAIL_FROM ?? 'Maandhoo Club <onboarding@resend.dev>',
        to: email.trim(),
        subject: `🎟 Lista Amiga — ${evento.nome} · ${format(new Date(`${evento.data_evento}T00:00:00`), 'dd/MM', { locale: ptBR })}`,
        html: htmlEmail,
      })
      if (!errEmail) {
        emailEnviado = true
        await supabaseAdmin
          .from('lista_amiga')
          .update({ qr_enviado: true, qr_enviado_em: new Date().toISOString() })
          .eq('id', inscricao.id)
      } else {
        console.error('[lista] Falha ao enviar email:', errEmail)
      }
    } catch (e) {
      console.error('[lista] Erro ao enviar email:', e)
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
