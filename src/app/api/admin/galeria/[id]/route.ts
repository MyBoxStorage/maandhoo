import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Injeta q_auto,f_auto em URLs do Cloudinary automaticamente.
 * URLs de imagem (Supabase Storage, etc.) passam sem alteração.
 */
function otimizarUrlCloudinary(url: string): string {
  if (!url) return url
  if (!url.includes('cloudinary.com')) return url
  if (url.includes('q_auto')) return url  // já tem otimização
  return url.replace('/upload/', '/upload/q_auto,f_auto/')
}

// PUT /api/admin/galeria/[id] — substituição completa
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  // Otimiza URL se for Cloudinary
  if (body.url) body.url = otimizarUrlCloudinary(body.url)

  const { data, error } = await supabaseAdmin
    .from('galeria')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ foto: data })
}

// PATCH /api/admin/galeria/[id] — atualização parcial (destaque, ordem, etc.)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  // Otimiza URL se vier no body (ex: edição do campo URL)
  if (body.url) body.url = otimizarUrlCloudinary(body.url)

  const { data, error } = await supabaseAdmin
    .from('galeria')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ foto: data })
}

// DELETE /api/admin/galeria/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin.from('galeria').delete().eq('id', params.id)
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ sucesso: true })
}
