import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// GET /api/admin/porteiros
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('porteiros')
    .select('id, nome, email, nivel, ativo, eventos_permitidos, created_at')
    .order('nome', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ porteiros: data })
}

// POST /api/admin/porteiros — criar porteiro
export async function POST(req: Request) {
  const { nome, email, senha, nivel, ativo, eventos_permitidos } = await req.json()

  if (!nome || !email || !senha) return NextResponse.json({ erro: 'Nome, email e senha são obrigatórios' }, { status: 400 })
  if (senha.length < 8) return NextResponse.json({ erro: 'Senha deve ter no mínimo 8 caracteres' }, { status: 400 })

  const senhaHash = await bcrypt.hash(senha, 12)

  const { data, error } = await supabaseAdmin
    .from('porteiros')
    .insert({ nome, email, senha_hash: senhaHash, nivel: nivel ?? 'porteiro', ativo: ativo ?? true, eventos_permitidos: eventos_permitidos ?? [] })
    .select('id, nome, email, nivel, ativo, eventos_permitidos, created_at')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ erro: 'Este email já está cadastrado' }, { status: 409 })
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ porteiro: data })
}
