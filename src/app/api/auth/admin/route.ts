import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import {
  criarTokenSessao,
  verificarTokenSessao,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_SECONDS,
} from '@/lib/admin-session'

// ──────────────────────────────────────────────────────────────
// POST /api/auth/admin  →  Login
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ erro: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    if (!process.env.NEXTAUTH_SECRET ||
        process.env.NEXTAUTH_SECRET === 'GERE_UMA_SECRET_FORTE_AQUI_COM_32_CHARS') {
      console.error('[admin-auth] NEXTAUTH_SECRET não configurado!')
      return NextResponse.json({ erro: 'Servidor não configurado corretamente' }, { status: 500 })
    }

    // Buscar usuário na tabela admin_users
    const { data: usuario, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, nome, email, senha_hash, role, ativo')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (error || !usuario || !usuario.ativo) {
      return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
    if (!senhaValida) {
      return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
    }

    // Registrar último acesso (best-effort)
    await supabaseAdmin
      .from('admin_users')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', usuario.id)

    const token = criarTokenSessao({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    })

    const res = NextResponse.json({
      sucesso: true,
      usuario: { id: usuario.id, nome: usuario.nome, role: usuario.role },
    })

    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
      path: '/',
    })

    return res
  } catch (err) {
    console.error('[admin-auth] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────────────
// DELETE /api/auth/admin  →  Logout
// ──────────────────────────────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ sucesso: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}

// ──────────────────────────────────────────────────────────────
// GET /api/auth/admin  →  Verificar sessão ativa
// ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ autenticado: false }, { status: 401 })
  }
  const payload = verificarTokenSessao(token)
  if (!payload) {
    return NextResponse.json({ autenticado: false }, { status: 401 })
  }
  return NextResponse.json({
    autenticado: true,
    usuario: { id: payload.id, nome: payload.nome, role: payload.role },
  })
}
