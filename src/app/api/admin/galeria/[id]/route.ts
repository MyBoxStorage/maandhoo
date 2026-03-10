import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/admin/galeria/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ foto: data })
}

// PATCH /api/admin/galeria/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ foto: data })
}

// DELETE /api/admin/galeria/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin.from('galeria').delete().eq('id', params.id)
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ sucesso: true })
}
