'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Sofa, UtensilsCrossed, Cake, Check } from 'lucide-react'
import toast from 'react-hot-toast'

type TipoReserva = 'mesa' | 'camarote' | 'aniversario'

const tiposConfig = {
  mesa: {
    icon: <UtensilsCrossed size={20} />,
    titulo: 'Reservar Mesa',
    descricao: 'Garanta seu espaço com até 5 pessoas.',
    areas: ['Área Principal', 'Área Lateral Esquerda', 'Área Lateral Direita', 'Frente ao Palco'],
  },
  camarote: {
    icon: <Sofa size={20} />,
    titulo: 'Reservar Camarote',
    descricao: 'Experiência VIP com vista privilegiada. Até 10 pessoas.',
    areas: ['Camarote Superior (4-7)', 'Camarote Lateral Direito (8-9)', 'Camarote Lateral Esquerdo (10)', 'Camarote Principal (11-15)'],
  },
  aniversario: {
    icon: <Cake size={20} />,
    titulo: 'Aniversário VIP',
    descricao: 'Aniversariante entra grátis com confirmação prévia via WhatsApp.',
    areas: ['Pista', 'Mesa', 'Camarote'],
  },
}

function ReservasContent() {
  const searchParams = useSearchParams()
  const tipoParam = searchParams.get('tipo') as TipoReserva | null
  const [tipo, setTipo] = useState<TipoReserva>(tipoParam || 'mesa')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const [form, setForm] = useState({
    nome: '', email: '', whatsapp: '', numeroPessoas: '',
    areaDesejada: '', dataAniversario: '', observacoes: '',
  })

  useEffect(() => {
    if (tipoParam) setTipo(tipoParam)
  }, [tipoParam])

  const config = tiposConfig[tipo]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.whatsapp) {
      toast.error('Preencha nome e WhatsApp')
      return
    }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 900))
      setEnviado(true)
      toast.success('Solicitação enviada! Retornaremos em breve.')
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <p className="section-subtitle mb-3">Exclusividade</p>
        <h1 className="section-title mb-4">Faça sua Reserva</h1>
        <div className="divider-gold w-24 mx-auto" />
      </div>

      <div className="flex gap-2 mb-8">
        {(Object.keys(tiposConfig) as TipoReserva[]).map(t => (
          <button
            key={t}
            onClick={() => { setTipo(t); setEnviado(false) }}
            className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-[10px] sm:text-xs font-accent tracking-wider uppercase rounded-sm border transition-all duration-200
              ${tipo === t ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/30'}`}
          >
            {tiposConfig[t].icon}
            <span>{t === 'aniversario' ? 'Aniver.' : t.charAt(0).toUpperCase() + t.slice(1)}</span>
          </button>
        ))}
      </div>

      {!enviado ? (
        <div className="bg-card border border-gold/20 rounded-sm p-5 sm:p-8">
          <h2 className="font-display text-2xl text-bege mb-1">{config.titulo}</h2>
          <p className="font-body text-sm text-bege-escuro/60 mb-6">{config.descricao}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Nome Completo *</label>
                <input type="text" className="admin-input" placeholder="Seu nome"
                  value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required />
              </div>
              <div>
                <label className="admin-label">WhatsApp *</label>
                <input type="tel" className="admin-input" placeholder="(47) 99999-9999"
                  value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="admin-label">Email</label>
              <input type="email" className="admin-input" placeholder="seu@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Nº de Pessoas</label>
                <input type="number" className="admin-input" placeholder="Ex: 4"
                  min={1} max={tipo === 'camarote' ? 10 : 5}
                  value={form.numeroPessoas} onChange={e => setForm(p => ({ ...p, numeroPessoas: e.target.value }))} />
              </div>
              <div>
                <label className="admin-label">Área Desejada</label>
                <select className="admin-input" value={form.areaDesejada}
                  onChange={e => setForm(p => ({ ...p, areaDesejada: e.target.value }))}>
                  <option value="">Sem preferência</option>
                  {config.areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {tipo === 'aniversario' && (
              <div>
                <label className="admin-label">Data do Aniversário</label>
                <input type="date" className="admin-input"
                  value={form.dataAniversario} onChange={e => setForm(p => ({ ...p, dataAniversario: e.target.value }))} />
              </div>
            )}

            <div>
              <label className="admin-label">Observações</label>
              <textarea className="admin-input min-h-[80px] resize-none" placeholder="Pedidos especiais, preferências..."
                value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
            </div>

            <p className="text-xs text-bege-escuro/40 italic">
              * Reservas confirmadas via WhatsApp em até 24h. Requer no mínimo 1 dia de antecedência.
            </p>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-preto-profundo/30 border-t-preto-profundo rounded-full animate-spin" /> : <MessageCircle size={16} />}
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>

            <p className="text-center text-xs text-bege-escuro/40">
              Ou fale diretamente:{' '}
              <a href="https://wa.me/5547999300283" target="_blank" rel="noopener noreferrer" className="text-dourado hover:underline">
                WhatsApp (47) 9930-0283
              </a>
            </p>
          </form>
        </div>
      ) : (
        <div className="bg-card border border-dourado/50 rounded-sm p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-dourado/15 flex items-center justify-center mx-auto">
            <Check size={36} className="text-dourado" />
          </div>
          <h3 className="font-display text-3xl text-bege">Solicitação Enviada!</h3>
          <p className="font-body text-sm text-bege-escuro/70">
            Recebemos sua solicitação de {tipo === 'aniversario' ? 'Aniversário VIP' : tipo === 'camarote' ? 'Camarote' : 'Mesa'}.<br />
            Nossa equipe entrará em contato via WhatsApp em até 24h.
          </p>
          <a href="https://wa.me/5547999300283?text=Olá! Acabei de solicitar uma reserva pelo site."
            target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 text-xs">
            <MessageCircle size={14} /> Acelerar via WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}

export default function ReservasPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <Suspense fallback={<div className="min-h-screen" />}>
        <ReservasContent />
      </Suspense>
    </div>
  )
}
