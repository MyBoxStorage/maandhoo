'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, RefreshCw, Loader2, X, Image as ImageIcon, ArrowUp, ArrowDown, Star, Upload } from 'lucide-react'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'

type FotoGaleria = {
  id: string
  evento_id: string | null
  url: string
  alt: string | null
  ordem: number
  destaque: boolean
  posicao_destaque: number | null
  created_at: string
  evento?: { nome: string } | null
}

type EventoOpt = { id: string; nome: string }

export default function AdminGaleriaPage() {
  const [fotos, setFotos] = useState<FotoGaleria[]>([])
  const [eventos, setEventos] = useState<EventoOpt[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<FotoGaleria | null>(null)
  const [eventoFiltro, setEventoFiltro] = useState('todos')
  const [enviandoLote, setEnviandoLote] = useState(false)
  const loteInputRef = useRef<HTMLInputElement | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [resFotos, resEv] = await Promise.all([
        fetch('/api/admin/galeria'),
        fetch('/api/admin/eventos'),
      ])
      const [dataFotos, dataEv] = await Promise.all([resFotos.json(), resEv.json()])
      setFotos(dataFotos.fotos ?? [])
      setEventos(dataEv.eventos ?? [])
    } catch {
      toast.error('Erro ao carregar galeria')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const reordenar = async (id: string, direcao: 'up' | 'down') => {
    const idx = fotos.findIndex(f => f.id === id)
    if ((direcao === 'up' && idx === 0) || (direcao === 'down' && idx === fotos.length - 1)) return

    const novaLista = [...fotos]
    const troca = direcao === 'up' ? idx - 1 : idx + 1
    ;[novaLista[idx], novaLista[troca]] = [novaLista[troca], novaLista[idx]]

    // Atualizar ordens
    const atualizadas = novaLista.map((f, i) => ({ ...f, ordem: i }))
    setFotos(atualizadas)

    // Salvar no banco
    await fetch('/api/admin/galeria', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordens: atualizadas.map(f => ({ id: f.id, ordem: f.ordem })) }),
    })
  }

  const deletar = async (id: string) => {
    if (!confirm('Remover esta foto da galeria?')) return
    const res = await fetch(`/api/admin/galeria/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setFotos(prev => prev.filter(f => f.id !== id))
      toast.success('Foto removida!')
    } else {
      toast.error('Erro ao remover')
    }
  }

  const toggleDestaque = async (foto: FotoGaleria) => {
    const destaquesAtivos = fotos
      .filter((f) => f.destaque)
      .map((f) => f.posicao_destaque)
      .filter((p): p is number => typeof p === 'number')

    if (!foto.destaque && destaquesAtivos.length >= 8) {
      toast.error('Limite de 8 destaques atingido. Remova um antes de adicionar.')
      return
    }

    const proximaPosicao = (() => {
      for (let i = 1; i <= 8; i += 1) {
        if (!destaquesAtivos.includes(i)) return i
      }
      return null
    })()

    const payload = foto.destaque
      ? { destaque: false, posicao_destaque: null }
      : { destaque: true, posicao_destaque: proximaPosicao }

    const res = await fetch(`/api/admin/galeria/${foto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      toast.error('Erro ao atualizar destaque')
      return
    }

    toast.success(foto.destaque ? 'Destaque removido' : `Foto destacada na posição ${proximaPosicao}`)
    carregar()
  }

  const abrirUploadLote = () => loteInputRef.current?.click()

  const handleUploadLote: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    if (files.length > 20) {
      toast.error('Selecione no máximo 20 fotos por lote.')
      return
    }

    setEnviandoLote(true)
    let enviados = 0

    try {
      for (const file of files) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const res = await fetch('/api/admin/galeria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: base64,
            alt: file.name,
            evento_id: eventoFiltro !== 'todos' && eventoFiltro !== 'sem_evento' && eventoFiltro !== 'destaques'
              ? eventoFiltro
              : null,
            ordem: fotos.length + enviados,
          }),
        })

        if (res.ok) enviados += 1
      }

      toast.success(`${enviados} foto(s) enviada(s) com sucesso!`)
      carregar()
    } catch {
      toast.error('Erro ao enviar lote de fotos')
    } finally {
      setEnviandoLote(false)
    }
  }

  const filtradas = fotos.filter(f =>
    eventoFiltro === 'todos'
    || (eventoFiltro === 'destaques' && f.destaque)
    || f.evento_id === eventoFiltro
    || (eventoFiltro === 'sem_evento' && !f.evento_id)
  )

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Galeria</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {fotos.length} foto{fotos.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={abrirUploadLote}
            disabled={enviandoLote}
            className="btn-outline flex items-center gap-2 text-xs"
          >
            {enviandoLote ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload em lote
          </button>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Adicionar Foto
          </button>
        </div>
      </div>
      <input
        ref={loteInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUploadLote}
      />

      {/* FILTRO POR EVENTO */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setEventoFiltro('todos')}
          className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
            ${eventoFiltro === 'todos' ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
          Todas
        </button>
        {eventos.map(ev => (
          <button key={ev.id} onClick={() => setEventoFiltro(ev.id)}
            className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
              ${eventoFiltro === ev.id ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
            {ev.nome}
          </button>
        ))}
        <button onClick={() => setEventoFiltro('sem_evento')}
          className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
            ${eventoFiltro === 'sem_evento' ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
          Sem evento
        </button>
        <button onClick={() => setEventoFiltro('destaques')}
          className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
            ${eventoFiltro === 'destaques' ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
          Destaques
        </button>
      </div>

      {/* GRID DE FOTOS */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="admin-card text-center py-16">
          <ImageIcon size={32} className="text-bege-escuro/20 mx-auto mb-3" />
          <p className="font-body text-bege-escuro/40 mb-4">Nenhuma foto na galeria.</p>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary text-xs">
            Adicionar primeira foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtradas.map((foto, idx) => (
            <div key={foto.id} className="admin-card p-2 group relative">
              <div className="relative aspect-square rounded-sm overflow-hidden bg-black/40 mb-2">
                <Image
                  src={foto.url}
                  alt={foto.alt ?? ''}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <button
                  onClick={() => toggleDestaque(foto)}
                  className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] border transition-all ${
                    foto.destaque
                      ? 'bg-dourado/90 text-preto-profundo border-dourado'
                      : 'bg-black/55 text-bege border-white/20 hover:border-dourado/60'
                  }`}
                  title={foto.destaque ? 'Remover dos destaques' : 'Adicionar aos destaques'}
                >
                  <Star size={12} className={foto.destaque ? 'fill-current' : ''} />
                  {foto.posicao_destaque ?? '-'}
                </button>
                {/* Overlay ações */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => reordenar(foto.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm disabled:opacity-30 transition-all"
                  >
                    <ArrowUp size={14} className="text-white" />
                  </button>
                  <button
                    onClick={() => reordenar(foto.id, 'down')}
                    disabled={idx === filtradas.length - 1}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm disabled:opacity-30 transition-all"
                  >
                    <ArrowDown size={14} className="text-white" />
                  </button>
                  <button
                    onClick={() => { setEditando(foto); setModalAberto(true) }}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-all"
                  >
                    <span className="text-white text-xs">✏️</span>
                  </button>
                  <button
                    onClick={() => deletar(foto.id)}
                    className="p-1.5 bg-red-500/40 hover:bg-red-500/60 rounded-sm transition-all"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              </div>
              {foto.alt && (
                <p className="font-body text-xs text-bege-escuro/60 truncate px-1">{foto.alt}</p>
              )}
              {foto.evento?.nome && (
                <p className="font-body text-[10px] text-dourado/60 truncate px-1">{foto.evento.nome}</p>
              )}
              <p className="font-body text-[10px] text-bege-escuro/25 px-1">#{foto.ordem + 1}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalAberto && (
        <FotoModal
          foto={editando}
          eventos={eventos}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

// ─── MODAL FOTO ───────────────────────────────────────────────

const FotoModal: React.FC<{
  foto: FotoGaleria | null
  eventos: EventoOpt[]
  onClose: () => void
  onSalvo: () => void
}> = ({ foto, eventos, onClose, onSalvo }) => {
  const [form, setForm] = useState({
    url: foto?.url ?? '',
    alt: foto?.alt ?? '',
    evento_id: foto?.evento_id ?? '',
    ordem: foto?.ordem ?? 0,
  })
  const [salvando, setSalvando] = useState(false)
  const [preview, setPreview] = useState(foto?.url ?? '')

  const salvar = async () => {
    if (!form.url) { toast.error('URL da foto é obrigatória'); return }
    setSalvando(true)
    try {
      const url = foto ? `/api/admin/galeria/${foto.id}` : '/api/admin/galeria'
      const method = foto ? 'PUT' : 'POST'
      const body = { ...form, evento_id: form.evento_id || null }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      toast.success(foto ? 'Foto atualizada!' : 'Foto adicionada!')
      onSalvo()
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f0c07] border border-dourado/30 rounded-sm"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dourado/15">
          <h3 className="font-display text-xl text-bege">{foto ? 'Editar Foto' : 'Adicionar Foto'}</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {preview && (
            <div className="relative aspect-video rounded-sm overflow-hidden bg-black/40">
              <Image src={preview} alt="Preview" fill className="object-cover" sizes="400px"
                onError={() => setPreview('')} />
            </div>
          )}
          <div>
            <label className="admin-label">URL da Foto *</label>
            <input className="admin-input font-mono text-xs" value={form.url}
              onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setPreview(e.target.value) }}
              placeholder="/images/galeria/foto.webp" />
            <p className="text-[10px] text-bege-escuro/30 mt-1">Cole o caminho da imagem em /public ou URL externa</p>
          </div>
          <div>
            <label className="admin-label">Descrição / Alt</label>
            <input className="admin-input" value={form.alt}
              onChange={e => setForm(p => ({ ...p, alt: e.target.value }))}
              placeholder="Descrição da foto para acessibilidade" />
          </div>
          <div>
            <label className="admin-label">Evento (opcional)</label>
            <select className="admin-input" value={form.evento_id}
              onChange={e => setForm(p => ({ ...p, evento_id: e.target.value }))}>
              <option value="">Sem evento específico</option>
              {eventos.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Ordem</label>
            <input type="number" min="0" className="admin-input" value={form.ordem}
              onChange={e => setForm(p => ({ ...p, ordem: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {salvando ? <><Loader2 size={12} className="animate-spin" /> Salvando...</> : (foto ? 'Salvar' : 'Adicionar')}
            </button>
            <button onClick={onClose} className="btn-outline">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
