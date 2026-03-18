'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, RefreshCw, Loader2, X, Image as ImageIcon, ArrowUp, ArrowDown, Star, Upload, Play, Link as LinkIcon, FolderOpen } from 'lucide-react'
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

const isVideo = (url: string): boolean =>
  url.includes('/video/upload/') ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(url)

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
    const atualizadas = novaLista.map((f, i) => ({ ...f, ordem: i }))
    setFotos(atualizadas)
    await fetch('/api/admin/galeria', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordens: atualizadas.map(f => ({ id: f.id, ordem: f.ordem })) }),
    })
  }

  const deletar = async (id: string) => {
    if (!confirm('Remover esta mídia da galeria?')) return
    const res = await fetch(`/api/admin/galeria/${id}`, { method: 'DELETE' })
    if (res.ok) { setFotos(prev => prev.filter(f => f.id !== id)); toast.success('Mídia removida!') }
    else toast.error('Erro ao remover')
  }

  const toggleDestaque = async (foto: FotoGaleria) => {
    const destaquesAtivos = fotos.filter(f => f.destaque).map(f => f.posicao_destaque).filter((p): p is number => typeof p === 'number')
    if (!foto.destaque && destaquesAtivos.length >= 8) { toast.error('Limite de 8 destaques atingido.'); return }
    const proximaPosicao = (() => { for (let i = 1; i <= 8; i++) if (!destaquesAtivos.includes(i)) return i; return null })()
    const payload = foto.destaque ? { destaque: false, posicao_destaque: null } : { destaque: true, posicao_destaque: proximaPosicao }
    const res = await fetch(`/api/admin/galeria/${foto.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { toast.error('Erro ao atualizar destaque'); return }
    toast.success(foto.destaque ? 'Destaque removido' : `Destacado na posição ${proximaPosicao}`)
    carregar()
  }

  const abrirUploadLote = () => loteInputRef.current?.click()

  const handleUploadLote: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    if (files.length > 20) { toast.error('Selecione no máximo 20 arquivos por lote.'); return }
    setEnviandoLote(true)
    let enviados = 0
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) continue
        const { url } = await uploadRes.json()
        const res = await fetch('/api/admin/galeria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            evento_id: eventoFiltro !== 'todos' && eventoFiltro !== 'sem_evento' && eventoFiltro !== 'destaques' ? eventoFiltro : null,
            ordem: fotos.length + enviados,
          }),
        })
        if (res.ok) enviados++
      }
      toast.success(`${enviados} arquivo(s) enviado(s) com sucesso!`)
      carregar()
    } catch {
      toast.error('Erro ao enviar lote')
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
            {fotos.length} item{fotos.length !== 1 ? 's' : ''} no total
            <span className="ml-2 text-bege-escuro/35">· fotos e vídeos</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={abrirUploadLote} disabled={enviandoLote} className="btn-outline flex items-center gap-2 text-xs">
            {enviandoLote ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload em lote
          </button>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Adicionar Mídia
          </button>
        </div>
      </div>

      <input ref={loteInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadLote} />

      {/* FILTRO */}
      <div className="flex gap-2 flex-wrap">
        {['todos', ...eventos.map(e => e.id), 'sem_evento', 'destaques'].map(val => {
          const label = val === 'todos' ? 'Todas' : val === 'sem_evento' ? 'Sem evento' : val === 'destaques' ? 'Destaques' : eventos.find(e => e.id === val)?.nome ?? val
          return (
            <button key={val} onClick={() => setEventoFiltro(val)}
              className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all ${eventoFiltro === val ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
              {label}
            </button>
          )
        })}
      </div>

      {/* GRID */}
      {carregando ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-dourado/50" /></div>
      ) : filtradas.length === 0 ? (
        <div className="admin-card text-center py-16">
          <ImageIcon size={32} className="text-bege-escuro/20 mx-auto mb-3" />
          <p className="font-body text-bege-escuro/40 mb-4">Nenhuma mídia na galeria.</p>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary text-xs">Adicionar primeira mídia</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtradas.map((foto, idx) => {
            const ehVideo = isVideo(foto.url)
            return (
              <div key={foto.id} className="admin-card p-2 group relative">
                <div className="relative aspect-square rounded-sm overflow-hidden bg-black/40 mb-2">
                  {ehVideo ? (
                    <>
                      <video src={foto.url} muted loop playsInline autoPlay className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 border border-dourado/20 px-1.5 py-0.5 rounded-sm">
                        <Play size={9} className="text-dourado fill-dourado" />
                        <span className="font-accent text-[8px] tracking-wider uppercase text-dourado/70">Vídeo</span>
                      </div>
                    </>
                  ) : (
                    <Image src={foto.url} alt={foto.alt ?? ''} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                  )}
                  <button onClick={() => toggleDestaque(foto)}
                    className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] border transition-all ${foto.destaque ? 'bg-dourado/90 text-preto-profundo border-dourado' : 'bg-black/55 text-bege border-white/20 hover:border-dourado/60'}`}
                    title={foto.destaque ? 'Remover dos destaques' : 'Adicionar aos destaques'}>
                    <Star size={12} className={foto.destaque ? 'fill-current' : ''} />
                    {foto.posicao_destaque ?? '-'}
                  </button>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => reordenar(foto.id, 'up')} disabled={idx === 0} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm disabled:opacity-30 transition-all"><ArrowUp size={14} className="text-white" /></button>
                    <button onClick={() => reordenar(foto.id, 'down')} disabled={idx === filtradas.length - 1} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm disabled:opacity-30 transition-all"><ArrowDown size={14} className="text-white" /></button>
                    <button onClick={() => { setEditando(foto); setModalAberto(true) }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-all"><span className="text-white text-xs">✏️</span></button>
                    <button onClick={() => deletar(foto.id)} className="p-1.5 bg-red-500/40 hover:bg-red-500/60 rounded-sm transition-all"><X size={14} className="text-white" /></button>
                  </div>
                </div>
                {foto.alt && <p className="font-body text-xs text-bege-escuro/60 truncate px-1">{foto.alt}</p>}
                {foto.evento?.nome && <p className="font-body text-[10px] text-dourado/60 truncate px-1">{foto.evento.nome}</p>}
                <p className="font-body text-[10px] text-bege-escuro/25 px-1">#{foto.ordem + 1} {ehVideo ? '· vídeo' : ''}</p>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <MidiaModal foto={editando} eventos={eventos} onClose={() => setModalAberto(false)} onSalvo={() => { setModalAberto(false); carregar() }} />
      )}
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────

