'use client'

import React, { useState, useEffect } from 'react'
import { X, PartyPopper } from 'lucide-react'
import { EVENTOS_INICIAIS } from '@/lib/eventos-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

export const PopupLista: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // Próximo evento com lista
  const proximoEvento = EVENTOS_INICIAIS.find(e => e.temLista && e.status === 'publicado')

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
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800)) // placeholder API
      toast.success('Nome adicionado à lista! Confira seu email.')
      fechar()
    } catch {
      toast.error('Erro ao entrar na lista. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible || !proximoEvento) return null

  const dataFormatada = format(proximoEvento.data, "dd 'de' MMMM", { locale: ptBR })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fechar} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-gold rounded-sm p-8 animate-fade-up">
        <button onClick={fechar} className="absolute top-4 right-4 text-bege-escuro hover:text-bege transition-colors">
          <X size={20} />
        </button>

        {/* TOPO */}
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

          <p className="text-xs text-bege-escuro/40 italic">
            * Lista válida até 00:00. Sujeita a alteração conforme lotação.
          </p>

          <button
            type="submit"
            disabled={loading}
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
