'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus, RefreshCw, Loader2, X, Image as ImageIcon,
  ArrowUp, ArrowDown, Upload, Play, Link as LinkIcon,
  FolderOpen, Layout, Grid, Check,
} from 'lucide-react'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'

type FotoGaleria = {
  id: string
  evento_id: string | null
  url: string
  alt: string | null
  ordem: number
  created_at: string
  evento?: { nome: string } | null
}

type SlotHome = {
  slot: number
  galeria: { id: string; url: string; alt: string | null } | null
}

type EventoOpt = { id: string; nome: string }

const isVideo = (url: string): boolean =>
  url.includes('/video/upload/') ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(url)

const SLOT_LABELS: Record<number, string> = {
  1: 'Vertical 1', 2: 'Vertical 2', 3: 'Vertical 3',
  4: 'Horizontal 1', 5: 'Horizontal 2', 6: 'Horizontal 3', 7: 'Horizontal 4',
}
const SLOT_HINT: Record<number, string> = {
  1: 'Foto/vídeo portrait', 2: 'Foto/vídeo portrait', 3: 'Foto/vídeo portrait',
  4: 'Foto landscape', 5: 'Foto landscape', 6: 'Foto landscape', 7: 'Foto landscape',
}

export default function AdminGaleriaPage() {
  const [aba, setAba] = useState<'galeria' | 'home'>('galeria')
  const [fotos, setFotos] = useState<FotoGaleria[]>([])
  const [slotsHome, setSlotsHome] = useState<SlotHome[]>([])
  const [eventos, setEventos] = useState<EventoOpt[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<FotoGaleria | null>(null)
  const [eventoFiltro, setEventoFiltro] = useState('todos')
  const [enviandoLote, setEnviandoLote] = useState(false)
  // Slot selecionado para atribuir mídia
  const [slotSelecionado, setSlotSelecionado] = useState<number | null>(null)
  const loteInputRef = useRef<HTMLInputElement | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [resFotos, resEv, resHome] = await Promise.all([
        fetch('/api/admin/galeria'),
        fetch('/api/admin/eventos'),
        fetch('/api/admin/galeria-home'),
      ])
      const [dataFotos, dataEv, dataHome] = await Promise.all([
        resFotos.json(), resEv.json(), resHome.json(),
      ])
      setFotos(dataFotos.fotos ?? [])
      setEventos(dataEv.eventos ?? [])
      setSlotsHome(dataHome.slots ?? [])
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

  // ── Atribuir mídia a um slot da home ────────────────────────
  const atribuirSlot = async (slot: number, galeriaId: string | null) => {
    const res = await fetch('/api/admin/galeria-home', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot, galeria_id: galeriaId }),
    })
    if (!res.ok) { toast.error('Erro ao salvar slot'); return }
    toast.success(galeriaId ? `Slot ${slot} definido!` : `Slot ${slot} limpo!`)
    setSlotSelecionado(null)
    carregar()
  }

  const abrirUploadLote = () => loteInputRef.current?.click()

  const handleUploadLote: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    if (files.length > 20) { toast.error('Máximo 20 arquivos por vez.'); return }
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
            url, alt: file.name.replace(/\.[^/.]+$/, ''),
            evento_id: eventoFiltro !== 'todos' && eventoFiltro !== 'sem_evento' ? eventoFiltro : null,
            ordem: fotos.length + enviados,
          }),
        })
        if (res.ok) enviados++
      }
      toast.success(`${enviados} arquivo(s) enviado(s)!`)
      carregar()
    } catch { toast.error('Erro no upload em lote') }
    finally { setEnviandoLote(false) }
  }

  const filtradas = fotos.filter(f =>
    eventoFiltro === 'todos' || f.evento_id === eventoFiltro || (eventoFiltro === 'sem_evento' && !f.evento_id)
  )

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Galeria</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {fotos.length} item{fotos.length !== 1 ? 's' : ''} · fotos e vídeos
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

      {/* Abas */}
      <div className="flex gap-1 border-b border-white/8">
        <button
          onClick={() => setAba('galeria')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-accent tracking-wider uppercase border-b-2 transition-all -mb-px ${
            aba === 'galeria' ? 'border-dourado text-dourado' : 'border-transparent text-bege-escuro/50 hover:text-bege-escuro/80'
          }`}
        >
          <Grid size={13} /> Todas as Mídias
        </button>
        <button
          onClick={() => setAba('home')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-accent tracking-wider uppercase border-b-2 transition-all -mb-px ${
            aba === 'home' ? 'border-dourado text-dourado' : 'border-transparent text-bege-escuro/50 hover:text-bege-escuro/80'
          }`}
        >
          <Layout size={13} /> Destaques da Home
          {slotsHome.filter(s => s.galeria).length > 0 && (
            <span className="bg-dourado/20 text-dourado text-[9px] px-1.5 py-0.5 rounded-sm">
              {slotsHome.filter(s => s.galeria).length}/7
            </span>
          )}
        </button>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-dourado/50" /></div>
      ) : (
        <>
          {/* ══════════════════════════════════════════ */}
          {/* ABA: DESTAQUES DA HOME                     */}
          {/* ══════════════════════════════════════════ */}
          {aba === 'home' && (
            <div className="space-y-6">
              <div className="admin-card">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-1">
                      Seção &quot;Experiência&quot; — Home
                    </h3>
                    <p className="font-body text-xs text-bege-escuro/50">
                      Defina qual mídia aparece em cada card. Slots 1-3 são verticais (portrait), slots 4-7 são horizontais (landscape).
                    </p>
                  </div>
                </div>

                {/* Preview visual dos 7 slots */}
                <div className="space-y-3">
                  {/* Linha 1: 3 slots verticais */}
                  <p className="font-accent text-[9px] tracking-[0.25em] uppercase text-bege-escuro/35">
                    Linha 1 — Cards Verticais (portrait / instagram)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {slotsHome.slice(0, 3).map(s => (
                      <SlotCard
                        key={s.slot}
                        slot={s}
                        selecionado={slotSelecionado === s.slot}
                        onSelecionar={() => setSlotSelecionado(slotSelecionado === s.slot ? null : s.slot)}
                        onLimpar={() => atribuirSlot(s.slot, null)}
                        alturaPreview="h-44"
                      />
                    ))}
                  </div>

                  {/* Linha 2: 4 slots horizontais */}
                  <p className="font-accent text-[9px] tracking-[0.25em] uppercase text-bege-escuro/35 mt-4">
                    Linha 2 — Cards Horizontais (landscape / wide)
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {slotsHome.slice(3, 7).map(s => (
                      <SlotCard
                        key={s.slot}
                        slot={s}
                        selecionado={slotSelecionado === s.slot}
                        onSelecionar={() => setSlotSelecionado(slotSelecionado === s.slot ? null : s.slot)}
                        onLimpar={() => atribuirSlot(s.slot, null)}
                        alturaPreview="h-24"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Painel de seleção de mídia (aparece quando um slot está selecionado) */}
              {slotSelecionado !== null && (
                <div className="admin-card border border-dourado/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-accent text-xs tracking-widest uppercase text-dourado">
                        Escolher mídia para o Slot {slotSelecionado} — {SLOT_LABELS[slotSelecionado]}
                      </h4>
                      <p className="font-body text-[11px] text-bege-escuro/45 mt-0.5">
                        Recomendado: {SLOT_HINT[slotSelecionado]}. Clique na mídia desejada.
                      </p>
                    </div>
                    <button onClick={() => setSlotSelecionado(null)} className="text-bege-escuro/40 hover:text-bege transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  {fotos.length === 0 ? (
                    <p className="text-center text-sm text-bege-escuro/40 py-8">Nenhuma mídia na galeria ainda.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
                      {fotos.map(foto => {
                        const ehVideo = isVideo(foto.url)
                        const jaNesseSlot = slotsHome.find(s => s.slot === slotSelecionado)?.galeria?.id === foto.id
                        const emOutroSlot = slotsHome.find(s => s.galeria?.id === foto.id && s.slot !== slotSelecionado)
                        return (
                          <button
                            key={foto.id}
                            onClick={() => atribuirSlot(slotSelecionado, foto.id)}
                            className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all duration-200 group ${
                              jaNesseSlot
                                ? 'border-dourado ring-1 ring-dourado/40'
                                : 'border-white/10 hover:border-dourado/60'
                            }`}
                            title={foto.alt ?? foto.url}
                          >
                            {ehVideo ? (
                              <video src={foto.url} muted loop playsInline autoPlay
                                className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <Image src={foto.url} alt={foto.alt ?? ''} fill
                                className="object-cover" sizes="120px" />
                            )}

                            {/* Badge "já neste slot" */}
                            {jaNesseSlot && (
                              <div className="absolute inset-0 bg-dourado/20 flex items-center justify-center">
                                <div className="bg-dourado rounded-full p-1">
                                  <Check size={12} className="text-preto-profundo" strokeWidth={3} />
                                </div>
                              </div>
                            )}

                            {/* Badge "em outro slot" */}
                            {emOutroSlot && !jaNesseSlot && (
                              <div className="absolute bottom-0 left-0 right-0 bg-dourado/80 text-preto-profundo text-[8px] font-accent tracking-wider text-center py-0.5">
                                Slot {emOutroSlot.slot}
                              </div>
                            )}

                            {/* Badge vídeo */}
                            {ehVideo && (
                              <div className="absolute top-1 left-1 bg-black/70 border border-dourado/20 px-1 py-0.5 rounded-sm flex items-center gap-0.5">
                                <Play size={7} className="text-dourado fill-dourado" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════ */}
          {/* ABA: TODAS AS MÍDIAS                       */}
          {/* ══════════════════════════════════════════ */}
          {aba === 'galeria' && (
            <>
              {/* Filtro por evento */}
              <div className="flex gap-2 flex-wrap">
                {['todos', ...eventos.map(e => e.id), 'sem_evento'].map(val => {
                  const label = val === 'todos' ? 'Todas' : val === 'sem_evento' ? 'Sem evento' : eventos.find(e => e.id === val)?.nome ?? val
                  return (
                    <button key={val} onClick={() => setEventoFiltro(val)}
                      className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all ${eventoFiltro === val ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
                      {label}
                    </button>
                  )
                })}
              </div>

              {filtradas.length === 0 ? (
                <div className="admin-card text-center py-16">
                  <ImageIcon size={32} className="text-bege-escuro/20 mx-auto mb-3" />
                  <p className="font-body text-bege-escuro/40 mb-4">Nenhuma mídia na galeria.</p>
                  <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary text-xs">
                    Adicionar primeira mídia
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtradas.map((foto, idx) => {
                    const ehVideo = isVideo(foto.url)
                    const slotAtribuido = slotsHome.find(s => s.galeria?.id === foto.id)
                    return (
                      <div key={foto.id} className="admin-card p-2 group relative">
                        <div className="relative aspect-square rounded-sm overflow-hidden bg-black/40 mb-2">
                          {ehVideo ? (
                            <>
                              <video src={foto.url} muted loop playsInline autoPlay
                                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 border border-dourado/20 px-1.5 py-0.5 rounded-sm">
                                <Play size={9} className="text-dourado fill-dourado" />
                                <span className="font-accent text-[8px] tracking-wider uppercase text-dourado/70">Vídeo</span>
                              </div>
                            </>
                          ) : (
                            <Image src={foto.url} alt={foto.alt ?? ''} fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                          )}

                          {/* Badge de slot da home */}
                          {slotAtribuido && (
                            <div className="absolute top-2 left-2 bg-dourado/90 text-preto-profundo px-2 py-0.5 rounded-sm">
                              <span className="font-accent text-[9px] tracking-wider uppercase">Home S{slotAtribuido.slot}</span>
                            </div>
                          )}

                          {/* Overlay ações */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => reordenar(foto.id, 'up')} disabled={idx === 0}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm disabled:opacity-30 transition-all">
                              <ArrowUp size={14} className="text-white" />
                            </button>
                            <button onClick={() => reordenar(foto.id, 'down')} disabled={idx === filtradas.length - 1}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm disabled:opacity-30 transition-all">
                              <ArrowDown size={14} className="text-white" />
                            </button>
                            <button onClick={() => { setEditando(foto); setModalAberto(true) }}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-sm transition-all">
                              <span className="text-white text-xs">✏️</span>
                            </button>
                            <button onClick={() => deletar(foto.id)}
                              className="p-1.5 bg-red-500/40 hover:bg-red-500/60 rounded-sm transition-all">
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        </div>
                        {foto.alt && <p className="font-body text-xs text-bege-escuro/60 truncate px-1">{foto.alt}</p>}
                        {foto.evento?.nome && <p className="font-body text-[10px] text-dourado/60 truncate px-1">{foto.evento.nome}</p>}
                        <p className="font-body text-[10px] text-bege-escuro/25 px-1">
                          #{foto.ordem + 1}{ehVideo ? ' · vídeo' : ''}{slotAtribuido ? ` · Home S${slotAtribuido.slot}` : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {modalAberto && (
        <MidiaModal foto={editando} eventos={eventos} onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar() }} />
      )}
    </div>
  )
}

// ─── CARD DE SLOT ─────────────────────────────────────────────
function SlotCard({
  slot, selecionado, onSelecionar, onLimpar, alturaPreview,
}: {
  slot: SlotHome
  selecionado: boolean
  onSelecionar: () => void
  onLimpar: () => void
  alturaPreview: string
}) {
  const midia = slot.galeria
  const ehVideo = midia ? isVideo(midia.url) : false

  return (
    <div className={`rounded-sm border-2 overflow-hidden transition-all duration-200 ${
      selecionado ? 'border-dourado shadow-[0_0_12px_rgba(201,168,76,0.25)]' : 'border-white/10 hover:border-dourado/40'
    }`}>
      {/* Preview */}
      <div
        className={`relative ${alturaPreview} bg-black/40 cursor-pointer group`}
        onClick={onSelecionar}
      >
        {midia ? (
          <>
            {ehVideo ? (
              <video src={midia.url} autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Image src={midia.url} alt={midia.alt ?? ''} fill className="object-cover" sizes="200px" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity font-accent text-[10px] tracking-widest uppercase text-white bg-black/60 px-2 py-1 rounded-sm">
                Trocar
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:bg-dourado/5 transition-colors">
            <div className="w-8 h-8 border border-dourado/20 rounded-sm flex items-center justify-center group-hover:border-dourado/50 transition-colors">
              <Plus size={14} className="text-dourado/40 group-hover:text-dourado/70 transition-colors" />
            </div>
            <span className="font-accent text-[9px] tracking-[0.2em] uppercase text-bege-escuro/30 group-hover:text-bege-escuro/60 transition-colors">
              Clique para definir
            </span>
          </div>
        )}
      </div>

      {/* Rodapé do slot */}
      <div className="px-2 py-2 bg-black/20 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <p className="font-accent text-[9px] tracking-[0.15em] uppercase text-dourado/60 leading-none">
            Slot {slot.slot}
          </p>
          <p className="font-body text-[10px] text-bege-escuro/40 mt-0.5 truncate">
            {midia ? (midia.alt || 'Sem descrição') : SLOT_HINT[slot.slot]}
          </p>
        </div>
        {midia && (
          <button
            onClick={e => { e.stopPropagation(); onLimpar() }}
            className="flex-shrink-0 p-1 text-bege-escuro/30 hover:text-red-400 transition-colors"
            title="Remover mídia deste slot"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MODAL ADICIONAR/EDITAR MÍDIA ─────────────────────────────
const MidiaModal: React.FC<{
  foto: FotoGaleria | null
  eventos: EventoOpt[]
  onClose: () => void
  onSalvo: () => void
}> = ({ foto, eventos, onClose, onSalvo }) => {
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

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10MB.'); return }
    setEnviandoUpload(true)
    try {
      const formData = new FormData(); formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) { const d = await res.json(); toast.error(d.erro ?? 'Erro no upload'); return }
      const { url } = await res.json()
      setForm(p => ({ ...p, url, alt: p.alt || file.name.replace(/\.[^/.]+$/, '') }))
      setPreviewUrl(url)
      toast.success('Foto carregada!')
    } catch { toast.error('Erro ao fazer upload') }
    finally { setEnviandoUpload(false) }
  }

  const salvar = async () => {
    if (!form.url) { toast.error(modo === 'upload' ? 'Selecione uma foto' : 'Informe a URL'); return }
    setSalvando(true)
    try {
      const endpoint = foto ? `/api/admin/galeria/${foto.id}` : '/api/admin/galeria'
      const method = foto ? 'PUT' : 'POST'
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, evento_id: form.evento_id || null }) })
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
      <div className="relative w-full max-w-md bg-[#0f0c07] border border-dourado/30 rounded-sm max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dourado/15">
          <h3 className="font-display text-xl text-bege">{foto ? 'Editar Mídia' : 'Adicionar Mídia'}</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          {!foto && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-sm border border-white/8">
              <button onClick={() => setModo('upload')} className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-accent tracking-[0.15em] uppercase transition-all duration-200 ${modo === 'upload' ? 'bg-dourado/15 text-dourado border border-dourado/30' : 'text-bege-escuro/50 hover:text-bege-escuro/80'}`}>
                <FolderOpen size={13} /> Upload de Foto
              </button>
              <button onClick={() => setModo('url')} className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-accent tracking-[0.15em] uppercase transition-all duration-200 ${modo === 'url' ? 'bg-dourado/15 text-dourado border border-dourado/30' : 'text-bege-escuro/50 hover:text-bege-escuro/80'}`}>
                <LinkIcon size={13} /> URL / Vídeo
              </button>
            </div>
          )}

          {modo === 'upload' && (
            <div>
              <label className="admin-label mb-2">Foto do computador</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={enviandoUpload}
                className={`w-full border-2 border-dashed rounded-sm transition-all duration-200 flex flex-col items-center justify-center gap-3 py-8 px-4 ${previewUrl && !isVideo(previewUrl) ? 'border-dourado/30 bg-dourado/5 hover:border-dourado/50' : 'border-white/15 hover:border-dourado/40 hover:bg-white/[0.02]'}`}>
                {enviandoUpload ? (
                  <><Loader2 size={28} className="animate-spin text-dourado/60" /><span className="font-body text-sm text-bege-escuro/50">Enviando...</span></>
                ) : previewUrl && !isVideo(previewUrl) ? (
                  <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                    <Image src={previewUrl} alt="Preview" fill className="object-contain rounded-sm" sizes="400px" onError={() => setPreviewUrl('')} />
                    <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="bg-black/70 text-bege text-xs px-3 py-1 rounded-sm font-body">Clique para trocar</span>
                    </div>
                  </div>
                ) : (
                  <><div className="w-12 h-12 border border-dourado/20 rounded-sm flex items-center justify-center"><FolderOpen size={22} className="text-dourado/50" /></div><div className="text-center"><p className="font-body text-sm text-bege-escuro/70">Clique para selecionar uma foto</p><p className="font-body text-xs text-bege-escuro/35 mt-1">JPG, PNG, WEBP · Máx. 10MB</p></div></>
                )}
              </button>
            </div>
          )}

          {modo === 'url' && (
            <div>
              <label className="admin-label">URL do Cloudinary ou vídeo *</label>
              <input className="admin-input font-mono text-xs" value={form.url} onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setPreviewUrl(e.target.value) }} placeholder="https://res.cloudinary.com/.../video.mp4" autoFocus />
              <p className="text-[10px] text-bege-escuro/30 mt-1.5">URL do Cloudinary (foto ou vídeo .mp4) ou URL externa</p>
              {previewUrl && (
                <div className="relative mt-3 rounded-sm overflow-hidden bg-black/40" style={{ aspectRatio: '16/9' }}>
                  {ehVideo ? (
                    <><video src={previewUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 border border-dourado/20 px-2 py-1 rounded-sm">
                      <Play size={10} className="text-dourado fill-dourado" /><span className="font-accent text-[9px] tracking-wider uppercase text-dourado/80">Vídeo</span>
                    </div></>
                  ) : (
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="400px" onError={() => setPreviewUrl('')} />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="h-px bg-white/5" />

          <div>
            <label className="admin-label">Descrição</label>
            <input className="admin-input" value={form.alt} onChange={e => setForm(p => ({ ...p, alt: e.target.value }))} placeholder="Ex: Ambiente da Maandhoo — sábado à noite" />
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
              <input type="number" min="0" className="admin-input" value={form.ordem} onChange={e => setForm(p => ({ ...p, ordem: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={salvar} disabled={salvando || enviandoUpload || !form.url} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
              {salvando ? <><Loader2 size={12} className="animate-spin" /> Salvando...</> : (foto ? 'Salvar Alterações' : 'Adicionar à Galeria')}
            </button>
            <button onClick={onClose} className="btn-outline px-5">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
