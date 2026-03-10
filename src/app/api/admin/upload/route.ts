import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ erro: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ erro: 'Tipo inválido. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const fileName = `flyers/${timestamp}-${random}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const client = getSupabaseAdmin()
    const { error: uploadError } = await client.storage
      .from('imagens')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] Supabase Storage error:', uploadError)
      return NextResponse.json({ erro: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = client.storage
      .from('imagens')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl, fileName })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[upload] Exception:', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}
