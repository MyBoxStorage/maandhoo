'use client'

import React, { useState } from 'react'
import { X, User, Mail, Phone, CreditCard, QrCode, Shield, CheckCircle, Copy, Check, Loader2, ArrowRight } from 'lucide-react'
import { TipoIngresso, GeneroIngresso } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Step = 'dados' | 'pagamento' | 'pix' | 'sucesso'
type MetodoPagamento = 'pix' | 'cartao'

interface Props {
  eventoId: string
  eventoNome: string
  eventoData: string
  eventoHora: string
  lotes: Array<{ id: string; numero: number; nome: string | null; preco_masc: number; preco_fem: number; preco_backstage_masc?: number | null; preco_backstage_fem?: number | null; ativo: boolean }>
  tipoInicial: TipoIngresso
  generoInicial: GeneroIngresso
  onClose: () => void
}

export const CompraIngressoModal: React.FC<Props> = ({
  eventoId, eventoNome, eventoData, eventoHora, lotes, tipoInicial, generoInicial, onClose
}) => {
  const [step, setStep] = useState<Step>('dados')
  const [tipo, setTipo] = useState<TipoIngresso>(tipoInicial)
  const [genero, setGenero] = useState<GeneroIngresso>(generoInicial)
  const [metodo, setMetodo] = useState<MetodoPagamento>('pix')
  const [loading, setLoading] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    whatsapp: '',
  })

  const [pixData, setPixData] = useState({
    qrCodeBase64: '',
    copiaCola: 'PIX_COPIA_COLA_PLACEHOLDER_CONFIGURE_MERCADOPAGO',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  })

  const loteAtivo = lotes.find(l => l.ativo) ?? lotes[0]

  const precos = {
    pista:     { masculino: loteAtivo?.preco_masc ?? 0, feminino: loteAtivo?.preco_fem ?? 0 },
    backstage: { masculino: loteAtivo?.preco_backstage_masc ?? 120, feminino: loteAtivo?.preco_backstage_fem ?? 60 },
  }

  const preco = precos[tipo][genero]
  const nomeIngresso = `${tipo === 'pista' ? 'Pista' : 'Backstage'} ${genero === 'masculino' ? 'Masculino' : 'Feminino'}`

  const formatCPF = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11)
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')
      .replace(/(\d{3})(\d{3})/, '$1.$2')
  }

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11)
    return n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      .replace(/(\d{2})(\d{4,5})/, '($1) $2')
  }

  const handleInput = (field: keyof typeof form, value: string) => {
    if (field === 'cpf') value = formatCPF(value)
    if (field === 'whatsapp') value = formatPhone(value)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validarDados = () => {
    const cpfLimpo = form.cpf.replace(/\D/g, '')
    if (!form.nome.trim() || form.nome.trim().split(' ').length < 2) {
      toast.error('Informe seu nome completo')
      return false
    }
    if (cpfLimpo.length !== 11) {
      toast.error('CPF inválido')
      return false
    }
    if (!form.email.includes('@')) {
      toast.error('Email inválido')
      return false
    }
    return true
  }

  const handleProsseguir = () => {
    if (!validarDados()) return
    setStep('pagamento')
  }

  const handleGerarPagamento = async () => {
    setLoading(true)
    try {
      // Chamada real: POST /api/pagamentos
      // Configure MERCADOPAGO_ACCESS_TOKEN no .env para ativar
      await new Promise(r => setTimeout(r, 1500))

      if (metodo === 'pix') {
        setPixData({
          qrCodeBase64: '',
          copiaCola: 'Configure MERCADOPAGO_ACCESS_TOKEN no .env.local para gerar PIX real',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        })
        setStep('pix')
      } else {
        toast('Integração de cartão: configure o Mercado Pago SDK', { icon: 'ℹ️' })
      }
    } catch {
      toast.error('Erro ao gerar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const copiarPix = async () => {
    await navigator.clipboard.writeText(pixData.copiaCola)
    setCopiado(true)
    toast.success('Código PIX copiado!')
    setTimeout(() => setCopiado(false), 3000)
  }

  // Simular confirmação de pagamento (só em dev — em prod: webhook do MP)
  const simularConfirmacao = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setStep('sucesso')
    setLoading(false)
    toast.success('Ingresso gerado! Acesse Minha Conta para ver o QR Code.')
  }

  // Suprimir warning de eventoId não usado (será usado quando MP for integrado)
  void eventoId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 bg-card border border-gold rounded-sm max-h-[92vh] overflow-y-auto animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <div>
            <p className="font-accent text-xs tracking-widest uppercase text-dourado">
              {step === 'dados' ? 'Seus Dados' : step === 'pagamento' ? 'Pagamento' : step === 'pix' ? 'PIX' : 'Confirmado!'}
            </p>
            <h3 className="font-display text-2xl text-bege mt-0.5">{eventoNome}</h3>
          </div>
          <button onClick={onClose} className="text-bege-escuro hover:text-bege transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* RESUMO DO INGRESSO */}
        <div className="px-6 py-4 bg-black/30 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-bege-escuro/60">{nomeIngresso}</p>
            <p className="font-body text-xs text-bege-escuro/40">
              {format(new Date(`${eventoData}T00:00:00`), "dd/MM/yyyy", { locale: ptBR })} às {eventoHora} · {loteAtivo?.nome ?? 'Lote'}
            </p>
          </div>
          <div className="font-display text-2xl text-gradient-gold">
            R$ {preco.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* STEPS */}
        <div className="p-6">

          {/* ── STEP 1: DADOS ── */}
          {step === 'dados' && (
            <div className="space-y-5">
              {/* Seletor tipo/gênero */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Tipo</label>
                  <div className="flex gap-2">
                    {(['pista', 'backstage'] as TipoIngresso[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTipo(t)}
                        className={`flex-1 py-2 text-xs font-accent tracking-wider uppercase rounded-sm border transition-all duration-200
                          ${tipo === t ? 'border-dourado bg-dourado/15 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/40'}`}
                      >
                        {t === 'pista' ? 'Pista' : 'Backstage'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="admin-label">Gênero</label>
                  <div className="flex gap-2">
                    {(['masculino', 'feminino'] as GeneroIngresso[]).map(g => (
                      <button
                        key={g}
                        onClick={() => setGenero(g)}
                        className={`flex-1 py-2 text-xs font-accent tracking-wider uppercase rounded-sm border transition-all duration-200
                          ${genero === g ? 'border-dourado bg-dourado/15 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/40'}`}
                      >
                        {g === 'masculino' ? 'Masc' : 'Fem'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campos */}
              <div>
                <label className="admin-label">Nome Completo *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
                  <input
                    type="text"
                    value={form.nome}
                    onChange={e => handleInput('nome', e.target.value)}
                    className="admin-input pl-9"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">CPF *</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={e => handleInput('cpf', e.target.value)}
                  className="admin-input"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <label className="admin-label">Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleInput('email', e.target.value)}
                    className="admin-input pl-9"
                    placeholder="seu@email.com"
                  />
                </div>
                {/* Atualizado: instrução para acessar em Minha Conta */}
                <p className="text-xs text-bege-escuro/40 mt-1">
                  Use o mesmo email ao acessar <strong className="text-bege-escuro/60">Minha Conta</strong> para ver o QR Code
                </p>
              </div>

              <div>
                <label className="admin-label">WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => handleInput('whatsapp', e.target.value)}
                    className="admin-input pl-9"
                    placeholder="(47) 99999-9999"
                  />
                </div>
              </div>

              <button onClick={handleProsseguir} className="btn-primary w-full">
                Continuar para Pagamento
              </button>

              <div className="flex items-center gap-2 justify-center">
                <Shield size={13} className="text-dourado/50" />
                <p className="text-xs text-bege-escuro/40">Compra segura · Dados protegidos · LGPD</p>
              </div>
            </div>
          )}

          {/* ── STEP 2: PAGAMENTO ── */}
          {step === 'pagamento' && (
            <div className="space-y-5">
              <div className="bg-black/30 border border-white/5 rounded-sm p-4 space-y-2">
                <p className="font-body text-xs text-bege-escuro/60">Comprador</p>
                <p className="font-body text-sm text-bege">{form.nome}</p>
                <p className="font-body text-xs text-bege-escuro/60">{form.email}</p>
              </div>

              <div>
                <label className="admin-label mb-3">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'pix', label: 'PIX', icon: <QrCode size={20} />, desc: 'Instantâneo' },
                    { id: 'cartao', label: 'Cartão', icon: <CreditCard size={20} />, desc: 'Crédito/Débito' },
                  ] as const).map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMetodo(m.id)}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-sm transition-all duration-200
                        ${metodo === m.id ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/40'}`}
                    >
                      {m.icon}
                      <span className="font-accent text-xs tracking-wider">{m.label}</span>
                      <span className="font-body text-xs opacity-60">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider-gold opacity-30" />

              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-bege-escuro">Total</span>
                <span className="font-display text-2xl text-gradient-gold">R$ {preco.toFixed(2).replace('.', ',')}</span>
              </div>

              <button
                onClick={handleGerarPagamento}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Gerando...' : `Pagar com ${metodo === 'pix' ? 'PIX' : 'Cartão'}`}
              </button>

              <button
                onClick={() => setStep('dados')}
                className="w-full text-center text-xs text-bege-escuro/50 hover:text-bege-escuro transition-colors"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* ── STEP 3: PIX ── */}
          {step === 'pix' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-white rounded-sm flex items-center justify-center mb-4">
                  {pixData.qrCodeBase64 ? (
                    <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="w-full h-full" />
                  ) : (
                    <div className="text-center p-4">
                      <QrCode size={80} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Configure Mercado Pago</p>
                    </div>
                  )}
                </div>
                <p className="font-body text-sm text-bege-escuro/70">
                  Expira em <strong className="text-bege">30 minutos</strong>
                </p>
              </div>

              <div>
                <label className="admin-label">PIX Copia e Cola</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={pixData.copiaCola}
                    className="admin-input flex-1 text-xs font-mono truncate"
                  />
                  <button
                    onClick={copiarPix}
                    className="flex-shrink-0 px-4 py-3 border border-dourado/50 hover:border-dourado hover:bg-dourado/10 text-dourado rounded-sm transition-all duration-200"
                  >
                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="bg-dourado/5 border border-dourado/20 rounded-sm p-4 space-y-2 text-xs text-bege-escuro/70">
                <p>1. Abra o app do seu banco</p>
                <p>2. Acesse a área PIX e escolha "Pagar com QR Code" ou "Copia e Cola"</p>
                <p>3. Confirme o valor de <strong className="text-bege">R$ {preco.toFixed(2).replace('.', ',')}</strong></p>
                <p>4. Após o pagamento, acesse <strong className="text-bege">Minha Conta</strong> para ver o QR Code de entrada</p>
              </div>

              {/* DEV: botão simulação — apenas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={simularConfirmacao}
                  disabled={loading}
                  className="btn-outline w-full flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  [DEV] Simular Pagamento Confirmado
                </button>
              )}
            </div>
          )}

          {/* ── STEP 4: SUCESSO ── */}
          {step === 'sucesso' && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-dourado/15 flex items-center justify-center">
                  <CheckCircle size={48} className="text-dourado animate-pulse-gold" />
                </div>
              </div>

              <div>
                <h3 className="font-display text-3xl text-bege mb-2">Ingresso Confirmado!</h3>
                <p className="font-body text-sm text-bege-escuro/70">
                  Seu ingresso está disponível na sua área do cliente.
                </p>
              </div>

              <div className="bg-black/30 border border-gold/20 rounded-sm p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-bege-escuro/60">Evento</span>
                  <span className="text-bege">{eventoNome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-bege-escuro/60">Ingresso</span>
                  <span className="text-bege">{nomeIngresso}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-bege-escuro/60">Comprador</span>
                  <span className="text-bege">{form.nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-bege-escuro/60">Valor</span>
                  <span className="text-dourado">R$ {preco.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* CTA principal: ir para Minha Conta */}
              <Link
                href={`/acesso?email=${encodeURIComponent(form.email)}`}
                className="flex items-center justify-center gap-2 w-full bg-dourado hover:bg-dourado/90 text-preto-profundo font-accent text-xs tracking-[0.25em] uppercase py-4 rounded-sm transition-all"
              >
                Ver Ingresso em Minha Conta
                <ArrowRight size={14} />
              </Link>

              <button onClick={onClose} className="w-full text-center text-xs text-bege-escuro/40 hover:text-bege-escuro transition-colors">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompraIngressoModal
