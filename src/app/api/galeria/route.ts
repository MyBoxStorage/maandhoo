import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/galeria — retorna todas as mídias ordenadas (mais recentes primeiro)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .select('id, url, alt, orientacao, ordem')
    .order('ordem', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ fotos: data ?? [] })
}
