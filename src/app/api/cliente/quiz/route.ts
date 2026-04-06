import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'
import { sendBcEvent } from '@/lib/bcconnect'

// POST /api/cliente/quiz
// Salva resultado do quiz de perfil + envia preferências ao BC Connect
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
    if (!token) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

    const payload = verificarTokenCliente(token)
    if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

    const { respostas, perfil_id, perfil_nome, lgpd_aceito, lgpd_versao } = await req.json()

    const ip    = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
              ?? req.headers.get('x-real-ip')
              ?? 'unknown'
    const ua    = req.headers.get('user-agent') ?? ''
    const agora = new Date().toISOString()

    const updates: Record<string, unknown> = {
      quiz_feito:       true,
      quiz_feito_em:    agora,
      quiz_respostas:   respostas,
      quiz_perfil_id:   perfil_id,
      quiz_perfil_nome: perfil_nome,
    }

    if (lgpd_aceito) {
      updates.lgpd_aceito        = true
      updates.lgpd_aceito_em     = agora
      updates.lgpd_versao_termo  = lgpd_versao ?? '1.0'
      updates.lgpd_ip            = ip

      await supabaseAdmin.from('consentimentos_log').insert({
        cliente_id:  payload.id,
        tipo:        'lgpd',
        acao:        'aceite',
        versao_termo: lgpd_versao ?? '1.0',
        ip,
        user_agent:  ua,
      })
    }

    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .update(updates)
      .eq('id', payload.id)
      .select('email, nome, whatsapp')
      .single()

    if (error) {
      console.error('[quiz POST]', error)
      return NextResponse.json({ erro: 'Erro ao salvar quiz' }, { status: 500 })
    }

    // Envia preferências ao BC Connect para enriquecer o score do lead
    // respostas é um objeto { categoria: valor } vindo do quiz de perfil
    if (cliente?.email && respostas && typeof respostas === 'object') {
      const preferences = Object.entries(respostas as Record<string, string>).map(
        ([category, value]) => ({ category: String(category).toUpperCase(), value: String(value) })
      )

      void sendBcEvent({
        eventType: 'PREFERENCE_UPDATE',
        occurredAt: agora,
        lead: {
          email: cliente.email,
          name:  cliente.nome ?? undefined,
          phone: cliente.whatsapp ? String(cliente.whatsapp).replace(/\D/g, '') : undefined,
        },
        optinAccepted: true,
        metadata: {
          preferences,
          eventName: `quiz_perfil_${perfil_id ?? 'desconhecido'}`,
          occasionType: 'quiz',
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[quiz POST] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
