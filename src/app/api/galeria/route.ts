import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/galeria — retorna fotos públicas ordenadas
// GET /api/galeria?destaques=true — retorna até 8 fotos com destaque=true
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const somenteDestaques = searchParams.get('destaques') === 'true'

  let query = supabaseAdmin
    .from('galeria')
    .select('*')

  if (somenteDestaques) {
    query = query
      .eq('destaque', true)
      .order('posicao_destaque', { ascending: true, nullsFirst: false })
      .limit(8)
  } else {
    query = query
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  return NextResponse.json({ fotos: data ?? [] })
}
