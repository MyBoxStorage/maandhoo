import { Resend } from 'resend'
import { gerarQRCodeBuffer } from './qr-generator'
import { mascaraCPF, labelTipoIngresso } from './ingresso-utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

interface DadosEmail {
  para: string
  nomeCompleto: string
  cpf: string
  eventoNome: string
  eventoData: string
  eventoHora: string
  tipoIngresso: string
  qrToken: string
  ingressoId: string
  loteNome?: string
  precoPago: number
}

/** HTML do ingresso com QR Code via CID (compatível com Gmail/Outlook) */
function gerarHTMLIngresso(dados: DadosEmail & { dataFormatada: string; dataAbrev: string; cpfMascarado: string; tipoLabel: string; serial: string }): string {
  const { dataFormatada, dataAbrev, cpfMascarado, tipoLabel, serial } = dados

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Seu Ingresso — ${dados.eventoNome}</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0a07;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(135deg,#1c1408 0%,#0d0a07 100%);border:1px solid rgba(201,168,76,0.35);border-bottom:none;padding:40px 48px 32px;text-align:center;border-radius:6px 6px 0 0;">
      <div style="font-size:9px;letter-spacing:7px;color:rgba(201,168,76,0.65);text-transform:uppercase;margin-bottom:6px;">Maandhoo Club</div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent);margin:18px auto;max-width:200px;"></div>
      <div style="font-size:28px;color:#ede4d8;letter-spacing:5px;text-transform:uppercase;font-weight:normal;">Seu Ingresso</div>
      <div style="font-size:11px;color:rgba(201,168,76,0.45);letter-spacing:3px;text-transform:uppercase;margin-top:8px;">Acesso Exclusivo</div>
    </td>
  </tr>

  <!-- EVENTO -->
  <tr>
    <td style="background:#120e07;border-left:1px solid rgba(201,168,76,0.35);border-right:1px solid rgba(201,168,76,0.35);border-bottom:1px solid rgba(201,168,76,0.12);">
      <div style="background:rgba(201,168,76,0.07);padding:26px 48px;text-align:center;">
        <div style="font-size:9px;letter-spacing:5px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:10px;">Evento</div>
        <div style="font-size:30px;color:#ede4d8;letter-spacing:1px;font-weight:normal;">${dados.eventoNome}</div>
        <div style="font-size:13px;color:rgba(237,228,216,0.45);margin-top:8px;text-transform:capitalize;">${dataFormatada}</div>
      </div>
    </td>
  </tr>

  <!-- DETALHES: DATA / ABERTURA / TIPO -->
  <tr>
    <td style="background:#0f0b06;border-left:1px solid rgba(201,168,76,0.35);border-right:1px solid rgba(201,168,76,0.35);border-bottom:1px solid rgba(201,168,76,0.12);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="33%" style="padding:20px 16px 20px 48px;border-right:1px solid rgba(201,168,76,0.1);">
            <div style="font-size:8px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:7px;">Data</div>
            <div style="font-size:15px;color:#ede4d8;">${dataAbrev}</div>
          </td>
          <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid rgba(201,168,76,0.1);">
            <div style="font-size:8px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:7px;">Abertura</div>
            <div style="font-size:15px;color:#ede4d8;">${dados.eventoHora}</div>
          </td>
          <td width="34%" style="padding:20px 48px 20px 16px;text-align:right;">
            <div style="font-size:8px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:7px;">Tipo</div>
            <div style="font-size:13px;color:#C9A84C;letter-spacing:1px;">${tipoLabel}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- QR CODE + DADOS PESSOAIS -->
  <tr>
    <td style="background:#0f0b06;border-left:1px solid rgba(201,168,76,0.35);border-right:1px solid rgba(201,168,76,0.35);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <!-- QR CODE via CID -->
          <td width="220" style="padding:36px 20px 36px 48px;vertical-align:middle;">
            <div style="background:#fefbf5;padding:14px;border-radius:4px;display:inline-block;box-shadow:0 2px 12px rgba(0,0,0,0.4);">
              <img src="cid:qrcode@maandhoo" width="160" height="160" alt="QR Code" style="display:block;border:0;"/>
            </div>
            <div style="font-size:8px;color:rgba(201,168,76,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:10px;text-align:center;">Apresente na entrada</div>
          </td>
          <!-- DIVISOR -->
          <td width="20" style="padding:0;vertical-align:middle;text-align:center;">
            <div style="width:1px;height:200px;background:repeating-linear-gradient(to bottom,rgba(201,168,76,0.3) 0px,rgba(201,168,76,0.3) 5px,transparent 5px,transparent 10px);margin:0 auto;"></div>
          </td>
          <!-- DADOS DO PORTADOR -->
          <td style="padding:36px 48px 36px 20px;vertical-align:middle;">
            <div style="margin-bottom:20px;">
              <div style="font-size:8px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:6px;">Portador</div>
              <div style="font-size:16px;color:#ede4d8;line-height:1.4;">${dados.nomeCompleto}</div>
            </div>
            <div style="margin-bottom:20px;">
              <div style="font-size:8px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:6px;">CPF</div>
              <div style="font-size:13px;color:rgba(237,228,216,0.55);font-family:Courier New,monospace;letter-spacing:1px;">${cpfMascarado}</div>
            </div>
            ${dados.precoPago > 0
              ? `<div><div style="font-size:8px;letter-spacing:4px;color:rgba(201,168,76,0.5);text-transform:uppercase;margin-bottom:6px;">Valor Pago</div><div style="font-size:18px;color:#C9A84C;">R$ ${dados.precoPago.toFixed(2).replace('.', ',')}</div></div>`
              : `<div style="background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.3);padding:8px 14px;border-radius:3px;display:inline-block;"><div style="font-size:9px;letter-spacing:3px;color:#C9A84C;text-transform:uppercase;">Acesso Gratuito</div></div>`
            }
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PICOTE -->
  <tr>
    <td style="background:#0d0a07;border-left:1px solid rgba(201,168,76,0.35);border-right:1px solid rgba(201,168,76,0.35);padding:0;position:relative;">
      <div style="height:2px;background:repeating-linear-gradient(to right,rgba(201,168,76,0.4) 0,rgba(201,168,76,0.4) 8px,transparent 8px,transparent 16px);"></div>
    </td>
  </tr>

  <!-- RODAPÉ: SERIAL -->
  <tr>
    <td style="background:#0a0805;border:1px solid rgba(201,168,76,0.35);border-top:none;padding:18px 48px 22px;border-radius:0 0 6px 6px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:8px;letter-spacing:3px;color:rgba(201,168,76,0.35);text-transform:uppercase;">Serial</div>
            <div style="font-size:10px;color:rgba(237,228,216,0.25);font-family:Courier New,monospace;margin-top:4px;letter-spacing:1px;">MAANDHOO-${serial}</div>
          </td>
          <td style="text-align:right;">
            <div style="font-size:8px;letter-spacing:2px;color:rgba(201,168,76,0.35);text-transform:uppercase;">Uso Único · Intransferível</div>
            <div style="font-size:9px;color:rgba(237,228,216,0.2);margin-top:4px;">Válido até 06h do dia seguinte</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- AVISO -->
  <tr>
    <td style="padding:24px 0 8px;">
      <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:4px;padding:18px 24px;">
        <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:10px;">Informações Importantes</div>
        <div style="font-size:12px;color:rgba(237,228,216,0.45);line-height:1.8;">
          &#8226; Ingresso pessoal e intransferível. Apresente o QR Code na entrada.<br/>
          &#8226; O QR Code é de uso único — invalidado automaticamente após leitura.<br/>
          &#8226; Dúvidas? WhatsApp: <span style="color:rgba(201,168,76,0.7);">(47) 99930-0283</span>
        </div>
      </div>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:14px 0 4px;text-align:center;">
      <div style="font-size:9px;color:rgba(237,228,216,0.15);letter-spacing:3px;text-transform:uppercase;">Maandhoo Club &middot; Balneário Camboriú</div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

/** Envia email com ingresso para o portador */
export async function enviarEmailIngresso(dados: DadosEmail): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    // QR Code como Buffer (attachment CID — funciona em Gmail, Outlook, Apple Mail)
    const qrBuffer = await gerarQRCodeBuffer(dados.qrToken)

    const dataISO = dados.eventoData.length === 10 ? `${dados.eventoData}T00:00:00` : dados.eventoData
    const dataFormatada = format(new Date(dataISO), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const dataAbrev = format(new Date(dataISO), 'dd/MM/yyyy', { locale: ptBR })
    const cpfMascarado = mascaraCPF(dados.cpf)
    const tipoLabel = labelTipoIngresso(dados.tipoIngresso)
    const serial = dados.ingressoId.slice(0, 8).toUpperCase()
    const dataSlug = dataAbrev.replace(/\//g, '')

    const html = gerarHTMLIngresso({
      ...dados,
      dataFormatada,
      dataAbrev,
      cpfMascarado,
      tipoLabel,
      serial: `${serial}-${dataSlug}`,
    })

    const { error } = await getResend().emails.send({
      from: process.env.EMAIL_FROM ?? 'Maandhoo Club <noreply@maandhoo.com.br>',
      to: dados.para,
      subject: `Seu ingresso — ${dados.eventoNome} · ${dataAbrev}`,
      html,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrBuffer.toString('base64'),
          contentType: 'image/png',
          contentId: 'qrcode@maandhoo',
        },
      ],
    })

    if (error) return { sucesso: false, erro: error.message }
    return { sucesso: true }
  } catch (err) {
    return { sucesso: false, erro: String(err) }
  }
}