const MidiaModal: React.FC<{
  foto: FotoGaleria | null
  eventos: EventoOpt[]
  onClose: () => void
  onSalvo: () => void
}> = ({ foto, eventos, onClose, onSalvo }) => {

  // Modo de entrada: 'upload' para foto do computador, 'url' para Cloudinary/URL externa
  type Modo = 'upload' | 'url'
  const [modo, setModo] = useState<Modo>(() => (foto?.url ? 'url' : 'upload'))

  const [form, setForm] = useState({
    url: foto?.url ?? '',
    alt: foto?.alt ?? '',
    evento_id: foto?.evento_id ?? '',
    ordem: foto?.ordem ?? 0,
  })
  const [salvando, setSalvando] = useState(false)
  const [enviandoUpload, setEnviandoUpload] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(foto?.url ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ehVideo = isVideo(previewUrl)

  // Upload de foto via Supabase Storage
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 10MB.'); return }

    setEnviandoUpload(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) { const d = await res.json(); toast.error(d.erro ?? 'Erro no upload'); return }
      const { url } = await res.json()
      setForm(p => ({ ...p, url, alt: p.alt || file.name.replace(/\.[^/.]+$/, '') }))
      setPreviewUrl(url)
      toast.success('Foto carregada!')
    } catch {
      toast.error('Erro ao fazer upload')
    } finally {
      setEnviandoUpload(false)
    }
  }

  const salvar = async () => {
    if (!form.url) { toast.error(modo === 'upload' ? 'Selecione uma foto' : 'Informe a URL'); return }
    setSalvando(true)
    try {
      const endpoint = foto ? `/api/admin/galeria/${foto.id}` : '/api/admin/galeria'
      const method = foto ? 'PUT' : 'POST'
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, evento_id: form.evento_id || null }),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      toast.success(foto ? 'Mídia atualizada!' : 'Mídia adicionada!')
      onSalvo()
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f0c07] border border-dourado/30 rounded-sm max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dourado/15">
          <h3 className="font-display text-xl text-bege">{foto ? 'Editar Mídia' : 'Adicionar Mídia'}</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">

          {/* ── SELETOR DE MODO (só no modal de criação ou se não for vídeo) ── */}
          {!foto && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-sm border border-white/8">
              <button
                onClick={() => setModo('upload')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-accent tracking-[0.15em] uppercase transition-all duration-200 ${
                  modo === 'upload'
                    ? 'bg-dourado/15 text-dourado border border-dourado/30'
                    : 'text-bege-escuro/50 hover:text-bege-escuro/80'
                }`}
              >
                <FolderOpen size={13} />
                Upload de Foto
              </button>
              <button
                onClick={() => setModo('url')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-accent tracking-[0.15em] uppercase transition-all duration-200 ${
                  modo === 'url'
                    ? 'bg-dourado/15 text-dourado border border-dourado/30'
                    : 'text-bege-escuro/50 hover:text-bege-escuro/80'
                }`}
              >
                <LinkIcon size={13} />
                URL / Vídeo
              </button>
            </div>
          )}

          {/* ── MODO UPLOAD ── */}
          {modo === 'upload' && (
            <div>
              <label className="admin-label mb-2">Foto do computador</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {/* Área de drop / clique */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={enviandoUpload}
                className={`w-full border-2 border-dashed rounded-sm transition-all duration-200 flex flex-col items-center justify-center gap-3 py-8 px-4 ${
                  previewUrl && !isVideo(previewUrl)
                    ? 'border-dourado/30 bg-dourado/5 hover:border-dourado/50'
                    : 'border-white/15 hover:border-dourado/40 hover:bg-white/[0.02]'
                }`}
              >
                {enviandoUpload ? (
                  <>
                    <Loader2 size={28} className="animate-spin text-dourado/60" />
                    <span className="font-body text-sm text-bege-escuro/50">Enviando...</span>
                  </>
                ) : previewUrl && !isVideo(previewUrl) ? (
                  <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                    <Image src={previewUrl} alt="Preview" fill className="object-contain rounded-sm" sizes="400px" onError={() => setPreviewUrl('')} />
                    <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="bg-black/70 text-bege text-xs px-3 py-1 rounded-sm font-body">Clique para trocar</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 border border-dourado/20 rounded-sm flex items-center justify-center">
                      <FolderOpen size={22} className="text-dourado/50" />
                    </div>
                    <div className="text-center">
                      <p className="font-body text-sm text-bege-escuro/70">Clique para selecionar uma foto</p>
                      <p className="font-body text-xs text-bege-escuro/35 mt-1">JPG, PNG, WEBP · Máx. 10MB</p>
                    </div>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── MODO URL (Cloudinary / vídeo / URL externa) ── */}
          {modo === 'url' && (
            <div>
              <label className="admin-label">URL do Cloudinary ou vídeo *</label>
              <input
                className="admin-input font-mono text-xs"
                value={form.url}
                onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setPreviewUrl(e.target.value) }}
                placeholder="https://res.cloudinary.com/.../video.mp4"
                autoFocus
              />
              <p className="text-[10px] text-bege-escuro/30 mt-1.5">
                Cole a URL do Cloudinary (foto ou vídeo .mp4) ou qualquer URL externa
              </p>

              {/* Preview da URL */}
              {previewUrl && (
                <div className="relative mt-3 rounded-sm overflow-hidden bg-black/40" style={{ aspectRatio: '16/9' }}>
                  {ehVideo ? (
                    <>
                      <video src={previewUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 border border-dourado/20 px-2 py-1 rounded-sm">
                        <Play size={10} className="text-dourado fill-dourado" />
                        <span className="font-accent text-[9px] tracking-wider uppercase text-dourado/80">Vídeo detectado</span>
                      </div>
                    </>
                  ) : (
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="400px" onError={() => setPreviewUrl('')} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* ── CAMPOS COMUNS ── */}
          <div>
            <label className="admin-label">Descrição</label>
            <input className="admin-input" value={form.alt}
              onChange={e => setForm(p => ({ ...p, alt: e.target.value }))}
              placeholder="Ex: Ambiente da Maandhoo — sábado à noite" />
            <p className="text-[10px] text-bege-escuro/30 mt-1">Texto exibido no hover e usado para acessibilidade</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-label">Evento (opcional)</label>
              <select className="admin-input" value={form.evento_id} onChange={e => setForm(p => ({ ...p, evento_id: e.target.value }))}>
                <option value="">Sem evento</option>
                {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Ordem</label>
              <input type="number" min="0" className="admin-input" value={form.ordem}
                onChange={e => setForm(p => ({ ...p, ordem: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={salvar}
              disabled={salvando || enviandoUpload || !form.url}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {salvando ? <><Loader2 size={12} className="animate-spin" /> Salvando...</> : (foto ? 'Salvar Alterações' : 'Adicionar à Galeria')}
            </button>
            <button onClick={onClose} className="btn-outline px-5">Cancelar</button>
          </div>

        </div>
      </div>
    </div>
  )
}
