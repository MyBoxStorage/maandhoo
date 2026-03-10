/**
 * admin-session.ts
 * Utilitários de sessão para o painel admin.
 * Usa HMAC-SHA256 com NEXTAUTH_SECRET para assinar tokens — sem dependência externa.
 */

import crypto from 'crypto'

const SECRET = process.env.NEXTAUTH_SECRET ?? ''
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 horas

export type AdminSessionPayload = {
  id: string
  nome: string
  email: string
  role: 'admin' | 'operador'
  exp: number // timestamp ms
}

/** Gera token de sessão: base64(payload).base64(hmac) */
export function criarTokenSessao(payload: Omit<AdminSessionPayload, 'exp'>): string {
  const data: AdminSessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_DURATION_MS,
  }
  const encodedPayload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const hmac = crypto
    .createHmac('sha256', SECRET)
    .update(encodedPayload)
    .digest('base64url')
  return `${encodedPayload}.${hmac}`
}

/** Valida e decodifica token. Retorna null se inválido ou expirado. */
export function verificarTokenSessao(token: string): AdminSessionPayload | null {
  if (!SECRET || SECRET === 'GERE_UMA_SECRET_FORTE_AQUI_COM_32_CHARS') return null
  try {
    const [encodedPayload, hmac] = token.split('.')
    if (!encodedPayload || !hmac) return null

    const expectedHmac = crypto
      .createHmac('sha256', SECRET)
      .update(encodedPayload)
      .digest('base64url')

    // Comparação em tempo constante para evitar timing attacks
    const bufA = Buffer.from(hmac)
    const bufB = Buffer.from(expectedHmac)
    if (bufA.length !== bufB.length) return null
    if (!crypto.timingSafeEqual(bufA, bufB)) return null

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    )

    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export const ADMIN_SESSION_COOKIE = 'maandhoo_admin_session'
export const ADMIN_SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000
