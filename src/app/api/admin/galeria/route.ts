import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/galeria
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .select('*, evento:eventos(id, nome)')
    .order('ordem', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ fotos: data })
}

// POST /api/admin/galeria — adicionar foto
export async function POST(req: Request) {
  const body = await req.json()
  const { url, alt, evento_id, ordem } = body

  if (!url) return NextResponse.json({ erro: 'URL é obrigatória' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('galeria')
    .insert({ url, alt: alt || null, evento_id: evento_id || null, ordem: ordem ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ foto: data })
}

// PATCH /api/admin/galeria — reordenar lote
export async function PATCH(req: Request) {
  const { ordens } = await req.json() as { ordens: Array<{ id: string; ordem: number }> }

  if (!Array.isArray(ordens)) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })

  const ops = ordens.map(({ id, ordem }) =>
    supabaseAdmin.from('galeria').update({ ordem }).eq('id', id)
  )
  await Promise.all(ops)

  return NextResponse.json({ sucesso: true })
}
