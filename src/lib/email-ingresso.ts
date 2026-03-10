import { Resend } from 'resend'
import { mascaraCPF, labelTipoIngresso } from './ingresso-utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = () =>
  process.env.EMAIL_FROM ?? 'Maandhoo Club <noreply@bravosbrasil.com.br>'

const SITE_URL = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maandhoo.vercel.app'

// ─── Estilos compartilhados ────────────────────────────────────────
const BG_BODY    = '#0d0a07'
const BG_HEADER  = 'linear-gradient(135deg,#1c1408 0%,#0d0a07 100%)'
const BG_SECTION = '#0f0b06'
const BG_FOOTER  = '#0a0805'
const GOLD       = '#C9A84C'
const GOLD_20    = 'rgba(201,168,76,0.20)'
const GOLD_30    = 'rgba(201,168,76,0.30)'
const GOLD_35    = 'rgba(201,168,76,0.35)'
const GOLD_50    = 'rgba(201,168,76,0.50)'
const GOLD_60    = 'rgba(201,168,76,0.60)'
const CREAM      = '#ede4d8'
const CREAM_40   = 'rgba(237,228,216,0.40)'
const CREAM_55   = 'rgba(237,228,216,0.55)'
const CREAM_20   = 'rgba(237,228,216,0.20)'
const CREAM_12   = 'rgba(237,228,216,0.12)'

