import { NextRequest, NextResponse } from 'next/server'
import { verificarTokenSessao, ADMIN_SESSION_COOKIE } from '@/lib/admin-session'

// Rotas que exigem autenticação admin (exceto a raiz /admin que é a tela de login)
const ROTAS_PROTEGIDAS_API   = ['/api/admin']
const ROTAS_PROTEGIDAS_PAGES = ['/admin/dashboard', '/admin/eventos', '/admin/ingressos',
  '/admin/camarotes', '/admin/porteiros', '/admin/listas', '/admin/reservas',
  '/admin/leads', '/admin/usuarios', '/admin/cardapio', '/admin/galeria']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const precisaAuth =
    ROTAS_PROTEGIDAS_API.some(r => pathname.startsWith(r)) ||
    ROTAS_PROTEGIDAS_PAGES.some(r => pathname.startsWith(r))

  if (!precisaAuth) return NextResponse.next()

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const payload = token ? verificarTokenSessao(token) : null

  if (!payload) {
    // Chamadas de API retornam 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    // Páginas redirecionam para a tela de login do admin
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/admin'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  // Propaga identidade do usuário nos headers para as rotas de API
  const res = NextResponse.next()
  res.headers.set('x-admin-id', payload.id)
  res.headers.set('x-admin-role', payload.role)
  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
