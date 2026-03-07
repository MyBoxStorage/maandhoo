import QRCode from 'qrcode'

/**
 * Gera QR Code como string base64 PNG
 * O conteúdo é apenas o qr_token — a API valida o token no Supabase
 */
export async function gerarQRCodeBase64(qrToken: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/validar?token=${qrToken}`

  const base64 = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#1a1208',  // marrom escuro Maandhoo
      light: '#fdf8f0', // bege claro
    },
  })

  return base64
}

/**
 * Gera QR Code como Buffer PNG (para embutir em email HTML)
 */
export async function gerarQRCodeBuffer(qrToken: string): Promise<Buffer> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/validar?token=${qrToken}`

  return QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#1a1208',
      light: '#fdf8f0',
    },
  })
}
