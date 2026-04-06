import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'
import { sendBcEvent } from '@/lib/bcconnect'

// PATCH /api/cliente/preferencias
// Atualiza preferências visuais do cliente e envia ao BC Connect
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
    if (!token) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

    const payload = verificarTokenCliente(token)
    if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

    const body = await req.json()

    const camposPermitidos = ['badge_ativo', 'tema_ativo']
    const updates: Record<string, unknown> = {}
    camposPermitidos.forEach(k => {
      if (k in body) updates[k] = body[k]
    })

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ erro: 'Nenhum campo válido informado' }, { status: 400 })
    }

    const { data: cliente, error } = await supabaseAdmin
      .from('clientes')
      .update(updates)
      .eq('id', payload.id)
      .select('email, nome, whatsapp')
      .single()

    if (error) {
      console.error('[preferencias PATCH]', error)
      return NextResponse.json({ erro: 'Erro ao salvar preferências' }, { status: 500 })
    }

    // Envia preferências ao BC Connect
    if (cliente?.email) {
      const preferences = Object.entries(updates).map(([category, value]) => ({
        category: category.toUpperCase(),
        value: String(value),
      }))

      void sendBcEvent({
        eventType: 'PREFERENCE_UPDATE',
        occurredAt: new Date().toISOString(),
        lead: {
          email: cliente.email,
          name:  cliente.nome ?? undefined,
          phone: cliente.whatsapp ? String(cliente.whatsapp).replace(/\D/g, '') : undefined,
        },
        optinAccepted: true,
        metadata: { preferences, occasionType: 'preferencias_visuais' },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[preferencias PATCH] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
