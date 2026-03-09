import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/ingressos — lista ingressos com cadastro
export async function GET(req: Request) {
  const url = new URL(req.url)
  const eventoId = url.searchParams.get('evento_id')

  let query = supabaseAdmin
    .from('ingressos')
    .select('*, cadastro:cadastros(*)')
    .order('created_at', { ascending: false })

  if (eventoId) query = query.eq('evento_id', eventoId)

  const { data, error } = await query
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ ingressos: data })
}