// ─── Interface ─────────────────────────────────────────────────────
interface DadosEmailIngresso {
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

interface DadosEmailLista {
  para: string
  nomeCompleto: string
  eventoNome: string
  eventoData: string
  eventoHora: string
  genero: string
  qrBase64: string
  qrToken: string
}

interface DadosEmailCamarote {
  para: string
  nomeResponsavel: string
  eventoNome: string
  eventoData: string
  camaroteId: string
  links: Array<{ numero: number; url: string }>
}

// ─────────────────────────────────────────────────────────────────
// BLOCO AUXILIAR: Layout base email
// ─────────────────────────────────────────────────────────────────
function wrapEmail(conteudo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG_BODY};font-family:Georgia,'Times New Roman',serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background:${BG_BODY};padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
      style="max-width:600px;width:100%;">
      ${conteudo}
      <!-- FOOTER -->
      <tr>
        <td style="padding:20px 0 4px;text-align:center;">
          <div style="font-size:8px;color:${CREAM_12};letter-spacing:3px;text-transform:uppercase;">
            Maandhoo Club &middot; Balneário Camboriú &middot; SC
          </div>
          <div style="font-size:8px;color:rgba(237,228,216,0.08);margin-top:4px;letter-spacing:1px;">
            Este é um email automático — não responda a esta mensagem.
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function cabecalhoEmail(titulo: string, subtitulo?: string): string {
  return `
  <tr>
    <td style="background:${BG_HEADER};border:1px solid ${GOLD_35};border-bottom:none;
      padding:44px 48px 36px;text-align:center;border-radius:6px 6px 0 0;">
      <div style="font-size:9px;letter-spacing:8px;color:${GOLD_60};text-transform:uppercase;margin-bottom:4px;">Maandhoo Club</div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD_50},transparent);
        margin:20px auto;max-width:220px;"></div>
      <div style="font-size:26px;color:${CREAM};letter-spacing:5px;text-transform:uppercase;font-weight:normal;">${titulo}</div>
      ${subtitulo ? `<div style="font-size:10px;color:${GOLD_50};letter-spacing:3px;text-transform:uppercase;margin-top:10px;">${subtitulo}</div>` : ''}
    </td>
  </tr>`
}

function picoteEmail(): string {
  return `
  <tr>
    <td style="background:${BG_BODY};border-left:1px solid ${GOLD_35};border-right:1px solid ${GOLD_35};padding:0;">
      <div style="height:2px;background:repeating-linear-gradient(to right,${GOLD_50} 0,${GOLD_50} 8px,transparent 8px,transparent 16px);"></div>
    </td>
  </tr>`
}

function rodapeSerial(serial: string): string {
  return `
  <tr>
    <td style="background:${BG_FOOTER};border:1px solid ${GOLD_35};border-top:none;
      padding:18px 48px 22px;border-radius:0 0 6px 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <div style="font-size:7px;letter-spacing:3px;color:rgba(201,168,76,0.30);text-transform:uppercase;">Serial</div>
            <div style="font-size:9px;color:${CREAM_20};font-family:'Courier New',Courier,monospace;
              margin-top:4px;letter-spacing:1px;">MAANDHOO-${serial}</div>
          </td>
          <td style="text-align:right;">
            <div style="font-size:7px;letter-spacing:2px;color:rgba(201,168,76,0.30);text-transform:uppercase;">Uso Único &middot; Intransferível</div>
            <div style="font-size:9px;color:rgba(237,228,216,0.18);margin-top:4px;">Válido até 06h do dia seguinte</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ─────────────────────────────────────────────────────────────────
// HTML: Ingresso Individual
// ─────────────────────────────────────────────────────────────────
function gerarHTMLIngresso(dados: DadosEmailIngresso & {
  dataFormatada: string; dataAbrev: string; cpfMascarado: string
  tipoLabel: string; serial: string
}): string {
  const { dataFormatada, dataAbrev, cpfMascarado, tipoLabel, serial } = dados
  const acessoUrl = `${SITE_URL()}/acesso?link=${dados.qrToken}`

  const corpo = `
  ${cabecalhoEmail('Seu Ingresso', 'Acesso Exclusivo')}

  <!-- EVENTO -->
  <tr>
    <td style="background:rgba(201,168,76,0.06);border-left:1px solid ${GOLD_35};
      border-right:1px solid ${GOLD_35};border-bottom:1px solid ${GOLD_20};padding:28px 48px;text-align:center;">
      <div style="font-size:8px;letter-spacing:5px;color:${GOLD_50};text-transform:uppercase;margin-bottom:10px;">Evento</div>
      <div style="font-size:28px;color:${CREAM};letter-spacing:1px;font-weight:normal;">${dados.eventoNome}</div>
      <div style="font-size:12px;color:${CREAM_40};margin-top:8px;text-transform:capitalize;">${dataFormatada}</div>
    </td>
  </tr>

  <!-- DATA / HORA / TIPO -->
  <tr>
    <td style="background:${BG_SECTION};border-left:1px solid ${GOLD_35};
      border-right:1px solid ${GOLD_35};border-bottom:1px solid ${GOLD_20};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" style="padding:20px 16px 20px 48px;border-right:1px solid rgba(201,168,76,0.08);">
            <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:7px;">Data</div>
            <div style="font-size:14px;color:${CREAM};">${dataAbrev}</div>
          </td>
          <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid rgba(201,168,76,0.08);">
            <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:7px;">Abertura</div>
            <div style="font-size:14px;color:${CREAM};">${dados.eventoHora}</div>
          </td>
          <td width="34%" style="padding:20px 48px 20px 16px;text-align:right;">
            <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:7px;">Tipo</div>
            <div style="font-size:12px;color:${GOLD};letter-spacing:1px;">${tipoLabel}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ACESSO + DADOS DO PORTADOR -->
  <tr>
    <td style="background:${BG_SECTION};border-left:1px solid ${GOLD_35};border-right:1px solid ${GOLD_35};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Botão QR -->
          <td width="220" style="padding:36px 20px 36px 48px;vertical-align:middle;text-align:center;">
            <div style="background:rgba(201,168,76,0.07);border:1px solid ${GOLD_30};border-radius:5px;padding:26px 18px;">
              <div style="font-size:8px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:14px;">QR Code</div>
              <a href="${acessoUrl}"
                style="display:inline-block;background:${GOLD};color:#0d0a07;padding:13px 22px;
                  border-radius:3px;text-decoration:none;font-size:9px;letter-spacing:3px;
                  text-transform:uppercase;font-weight:bold;font-family:Georgia,serif;">
                Acessar Ingresso
              </a>
              <div style="font-size:9px;color:${CREAM_40};line-height:1.7;margin-top:14px;">
                Faça login na sua conta<br/>para exibir o QR Code
              </div>
            </div>
            <div style="font-size:7px;color:rgba(201,168,76,0.30);letter-spacing:2px;text-transform:uppercase;margin-top:10px;">Apresente na entrada</div>
          </td>
          <!-- Separador pontilhado -->
          <td width="1" style="padding:0 10px;vertical-align:middle;">
            <div style="width:1px;height:180px;background:repeating-linear-gradient(to bottom,
              ${GOLD_30} 0px,${GOLD_30} 5px,transparent 5px,transparent 10px);margin:0 auto;"></div>
          </td>
          <!-- Dados do portador -->
          <td style="padding:36px 48px 36px 16px;vertical-align:middle;">
            <div style="margin-bottom:20px;">
              <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:6px;">Portador</div>
              <div style="font-size:15px;color:${CREAM};line-height:1.4;">${dados.nomeCompleto}</div>
            </div>
            <div style="margin-bottom:20px;">
              <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:6px;">CPF</div>
              <div style="font-size:12px;color:${CREAM_55};font-family:'Courier New',Courier,monospace;letter-spacing:1px;">${cpfMascarado}</div>
            </div>
            ${dados.precoPago > 0
              ? `<div>
                  <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:6px;">Valor Pago</div>
                  <div style="font-size:17px;color:${GOLD};">R$ ${dados.precoPago.toFixed(2).replace('.', ',')}</div>
                </div>`
              : `<div style="background:rgba(201,168,76,0.10);border:1px solid ${GOLD_30};padding:9px 16px;border-radius:3px;display:inline-block;">
                  <div style="font-size:8px;letter-spacing:3px;color:${GOLD};text-transform:uppercase;">Acesso Gratuito</div>
                </div>`
            }
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${picoteEmail()}
  ${rodapeSerial(serial)}

