import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashCPF, formatarCPF, validarCPF, calcularExpiracao } from '@/lib/ingresso-utils'
import { enviarEmailIngresso } from '@/lib/email-ingresso'
import type { CadastroPayload } from '@/types/ingressos'

/**
 * POST /api/ingressos/cadastro
 * Recebe dados do formulário de cadastro via link único
 * Valida, salva cadastro, ativa ingresso e envia QR Code por email
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

    // ── Lock atômico: marca link_usado = true SOMENTE se ainda false ──
    // Isso evita race condition onde dois requests simultâneos passariam
    // pela verificação anterior antes de um deles gravar o lock.
    const { data: lockData, error: errLock } = await supabaseAdmin
      .from('ingressos')
      .update({
        status: 'ativo',
        link_usado: true,
        expira_em: expiraEm,
      })
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
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.replace(/[^0-9]/g, ''),
        genero,
        email_enviado: email.trim().toLowerCase(),
      })

    if (errCadastro) {
      console.error('[cadastro] Erro ao salvar cadastro:', errCadastro)
      // Reverter o lock caso o cadastro falhe
      await supabaseAdmin
        .from('ingressos')
        .update({ status: 'aguardando_cadastro', link_usado: false })
        .eq('id', ingresso.id)
      return NextResponse.json({ erro: 'Erro ao salvar cadastro' }, { status: 500 })
    }

    // ── Enviar email com QR Code ────────────────────────────────
    const resultadoEmail = await enviarEmailIngresso({
      para: email,
      nomeCompleto: nome_completo,
      cpf,
      eventoNome: ingresso.eventos?.nome ?? 'Evento Maandhoo',
      eventoData: ingresso.eventos?.data_evento ?? new Date().toISOString(),
      eventoHora: ingresso.eventos?.hora_abertura ?? '22:00',
      tipoIngresso: ingresso.tipo,
      qrToken: ingresso.qr_token,
      ingressoId: ingresso.id,
      loteNome: ingresso.lotes?.nome,
      precoPago: ingresso.preco_pago,
    })

    // ── Marcar email como enviado ───────────────────────────────
    if (resultadoEmail.sucesso) {
      await supabaseAdmin
        .from('cadastros')
        .update({ qr_enviado: true, qr_enviado_em: new Date().toISOString() })
        .eq('ingresso_id', ingresso.id)
    } else {
      console.error('[cadastro] Falha ao enviar email:', resultadoEmail.erro)
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Cadastro realizado! Seu ingresso foi enviado para o email.',
      email_enviado: resultadoEmail.sucesso,
      aviso_email: resultadoEmail.sucesso
        ? undefined
        : 'Cadastro realizado, mas houve falha no envio do email. Entre em contato conosco.',
    })
  } catch (err) {
    console.error('[cadastro] Erro inesperado:', err)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
