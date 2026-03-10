import { NextRequest, NextResponse } from 'next/server'
import { verificarTokenSessao, ADMIN_SESSION_COOKIE } from '@/lib/admin-session'

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
// Mapa em memória: chave → { count, resetAt }
// Funciona no Edge Runtime do Next.js (sem dependências externas)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_RULES: Record<string, { limit: number; windowMs: number }> = {
  '/api/ingressos/cadastro': { limit: 5,  windowMs: 60_000 },  // 5 req/min por IP
  '/api/leads':              { limit: 10, windowMs: 60_000 },  // 10 req/min por IP
  '/api/lista':              { limit: 15, windowMs: 60_000 },  // 15 req/min por IP
  '/api/validar':            { limit: 60, windowMs: 60_000 },  // 60 req/min (portaria)
  '/api/auth/admin':         { limit: 10, windowMs: 60_000 },  // 10 tentativas login/min
  '/api/cliente/auth':       { limit: 10, windowMs: 60_000 },  // 10 tentativas cliente/min
}

function applyRateLimit(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  const rule = RATE_LIMIT_RULES[pathname]
  if (!rule) return null

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const key = `${pathname}::${ip}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + rule.windowMs })
    return null
  }

  entry.count++
  if (entry.count > rule.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { erro: 'Muitas tentativas. Aguarde antes de tentar novamente.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(rule.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return null
}

// ─── AUTH ADMIN ───────────────────────────────────────────────────────────────
const ROTAS_PROTEGIDAS_API   = ['/api/admin']
const ROTAS_PROTEGIDAS_PAGES = [
  '/admin/dashboard', '/admin/eventos', '/admin/ingressos',
  '/admin/camarotes', '/admin/porteiros', '/admin/listas', '/admin/reservas',
  '/admin/leads', '/admin/usuarios', '/admin/cardapio', '/admin/galeria',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Rate limiting (rotas públicas sensíveis)
  const rateLimitResponse = applyRateLimit(req)
  if (rateLimitResponse) return rateLimitResponse

  // 2. Proteção de rotas admin
  const precisaAuth =
    ROTAS_PROTEGIDAS_API.some(r => pathname.startsWith(r)) ||
    ROTAS_PROTEGIDAS_PAGES.some(r => pathname.startsWith(r))

  if (!precisaAuth) return NextResponse.next()

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const payload = token ? verificarTokenSessao(token) : null

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/admin'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  const res = NextResponse.next()
  res.headers.set('x-admin-id', payload.id)
  res.headers.set('x-admin-role', payload.role)
  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/ingressos/cadastro',
    '/api/leads',
    '/api/lista',
    '/api/validar',
    '/api/auth/admin',
    '/api/cliente/auth',
  ],
}
