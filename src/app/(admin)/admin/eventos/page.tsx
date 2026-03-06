'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Upload, Eye, EyeOff, ChevronDown, ChevronUp, X } from 'lucide-react'
import { EVENTOS_INICIAIS } from '@/lib/eventos-data'
import { Evento, Lote } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_INICIAIS)
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  const abrirNovo = () => {
    setEventoEditando(null)
    setModalAberto(true)
  }

  const abrirEditar = (evento: Evento) => {
    setEventoEditando(evento)
    setModalAberto(true)
  }

  const toggleStatus = (id: string) => {
    setEventos(prev => prev.map(e =>
      e.id === id ? { ...e, status: e.status === 'publicado' ? 'rascunho' : 'publicado' } : e
    ))
    toast.success('Status atualizado!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Eventos</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">Gerencie os eventos e ingressos</p>
        </div>
        <button onClick={abrirNovo} className="btn-primary flex items-center gap-2 text-xs">
          <Plus size={14} /> Novo Evento
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {eventos.map(evento => {
          const loteAtivo = evento.lotes.find(l => l.ativo)
          const totalVendido = evento.lotes.reduce((a, l) => a + l.vendidoMasculino + l.vendidoFeminino, 0)
          const totalIngressos = evento.lotes.reduce((a, l) => a + l.qtdMasculino + l.qtdFeminino, 0)
          const aberto = expandido === evento.id

          return (
            <div key={evento.id} className="admin-card">
              {/* HEADER */}
              <div className="flex items-start gap-4">
                {/* FLYER THUMBNAIL */}
                <div className="relative w-16 h-24 flex-shrink-0 rounded-sm overflow-hidden bg-black/30">
                  {evento.flyerUrl && (
                    <Image src={evento.flyerUrl} alt={evento.nome} fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${evento.status === 'publicado' ? 'bg-green-400' : 'bg-amber-400'}`} />
                        <span className="font-body text-xs text-bege-escuro/60 capitalize">{evento.status}</span>
                      </div>
                      <h3 className="font-display text-2xl text-bege">{evento.nome}</h3>
                      <p className="font-body text-xs text-bege-escuro/60 mt-0.5 capitalize">
                        {format(evento.data, "EEEE, dd 'de' MMMM", { locale: ptBR })} · {evento.hora}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleStatus(evento.id)}
                        className="p-2 border border-white/10 hover:border-dourado/40 text-bege-escuro hover:text-dourado rounded-sm transition-all"
                        title={evento.status === 'publicado' ? 'Despublicar' : 'Publicar'}>
                        {evento.status === 'publicado' ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button onClick={() => abrirEditar(evento)}
                        className="p-2 border border-white/10 hover:border-dourado/40 text-bege-escuro hover:text-dourado rounded-sm transition-all">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setExpandido(aberto ? null : evento.id)}
                        className="p-2 border border-white/10 hover:border-white/20 text-bege-escuro rounded-sm transition-all">
                        {aberto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* STATS RÁPIDOS */}
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="text-xs">
                      <span className="text-bege-escuro/50">Lote atual: </span>
                      <span className="text-bege">{loteAtivo?.nome || 'Esgotado'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-bege-escuro/50">Masc: </span>
                      <span className="text-bege">R$ {loteAtivo?.precoMasculino || '-'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-bege-escuro/50">Fem: </span>
                      <span className="text-dourado">R$ {loteAtivo?.precoFeminino || '-'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-bege-escuro/50">Vendidos: </span>
                      <span className="text-bege">{totalVendido}/{totalIngressos}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-bege-escuro/50">Lista: </span>
                      <span className={evento.temLista ? 'text-green-400' : 'text-bege-escuro/40'}>
                        {evento.temLista ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXPANDIDO — LOTES */}
              {aberto && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <LotesEditor evento={evento} onSave={(lotes) => {
                    setEventos(prev => prev.map(e => e.id === evento.id ? { ...e, lotes } : e))
                    toast.success('Lotes salvos!')
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL CRIAR/EDITAR */}
      {modalAberto && (
        <EventoModal
          evento={eventoEditando}
          onClose={() => setModalAberto(false)}
          onSave={(novoEvento) => {
            if (eventoEditando) {
              setEventos(prev => prev.map(e => e.id === eventoEditando.id ? novoEvento : e))
            } else {
              setEventos(prev => [...prev, novoEvento])
            }
            setModalAberto(false)
            toast.success(eventoEditando ? 'Evento atualizado!' : 'Evento criado!')
          }}
        />
      )}
    </div>
  )
}

// ── LOTES EDITOR ──
const LotesEditor: React.FC<{ evento: Evento; onSave: (lotes: Lote[]) => void }> = ({ evento, onSave }) => {
  const [lotes, setLotes] = useState<Lote[]>(evento.lotes)

  const addLote = () => {
    const novo: Lote = {
      id: `lote-${Date.now()}`,
      eventoId: evento.id,
      numero: lotes.length + 1,
      nome: `${lotes.length + 1}º Lote`,
      precoMasculino: 0,
      precoFeminino: 0,
      qtdMasculino: 100,
      qtdFeminino: 100,
      vendidoMasculino: 0,
      vendidoFeminino: 0,
      ativo: false,
      ordem: lotes.length + 1,
    }
    setLotes(p => [...p, novo])
  }

  const updateLote = (id: string, field: keyof Lote, value: any) => {
    setLotes(p => p.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const ativarLote = (id: string) => {
    setLotes(p => p.map(l => ({ ...l, ativo: l.id === id })))
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
          <div key={lote.id} className={`p-4 rounded-sm border ${lote.ativo ? 'border-dourado/40 bg-dourado/5' : 'border-white/5 bg-black/20'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
              <div>
                <label className="admin-label text-xs">Nome</label>
                <input className="admin-input text-xs py-2"
                  value={lote.nome}
                  onChange={e => updateLote(lote.id, 'nome', e.target.value)} />
              </div>
              <div>
                <label className="admin-label text-xs">Preço Masc (R$)</label>
                <input type="number" className="admin-input text-xs py-2"
                  value={lote.precoMasculino}
                  onChange={e => updateLote(lote.id, 'precoMasculino', Number(e.target.value))} />
              </div>
              <div>
                <label className="admin-label text-xs">Preço Fem (R$)</label>
                <input type="number" className="admin-input text-xs py-2"
                  value={lote.precoFeminino}
                  onChange={e => updateLote(lote.id, 'precoFeminino', Number(e.target.value))} />
              </div>
              <div>
                <label className="admin-label text-xs">Qtd Masc</label>
                <input type="number" className="admin-input text-xs py-2"
                  value={lote.qtdMasculino}
                  onChange={e => updateLote(lote.id, 'qtdMasculino', Number(e.target.value))} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="admin-label text-xs">Ações</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => ativarLote(lote.id)}
                    className={`flex-1 py-2 text-xs rounded-sm border transition-all ${lote.ativo ? 'border-dourado bg-dourado/20 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/40'}`}
                  >
                    {lote.ativo ? 'Ativo' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-bege-escuro/40">
              Vendidos: {lote.vendidoMasculino}M / {lote.vendidoFeminino}F · Restam: {lote.qtdMasculino - lote.vendidoMasculino}M / {lote.qtdFeminino - lote.vendidoFeminino}F
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onSave(lotes)} className="btn-primary text-xs mt-4">
        Salvar Lotes
      </button>
    </div>
  )
}

// ── MODAL EVENTO ──
const EventoModal: React.FC<{
  evento: Evento | null;
  onClose: () => void;
  onSave: (e: Evento) => void;
}> = ({ evento, onClose, onSave }) => {
  const [form, setForm] = useState({
    nome: evento?.nome || '',
    data: evento ? format(evento.data, 'yyyy-MM-dd') : '',
    hora: evento?.hora || '22:00',
    descricao: evento?.descricao || '',
    status: evento?.status || 'rascunho',
    temLista: evento?.temLista || false,
    limiteListaMasc: evento?.limiteListaMasc || 200,
    limiteListaFem: evento?.limiteListaFem || 200,
    flyerUrl: evento?.flyerUrl || '',
  })
  const [flyerPreview, setFlyerPreview] = useState(evento?.flyerUrl || '')

  const handleFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFlyerPreview(url)
      setForm(p => ({ ...p, flyerUrl: url }))
      toast.success('Flyer carregado! Será enviado ao salvar.')
    }
  }

  const handleSave = () => {
    if (!form.nome || !form.data) {
      toast.error('Nome e data são obrigatórios')
      return
    }
    const novoEvento: Evento = {
      id: evento?.id || `evt-${Date.now()}`,
      slug: evento?.slug || form.nome.toLowerCase().replace(/\s+/g, '-'),
      nome: form.nome,
      data: new Date(form.data),
      hora: form.hora,
      descricao: form.descricao,
      flyerUrl: form.flyerUrl,
      status: form.status as any,
      temLista: form.temLista,
      limiteListaMasc: form.limiteListaMasc,
      limiteListaFem: form.limiteListaFem,
      prazoLista: new Date(form.data),
      lotes: evento?.lotes || [],
      criadoEm: evento?.criadoEm || new Date(),
      atualizadoEm: new Date(),
    }
    onSave(novoEvento)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-gold rounded-sm max-h-[90vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h3 className="font-display text-2xl text-bege">{evento ? 'Editar Evento' : 'Novo Evento'}</h3>
          <button onClick={onClose} className="text-bege-escuro hover:text-bege"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* FLYER UPLOAD */}
          <div>
            <label className="admin-label">Flyer do Evento</label>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-36 bg-black/30 border border-white/10 rounded-sm overflow-hidden flex-shrink-0">
                {flyerPreview ? (
                  <Image src={flyerPreview} alt="Flyer" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-bege-escuro/30">
                    <Upload size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-2 border border-dourado/30 hover:border-dourado px-4 py-3 rounded-sm text-sm text-bege-escuro hover:text-bege cursor-pointer transition-all duration-200">
                  <Upload size={15} /> Enviar Flyer (WebP, JPG, PNG)
                  <input type="file" accept="image/*" onChange={handleFlyerUpload} className="hidden" />
                </label>
                <p className="text-xs text-bege-escuro/40 mt-2">Formatos aceitos: WebP, JPG, PNG. Proporção recomendada: 9:16</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="admin-label">Nome do Evento *</label>
              <input className="admin-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Me Leva Pro Pagode" />
            </div>
            <div>
              <label className="admin-label">Data *</label>
              <input type="date" className="admin-input" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
            </div>
            <div>
              <label className="admin-label">Horário</label>
              <input type="time" className="admin-input" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-label">Descrição</label>
              <textarea className="admin-input min-h-[70px] resize-none" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Atrações, estilo musical..." />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select className="admin-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
                <option value="encerrado">Encerrado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Lista Amiga</label>
              <div className="flex items-center gap-3 h-[46px]">
                <button
                  onClick={() => setForm(p => ({ ...p, temLista: !p.temLista }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 relative ${form.temLista ? 'bg-dourado' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${form.temLista ? 'left-6' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-bege-escuro">{form.temLista ? 'Ativa' : 'Inativa'}</span>
              </div>
            </div>
            {form.temLista && (
              <>
                <div>
                  <label className="admin-label">Limite Lista Masculino</label>
                  <input type="number" className="admin-input" value={form.limiteListaMasc}
                    onChange={e => setForm(p => ({ ...p, limiteListaMasc: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="admin-label">Limite Lista Feminino</label>
                  <input type="number" className="admin-input" value={form.limiteListaFem}
                    onChange={e => setForm(p => ({ ...p, limiteListaFem: Number(e.target.value) }))} />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1">
              {evento ? 'Salvar Alterações' : 'Criar Evento'}
            </button>
            <button onClick={onClose} className="btn-outline flex-shrink-0">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
