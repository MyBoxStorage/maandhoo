import { Resend } from 'resend'
import { gerarQRCodeBase64 } from './qr-generator'
import { mascaraCPF, labelTipoIngresso } from './ingresso-utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

interface DadosEmail {
  para: string
  nomeCompleto: string
  cpf: string
  eventoNome: string
  eventoData: string   // ISO string
  eventoHora: string
  tipoIngresso: string
  qrToken: string
  ingressoId: string
  loteNome?: string
  precoPago: number
}

/**
 * Gera o HTML do ingresso ultra bonito — tema Maandhoo
 */
async function gerarHTMLIngresso(dados: DadosEmail): Promise<string> {
  const qrBase64 = await gerarQRCodeBase64(dados.qrToken)
  const dataFormatada = format(new Date(dados.eventoData), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const dataAbrev = format(new Date(dados.eventoData), 'dd/MM/yyyy', { locale: ptBR })
  const cpfMascarado = mascaraCPF(dados.cpf)
  const tipoLabel = labelTipoIngresso(dados.tipoIngresso)
  const serial = dados.ingressoId.slice(0, 8).toUpperCase()

  // SVG da logo elefante inline
  const logoSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 218" width="54" height="59"
      fill="none" stroke="#C9A84C" stroke-width="1.8" stroke-linejoin="miter" stroke-linecap="butt">
      <line x1="2" y1="55" x2="38" y2="15"/><line x1="38" y1="15" x2="70" y2="35"/>
      <line x1="70" y1="35" x2="58" y2="75"/><line x1="58" y1="75" x2="22" y2="95"/>
      <line x1="22" y1="95" x2="2" y2="75"/><line x1="2" y1="75" x2="2" y2="55"/>
      <line x1="2" y1="55" x2="22" y2="95"/><line x1="38" y1="15" x2="22" y2="95"/>
      <line x1="2" y1="55" x2="58" y2="75"/><line x1="22" y1="95" x2="70" y2="35"/>
      <line x1="198" y1="55" x2="162" y2="15"/><line x1="162" y1="15" x2="130" y2="35"/>
      <line x1="130" y1="35" x2="142" y2="75"/><line x1="142" y1="75" x2="178" y2="95"/>
      <line x1="178" y1="95" x2="198" y2="75"/><line x1="198" y1="75" x2="198" y2="55"/>
      <line x1="198" y1="55" x2="178" y2="95"/><line x1="162" y1="15" x2="178" y2="95"/>
      <line x1="198" y1="55" x2="142" y2="75"/><line x1="178" y1="95" x2="130" y2="35"/>
      <line x1="70" y1="35" x2="100" y2="24"/><line x1="100" y1="24" x2="130" y2="35"/>
      <line x1="70" y1="35" x2="130" y2="35"/><line x1="70" y1="35" x2="75" y2="65"/>
      <line x1="130" y1="35" x2="125" y2="65"/><line x1="75" y1="65" x2="125" y2="65"/>
      <line x1="100" y1="24" x2="75" y2="65"/><line x1="100" y1="24" x2="125" y2="65"/>
      <line x1="70" y1="35" x2="100" y2="45"/><line x1="130" y1="35" x2="100" y2="45"/>
      <line x1="100" y1="45" x2="100" y2="24"/><line x1="58" y1="75" x2="75" y2="65"/>
      <line x1="58" y1="75" x2="62" y2="105"/><line x1="75" y1="65" x2="62" y2="105"/>
      <line x1="62" y1="105" x2="78" y2="115"/><line x1="75" y1="65" x2="78" y2="115"/>
      <line x1="142" y1="75" x2="125" y2="65"/><line x1="142" y1="75" x2="138" y2="105"/>
      <line x1="125" y1="65" x2="138" y2="105"/><line x1="138" y1="105" x2="122" y2="115"/>
      <line x1="125" y1="65" x2="122" y2="115"/><line x1="75" y1="65" x2="85" y2="95"/>
      <line x1="125" y1="65" x2="115" y2="95"/><line x1="85" y1="95" x2="100" y2="88"/>
      <line x1="115" y1="95" x2="100" y2="88"/><line x1="100" y1="88" x2="100" y2="65"/>
      <line x1="75" y1="65" x2="100" y2="65"/><line x1="125" y1="65" x2="100" y2="65"/>
      <line x1="62" y1="105" x2="78" y2="115"/><line x1="78" y1="115" x2="85" y2="95"/>
      <line x1="85" y1="95" x2="115" y2="95"/><line x1="115" y1="95" x2="122" y2="115"/>
      <line x1="122" y1="115" x2="138" y2="105"/>
      <polygon points="85,95 100,88 115,95 108,120 92,120" fill="none"/>
      <polygon points="92,120 108,120 105,148 95,148" fill="none"/>
      <polygon points="95,148 105,148 108,170 92,175" fill="none"/>
      <polygon points="92,175 108,170 110,190 94,195 86,182" fill="none"/>
    </svg>
  `

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Seu Ingresso — ${dados.eventoNome}</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0a07;font-family:'Georgia',serif;">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER COM LOGO -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1208 0%,#0d0a07 100%);border:1px solid rgba(201,168,76,0.3);border-bottom:none;padding:36px 40px 28px;text-align:center;border-radius:4px 4px 0 0;">
            <div style="margin-bottom:14px;">${logoSVG}</div>
            <div style="font-family:'Georgia',serif;font-size:11px;letter-spacing:6px;color:rgba(201,168,76,0.7);text-transform:uppercase;margin-bottom:6px;">Maandhoo Club</div>
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);margin:18px 0;"></div>
            <div style="font-family:'Georgia',serif;font-size:26px;color:#e8ddd0;letter-spacing:2px;font-weight:normal;">SEU INGRESSO</div>
          </td>
        </tr>

        <!-- CORPO DO INGRESSO -->
        <tr>
          <td style="background:linear-gradient(180deg,#161008 0%,#0f0c06 100%);border-left:1px solid rgba(201,168,76,0.3);border-right:1px solid rgba(201,168,76,0.3);padding:0;">

            <!-- NOME DO EVENTO -->
            <div style="background:rgba(201,168,76,0.08);border-top:1px solid rgba(201,168,76,0.15);border-bottom:1px solid rgba(201,168,76,0.15);padding:24px 40px;text-align:center;">
              <div style="font-size:10px;letter-spacing:5px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:10px;">Evento</div>
              <div style="font-size:28px;color:#e8ddd0;letter-spacing:1px;font-weight:normal;">${dados.eventoNome}</div>
              <div style="font-size:13px;color:rgba(232,221,208,0.55);margin-top:6px;text-transform:capitalize;">${dataFormatada}</div>
            </div>

            <!-- DADOS: DATA + HORÁRIO + TIPO -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid rgba(201,168,76,0.12);">
              <tr>
                <td width="33%" style="padding:22px 16px 22px 40px;border-right:1px solid rgba(201,168,76,0.1);">
                  <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:6px;">Data</div>
                  <div style="font-size:15px;color:#e8ddd0;">${dataAbrev}</div>
                </td>
                <td width="33%" style="padding:22px 16px;border-right:1px solid rgba(201,168,76,0.1);text-align:center;">
                  <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:6px;">Abertura</div>
                  <div style="font-size:15px;color:#e8ddd0;">${dados.eventoHora}</div>
                </td>
                <td width="34%" style="padding:22px 40px 22px 16px;text-align:right;">
                  <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:6px;">Tipo</div>
                  <div style="font-size:13px;color:#C9A84C;">${tipoLabel}</div>
                </td>
              </tr>
            </table>

            <!-- QR CODE + DADOS PESSOAIS -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- QR CODE -->
                <td width="200" style="padding:32px 24px 32px 40px;vertical-align:middle;">
                  <div style="background:#fdf8f0;padding:12px;display:inline-block;border-radius:3px;">
                    <img src="${qrBase64}" width="156" height="156" alt="QR Code do Ingresso" style="display:block;"/>
                  </div>
                  <div style="font-size:9px;color:rgba(201,168,76,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:10px;text-align:center;">Apresente na entrada</div>
                </td>

                <!-- DIVISOR TRACEJADO VERTICAL -->
                <td width="1" style="padding:0;vertical-align:middle;">
                  <div style="width:1px;height:180px;background:repeating-linear-gradient(to bottom,rgba(201,168,76,0.25) 0px,rgba(201,168,76,0.25) 6px,transparent 6px,transparent 12px);margin:auto;"></div>
                </td>

                <!-- DADOS PESSOAIS -->
                <td style="padding:32px 40px 32px 24px;vertical-align:middle;">
                  <div style="margin-bottom:16px;">
                    <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:5px;">Portador</div>
                    <div style="font-size:15px;color:#e8ddd0;line-height:1.4;">${dados.nomeCompleto}</div>
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:5px;">CPF</div>
                    <div style="font-size:14px;color:rgba(232,221,208,0.7);font-family:monospace;">${cpfMascarado}</div>
                  </div>
                  ${dados.loteNome ? `
                  <div style="margin-bottom:16px;">
                    <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:5px;">Lote</div>
                    <div style="font-size:13px;color:rgba(232,221,208,0.7);">${dados.loteNome}</div>
                  </div>` : ''}
                  ${dados.precoPago > 0 ? `
                  <div>
                    <div style="font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.55);text-transform:uppercase;margin-bottom:5px;">Valor Pago</div>
                    <div style="font-size:16px;color:#C9A84C;">R$ ${dados.precoPago.toFixed(2).replace('.', ',')}</div>
                  </div>` : `
                  <div>
                    <div style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);padding:6px 12px;border-radius:2px;display:inline-block;">
                      <div style="font-size:9px;letter-spacing:3px;color:#C9A84C;text-transform:uppercase;">Acesso Gratuito</div>
                    </div>
                  </div>`}
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- LINHA PICOTADA (divisor) -->
        <tr>
          <td style="background:#0d0a07;border-left:1px solid rgba(201,168,76,0.3);border-right:1px solid rgba(201,168,76,0.3);padding:0 0;position:relative;">
            <div style="height:1px;background:repeating-linear-gradient(to right,rgba(201,168,76,0.3) 0px,rgba(201,168,76,0.3) 8px,transparent 8px,transparent 16px);"></div>
            <div style="position:absolute;left:-12px;top:-12px;width:24px;height:24px;background:#0d0a07;border-radius:50%;border:1px solid rgba(201,168,76,0.3);"></div>
            <div style="position:absolute;right:-12px;top:-12px;width:24px;height:24px;background:#0d0a07;border-radius:50%;border:1px solid rgba(201,168,76,0.3);"></div>
          </td>
        </tr>

        <!-- RODAPÉ DO INGRESSO — SERIAL -->
        <tr>
          <td style="background:linear-gradient(180deg,#0f0c06 0%,#0d0a07 100%);border:1px solid rgba(201,168,76,0.3);border-top:none;padding:18px 40px 24px;border-radius:0 0 4px 4px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.4);text-transform:uppercase;">Serial</div>
                  <div style="font-size:11px;color:rgba(232,221,208,0.35);font-family:monospace;margin-top:3px;">MAANDHOO-${serial}-${dataAbrev.replace(/\//g,'')}
                  </div>
                </td>
                <td style="text-align:right;">
                  <div style="font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.4);text-transform:uppercase;">Uso único · Intransferível</div>
                  <div style="font-size:9px;color:rgba(232,221,208,0.25);margin-top:3px;">Válido até 06h do dia seguinte</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- AVISO IMPORTANTE -->
        <tr>
          <td style="padding:28px 0 8px;">
            <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:3px;padding:16px 24px;">
              <div style="font-size:10px;letter-spacing:3px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:8px;">Informações Importantes</div>
              <div style="font-size:12px;color:rgba(232,221,208,0.5);line-height:1.7;">
                • Este ingresso é pessoal e intransferível. Apresente o QR Code na entrada.<br/>
                • O QR Code é de uso único — após a leitura, o ingresso é invalidado automaticamente.<br/>
                • Em caso de dúvidas, entre em contato via WhatsApp: (47) 99930-0283.
              </div>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:16px 0 0;text-align:center;">
            <div style="font-size:10px;color:rgba(232,221,208,0.2);letter-spacing:2px;">MAANDHOO CLUB · BALNEÁRIO CAMBORIÚ</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`
}

