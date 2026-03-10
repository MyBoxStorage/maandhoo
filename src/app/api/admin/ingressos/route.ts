import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PAGE_SIZE = 50

// GET /api/admin/ingressos?evento_id=&page=1&status=&busca=
export async function GET(req: Request) {
  const url      = new URL(req.url)
  const eventoId = url.searchParams.get('evento_id')
  const page     = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const status   = url.searchParams.get('status')  // ativo | cancelado | utilizado
  const busca    = url.searchParams.get('busca')   // nome ou início do ID (serial)

  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  // ── Busca por nome: o Supabase não suporta filtrar colunas de join via .or()
  // Estratégia: se há busca por nome, primeiro buscamos os ingresso_ids via
  // tabela cadastros, depois filtramos ingressos por esses IDs.
  let ingressoIdsFiltrados: string[] | null = null

  if (busca) {
    const termoBusca = busca.trim()

    // Buscar por nome na tabela cadastros
    const { data: cadastrosBusca } = await supabaseAdmin
      .from('cadastros')
      .select('ingresso_id')
      .ilike('nome_completo', `%${termoBusca}%`)

    // Buscar por email na tabela cadastros
    const { data: cadastrosEmail } = await supabaseAdmin
      .from('cadastros')
      .select('ingresso_id')
      .ilike('email', `%${termoBusca}%`)

    // Unir IDs únicos de ambas as buscas
    const idsSet = new Set<string>()
    ;(cadastrosBusca ?? []).forEach(c => { if (c.ingresso_id) idsSet.add(c.ingresso_id) })
    ;(cadastrosEmail ?? []).forEach(c => { if (c.ingresso_id) idsSet.add(c.ingresso_id) })

    ingressoIdsFiltrados = Array.from(idsSet)

    // Se não encontrou nada nas buscas por nome/email, retornar vazio imediatamente
    if (ingressoIdsFiltrados.length === 0) {
      return NextResponse.json({
        ingressos: [],
        paginacao: { page, pageSize: PAGE_SIZE, total: 0, totalPages: 0 },
      })
    }
  }

  let query = supabaseAdmin
    .from('ingressos')
    .select('*, cadastro:cadastros(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (eventoId) query = query.eq('evento_id', eventoId)
  if (status)   query = query.eq('status', status)
  if (ingressoIdsFiltrados) query = query.in('id', ingressoIdsFiltrados)

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
