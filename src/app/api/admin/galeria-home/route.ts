import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/galeria-home
// Retorna os 7 slots com os dados da mídia vinculada
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria_home')
    .select('slot, galeria_id, galeria:galeria_id(id, url, alt)')
    .order('slot', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ slots: data ?? [] })
}

// PUT /api/admin/galeria-home
// Atualiza um slot específico { slot: 1-7, galeria_id: uuid | null }
export async function PUT(req: Request) {
  const { slot, galeria_id } = await req.json()

  if (!slot || slot < 1 || slot > 7) {
    return NextResponse.json({ erro: 'Slot deve ser entre 1 e 7' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('galeria_home')
    .update({ galeria_id: galeria_id ?? null, updated_at: new Date().toISOString() })
    .eq('slot', slot)

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ sucesso: true })
}