  <!-- INFORMAÇÕES IMPORTANTES -->
  <tr>
    <td style="padding:22px 0 0;">
      <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.14);
        border-radius:4px;padding:18px 24px;">
        <div style="font-size:8px;letter-spacing:3px;color:${GOLD_50};text-transform:uppercase;margin-bottom:10px;">Informações Importantes</div>
        <div style="font-size:11px;color:rgba(237,228,216,0.40);line-height:1.9;">
          &#8226; Ingresso pessoal e intransferível — documento com foto obrigatório na entrada.<br/>
          &#8226; O QR Code é de uso único e invalidado automaticamente após a leitura.<br/>
          &#8226; Dúvidas? WhatsApp: <span style="color:rgba(201,168,76,0.65);">(47) 99930-0283</span>
        </div>
      </div>
    </td>
  </tr>`

  return wrapEmail(corpo)
}

// ─────────────────────────────────────────────────────────────────
// HTML: Lista Amiga
// ─────────────────────────────────────────────────────────────────
function gerarHTMLLista(dados: DadosEmailLista & {
  dataFormatada: string; dataAbrev: string; generoLabel: string; serial: string
}): string {
  const { dataFormatada, dataAbrev, generoLabel, serial } = dados

  const corpo = `
  ${cabecalhoEmail('Lista Amiga', 'Seu QR Code de Acesso')}

  <!-- EVENTO -->
  <tr>
    <td style="background:rgba(201,168,76,0.06);border-left:1px solid ${GOLD_35};
      border-right:1px solid ${GOLD_35};border-bottom:1px solid ${GOLD_20};padding:26px 48px;text-align:center;">
      <div style="font-size:8px;letter-spacing:5px;color:${GOLD_50};text-transform:uppercase;margin-bottom:10px;">Evento</div>
      <div style="font-size:26px;color:${CREAM};letter-spacing:1px;font-weight:normal;">${dados.eventoNome}</div>
      <div style="font-size:12px;color:${CREAM_40};margin-top:8px;text-transform:capitalize;">${dataFormatada} &middot; ${dados.eventoHora}</div>
    </td>
  </tr>

  <!-- QR CODE -->
  <tr>
    <td style="background:${BG_SECTION};border-left:1px solid ${GOLD_35};
      border-right:1px solid ${GOLD_35};border-bottom:1px solid ${GOLD_20};padding:36px 48px;text-align:center;">
      <div style="font-size:8px;letter-spacing:5px;color:${GOLD_50};text-transform:uppercase;margin-bottom:18px;">Seu QR Code</div>
      <div style="display:inline-block;background:#fdf9f2;padding:14px;border-radius:4px;
        border:2px solid rgba(201,168,76,0.20);">
        <img src="${dados.qrBase64}" width="180" height="180" alt="QR Code Lista Amiga"
          style="display:block;border:0;outline:none;-ms-interpolation-mode:bicubic;"/>
      </div>
      <div style="font-size:8px;letter-spacing:3px;color:rgba(201,168,76,0.35);
        text-transform:uppercase;margin-top:14px;">Apresente na entrada</div>
    </td>
  </tr>

  <!-- DADOS DO PORTADOR -->
  <tr>
    <td style="background:${BG_SECTION};border-left:1px solid ${GOLD_35};
      border-right:1px solid ${GOLD_35};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="50%" style="padding:22px 16px 22px 48px;border-right:1px solid rgba(201,168,76,0.08);">
            <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:7px;">Portador</div>
            <div style="font-size:15px;color:${CREAM};">${dados.nomeCompleto}</div>
          </td>
          <td width="50%" style="padding:22px 48px 22px 16px;text-align:right;">
            <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:7px;">Categoria</div>
            <div style="font-size:12px;color:${GOLD};letter-spacing:1px;">${generoLabel}</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:16px 48px 22px;border-top:1px solid rgba(201,168,76,0.06);">
            <div style="font-size:7px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;margin-bottom:7px;">Validade</div>
            <div style="font-size:12px;color:${CREAM_55};">${dataAbrev} &middot; Até 00h00 &middot; Entrada única</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${picoteEmail()}
  ${rodapeSerial(serial)}

  <!-- AVISO -->
  <tr>
    <td style="padding:22px 0 0;">
      <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.14);
        border-radius:4px;padding:18px 24px;">
        <div style="font-size:8px;letter-spacing:3px;color:${GOLD_50};text-transform:uppercase;margin-bottom:10px;">Informações Importantes</div>
        <div style="font-size:11px;color:rgba(237,228,216,0.40);line-height:1.9;">
          &#8226; QR Code pessoal e intransferível — válido somente para este evento.<br/>
          &#8226; Acesso encerrado às 00h00. Não haverá entrada após este horário.<br/>
          &#8226; Dúvidas? WhatsApp: <span style="color:rgba(201,168,76,0.65);">(47) 99930-0283</span>
        </div>
      </div>
    </td>
  </tr>`

  return wrapEmail(corpo)
}

// ─────────────────────────────────────────────────────────────────
// HTML: Camarote
// ─────────────────────────────────────────────────────────────────
function gerarHTMLCamarote(dados: DadosEmailCamarote & {
  dataFormatada: string; dataAbrev: string
}): string {
  const { dataFormatada, dataAbrev } = dados

  const linksHTML = dados.links.map(l => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid rgba(201,168,76,0.07);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="36" style="vertical-align:middle;padding-right:14px;">
              <div style="width:30px;height:30px;border-radius:50%;background:rgba(201,168,76,0.10);
                border:1px solid ${GOLD_30};text-align:center;line-height:30px;font-size:11px;
                color:${GOLD};font-family:Georgia,serif;">${l.numero}</div>
            </td>
            <td style="vertical-align:middle;">
              <div style="font-size:7px;letter-spacing:3px;color:rgba(201,168,76,0.38);
                text-transform:uppercase;margin-bottom:6px;">Convidado ${l.numero}</div>
              <a href="${l.url}"
                style="display:block;background:#0a0805;border:1px solid ${GOLD_30};
                  border-radius:4px;padding:10px 14px;text-decoration:none;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:10px;
                  color:${GOLD};word-break:break-all;line-height:1.5;">${l.url}</span>
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  const corpo = `
  ${cabecalhoEmail('Ingressos de Camarote', dados.eventoNome + ' · ' + dataAbrev)}

  <!-- INTRO -->
  <tr>
    <td style="background:${BG_SECTION};border:1px solid ${GOLD_35};border-top:none;
      padding:32px 48px 28px;">
      <div style="font-size:13px;color:rgba(237,228,216,0.55);line-height:1.9;margin-bottom:28px;">
        Olá, <strong style="color:${CREAM};">${dados.nomeResponsavel}</strong>!<br/>
        Seu camarote está confirmado para <strong style="color:${GOLD};">${dados.eventoNome}</strong>
        em <strong style="color:${GOLD};">${dataFormatada}</strong>.<br/>
        Encaminhe o link individual para cada convidado — cada um fará seu próprio cadastro
        e receberá seu QR Code por email.
      </div>

      <!-- LISTA DE LINKS -->
      <div style="font-size:8px;letter-spacing:4px;color:${GOLD_50};text-transform:uppercase;
        margin-bottom:14px;border-bottom:1px solid rgba(201,168,76,0.12);padding-bottom:12px;">
        Links de Cadastro
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${linksHTML}
      </table>

      <!-- AVISO -->
      <div style="margin-top:24px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.14);
        padding:16px 20px;border-radius:4px;">
        <div style="font-size:8px;color:${GOLD_50};letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Atenção</div>
        <div style="font-size:11px;color:rgba(237,228,216,0.35);line-height:1.8;">
          Os links são de uso único e expiram após o cadastro individual.<br/>
          Cada convidado deve acessar o seu próprio link — não compartilhe o mesmo link duas vezes.
        </div>
      </div>
    </td>
  </tr>

  <!-- SERIAL DO CAMAROTE -->
  <tr>
    <td style="background:${BG_FOOTER};border:1px solid ${GOLD_35};border-top:none;
      padding:16px 48px 18px;border-radius:0 0 6px 6px;text-align:right;">
      <div style="font-size:7px;letter-spacing:2px;color:rgba(201,168,76,0.28);text-transform:uppercase;">
        Camarote &middot; ${dados.camaroteId.slice(0, 8).toUpperCase()}
      </div>
    </td>
  </tr>

  <!-- AVISO IMPORTANTE -->
  <tr>
    <td style="padding:22px 0 0;">
      <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.14);
        border-radius:4px;padding:18px 24px;">
        <div style="font-size:11px;color:rgba(237,228,216,0.40);line-height:1.9;">
          &#8226; Cada convidado precisa completar o cadastro com CPF para receber o QR Code.<br/>
          &#8226; Dúvidas? WhatsApp: <span style="color:rgba(201,168,76,0.65);">(47) 99930-0283</span>
        </div>
      </div>
    </td>
  </tr>`

  return wrapEmail(corpo)
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS: funções públicas de envio
// ─────────────────────────────────────────────────────────────────

/** Envia email com ingresso individual (QR via link de acesso) */
export async function enviarEmailIngresso(
  dados: DadosEmailIngresso
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const dataISO = dados.eventoData.length === 10
      ? `${dados.eventoData}T00:00:00`
      : dados.eventoData
    const dataFormatada = format(new Date(dataISO), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const dataAbrev     = format(new Date(dataISO), 'dd/MM/yyyy', { locale: ptBR })
    const cpfMascarado  = mascaraCPF(dados.cpf)
    const tipoLabel     = labelTipoIngresso(dados.tipoIngresso)
    const serial        = `${dados.ingressoId.slice(0, 8).toUpperCase()}-${dataAbrev.replace(/\//g, '')}`

    const html = gerarHTMLIngresso({
      ...dados, dataFormatada, dataAbrev, cpfMascarado, tipoLabel, serial,
    })

    const { error } = await getResend().emails.send({
      from:     EMAIL_FROM(),
      to:       dados.para,
      subject:  `Seu ingresso — ${dados.eventoNome} · ${dataAbrev}`,
      html,
      headers:  {
        'X-Entity-Ref-ID': dados.ingressoId,
        'List-Unsubscribe':  '<mailto:contato@maandhoo.com>',
      },
    })

    if (error) {
      console.error('[email-ingresso] Erro Resend:', error)
      return { sucesso: false, erro: error.message }
    }
    return { sucesso: true }
  } catch (err) {
    console.error('[email-ingresso] Exceção:', err)
    return { sucesso: false, erro: String(err) }
  }
}

