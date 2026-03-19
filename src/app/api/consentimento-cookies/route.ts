import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/consentimento-cookies
// Registra consentimento de cookies de forma anônima (sem dados pessoais)
// Chamado pelo CookieBanner ao aceitar/recusar cookies
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { analytics, marketing, dataConsentimento, versao } = body

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown'

    const userAgent = req.headers.get('user-agent') ?? 'unknown'

    // Grava na tabela cookie_consents (anônimo — sem nome/email)
    const { error } = await supabaseAdmin
      .from('cookie_consents')
      .insert({
        analytics_aceito: analytics ?? false,
        marketing_aceito: marketing ?? false,
        versao_politica: versao ?? '1.0',
        ip_origem: ip,
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
