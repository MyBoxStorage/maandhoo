import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

/**
 * POST /api/ingressos/portaria-auth
 * Autenticação do porteiro para o PWA de validação
 * Retorna dados do porteiro + eventos permitidos
 */
export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ erro: 'Email e senha obrigatórios' }, { status: 400 })
    }

    // ── Buscar porteiro ─────────────────────────────────────────
    const { data: porteiro, error } = await supabaseAdmin
      .from('porteiros')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('ativo', true)
      .single()

    if (error || !porteiro) {
      return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
    }

    // ── Verificar senha ─────────────────────────────────────────
    const senhaValida = await bcrypt.compare(senha, porteiro.senha_hash)
    if (!senhaValida) {
      return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
    }

    // ── Buscar eventos permitidos ───────────────────────────────
    let eventosQuery = supabaseAdmin
      .from('eventos')
      .select('id, nome, data_evento, hora_abertura, flyer_url')
      .eq('ativo', true)
      .order('data_evento', { ascending: true })

    // Se tem restrição por eventos específicos
    if (porteiro.eventos_permitidos && porteiro.eventos_permitidos.length > 0) {
      eventosQuery = eventosQuery.in('id', porteiro.eventos_permitidos)
    }

    const { data: eventos } = await eventosQuery

    // ── Atualizar último acesso ─────────────────────────────────
    await supabaseAdmin
      .from('porteiros')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', porteiro.id)

    // ── Retornar dados (sem senha_hash) ─────────────────────────
    return NextResponse.json({
      sucesso: true,
      porteiro: {
        id: porteiro.id,
        nome: porteiro.nome,
        nivel: porteiro.nivel,
      },
      eventos: eventos ?? [],
    })
  } catch (err) {
    console.error('[portaria-auth] Erro:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
