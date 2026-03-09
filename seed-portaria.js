/**
 * seed-portaria.js
 * Cria credenciais de teste para o sistema de portaria Maandhoo Club
 * Uso: node seed-portaria.js
 */

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

  console.log('🔌 Conectando ao Supabase...')

  // ── 1. Criar evento de teste ──────────────────────────────────
  console.log('\n📅 Criando evento de teste...')
  const eventoRes = await pool.query(
    `
    INSERT INTO eventos (nome, data_evento, hora_abertura, hora_fechamento, ativo, descricao)
    VALUES ($1, CURRENT_DATE + INTERVAL '1 day', '22:00', '06:00', true, $2)
    RETURNING id, nome
  `,
    [
      `Noite de Teste ${Date.now()}`,
      'Evento criado automaticamente para testes do sistema',
    ],
  )
  const evento = eventoRes.rows[0]
  console.log(`   ✅ Evento: ${evento.nome} (${evento.id})`)

  // ── 2. Criar lote de teste no evento ─────────────────────────
  console.log('\n🎟️  Criando lote de teste...')
  await pool.query(
    `
    INSERT INTO lotes (evento_id, numero, nome, preco_masc, preco_fem, limite_masc, limite_fem, ativo)
    VALUES ($1, 1, '1o Lote', 50.00, 30.00, 100, 100, true)
    ON CONFLICT (evento_id, numero) DO NOTHING
  `,
    [evento.id],
  )
  console.log(`   ✅ Lote criado`)

  // ── 3. Criar porteiro admin ───────────────────────────────────
  console.log('\n👮 Criando porteiro admin de teste...')
  const senhaHash = await bcrypt.hash('teste123', 10)

  const porteiroRes = await pool.query(`
    INSERT INTO porteiros (nome, email, senha_hash, nivel, ativo)
    VALUES ('Admin Teste', 'admin@teste.com', $1, 'admin_saida', true)
    ON CONFLICT (email) DO UPDATE SET senha_hash = $1, ativo = true, nivel = 'admin_saida'
    RETURNING id, nome, email, nivel
  `, [senhaHash])
  const porteiro = porteiroRes.rows[0]
  console.log(`   ✅ Porteiro: ${porteiro.nome} (${porteiro.email})`)

  // ── 4. Criar ingresso de teste (status ativo) ─────────────────
  console.log('\n🎫 Criando ingresso de teste...')
  const qrToken = `TEST-${Date.now()}-QR`
  const ingressoRes = await pool.query(`
    INSERT INTO ingressos (evento_id, tipo, status, qr_token, link_token)
    VALUES ($1, 'pista_masc', 'ativo', $2, $3)
    RETURNING id, qr_token
  `, [evento.id, qrToken, `LINK-${Date.now()}`])
  const ingresso = ingressoRes.rows[0]
  console.log(`   ✅ Ingresso criado`)

  // ── 5. Criar cadastro vinculado ao ingresso ───────────────────
  console.log('\n👤 Vinculando cadastro ao ingresso...')
  await pool.query(
    `
    INSERT INTO cadastros (ingresso_id, nome_completo, cpf, cpf_hash, email, whatsapp, genero)
    VALUES ($1, 'Joao Teste da Silva', '123.456.789-00', 'hash_cpf_teste', 'joao@teste.com', '47999000000', 'masculino')
    ON CONFLICT (ingresso_id) DO NOTHING
  `,
    [ingresso.id],
  )
  console.log(`   ✅ Cadastro vinculado`)

  // ── Resumo final ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50))
  console.log('✅ SEED CONCLUÍDO — USE ESTES DADOS PARA TESTAR:')
  console.log('═'.repeat(50))
  console.log('\n🔐 LOGIN DA PORTARIA:')
  console.log('   Email : admin@teste.com')
  console.log('   Senha : teste123')
  console.log('\n📅 EVENTO DISPONÍVEL:')
  console.log(`   Nome  : ${evento.nome}`)
  console.log('\n🎫 QR CODE PARA VALIDAR (cole no campo manual):')
  console.log(`   Token : ${qrToken}`)
  console.log('\n' + '═'.repeat(50))

  await pool.end()
}

main().catch(err => {
  console.error('❌ Erro:', err.message)
  process.exit(1)
})
