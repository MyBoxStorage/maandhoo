import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/cardapio
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('cardapio')
    .select('*')
    .order('categoria')
    .order('ordem')

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ itens: data })
}

// POST /api/admin/cardapio — criar item
export async function POST(req: Request) {
  const body = await req.json()
  const { categoria, nome, descricao, preco, disponivel, destaque, ordem } = body

  if (!nome || !categoria) {
    return NextResponse.json({ erro: 'Nome e categoria são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('cardapio')
    .insert({ categoria, nome, descricao: descricao || null, preco: preco ?? 0, disponivel: disponivel ?? true, destaque: destaque ?? false, ordem: ordem ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}
