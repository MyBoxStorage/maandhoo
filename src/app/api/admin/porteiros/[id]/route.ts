import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// PUT /api/admin/porteiros/[id] — editar porteiro
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { nome, senha, nivel, ativo, eventos_permitidos } = await req.json()
  const { id } = params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { nome, nivel, ativo, eventos_permitidos, updated_at: new Date().toISOString() }
  if (senha && senha.length >= 8) {
    update.senha_hash = await bcrypt.hash(senha, 12)
  } else if (senha && senha.length < 8) {
    return NextResponse.json({ erro: 'Senha deve ter no mínimo 8 caracteres' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('porteiros')
    .update(update)
    .eq('id', id)
    .select('id, nome, email, nivel, ativo, eventos_permitidos, created_at')
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ porteiro: data })
}

// PATCH /api/admin/porteiros/[id] — atualização parcial
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { id } = params

  const { data, error } = await supabaseAdmin
    .from('porteiros')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, nome, email, nivel, ativo, eventos_permitidos, created_at')
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ porteiro: data })
}
