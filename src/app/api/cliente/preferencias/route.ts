import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessao = cookieStore.get('cliente_sessao')?.value
    if (!sessao) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    let clienteId: string
    try { clienteId = JSON.parse(sessao).id } catch { return NextResponse.json({ erro: 'Sessão inválida' }, { status: 401 }) }

    const body = await req.json()
    const allowed = ['badge_ativo', 'tema_ativo']
    const updates: Record<string, unknown> = {}
    allowed.forEach(k => { if (k in body) updates[k] = body[k] })

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ erro: 'Nenhum campo válido' }, { status: 400 })

    await supabase.from('clientes').update(updates).eq('id', clienteId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Preferencias PATCH error:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
