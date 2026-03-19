import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/consentimento-cookies
// Registra consentimento de cookies de forma anônima (sem dados pessoais diretos)
// Chamado pelo CookieBanner ao aceitar/recusar cookies.
//
// LGPD / privacidade: o IP é dado pessoal (art. 5º LGPD).
// Armazenamos apenas um hash SHA-256 com salt para fins de auditoria de
// unicidade, sem possibilidade de reverter ao IP original.
// ─────────────────────────────────────────────────────────────────────────────

// Salt fixo de ambiente — adicione IP_HASH_SALT nas variáveis de ambiente (.env.local)
// Se não existir, usa um fallback estático (menos seguro, mas não expõe o IP bruto)
const IP_SALT = process.env.IP_HASH_SALT ?? 'maandhoo-lgpd-salt-2025'

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${IP_SALT}:${ip}`)
    .digest('hex')
    .slice(0, 16) // 16 chars são suficientes para auditoria de unicidade
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { analytics, marketing, dataConsentimento, versao } = body

    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    // ── LGPD: nunca armazenar IP bruto — apenas o hash anonimizado ──────────
    const ipHash = rawIp !== 'unknown' ? hashIp(rawIp) : 'unknown'

    const userAgent = req.headers.get('user-agent') ?? 'unknown'

    // Grava na tabela cookie_consents (anônimo — sem nome/email/IP bruto)
    const { error } = await supabaseAdmin
      .from('cookie_consents')
      .insert({
        analytics_aceito: analytics ?? false,
        marketing_aceito: marketing ?? false,
        versao_politica: versao ?? '1.0',
        ip_hash: ipHash,           // hash anonimizado — não é o IP real
        user_agent: userAgent,
        criado_em: dataConsentimento ?? new Date().toISOString(),
      })

    // Se a tabela não existir ainda, silencia o erro e não quebra o UX
    if (error && !error.message?.includes('does not exist')) {
      console.error('[consentimento-cookies]', error.message)
    }

    return NextResponse.json({ sucesso: true })
  } catch (err) {
    console.error('[consentimento-cookies]', err)
    return NextResponse.json({ sucesso: false })
  }
}
