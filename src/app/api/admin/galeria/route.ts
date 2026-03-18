import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Injeta q_auto,f_auto em URLs do Cloudinary automaticamente.
 */
function otimizarUrlCloudinary(url: string): string {
  if (!url) return url
  if (!url.includes('cloudinary.com')) return url
  if (url.includes('q_auto')) return url
  return url.replace('/upload/', '/upload/q_auto,f_auto/')
}

// GET /api/admin/galeria
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .select('*, evento:eventos(id, nome)')
    .order('ordem', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ fotos: data })
}

// POST /api/admin/galeria — adicionar mídia (sempre vai para o topo, ordem 0)
export async function POST(req: Request) {
  const body = await req.json()
  const { url, alt, evento_id, orientacao } = body

  if (!url) return NextResponse.json({ erro: 'URL é obrigatória' }, { status: 400 })

  // Buscar todas as mídias existentes e incrementar suas ordens (+1)
  const { data: todos } = await supabaseAdmin
    .from('galeria')
    .select('id, ordem')

  if (todos && todos.length > 0) {
    await Promise.all(
      todos.map(item =>
        supabaseAdmin.from('galeria').update({ ordem: item.ordem + 1 }).eq('id', item.id)
      )
    )
  }

  // Inserir nova mídia com ordem 0 (sempre no topo)
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .insert({
      url: otimizarUrlCloudinary(url),
      alt: alt || null,
      evento_id: evento_id || null,
      ordem: 0,
      orientacao: orientacao ?? 'landscape',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ foto: data })
}

// PATCH /api/admin/galeria — reordenar lote
export async function PATCH(req: Request) {
  const { ordens } = await req.json() as { ordens: Array<{ id: string; ordem: number }> }

  if (!Array.isArray(ordens)) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })

  const ops = ordens.map(({ id, ordem }) =>
    supabaseAdmin.from('galeria').update({ ordem }).eq('id', id)
  )
  await Promise.all(ops)

  return NextResponse.json({ sucesso: true })
}