/** Envia email da Lista Amiga com QR Code embutido */
export async function enviarEmailLista(
  dados: DadosEmailLista
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const dataISO = dados.eventoData.length === 10
      ? `${dados.eventoData}T00:00:00`
      : dados.eventoData
    const dataFormatada = format(new Date(dataISO), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const dataAbrev     = format(new Date(dataISO), 'dd/MM/yyyy', { locale: ptBR })
    const generoLabel   = dados.genero === 'feminino'
      ? 'Feminino — Entrada Gratuita'
      : 'Masculino — R$ 50,00'
    const serial = `${dados.qrToken.slice(6, 14)}-LISTA`

    const html = gerarHTMLLista({
      ...dados, dataFormatada, dataAbrev, generoLabel, serial,
    })

    const { error } = await getResend().emails.send({
      from:    EMAIL_FROM(),
      to:      dados.para,
      subject: `Lista Amiga confirmada — ${dados.eventoNome} · ${format(new Date(dataISO), 'dd/MM', { locale: ptBR })}`,
      html,
      headers: {
        'X-Entity-Ref-ID': dados.qrToken,
        'List-Unsubscribe':  '<mailto:contato@maandhoo.com>',
      },
    })

    if (error) {
      console.error('[email-lista] Erro Resend:', error)
      return { sucesso: false, erro: error.message }
    }
    return { sucesso: true }
  } catch (err) {
    console.error('[email-lista] Exceção:', err)
    return { sucesso: false, erro: String(err) }
  }
}

/** Envia email de camarote com múltiplos links de cadastro */
export async function enviarEmailCamarote(
  params: DadosEmailCamarote
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const dataISO = params.eventoData.length === 10
      ? `${params.eventoData}T00:00:00`
      : params.eventoData
    const dataFormatada = format(new Date(dataISO), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const dataAbrev     = format(new Date(dataISO), 'dd/MM', { locale: ptBR })

    const html = gerarHTMLCamarote({
      ...params, dataFormatada, dataAbrev,
    })

    const { error } = await getResend().emails.send({
      from:    EMAIL_FROM(),
      to:      params.para,
      subject: `Ingressos do Camarote — ${params.eventoNome} · ${dataAbrev}`,
      html,
      headers: {
        'X-Entity-Ref-ID': params.camaroteId,
        'List-Unsubscribe':  '<mailto:contato@maandhoo.com>',
      },
    })

    if (error) {
      console.error('[email-camarote] Erro Resend:', error)
      return { sucesso: false, erro: error.message }
    }
    return { sucesso: true }
  } catch (err) {
    console.error('[email-camarote] Exceção:', err)
    return { sucesso: false, erro: String(err) }
  }
}
