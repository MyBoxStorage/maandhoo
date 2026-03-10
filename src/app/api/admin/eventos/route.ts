import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const client = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const publico = searchParams.get('publico') === 'true'

    if (publico) {
      const { data: eventosAtivos, error: errorEventos } = await client
        .from('eventos')
        .select('id, nome, descricao, data_evento, hora_abertura, flyer_url, ativo, lista_encerra_as')
        .eq('ativo', true)
        .order('data_evento', { ascending: true })

      if (errorEventos) {
        console.error('[GET eventos publico] Supabase error:', JSON.stringify(errorEventos))
        return NextResponse.json({ erro: errorEventos.message, code: errorEventos.code, details: errorEventos.details }, { status: 500 })
      }

      const eventoIds = (eventosAtivos ?? []).map((e) => e.id)
      if (eventoIds.length === 0) {
        return NextResponse.json({ eventos: [] })
      }

      const { data: lotesAtivos, error: errorLotes } = await client
        .from('lotes')
        .select('*')
        .in('evento_id', eventoIds)
        .eq('ativo', true)
        .order('numero', { ascending: true })

      if (errorLotes) {
        console.error('[GET eventos publico / lotes] Supabase error:', JSON.stringify(errorLotes))
        return NextResponse.json({ erro: errorLotes.message, code: errorLotes.code, details: errorLotes.details }, { status: 500 })
      }

      const lotesPorEvento = new Map<string, typeof lotesAtivos>()
      for (const lote of lotesAtivos ?? []) {
        const atual = lotesPorEvento.get(lote.evento_id) ?? []
        atual.push(lote)
        lotesPorEvento.set(lote.evento_id, atual)
      }

      const eventosComLotes = (eventosAtivos ?? []).map((evento) => ({
        ...evento,
        lotes: lotesPorEvento.get(evento.id) ?? [],
      }))

      return NextResponse.json({ eventos: eventosComLotes })
    }

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
