import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/admin/eventos/[id]/lotes — salvar/sincronizar lotes
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { lotes } = await req.json()
  const eventoId = params.id

  if (!Array.isArray(lotes)) return NextResponse.json({ erro: 'Lotes inválidos' }, { status: 400 })

  const novos      = lotes.filter(l => l.id.startsWith('new-'))
  const existentes = lotes.filter(l => !l.id.startsWith('new-'))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: PromiseLike<any>[] = []

  // Upsert lotes existentes — inclui campos de backstage
  if (existentes.length > 0) {
    ops.push(
      supabaseAdmin.from('lotes').upsert(
        existentes.map((l, i) => ({
          id:                   l.id,
          evento_id:            eventoId,
          numero:               l.numero ?? (i + 1),
          nome:                 l.nome,
          preco_masc:           l.preco_masc,
          preco_fem:            l.preco_fem,
          preco_backstage_masc: l.preco_backstage_masc ?? null,
          preco_backstage_fem:  l.preco_backstage_fem ?? null,
          limite_masc:          l.limite_masc ?? 100,
          limite_fem:           l.limite_fem ?? 100,
          ativo:                l.ativo,
          updated_at:           new Date().toISOString(),
        }))
      ).then(r => r)
    )
  }

  // Inserir lotes novos — inclui campos de backstage
  if (novos.length > 0) {
    const { data: lotesExistentes } = await supabaseAdmin
      .from('lotes')
      .select('numero')
      .eq('evento_id', eventoId)
      .order('numero', { ascending: false })
      .limit(1)

    const maxNumero = lotesExistentes?.[0]?.numero ?? 0

    ops.push(
      supabaseAdmin.from('lotes').insert(
        novos.map((l, i) => ({
          evento_id:            eventoId,
          numero:               l.numero ?? (maxNumero + i + 1),
          nome:                 l.nome,
          preco_masc:           l.preco_masc,
          preco_fem:            l.preco_fem,
          preco_backstage_masc: l.preco_backstage_masc ?? null,
          preco_backstage_fem:  l.preco_backstage_fem ?? null,
          limite_masc:          l.limite_masc ?? 100,
          limite_fem:           l.limite_fem ?? 100,
          ativo:                l.ativo,
        }))
      ).then(r => r)
    )
  }

  const resultados = await Promise.all(ops as Promise<{ error: { message: string } | null }>[])
  for (const r of resultados) {
    if (r?.error) return NextResponse.json({ erro: r.error.message }, { status: 500 })
  }

  // Retornar lotes atualizados
  const { data: lotesAtualizados, error } = await supabaseAdmin
    .from('lotes')
    .select('*')
    .eq('evento_id', eventoId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ lotes: lotesAtualizados })
}
