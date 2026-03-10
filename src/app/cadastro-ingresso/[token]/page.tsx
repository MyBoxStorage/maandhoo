'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import { CheckCircle2, XCircle, Loader2, User, Mail, Phone, CreditCard, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Fase = 'carregando' | 'formulario' | 'enviando' | 'sucesso' | 'erro'

interface DadosIngresso {
  id: string
  tipo: string
  eventos: { nome: string; data_evento: string; hora_abertura: string; flyer_url?: string }
  lotes?: { nome?: string; preco_masc: number; preco_fem: number }
}

export default function CadastroIngressoPage() {
  const { token } = useParams<{ token: string }>()

  const [fase, setFase] = useState<Fase>('carregando')
  const [ingresso, setIngresso] = useState<DadosIngresso | null>(null)
  const [erroMsg, setErroMsg] = useState('')
  const [emailEnviado, setEmailEnviado] = useState(true)

  const [form, setForm] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    whatsapp: '',
    genero: '' as 'masculino' | 'feminino' | 'outro' | '',
  })

  // ── Verificar link ao carregar ──────────────────────────────
  useEffect(() => {
    if (!token) return
    fetch(`/api/ingressos/validar-link?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.erro) { setErroMsg(data.erro); setFase('erro') }
        else { setIngresso(data.ingresso); setFase('formulario') }
      })
      .catch(() => { setErroMsg('Erro de conexão. Tente novamente.'); setFase('erro') })
  }, [token])

  // ── Máscara de CPF ──────────────────────────────────────────
  const maskCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  // ── Máscara de WhatsApp ─────────────────────────────────────
  const maskPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ── Enviar formulário ───────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.nome_completo || !form.cpf || !form.email || !form.whatsapp || !form.genero) {
      alert('Preencha todos os campos.')
      return
    }
    setFase('enviando')
    try {
      const res = await fetch('/api/ingressos/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_token: token, ...form }),
      })
      const data = await res.json()
      if (data.sucesso) {
        setEmailEnviado(data.email_enviado !== false)
        setFase('sucesso')
      } else { setErroMsg(data.erro ?? 'Erro ao processar cadastro.'); setFase('erro') }
    } catch {
      setErroMsg('Erro de conexão. Tente novamente.')
      setFase('erro')
    }
  }

  // ── RENDER ──────────────────────────────────────────────────
  const dataFormatada = ingresso?.eventos?.data_evento
    ? format(new Date(`${ingresso.eventos.data_evento.slice(0, 10)}T00:00:00`), "dd 'de' MMMM", { locale: ptBR })
    : ''

  return (
    <div className="min-h-screen bg-preto-profundo flex flex-col items-center justify-center px-4 py-12">

      {/* LOGO */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <LogoElefante width={48} height={53} color="#C9A84C" />
        <span className="font-accent text-xs tracking-[0.4em] text-dourado/60 uppercase">Maandhoo Club</span>
      </div>

      <div className="w-full max-w-md">

        {/* CARREGANDO */}
        {fase === 'carregando' && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 size={32} className="animate-spin text-dourado/50" />
            <p className="font-body text-sm text-bege-escuro/50">Verificando seu link...</p>
          </div>
        )}

        {/* ERRO */}
        {fase === 'erro' && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-sm p-8 text-center">
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="font-accent text-base tracking-widest text-red-400 mb-2">Link Inválido</p>
            <p className="font-body text-sm text-bege-escuro/60">{erroMsg}</p>
          </div>
        )}

        {/* SUCESSO */}
        {fase === 'sucesso' && (
          <div className="border border-dourado/30 bg-dourado/5 rounded-sm p-8 text-center">
            <CheckCircle2 size={56} className="text-dourado mx-auto mb-5" />
            <p className="font-accent text-lg tracking-widest text-dourado mb-3">Cadastro Confirmado!</p>
            {emailEnviado ? (
              <p className="font-body text-sm text-bege-escuro/70 leading-relaxed">
                Seu ingresso foi enviado para o email informado.<br/>
                Apresente o QR Code na entrada do evento.
              </p>
            ) : (
              <p className="font-body text-sm text-amber-400/80 leading-relaxed">
                Seu cadastro foi realizado com sucesso, porém houve uma falha no envio do email.<br/>
                Entre em contato conosco via WhatsApp para receber seu QR Code.
              </p>
            )}
            <div className="mt-6 border-t border-dourado/15 pt-5">
              <p className="font-body text-xs text-bege-escuro/40">
                {emailEnviado
                  ? 'Não encontrou o email? Verifique a pasta de spam ou entre em contato via WhatsApp.'
                  : 'Seu ingresso está garantido. Fale conosco pelo WhatsApp para mais informações.'}
              </p>
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        {(fase === 'formulario' || fase === 'enviando') && ingresso && (
          <>
            {/* Card do evento */}
            <div className="border border-dourado/20 bg-dourado/5 rounded-sm p-4 mb-6 flex items-center gap-4">
              {ingresso.eventos.flyer_url && (
                <img src={ingresso.eventos.flyer_url} alt="" className="w-12 h-16 object-cover rounded-sm flex-shrink-0 opacity-90" />
              )}
              <div>
                <p className="font-accent text-xs tracking-[0.2em] text-dourado/60 uppercase mb-1">Ingresso para</p>
                <p className="font-display text-base text-bege">{ingresso.eventos.nome}</p>
                <p className="font-body text-xs text-bege-escuro/50 mt-0.5">
                  {dataFormatada} · {ingresso.eventos.hora_abertura}
                </p>
              </div>
            </div>

            {/* Campos */}
            <div className="space-y-4">

              {/* Nome */}
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Nome Completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
                  <input
                    type="text"
                    value={form.nome_completo}
                    onChange={e => handleChange('nome_completo', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3.5 font-body text-sm text-bege outline-none transition-colors"
                    placeholder="Como aparece no documento"
                    disabled={fase === 'enviando'}
                  />
                </div>
              </div>

              {/* Gênero */}
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Gênero</label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30 pointer-events-none" />
                  <select
                    value={form.genero}
                    onChange={e => handleChange('genero', e.target.value)}
                    className="w-full appearance-none bg-black/30 border border-white/10 focus:border-dourado/40 rounded-sm px-4 py-3.5 font-body text-sm text-bege outline-none transition-colors"
                    disabled={fase === 'enviando'}
                  >
                    <option value="" disabled>Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">CPF</label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={e => handleChange('cpf', maskCPF(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3.5 font-body text-sm text-bege outline-none transition-colors font-mono tracking-wider"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    disabled={fase === 'enviando'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">E-mail</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3.5 font-body text-sm text-bege outline-none transition-colors"
                    placeholder="seu@email.com"
                    inputMode="email"
                    disabled={fase === 'enviando'}
                  />
                </div>
                <p className="font-body text-[10px] text-bege-escuro/35 mt-1.5 pl-1">O QR Code será enviado para este email</p>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => handleChange('whatsapp', maskPhone(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3.5 font-body text-sm text-bege outline-none transition-colors"
                    placeholder="(47) 99999-9999"
                    inputMode="tel"
                    disabled={fase === 'enviando'}
                  />
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={handleSubmit}
                disabled={fase === 'enviando'}
                className="w-full bg-dourado hover:bg-dourado/90 disabled:bg-dourado/40 text-preto-profundo font-accent text-xs tracking-[0.25em] uppercase py-4 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {fase === 'enviando'
                  ? <><Loader2 size={14} className="animate-spin" /> Enviando ingresso...</>
                  : 'Confirmar e Receber Ingresso'
                }
              </button>

              {/* Aviso LGPD */}
              <p className="font-body text-[10px] text-bege-escuro/25 text-center leading-relaxed">
                Seus dados são utilizados exclusivamente para identificação e envio do ingresso, conforme a LGPD.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
