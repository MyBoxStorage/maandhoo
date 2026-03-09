import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/eventos — lista todos com lotes
export async function GET() {
  const { data: eventos, error } = await supabaseAdmin
    .from('eventos')
    .select('*, lotes(*)')
    .order('data_evento', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ eventos })
}

// POST /api/admin/eventos — criar evento
export async function POST(req: Request) {
  const body = await req.json()
  const { nome, data_evento, hora_abertura, descricao, ativo, capacidade_total, lista_encerra_as, flyer_url } = body

  if (!nome || !data_evento) return NextResponse.json({ erro: 'Nome e data são obrigatórios' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('eventos')
    .insert({ nome, data_evento, hora_abertura, descricao, ativo: ativo ?? false, capacidade_total, lista_encerra_as, flyer_url })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ evento: data })
}
