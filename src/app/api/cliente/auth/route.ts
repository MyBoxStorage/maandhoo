import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import {
  criarTokenCliente, verificarTokenCliente,
  CLIENTE_SESSION_COOKIE, CLIENTE_SESSION_DURATION_SECONDS,
} from '@/lib/cliente-session'

// POST /api/cliente/auth — login ou cadastro
export async function POST(req: NextRequest) {
  try {
    const { acao, email, senha, nome, whatsapp, cpf, data_nascimento, estado, cidade, termos_aceitos, lgpd_aceito, lgpd_versao, link_token } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ erro: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    // ── CADASTRO ────────────────────────────────────────────────
    if (acao === 'cadastro') {
      if (!nome) return NextResponse.json({ erro: 'Nome é obrigatório' }, { status: 400 })
      if (!termos_aceitos) return NextResponse.json({ erro: 'Você precisa aceitar os Termos de Uso' }, { status: 400 })
      if (!cpf) return NextResponse.json({ erro: 'CPF é obrigatório' }, { status: 400 })

      // Validação básica de CPF (11 dígitos numéricos)
      const cpfLimpo = cpf.replace(/\D/g, '')
      if (cpfLimpo.length !== 11) {
        return NextResponse.json({ erro: 'CPF inválido' }, { status: 400 })
      }

      // Verificar CPF duplicado
      const { data: cpfExistente } = await supabaseAdmin
        .from('clientes').select('id').eq('cpf', cpfLimpo).maybeSingle()
      if (cpfExistente) {
        return NextResponse.json({ erro: 'CPF já cadastrado.' }, { status: 409 })
      }

      const { data: existente } = await supabaseAdmin
        .from('clientes').select('id').eq('email', email.toLowerCase()).maybeSingle()

      if (existente) {
        return NextResponse.json({ erro: 'Email já cadastrado. Faça login.' }, { status: 409 })
      }

      const senha_hash = await bcrypt.hash(senha, 12)
      const agora = new Date().toISOString()
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      const { data: cliente, error } = await supabaseAdmin
        .from('clientes')
        .insert({
          nome: nome.trim(), email: email.toLowerCase(), whatsapp, cpf: cpfLimpo, senha_hash,
          data_nascimento: data_nascimento || null,
          estado: estado?.trim() || null,
          cidade: cidade?.trim() || null,
          termos_aceitos: true,
          termos_aceitos_em: agora,
          termos_versao: '1.0',
          lgpd_aceito: !!lgpd_aceito,
          lgpd_aceito_em: lgpd_aceito ? agora : null,
          lgpd_versao_termo: lgpd_aceito ? (lgpd_versao || '1.0') : null,
          lgpd_ip: lgpd_aceito ? ip : null,
        })
        .select('id, nome, email').single()

      if (error || !cliente) {
        return NextResponse.json({ erro: 'Erro ao criar conta' }, { status: 500 })
      }

      // Vincular ingresso ao cliente se vier de um link
      if (link_token) {
        await supabaseAdmin.from('ingressos')
          .update({ cliente_id: cliente.id })
          .eq('link_token', link_token)
          .eq('link_usado', true) // só vincula se já foi cadastrado
      }

      return _responderComSessao(cliente)
    }

    // ── LOGIN ───────────────────────────────────────────────────
    if (acao === 'login') {
      const { data: cliente, error } = await supabaseAdmin
        .from('clientes').select('id, nome, email, senha_hash, ativo')
        .eq('email', email.toLowerCase()).single()

      if (error || !cliente || !cliente.ativo) {
        return NextResponse.json({ erro: 'Email ou senha inválidos' }, { status: 401 })
      }

      const ok = await bcrypt.compare(senha, cliente.senha_hash)
      if (!ok) return NextResponse.json({ erro: 'Email ou senha inválidos' }, { status: 401 })

      await supabaseAdmin.from('clientes')
        .update({ ultimo_acesso: new Date().toISOString() }).eq('id', cliente.id)

      // Vincular ingresso se vier de um link
      if (link_token) {
        await supabaseAdmin.from('ingressos')
          .update({ cliente_id: cliente.id })
          .eq('link_token', link_token).eq('link_usado', true)
      }

      return _responderComSessao(cliente)
    }

    return NextResponse.json({ erro: 'Ação inválida' }, { status: 400 })
  } catch (err) {
    console.error('[cliente-auth]', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

// GET /api/cliente/auth — verificar sessão + dados completos do perfil
export async function GET(req: NextRequest) {
  const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ autenticado: false }, { status: 401 })
  const payload = verificarTokenCliente(token)
  if (!payload) return NextResponse.json({ autenticado: false }, { status: 401 })

  // Busca dados atualizados do cliente incluindo quiz/perfil/lgpd
  const { data: c } = await supabaseAdmin
    .from('clientes')
    .select('id, nome, email, quiz_feito, quiz_perfil_id, quiz_respostas, lgpd_aceito, badge_ativo, tema_ativo')
    .eq('id', payload.id)
    .single()

  return NextResponse.json({
    autenticado: true,
    cliente: c ?? { id: payload.id, nome: payload.nome, email: payload.email },
  })
}

// DELETE /api/cliente/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ sucesso: true })
  res.cookies.set(CLIENTE_SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' })
  return res
}

function _responderComSessao(cliente: { id: string; nome: string; email: string }) {
  const token = criarTokenCliente({ id: cliente.id, nome: cliente.nome, email: cliente.email })
  const res = NextResponse.json({ sucesso: true, cliente: { id: cliente.id, nome: cliente.nome } })
  res.cookies.set(CLIENTE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CLIENTE_SESSION_DURATION_SECONDS,
    path: '/',
  })
  return res
}
