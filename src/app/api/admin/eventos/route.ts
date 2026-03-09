import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const client = getSupabaseAdmin()
    const { data: eventos, error } = await client
      .from('eventos')
      .select('*, lotes(*)')
      .order('data_evento', { ascending: true })

    if (error) {
      console.error('[GET eventos] Supabase error:', JSON.stringify(error))
      return NextResponse.json({ erro: error.message, code: error.code, details: error.details }, { status: 500 })
    }
    return NextResponse.json({ eventos })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[GET eventos] Exception:', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, data_evento, hora_abertura, descricao, ativo, capacidade_total, lista_encerra_as, flyer_url } = body

    if (!nome || !data_evento) {
      return NextResponse.json({ erro: 'Nome e data são obrigatórios' }, { status: 400 })
    }

    const client = getSupabaseAdmin()
    const { data, error } = await client
      .from('eventos')
      .insert({ nome, data_evento, hora_abertura, descricao, ativo: ativo ?? false, capacidade_total, lista_encerra_as, flyer_url })
      .select()
      .single()

    if (error) {
      console.error('[POST eventos] Supabase error:', JSON.stringify(error))
      return NextResponse.json({ erro: error.message, code: error.code, details: error.details }, { status: 500 })
    }
    return NextResponse.json({ evento: data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[POST eventos] Exception:', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}
