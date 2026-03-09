import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/admin/camarotes — criar camarote
export async function POST(req: Request) {
  const { evento_id, nome, descricao, capacidade, preco_total } = await req.json()
  if (!evento_id || !nome) return NextResponse.json({ erro: 'Evento e nome são obrigatórios' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('camarotes')
    .insert({
      evento_id,
      identificador: nome,
      capacidade: capacidade ?? 10,
      preco_total: preco_total ?? 0,
      disponivel: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ camarote: data })
}
