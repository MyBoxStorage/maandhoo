'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Loader2, X, GripVertical, Eye, EyeOff } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
type CategoriaCardapio = 'drinks' | 'longneck' | 'doses' | 'soft' | 'combos' | 'espumantes' | 'outros'

type ItemCardapio = {
  id: string
  categoria: CategoriaCardapio
  nome: string
  descricao: string | null
  preco: number
  disponivel: boolean
  destaque: boolean
  ordem: number
}

const CATEGORIAS: { value: CategoriaCardapio; label: string; emoji: string }[] = [
  { value: 'drinks',     label: 'Drinks',     emoji: '🍹' },
  { value: 'longneck',   label: 'Longneck',   emoji: '🍺' },
  { value: 'doses',      label: 'Doses',      emoji: '🥃' },
  { value: 'soft',       label: 'Soft Drinks', emoji: '🥤' },
  { value: 'combos',     label: 'Combos',     emoji: '🎯' },
  { value: 'espumantes', label: 'Espumantes', emoji: '🥂' },
  { value: 'outros',     label: 'Outros',     emoji: '🍽️' },
]

const fmtMoeda = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

export default function AdminCardapioPage() {
  const [itens, setItens] = useState<ItemCardapio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaCardapio | 'todas'>('todas')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<ItemCardapio | null>(null)

  const carregarViaAPI = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/cardapio')
      if (!res.ok) throw new Error('Erro')
      const data = await res.json()
      setItens(data.itens ?? [])
    } catch {
      toast.error('Erro ao carregar cardápio')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregarViaAPI() }, [carregarViaAPI])

  const toggleDisponivel = async (id: string, atual: boolean) => {
    const res = await fetch(`/api/admin/cardapio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponivel: !atual }),
    })
    if (res.ok) {
      setItens(prev => prev.map(i => i.id === id ? { ...i, disponivel: !atual } : i))
      toast.success(!atual ? 'Item disponibilizado!' : 'Item ocultado!')
    } else {
      toast.error('Erro ao atualizar')
    }
  }

  const toggleDestaque = async (id: string, atual: boolean) => {
    const res = await fetch(`/api/admin/cardapio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque: !atual }),
    })
    if (res.ok) {
      setItens(prev => prev.map(i => i.id === id ? { ...i, destaque: !atual } : i))
      toast.success(!atual ? 'Marcado como destaque!' : 'Removido dos destaques!')
    } else {
      toast.error('Erro ao atualizar')
    }
  }

  const deletar = async (id: string) => {
    if (!confirm('Remover item do cardápio?')) return
    const res = await fetch(`/api/admin/cardapio/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItens(prev => prev.filter(i => i.id !== id))
      toast.success('Item removido!')
    } else {
      toast.error('Erro ao remover')
    }
  }

  const filtrados = itens.filter(i => categoriaFiltro === 'todas' || i.categoria === categoriaFiltro)

  const porCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    itens: filtrados.filter(i => i.categoria === cat.value),
  })).filter(c => c.itens.length > 0)

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Cardápio</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {itens.filter(i => i.disponivel).length} disponíveis · {itens.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregarViaAPI} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Novo Item
          </button>
        </div>
      </div>

      {/* FILTRO POR CATEGORIA */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoriaFiltro('todas')}
          className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
            ${categoriaFiltro === 'todas' ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
          Todas
        </button>
        {CATEGORIAS.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoriaFiltro(cat.value)}
            className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
              ${categoriaFiltro === cat.value ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : itens.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="font-body text-bege-escuro/40 mb-4">Nenhum item no cardápio ainda.</p>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary text-xs">
            Adicionar primeiro item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {porCategoria.map(cat => (
            <div key={cat.value}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{cat.emoji}</span>
                <h3 className="font-accent text-sm tracking-widest uppercase text-dourado">{cat.label}</h3>
                <span className="font-body text-xs text-bege-escuro/40">({cat.itens.length})</span>
              </div>

              <div className="grid gap-2">
                {cat.itens.map(item => (
                  <div
                    key={item.id}
                    className={`admin-card flex items-center gap-4 transition-opacity ${!item.disponivel ? 'opacity-40' : ''}`}
                  >
                    <GripVertical size={14} className="text-bege-escuro/20 flex-shrink-0 cursor-grab" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body text-bege text-sm font-medium">{item.nome}</p>
                        {item.destaque && (
                          <span className="text-xs border border-dourado/40 text-dourado/80 px-1.5 py-0.5 rounded-sm">
                            ★ Destaque
                          </span>
                        )}
                      </div>
                      {item.descricao && (
                        <p className="font-body text-xs text-bege-escuro/50 mt-0.5 truncate">{item.descricao}</p>
                      )}
                    </div>

                    <p className="font-display text-lg text-dourado flex-shrink-0">{fmtMoeda(item.preco)}</p>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleDestaque(item.id, item.destaque)}
                        className={`p-2 border rounded-sm transition-all text-xs
                          ${item.destaque ? 'border-dourado/50 text-dourado bg-dourado/10' : 'border-white/10 text-bege-escuro/40 hover:border-dourado/30'}`}
                        title={item.destaque ? 'Remover destaque' : 'Marcar como destaque'}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => toggleDisponivel(item.id, item.disponivel)}
                        className="p-2 border border-white/10 hover:border-dourado/30 text-bege-escuro/50 hover:text-dourado rounded-sm transition-all"
                        title={item.disponivel ? 'Ocultar' : 'Disponibilizar'}
                      >
                        {item.disponivel ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => { setEditando(item); setModalAberto(true) }}
                        className="p-2 border border-white/10 hover:border-dourado/30 text-bege-escuro/50 hover:text-dourado rounded-sm transition-all text-xs"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deletar(item.id)}
                        className="p-2 border border-red-500/15 hover:border-red-500/40 text-red-500/40 hover:text-red-400 rounded-sm transition-all"
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalAberto && (
        <ItemModal
          item={editando}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregarViaAPI() }}
        />
      )}
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────

const ItemModal: React.FC<{
  item: ItemCardapio | null
  onClose: () => void
  onSalvo: () => void
}> = ({ item, onClose, onSalvo }) => {
  const [form, setForm] = useState({
    categoria: item?.categoria ?? 'drinks' as CategoriaCardapio,
    nome: item?.nome ?? '',
    descricao: item?.descricao ?? '',
    preco: item?.preco ?? 0,
    disponivel: item?.disponivel ?? true,
    destaque: item?.destaque ?? false,
    ordem: item?.ordem ?? 0,
  })
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!form.nome) { toast.error('Nome é obrigatório'); return }
    setSalvando(true)
    try {
      const url = item ? `/api/admin/cardapio/${item.id}` : '/api/admin/cardapio'
      const method = item ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      toast.success(item ? 'Item atualizado!' : 'Item adicionado!')
      onSalvo()
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  const f = (field: string, value: unknown) => setForm(p => ({ ...p, [field]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f0c07] border border-dourado/30 rounded-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dourado/15">
          <h3 className="font-display text-xl text-bege">{item ? 'Editar Item' : 'Novo Item'}</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="admin-label">Categoria *</label>
            <select className="admin-input" value={form.categoria} onChange={e => f('categoria', e.target.value)}>
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Nome *</label>
            <input className="admin-input" value={form.nome} onChange={e => f('nome', e.target.value)}
              placeholder="Ex: Caipirinha de Morango" />
          </div>
          <div>
            <label className="admin-label">Descrição</label>
            <input className="admin-input" value={form.descricao}
              onChange={e => f('descricao', e.target.value)}
              placeholder="Ingredientes ou observações" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Preço (R$)</label>
              <input type="number" step="0.01" min="0" className="admin-input" value={form.preco}
                onChange={e => f('preco', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="admin-label">Ordem</label>
              <input type="number" min="0" className="admin-input" value={form.ordem}
                onChange={e => f('ordem', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => f('disponivel', !form.disponivel)}
                className={`w-10 h-5.5 rounded-full transition-all relative ${form.disponivel ? 'bg-dourado' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${form.disponivel ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className="font-body text-sm text-bege-escuro/70">Disponível</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => f('destaque', !form.destaque)}
                className={`w-10 h-5.5 rounded-full transition-all relative ${form.destaque ? 'bg-dourado' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${form.destaque ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className="font-body text-sm text-bege-escuro/70">Destaque</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {salvando ? <><Loader2 size={12} className="animate-spin" /> Salvando...</> : (item ? 'Salvar' : 'Adicionar')}
            </button>
            <button onClick={onClose} className="btn-outline">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
