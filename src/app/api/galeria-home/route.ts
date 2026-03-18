import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/galeria-home — retorna os 7 slots para a seção Experiência da home
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria_home')
    .select('slot, galeria:galeria_id(id, url, alt)')
    .order('slot', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  // Retorna array de 7 posições — null onde não há mídia definida
  const slots = Array.from({ length: 7 }, (_, i) => {
    const found = (data ?? []).find((s: { slot: number }) => s.slot === i + 1)
    return found?.galeria ?? null
  })

  return NextResponse.json({ slots })
}
