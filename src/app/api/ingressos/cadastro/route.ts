import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashCPF, formatarCPF, validarCPF, calcularExpiracao } from '@/lib/ingresso-utils'
import type { CadastroPayload } from '@/types/ingressos'

/**
 * POST /api/ingressos/cadastro
 * Recebe dados do formulário via link único (camarote ou ingresso avulso).
 * Salva cadastro, ativa ingresso e vincula ao cliente (se já tiver conta).
 * O QR Code é exibido em /minha-conta — NÃO é mais enviado por email aqui.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CadastroPayload = await req.json()
    const { link_token, nome_completo, cpf, email, whatsapp, genero } = body

    // ── Validações básicas ──────────────────────────────────────
    if (!link_token || !nome_completo || !cpf || !email || !whatsapp || !genero) {
      return NextResponse.json({ erro: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (!validarCPF(cpf)) {
      return NextResponse.json({ erro: 'CPF inválido' }, { status: 400 })
    }

    // ── Buscar ingresso pelo link_token ─────────────────────────
    const { data: ingresso, error: errIngresso } = await supabaseAdmin
      .from('ingressos')
      .select('*, eventos(*), lotes(*)')
      .eq('link_token', link_token)
      .single()

    if (errIngresso || !ingresso) {
      return NextResponse.json({ erro: 'Link inválido' }, { status: 404 })
    }

    if (ingresso.status === 'cancelado' || ingresso.status === 'utilizado') {
      return NextResponse.json({ erro: 'Ingresso não disponível' }, { status: 410 })
    }

    // ── Verificar se CPF já tem cadastro neste ingresso ─────────
    const cpfHash = hashCPF(cpf)
    const { data: cadastroExistente } = await supabaseAdmin
      .from('cadastros')
      .select('id')
      .eq('cpf_hash', cpfHash)
      .eq('ingresso_id', ingresso.id)
      .maybeSingle()

    if (cadastroExistente) {
      return NextResponse.json({ erro: 'CPF já cadastrado neste ingresso' }, { status: 409 })
    }

    // ── Calcular expiração se não definida ──────────────────────
    let expiraEm = ingresso.expira_em
    if (!expiraEm && ingresso.eventos?.data_evento) {
      expiraEm = calcularExpiracao(ingresso.eventos.data_evento).toISOString()
    }

    // ── Verificar se já existe um cliente com este email ────────
    // Feito ANTES do lock para ter o cliente_id pronto para gravar junto
    const emailNormalizado = email.trim().toLowerCase()
    const { data: clienteExistente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('email', emailNormalizado)
      .maybeSingle()

    const clienteId = clienteExistente?.id ?? null

    // ── Lock atômico: marca link_usado = true SOMENTE se ainda false ──
    // Evita race condition onde dois requests simultâneos passariam
    // pela verificação anterior antes de um deles gravar o lock.
    const updatePayload: Record<string, unknown> = {
      status: 'ativo',
      link_usado: true,
      expira_em: expiraEm,
    }

    // Vincula ao cliente já na mesma operação atômica (se tiver conta)
    if (clienteId) {
      updatePayload.cliente_id = clienteId
    }

    const { data: lockData, error: errLock } = await supabaseAdmin
      .from('ingressos')
      .update(updatePayload)
      .eq('id', ingresso.id)
      .eq('link_usado', false)   // ← condição atômica: só atualiza se ainda não foi usado
      .select('id')
      .single()

    if (errLock || !lockData) {
      // Nenhuma linha foi afetada = outro request ganhou a corrida
      return NextResponse.json({ erro: 'Este link já foi utilizado' }, { status: 410 })
    }

    // ── Salvar cadastro ─────────────────────────────────────────
    const { error: errCadastro } = await supabaseAdmin
      .from('cadastros')
      .insert({
        ingresso_id: ingresso.id,
        nome_completo: nome_completo.trim(),
        cpf: formatarCPF(cpf),
        cpf_hash: cpfHash,
        email: emailNormalizado,
        whatsapp: whatsapp.replace(/[^0-9]/g, ''),
        genero,
        email_enviado: emailNormalizado,
      })

    if (errCadastro) {
      console.error('[cadastro] Erro ao salvar cadastro:', errCadastro)
      // Reverter o lock caso o cadastro falhe
      await supabaseAdmin
        .from('ingressos')
        .update({ status: 'aguardando_cadastro', link_usado: false, cliente_id: null })
        .eq('id', ingresso.id)
      return NextResponse.json({ erro: 'Erro ao salvar cadastro' }, { status: 500 })
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Cadastro realizado com sucesso! Acesse sua conta para ver o ingresso.',
      tem_conta: !!clienteId,
    })
  } catch (err) {
    console.error('[cadastro] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
