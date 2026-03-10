import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessao = cookieStore.get('cliente_sessao')?.value
    if (!sessao) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

    let clienteId: string
    try { clienteId = JSON.parse(sessao).id } catch { return NextResponse.json({ erro: 'Sessão inválida' }, { status: 401 }) }

    const { respostas, perfil } = await req.json()
    if (!respostas || !perfil) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })

    // Salva/atualiza preferências do cliente
    const { error } = await supabase
      .from('clientes')
      .update({
        quiz_respostas: respostas,
        quiz_perfil: perfil,
        quiz_feito_em: new Date().toISOString(),
      })
      .eq('id', clienteId)

    if (error) {
      // Coluna pode não existir ainda — retorna ok silencioso
      console.warn('Quiz save warning:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Quiz POST error:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