/** Envia email de camarote com múltiplos links de cadastro */
export async function enviarEmailCamarote(params: {
  para: string
  nomeResponsavel: string
  eventoNome: string
  eventoData: string
  camaroteId: string
  links: Array<{ numero: number; url: string }>
}): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const dataISO = params.eventoData.length === 10 ? `${params.eventoData}T00:00:00` : params.eventoData
    const dataFormatada = format(new Date(dataISO), "EEEE, dd 'de' MMMM", { locale: ptBR })
    const dataAbrev = format(new Date(dataISO), 'dd/MM', { locale: ptBR })

    const linksHTML = params.links.map(l => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(201,168,76,0.08);">
          <div style="font-size:10px;letter-spacing:3px;color:rgba(201,168,76,0.45);text-transform:uppercase;margin-bottom:6px;">Convidado ${l.numero}</div>
          <div style="background:#0a0805;border:1px solid rgba(201,168,76,0.2);border-radius:3px;padding:10px 14px;display:flex;align-items:center;gap:10px;">
            <span style="font-family:Courier New,monospace;font-size:11px;color:rgba(237,228,216,0.6);word-break:break-all;flex:1;">${l.url}</span>
          </div>
          <div style="margin-top:6px;">
            <a href="${l.url}" style="font-size:10px;color:rgba(201,168,76,0.6);text-decoration:underline;letter-spacing:1px;">Abrir link &rarr;</a>
          </div>
        </td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0d0a07;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
  <tr><td style="background:linear-gradient(135deg,#1c1408,#0d0a07);border:1px solid rgba(201,168,76,0.35);padding:40px 48px;border-radius:6px 6px 0 0;text-align:center;">
    <div style="font-size:9px;letter-spacing:7px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:6px;">Maandhoo Club</div>
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent);margin:16px auto 22px;max-width:180px;"></div>
    <div style="font-size:24px;color:#ede4d8;letter-spacing:3px;text-transform:uppercase;">Ingressos de Camarote</div>
    <div style="font-size:12px;color:rgba(237,228,216,0.4);margin-top:8px;text-transform:capitalize;">${params.eventoNome} &middot; ${dataFormatada}</div>
  </td></tr>
  <tr><td style="background:#0f0b06;border:1px solid rgba(201,168,76,0.25);border-top:none;padding:32px 48px 36px;">
    <div style="font-size:14px;color:rgba(237,228,216,0.6);line-height:1.9;margin-bottom:28px;">
      Olá, <strong style="color:#ede4d8;">${params.nomeResponsavel}</strong>!<br/>
      Seu camarote está confirmado para <strong style="color:#C9A84C;">${params.eventoNome}</strong> em <strong style="color:#C9A84C;">${dataAbrev}</strong>.<br/>
      Encaminhe o link individual para cada convidado — cada um fará seu próprio cadastro e receberá seu QR Code por email.
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">${linksHTML}</table>
    <div style="margin-top:24px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);padding:16px 20px;border-radius:4px;">
      <div style="font-size:9px;color:rgba(201,168,76,0.5);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Atenção</div>
      <div style="font-size:11px;color:rgba(237,228,216,0.35);line-height:1.7;">
        Os links são de uso único e expiram após o cadastro. Cada pessoa deve acessar o seu próprio link individualmente.
      </div>
    </div>
  </td></tr>
  <tr><td style="padding:18px 0 4px;text-align:center;">
    <div style="font-size:9px;color:rgba(237,228,216,0.12);letter-spacing:3px;text-transform:uppercase;">Maandhoo Club &middot; Balneário Camboriú</div>
  </td></tr>
</table>
</td></tr>
</table></body></html>`

    const { error } = await getResend().emails.send({
      from: process.env.EMAIL_FROM ?? 'Maandhoo Club <noreply@maandhoo.com.br>',
      to: params.para,
      subject: `Ingressos do Camarote — ${params.eventoNome} · ${dataAbrev}`,
      html,
    })

    if (error) return { sucesso: false, erro: error.message }
    return { sucesso: true }
  } catch (err) {
    return { sucesso: false, erro: String(err) }
  }
}