/**
 * Envia email com ingresso para o portador
 */
export async function enviarEmailIngresso(dados: DadosEmail): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const html = await gerarHTMLIngresso(dados)
    const dataFormatada = format(new Date(dados.eventoData), "dd/MM", { locale: ptBR })

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Maandhoo Club <onboarding@resend.dev>',
      to: dados.para,
      subject: `🎟 Seu ingresso — ${dados.eventoNome} · ${dataFormatada}`,
      html,
    })

    if (error) return { sucesso: false, erro: error.message }
    return { sucesso: true }
  } catch (err) {
    return { sucesso: false, erro: String(err) }
  }
}

/**
 * Envia email de camarote com múltiplos links de cadastro
 */
export async function enviarEmailCamarote(params: {
  para: string
  nomeResponsavel: string
  eventoNome: string
  eventoData: string
  camaroteId: string
  links: Array<{ numero: number; url: string }>
}): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const dataFormatada = format(new Date(params.eventoData), "EEEE, dd 'de' MMMM", { locale: ptBR })

    const linksHTML = params.links.map(l => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(201,168,76,0.1);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;color:rgba(232,221,208,0.5);">Convidado ${l.numero}</td>
              <td style="text-align:right;">
                <a href="${l.url}" style="background:rgba(201,168,76,0.85);color:#0d0a07;padding:8px 20px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;border-radius:2px;font-weight:bold;">
                  Cadastrar &amp; Receber QR
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('')

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0d0a07;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1208,#0d0a07);border:1px solid rgba(201,168,76,0.3);padding:36px 40px;border-radius:4px;text-align:center;">
            <div style="font-size:9px;letter-spacing:6px;color:rgba(201,168,76,0.6);text-transform:uppercase;margin-bottom:10px;">Maandhoo Club</div>
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);margin:14px 0 20px;"></div>
            <div style="font-size:22px;color:#e8ddd0;">Ingressos de Camarote</div>
            <div style="font-size:13px;color:rgba(232,221,208,0.45);margin-top:8px;text-transform:capitalize;">${params.eventoNome} · ${dataFormatada}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#0f0c06;border:1px solid rgba(201,168,76,0.2);border-top:none;padding:30px 40px;">
            <div style="font-size:13px;color:rgba(232,221,208,0.65);line-height:1.8;margin-bottom:24px;">
              Olá, <strong style="color:#e8ddd0;">${params.nomeResponsavel}</strong>!<br/>
              Seu camarote foi confirmado. Abaixo estão os links individuais para cada convidado.
              Cada link é <strong style="color:#C9A84C;">único e intransferível</strong> — encaminhe um para cada pessoa do seu grupo.
              Ao acessar o link, cada convidado fará seu cadastro e receberá o QR Code por email.
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${linksHTML}
            </table>
            <div style="margin-top:24px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);padding:14px 20px;border-radius:3px;">
              <div style="font-size:10px;color:rgba(201,168,76,0.5);letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">Atenção</div>
              <div style="font-size:11px;color:rgba(232,221,208,0.4);line-height:1.7;">
                Os links expiram após o uso. Cada pessoa deve acessar o seu próprio link para cadastrar seus dados e receber o QR Code individualmente.
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 0 0;text-align:center;">
            <div style="font-size:10px;color:rgba(232,221,208,0.15);letter-spacing:2px;">MAANDHOO CLUB · BALNEÁRIO CAMBORIÚ</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Maandhoo Club <onboarding@resend.dev>',
      to: params.para,
      subject: `🎪 Ingressos do Camarote — ${params.eventoNome}`,
      html,
    })

    if (error) return { sucesso: false, erro: error.message }
    return { sucesso: true }
  } catch (err) {
    return { sucesso: false, erro: String(err) }
  }
}
