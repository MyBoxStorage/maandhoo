/**
 * BC Connect — cliente de webhook para o Maandhoo Club
 */

const BC_WEBHOOK_URL = process.env.BC_CONNECT_WEBHOOK_URL ?? 'http://localhost:3001'
const BC_API_KEY = process.env.BC_CONNECT_API_KEY ?? ''
const BC_PARTNER_ID = process.env.BC_CONNECT_PARTNER_ID ?? ''

export type BcEventType = 'SIGNUP' | 'RESERVATION' | 'PREFERENCE_UPDATE' | 'TICKET_PURCHASE' | 'LOGIN'

export interface BcLeadPayload {
  email: string
  name?: string
  phone?: string
  age?: number
  gender?: string
  cityOfOrigin?: string
}

export interface BcWebhookPayload {
  eventType: BcEventType
  occurredAt: string
  lead: BcLeadPayload
  optinAccepted?: boolean
  metadata?: {
    groupSize?: number
    estimatedTicket?: number
    occasionType?: string
    eventName?: string
    preferences?: Array<{ category: string; value: string }>
  }
}

export async function sendBcEvent(payload: BcWebhookPayload): Promise<void> {
  if (!BC_API_KEY) {
    console.log('[BC Connect] API key não configurada — evento não enviado:', payload.eventType)
    return
  }
  try {
    const res = await fetch(
      `${BC_WEBHOOK_URL}/api/webhook/partner/${BC_PARTNER_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': BC_API_KEY },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) {
      console.warn(`[BC Connect] Webhook rejeitado (${res.status}):`, await res.text())
    }
  } catch (err) {
    console.warn('[BC Connect] Falha silenciosa:', (err as Error).message)
  }
}
