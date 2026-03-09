import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/admin/eventos/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { id } = params

  const { data, error } = await supabaseAdmin
    .from('eventos')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ evento: data })
}

// PATCH /api/admin/eventos/[id] — atualização parcial (ex: toggle ativo)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { id } = params

  const { data, error } = await supabaseAdmin
    .from('eventos')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ evento: data })
}
