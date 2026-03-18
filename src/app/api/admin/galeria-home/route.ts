import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/galeria-home
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria_home')
    .select('slot, galeria_id, galeria:galeria_id(id, url, alt)')
    .order('slot', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  return NextResponse.json(
    { slots: data ?? [] },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}

// PUT /api/admin/galeria-home
export async function PUT(req: NextRequest) {
  return handleUpdate(req)
}

// POST como fallback (Vercel às vezes bloqueia PUT)
export async function POST(req: NextRequest) {
  return handleUpdate(req)
}

async function handleUpdate(req: NextRequest) {
  try {
    const body = await req.json()
    const { slot, galeria_id } = body

    if (!slot || slot < 1 || slot > 7) {
      return NextResponse.json({ erro: 'Slot deve ser entre 1 e 7' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('galeria_home')
      .update({
        galeria_id: galeria_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('slot', slot)

    if (error) {
      console.error('[galeria-home PUT]', error)
      return NextResponse.json({ erro: error.message }, { status: 500 })
    }

    return NextResponse.json({ sucesso: true })
  } catch (err) {
    console.error('[galeria-home PUT] erro:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
