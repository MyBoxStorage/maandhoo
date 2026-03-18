import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PAGE_SIZE = 50

// GET /api/admin/ingressos?evento_id=&page=1&status=&busca=
export async function GET(req: Request) {
  const url      = new URL(req.url)
  const eventoId = url.searchParams.get('evento_id')
  const page     = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const status   = url.searchParams.get('status')
  const busca    = url.searchParams.get('busca')

  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  // ── Busca por nome/email via tabela cadastros ─────────────────
  // O Supabase não suporta filtrar colunas de join via .or() direto,
  // então primeiro obtemos os ingresso_ids e depois filtramos.
  let ingressoIdsFiltrados: string[] | null = null

  if (busca) {
    const termoBusca = busca.trim()

    const [{ data: porNome }, { data: porEmail }] = await Promise.all([
      supabaseAdmin.from('cadastros').select('ingresso_id').ilike('nome_completo', `%${termoBusca}%`),
      supabaseAdmin.from('cadastros').select('ingresso_id').ilike('email', `%${termoBusca}%`),
    ])

    const idsSet = new Set<string>()
    ;(porNome  ?? []).forEach(c => { if (c.ingresso_id) idsSet.add(c.ingresso_id) })
    ;(porEmail ?? []).forEach(c => { if (c.ingresso_id) idsSet.add(c.ingresso_id) })

    ingressoIdsFiltrados = Array.from(idsSet)

    if (ingressoIdsFiltrados.length === 0) {
      return NextResponse.json({
        ingressos: [],
        paginacao: { page, pageSize: PAGE_SIZE, total: 0, totalPages: 0 },
      })
    }
  }

  let query = supabaseAdmin
    .from('ingressos')
    .select(
      // Inclui cadastro (dados do portador) e evento (para o dashboard exibir nome)
      '*, cadastro:cadastros(*), evento:eventos(id, nome, data_evento)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (eventoId)              query = query.eq('evento_id', eventoId)
  if (status)                query = query.eq('status', status)
  if (ingressoIdsFiltrados)  query = query.in('id', ingressoIdsFiltrados)

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
