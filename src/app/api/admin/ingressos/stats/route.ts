import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/admin/ingressos/stats?evento_id=
 * Retorna contagens e receita total — sem paginação, para o dashboard.
 * Não carrega cadastros nem dados pessoais — só agrega números.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eventoId = searchParams.get('evento_id')

  let query = supabaseAdmin
    .from('ingressos')
    .select('status, preco_pago')

  if (eventoId) query = query.eq('evento_id', eventoId)

  const { data, error } = await query

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  const ingressos = data ?? []

  const ativos     = ingressos.filter(i => i.status === 'ativo').length
  const utilizados = ingressos.filter(i => i.status === 'utilizado').length
  const total      = ingressos.length

  const receita = ingressos
    .filter(i => i.status === 'ativo' || i.status === 'utilizado')
    .reduce((acc, i) => acc + (Number(i.preco_pago) || 0), 0)

  return NextResponse.json({ ativos, utilizados, total, receita })
}
