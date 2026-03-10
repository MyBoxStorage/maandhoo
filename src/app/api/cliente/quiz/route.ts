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

    const { respostas, perfil_id, perfil_nome, lgpd_aceito, lgpd_versao } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const ua = req.headers.get('user-agent') || ''
    const agora = new Date().toISOString()

    const updates: Record<string, unknown> = {
      quiz_feito: true,
      quiz_feito_em: agora,
      quiz_respostas: respostas,
      quiz_perfil_id: perfil_id,
      quiz_perfil_nome: perfil_nome,
    }

    // Salva consentimento LGPD se foi dado
    if (lgpd_aceito) {
      updates.lgpd_aceito = true
      updates.lgpd_aceito_em = agora
      updates.lgpd_versao_termo = lgpd_versao || '1.0'
      updates.lgpd_ip = ip

      // Log imutável de consentimento (obrigatório LGPD)
      await supabase.from('consentimentos_log').insert({
        cliente_id: clienteId,
        tipo: 'lgpd',
        acao: 'aceite',
        versao_termo: lgpd_versao || '1.0',
        ip,
        user_agent: ua,
      })
    }

    await supabase.from('clientes').update(updates).eq('id', clienteId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Quiz POST error:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
