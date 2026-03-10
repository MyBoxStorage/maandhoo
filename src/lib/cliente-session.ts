import crypto from 'crypto'

const SECRET = process.env.NEXTAUTH_SECRET ?? 'fallback-dev-secret'
export const CLIENTE_SESSION_COOKIE = 'maandhoo_cliente_session'
export const CLIENTE_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7 // 7 dias

export interface ClientePayload {
  id: string
  nome: string
  email: string
}

function hmac(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex')
}

export function criarTokenCliente(payload: ClientePayload): string {
  const exp = Math.floor(Date.now() / 1000) + CLIENTE_SESSION_DURATION_SECONDS
  const data = JSON.stringify({ ...payload, exp })
  const encoded = Buffer.from(data).toString('base64url')
  const sig = hmac(encoded)
  return `${encoded}.${sig}`
}

export function verificarTokenCliente(token: string): (ClientePayload & { exp: number }) | null {
  try {
    const [encoded, sig] = token.split('.')
    if (!encoded || !sig) return null
    if (hmac(encoded) !== sig) return null
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
    if (Date.now() / 1000 > payload.exp) return null
    return payload
  } catch {
    return null
  }
}
