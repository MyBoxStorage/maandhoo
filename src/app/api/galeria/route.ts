import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/galeria — retorna todas as mídias, mais recentes primeiro
// Cache desabilitado para refletir uploads imediatamente
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('galeria')
    .select('id, url, alt, orientacao, ordem, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  return NextResponse.json(
    { fotos: data ?? [] },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    }
  )
}
