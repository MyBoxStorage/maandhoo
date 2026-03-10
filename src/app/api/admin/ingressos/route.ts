import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PAGE_SIZE = 50

// GET /api/admin/ingressos?evento_id=&page=1&status=&busca=
export async function GET(req: Request) {
  const url    = new URL(req.url)
  const eventoId = url.searchParams.get('evento_id')
  const page     = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const status   = url.searchParams.get('status')   // ativo | cancelado | utilizado
  const busca    = url.searchParams.get('busca')    // nome ou serial (primeiros 8 chars do id)

  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabaseAdmin
    .from('ingressos')
    .select('*, cadastro:cadastros(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (eventoId) query = query.eq('evento_id', eventoId)
  if (status)   query = query.eq('status', status)
  if (busca) {
    // Busca por nome do portador (cadastro) ou início do ID (serial)
    query = query.or(
      `id.ilike.${busca}%,cadastro.nome_completo.ilike.%${busca}%`
    )
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  return NextResponse.json({
    ingressos: data,
    paginacao: {
      page,
      pageSize: PAGE_SIZE,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    },
  })
}
