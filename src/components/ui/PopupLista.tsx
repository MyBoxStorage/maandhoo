'use client'

import React, { useState, useEffect } from 'react'
import { X, PartyPopper } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

type EventoPublico = {
  id: string
  nome: string
  data_evento: string
  lista_encerra_as?: string | null
}

export const PopupLista: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [genero, setGenero] = useState<'masculino' | 'feminino'>('feminino')
  const [lgpdAceito, setLgpdAceito] = useState(false)
  const [loading, setLoading] = useState(false)
  const [proximoEvento, setProximoEvento] = useState<EventoPublico | null>(null)

  useEffect(() => {
    const carregarEvento = async () => {
      try {
        const res = await fetch('/api/admin/eventos?publico=true')
        const data = await res.json()
        const eventos = Array.isArray(data.eventos) ? data.eventos : []
        setProximoEvento(eventos[0] ?? null)
      } catch {
        setProximoEvento(null)
      }
    }
    carregarEvento()
  }, [])

  useEffect(() => {
    const jaViu = sessionStorage.getItem('popup-lista-fechado')
    if (jaViu || !proximoEvento) return
    const timer = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(timer)
  }, [proximoEvento])

  const fechar = () => {
    setVisible(false)
    sessionStorage.setItem('popup-lista-fechado', '1')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !email.trim()) return
    if (!lgpdAceito) {
      toast.error('Você precisa aceitar a Política de Privacidade para continuar.')
      return
    }
    setLoading(true)
    try {
      // Chama /api/lista — que inscreve na lista amiga, gera QR, envia email e captura lead
      const res = await fetch('/api/lista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: proximoEvento?.id,
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          genero,
          origem: 'popup_lista',
          consentimentoLGPD: true,
          lgpdVersao: '1.0',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao entrar na lista.')
        return
      }
      toast.success('Nome adicionado à lista! Confira seu email.')
      fechar()
    } catch {
      toast.error('Erro ao entrar na lista. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible || !proximoEvento) return null

  const dataFormatada = format(new Date(`${proximoEvento.data_evento}T00:00:00`), "dd 'de' MMMM", { locale: ptBR })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fechar} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-gold rounded-sm p-8 animate-fade-up">
        <button onClick={fechar} className="absolute top-4 right-4 text-bege-escuro hover:text-bege transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <PartyPopper size={22} className="text-dourado" />
          <div>
            <p className="font-accent text-xs tracking-widest uppercase text-dourado">Lista Amiga</p>
            <p className="font-body text-xs text-bege-escuro">{proximoEvento.nome} · {dataFormatada}</p>
          </div>
        </div>

        <h3 className="font-display text-3xl text-bege mb-2">Entre na Lista!</h3>
        <p className="font-body text-sm text-bege-escuro/70 mb-6 leading-relaxed">
          <strong className="text-dourado">Feminino:</strong> entrada gratuita até 00:00<br />
          <strong className="text-bege">Masculino:</strong> ingresso fixo R$ 50 — sem filas
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="admin-label">Gênero</label>
            <div className="flex gap-2">
              {(['feminino', 'masculino'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenero(g)}
                  className={`flex-1 py-2 text-xs font-accent tracking-wider uppercase rounded-sm border transition-all
                    ${genero === g ? 'border-dourado bg-dourado/15 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}
                >
                  {g === 'feminino' ? 'Feminino' : 'Masculino'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="admin-label">Seu Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Digite seu nome..."
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">Seu Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="admin-input"
              required
            />
          </div>

          {/* CONSENTIMENTO LGPD EXPLÍCITO */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={lgpdAceito}
                onChange={e => setLgpdAceito(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-sm border transition-all ${
                lgpdAceito ? 'bg-dourado border-dourado' : 'border-white/30 bg-black/30 group-hover:border-dourado/50'
              }`}>
                {lgpdAceito && (
                  <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
                    <path d="M2 6l3 3 5-5" stroke="#0a0604" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="font-body text-[11px] text-bege-escuro/50 leading-relaxed">
              Concordo com o uso dos meus dados para comunicação sobre eventos, conforme a{' '}
              <a href="/politicas#privacidade" target="_blank" className="text-dourado/70 hover:text-dourado underline" onClick={e => e.stopPropagation()}>
                Política de Privacidade (LGPD)
              </a>.
            </span>
          </label>

          <p className="text-xs text-bege-escuro/40 italic">
            * Lista válida até 00:00. Sujeita a alteração conforme lotação.
          </p>

          <button
            type="submit"
            disabled={loading || !lgpdAceito}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Quero Entrar na Lista!'}
          </button>
        </form>

        <p className="text-center text-xs text-bege-escuro/30 mt-4">
          Você receberá um QR Code no seu email
        </p>
      </div>
    </div>
  )
}

export default PopupLista
