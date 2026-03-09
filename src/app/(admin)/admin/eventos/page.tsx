'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Eye, EyeOff, ChevronDown, ChevronUp, X, Upload, RefreshCw, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import type { EventoDB, LoteDB } from '@/types/ingressos'

// ─── TIPOS LOCAIS ─────────────────────────────────────────────

type EventoComLotes = EventoDB & { lotes: LoteDB[] }

// ─── HELPERS ─────────────────────────────────────────────────

const fmtMoeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<EventoComLotes[]>([])
  const [carregando, setCarregando] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<EventoComLotes | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/eventos')
      const data = await res.json()
      if (data.eventos) setEventos(data.eventos)
    } catch { toast.error('Erro ao carregar eventos') }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const toggleAtivo = async (id: string, atual: boolean) => {
    const res = await fetch(`/api/admin/eventos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !atual }),
    })
    if (res.ok) {
      setEventos(prev => prev.map(e => e.id === id ? { ...e, ativo: !atual } : e))
      toast.success(!atual ? 'Evento publicado!' : 'Evento despublicado!')
    } else {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Eventos</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {eventos.length} evento{eventos.length !== 1 ? 's' : ''} cadastrado{eventos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEventoEditando(null); setModalAberto(true) }} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Novo Evento
          </button>
        </div>
      </div>

      {/* LISTA */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : eventos.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="font-body text-bege-escuro/40">Nenhum evento cadastrado.</p>
          <button onClick={() => { setEventoEditando(null); setModalAberto(true) }} className="btn-primary text-xs mt-4">
            Criar primeiro evento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map(evento => {
            const loteAtivo = evento.lotes?.find(l => l.ativo)
            const totalVendido = (evento.lotes || []).reduce((a, l) => a + l.vendidos_masc + l.vendidos_fem, 0)
            const totalCap = evento.capacidade_total
            const pct = totalCap > 0 ? Math.min(100, Math.round((totalVendido / totalCap) * 100)) : 0
            const aberto = expandido === evento.id

            return (
              <div key={evento.id} className="admin-card">
                <div className="flex items-start gap-4">
                  {/* FLYER */}
                  <div className="relative w-14 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-black/30">
                    {evento.flyer_url && (
                      <Image src={evento.flyer_url} alt={evento.nome} fill className="object-cover object-top" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${evento.ativo ? 'bg-green-400 animate-pulse' : 'bg-bege-escuro/30'}`} />
                          <span className="font-body text-xs text-bege-escuro/50">{evento.ativo ? 'Publicado' : 'Rascunho'}</span>
                        </div>
                        <h3 className="font-display text-xl text-bege">{evento.nome}</h3>
                        <p className="font-body text-xs text-bege-escuro/50 mt-0.5 capitalize">
                          {format(new Date(evento.data_evento), "EEEE, dd 'de' MMMM", { locale: ptBR })} · {evento.hora_abertura}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => toggleAtivo(evento.id, evento.ativo)}
                          className="p-2 border border-white/10 hover:border-dourado/40 text-bege-escuro/50 hover:text-dourado rounded-sm transition-all"
                          title={evento.ativo ? 'Despublicar' : 'Publicar'}>
                          {evento.ativo ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => { setEventoEditando(evento); setModalAberto(true) }}
                          className="p-2 border border-white/10 hover:border-dourado/40 text-bege-escuro/50 hover:text-dourado rounded-sm transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setExpandido(aberto ? null : evento.id)}
                          className="p-2 border border-white/10 hover:border-white/20 text-bege-escuro/50 rounded-sm transition-all">
                          {aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="flex flex-wrap gap-4 mt-2.5 mb-2">
                      <span className="text-xs text-bege-escuro/50">
                        Lote ativo: <span className="text-bege">{loteAtivo?.nome ?? '—'}</span>
                      </span>
                      {loteAtivo && (
                        <>
                          <span className="text-xs text-bege-escuro/50">
                            Masc: <span className="text-bege">{fmtMoeda(loteAtivo.preco_masc)}</span>
                          </span>
                          <span className="text-xs text-bege-escuro/50">
                            Fem: <span className="text-dourado">{fmtMoeda(loteAtivo.preco_fem)}</span>
                          </span>
                        </>
                      )}
                      <span className="text-xs text-bege-escuro/50">
                        Vendidos: <span className="text-bege">{totalVendido}/{totalCap}</span>
                      </span>
                    </div>

                    {/* BARRA DE PROGRESSO */}
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden w-full max-w-xs">
                      <div className="h-full bg-dourado rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-bege-escuro/35 mt-0.5">{pct}% vendido</p>
                  </div>
                </div>

                {/* EXPANDIDO — LOTES */}
                {aberto && (
                  <div className="mt-5 pt-5 border-t border-white/5">
                    <LotesEditor
                      eventoId={evento.id}
                      lotes={evento.lotes || []}
                      onAtualizar={(lotes) => {
                        setEventos(prev => prev.map(e => e.id === evento.id ? { ...e, lotes } : e))
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {modalAberto && (
        <EventoModal
          evento={eventoEditando}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

// ─── EDITOR DE LOTES ─────────────────────────────────────────

const LotesEditor: React.FC<{
  eventoId: string
  lotes: LoteDB[]
  onAtualizar: (lotes: LoteDB[]) => void
}> = ({ eventoId, lotes: lotesIniciais, onAtualizar }) => {
  const [lotes, setLotes] = useState<LoteDB[]>(lotesIniciais)
  const [salvando, setSalvando] = useState(false)

  const addLote = () => {
    const novo = {
      id: `new-${Date.now()}`,
      evento_id: eventoId,
      numero: lotes.length + 1,
      nome: `${lotes.length + 1}º Lote`,
      preco_masc: 50,
      preco_fem: 20,
      limite_masc: 100,
      limite_fem: 100,
      vendidos_masc: 0,
      vendidos_fem: 0,
      ativo: false,
      created_at: '',
      updated_at: '',
    } as LoteDB
    setLotes(p => [...p, novo])
  }

  const update = (id: string, field: keyof LoteDB, value: unknown) => {
    setLotes(p => p.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const ativar = (id: string) => {
    setLotes(p => p.map(l => ({ ...l, ativo: l.id === id })))
  }

  const salvar = async () => {
    setSalvando(true)
    try {
      const res = await fetch(`/api/admin/eventos/${eventoId}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotes }),
      })
      const data = await res.json()
      if (data.lotes) {
        setLotes(data.lotes)
        onAtualizar(data.lotes)
        toast.success('Lotes salvos com sucesso!')
      } else {
        toast.error(data.erro ?? 'Erro ao salvar lotes')
      }
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-accent text-xs tracking-widest uppercase text-dourado">Lotes de Ingressos</h4>
        <button onClick={addLote} className="flex items-center gap-1 text-xs text-dourado border border-dourado/30 hover:border-dourado px-3 py-1.5 rounded-sm transition-all">
          <Plus size={12} /> Adicionar Lote
        </button>
      </div>

      <div className="space-y-3">
        {lotes.map(lote => (
          <div key={lote.id} className={`p-4 rounded-sm border transition-colors ${lote.ativo ? 'border-dourado/40 bg-dourado/5' : 'border-white/5 bg-black/20'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="admin-label">Nome</label>
                <input className="admin-input text-xs py-2" value={lote.nome ?? ''} onChange={e => update(lote.id, 'nome', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Masc (R$)</label>
                <input type="number" className="admin-input text-xs py-2" value={lote.preco_masc}
                  onChange={e => update(lote.id, 'preco_masc', Number(e.target.value))} />
              </div>
              <div>
                <label className="admin-label">Fem (R$)</label>
                <input type="number" className="admin-input text-xs py-2" value={lote.preco_fem}
                  onChange={e => update(lote.id, 'preco_fem', Number(e.target.value))} />
              </div>
              <div>
                <label className="admin-label">Limite Masc</label>
                <input type="number" className="admin-input text-xs py-2" value={lote.limite_masc ?? 100}
                  onChange={e => update(lote.id, 'limite_masc', Number(e.target.value))} />
              </div>
              <div>
                <label className="admin-label">Limite Fem</label>
                <input type="number" className="admin-input text-xs py-2" value={lote.limite_fem ?? 100}
                  onChange={e => update(lote.id, 'limite_fem', Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-bege-escuro/35">
                Vendidos: {lote.vendidos_masc}M · {lote.vendidos_fem}F
              </p>
              <button onClick={() => ativar(lote.id)}
                className={`px-4 py-1.5 text-xs rounded-sm border transition-all ${lote.ativo ? 'border-dourado bg-dourado/20 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/40'}`}>
                {lote.ativo ? '✓ Lote Ativo' : 'Ativar este Lote'}
              </button>
            </div>
          </div>
        ))}

        {lotes.length === 0 && (
          <p className="text-xs text-bege-escuro/30 text-center py-4">Nenhum lote. Clique em "Adicionar Lote" para começar.</p>
        )}
      </div>

      <button onClick={salvar} disabled={salvando} className="btn-primary text-xs mt-4 flex items-center gap-2">
        {salvando ? <><Loader2 size={12} className="animate-spin" /> Salvando...</> : 'Salvar Lotes'}
      </button>
    </div>
  )
}

// ─── MODAL EVENTO ─────────────────────────────────────────────

const EventoModal: React.FC<{
  evento: EventoComLotes | null
  onClose: () => void
  onSalvo: () => void
}> = ({ evento, onClose, onSalvo }) => {
  // Converte ISO (yyyy-mm-dd) → display (dd/mm/yyyy)
  const isoParaDisplay = (iso: string) => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }
  // Converte display (dd/mm/yyyy) → ISO (yyyy-mm-dd)
  const displayParaIso = (display: string) => {
    const limpo = display.replace(/\D/g, '')
    if (limpo.length !== 8) return display
    return `${limpo.slice(4)}-${limpo.slice(2, 4)}-${limpo.slice(0, 2)}`
  }
  // Máscara automática dd/mm/yyyy
  const mascaraData = (valor: string) => {
    const nums = valor.replace(/\D/g, '').slice(0, 8)
    if (nums.length <= 2) return nums
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4)}`
  }

  const [form, setForm] = useState({
    nome: evento?.nome ?? '',
    data_evento: isoParaDisplay(evento?.data_evento?.slice(0, 10) ?? ''),
    hora_abertura: evento?.hora_abertura?.slice(0, 5) ?? '22:00',
    descricao: evento?.descricao ?? '',
    ativo: evento?.ativo ?? false,
    capacidade_total: evento?.capacidade_total ?? 500,
    lista_encerra_as: evento?.lista_encerra_as?.slice(0, 5) ?? '00:00',
    flyer_url: evento?.flyer_url ?? '',
  })
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!form.nome || !form.data_evento) { toast.error('Nome e data são obrigatórios'); return }
    setSalvando(true)
    try {
      const url = evento ? `/api/admin/eventos/${evento.id}` : '/api/admin/eventos'
      const method = evento ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, data_evento: displayParaIso(form.data_evento) }),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      toast.success(evento ? 'Evento atualizado!' : 'Evento criado!')
      onSalvo()
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  const f = (field: string, value: unknown) => setForm(p => ({ ...p, [field]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0f0c07] border border-dourado/30 rounded-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-dourado/15">
          <h3 className="font-display text-2xl text-bege">{evento ? 'Editar Evento' : 'Novo Evento'}</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="admin-label">Nome do Evento *</label>
            <input className="admin-input" value={form.nome} onChange={e => f('nome', e.target.value)} placeholder="Ex: Me Leva Pro Pagode" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Data *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="dd/mm/aaaa"
                value={form.data_evento}
                onChange={e => f('data_evento', mascaraData(e.target.value))}
                maxLength={10}
              />
            </div>
            <div>
              <label className="admin-label">Abertura</label>
              <input type="time" className="admin-input" value={form.hora_abertura} onChange={e => f('hora_abertura', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Capacidade Total</label>
              <input type="number" className="admin-input" value={form.capacidade_total} onChange={e => f('capacidade_total', Number(e.target.value))} />
            </div>
            <div>
              <label className="admin-label">Lista encerra às</label>
              <input type="time" className="admin-input" value={form.lista_encerra_as} onChange={e => f('lista_encerra_as', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="admin-label">Descrição</label>
            <textarea className="admin-input min-h-[70px] resize-none" value={form.descricao}
              onChange={e => f('descricao', e.target.value)} placeholder="Atrações, estilo musical..." />
          </div>

          <div>
            <label className="admin-label">URL do Flyer</label>
            <input className="admin-input font-mono text-xs" value={form.flyer_url}
              onChange={e => f('flyer_url', e.target.value)} placeholder="/images/flyers/flyer.webp" />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => f('ativo', !form.ativo)}
              className={`w-11 h-6 rounded-full transition-all relative ${form.ativo ? 'bg-dourado' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.ativo ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="font-body text-sm text-bege-escuro/70">{form.ativo ? 'Publicado' : 'Rascunho'}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {salvando ? <><Loader2 size={13} className="animate-spin" /> Salvando...</> : (evento ? 'Salvar Alterações' : 'Criar Evento')}
            </button>
            <button onClick={onClose} className="btn-outline">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
