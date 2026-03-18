import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verificarTokenCliente, CLIENTE_SESSION_COOKIE } from '@/lib/cliente-session'

// PATCH /api/cliente/preferencias
// Atualiza preferências visuais do cliente (badge_ativo, tema_ativo)
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(CLIENTE_SESSION_COOKIE)?.value
    if (!token) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

    const payload = verificarTokenCliente(token)
    if (!payload) return NextResponse.json({ erro: 'Sessão expirada' }, { status: 401 })

    const body = await req.json()

    // Só permite atualizar campos de preferência — nunca dados sensíveis
    const camposPermitidos = ['badge_ativo', 'tema_ativo']
    const updates: Record<string, unknown> = {}
    camposPermitidos.forEach(k => {
      if (k in body) updates[k] = body[k]
    })

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ erro: 'Nenhum campo válido informado' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('clientes')
      .update(updates)
      .eq('id', payload.id)

    if (error) {
      console.error('[preferencias PATCH]', error)
      return NextResponse.json({ erro: 'Erro ao salvar preferências' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[preferencias PATCH] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
