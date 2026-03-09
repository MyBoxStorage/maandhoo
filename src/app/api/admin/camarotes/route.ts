import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/admin/camarotes — criar camarote
export async function POST(req: Request) {
  const { evento_id, nome, descricao, capacidade } = await req.json()
  if (!evento_id || !nome) return NextResponse.json({ erro: 'Evento e nome são obrigatórios' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('camarotes')
    .insert({ evento_id, nome, descricao, capacidade: capacidade ?? 10, ativo: true })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ camarote: data })
}
