import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/admin/sync-leads
// Popula a tabela leads retroativamente a partir de:
// - lista_amiga (inscrições já feitas)
// - clientes (contas criadas em /minha-conta)
// - reservas (formulários de reserva já enviados)
// Usa INSERT ... ON CONFLICT DO NOTHING para ser idempotente
export async function POST() {
  const resultados: Record<string, number> = { lista_amiga: 0, clientes: 0, reservas: 0, erros: 0 }

  // ── 1. LISTA AMIGA ─────────────────────────────────────────────────────────
  try {
    const { data: inscritos } = await supabaseAdmin
      .from('lista_amiga')
      .select('nome, email, evento_id, genero, created_at')
      .order('created_at', { ascending: true })

    for (const i of inscritos ?? []) {
      // buscar nome do evento
      const { data: ev } = await supabaseAdmin
        .from('eventos').select('nome').eq('id', i.evento_id).single()

      const { error } = await supabaseAdmin.from('leads').insert({
        nome: i.nome,
        email: i.email,
        whatsapp: null,
        origem: 'popup_lista',
        evento_id: i.evento_id,
        evento_nome: ev?.nome ?? null,
        observacoes: `Gênero: ${i.genero} · Retroativo`,
        consentimento_lgpd: true,
        data_consentimento: i.created_at,
        status: 'novo',
        created_at: i.created_at,
      })

      if (!error) resultados.lista_amiga++
      else if (!error.message?.includes('duplicate') && !error.message?.includes('unique'))
        resultados.erros++
    }
  } catch (e) {
    console.error('[sync-leads] lista_amiga:', e)
    resultados.erros++
  }

  // ── 2. CLIENTES REGISTRADOS ────────────────────────────────────────────────
  try {
    const { data: clientes } = await supabaseAdmin
      .from('clientes')
      .select('nome, email, whatsapp, lgpd_aceito, lgpd_aceito_em, created_at')
      .order('created_at', { ascending: true })

    for (const c of clientes ?? []) {
      const { error } = await supabaseAdmin.from('leads').insert({
        nome: c.nome,
        email: c.email,
        whatsapp: c.whatsapp ?? null,
        origem: 'compra_ingresso',
        observacoes: 'Cadastro via área do cliente (/minha-conta) · Retroativo',
        consentimento_lgpd: c.lgpd_aceito ?? false,
        data_consentimento: c.lgpd_aceito_em ?? c.created_at,
        status: 'novo',
        created_at: c.created_at,
      })

      if (!error) resultados.clientes++
      else if (!error.message?.includes('duplicate') && !error.message?.includes('unique'))
        resultados.erros++
    }
  } catch (e) {
    console.error('[sync-leads] clientes:', e)
    resultados.erros++
  }

  // ── 3. RESERVAS ────────────────────────────────────────────────────────────
  try {
    const { data: reservas } = await supabaseAdmin
      .from('reservas')
      .select('nome, email, whatsapp, tipo, area_desejada, numero_pessoas, observacoes, created_at')
      .order('created_at', { ascending: true })

    const origemMap: Record<string, string> = {
      mesa: 'reserva_mesa',
      camarote: 'reserva_camarote',
      aniversario: 'reserva_aniversario',
    }

    for (const r of reservas ?? []) {
      const { error } = await supabaseAdmin.from('leads').insert({
        nome: r.nome,
        email: r.email ?? null,
        whatsapp: r.whatsapp ?? null,
        origem: origemMap[r.tipo] ?? 'contato',
        observacoes: `Reserva ${r.tipo} · ${r.numero_pessoas} pessoas · ${r.area_desejada ?? ''} · Retroativo`,
        consentimento_lgpd: true,
        data_consentimento: r.created_at,
        status: 'novo',
        created_at: r.created_at,
      })

      if (!error) resultados.reservas++
      else if (!error.message?.includes('duplicate') && !error.message?.includes('unique'))
        resultados.erros++
    }
  } catch (e) {
    console.error('[sync-leads] reservas:', e)
    resultados.erros++
  }

  const total = resultados.lista_amiga + resultados.clientes + resultados.reservas
  return NextResponse.json({
    sucesso: true,
    total_importados: total,
    detalhes: resultados,
    mensagem: `${total} leads importados retroativamente.`,
  })
}
