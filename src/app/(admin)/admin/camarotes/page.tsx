'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Copy, RefreshCw, Loader2, X, ExternalLink, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'
import type { CamaroteDB, EventoDB } from '@/types/ingressos'

type CamaroteComIngressos = CamaroteDB & {
  evento?: Pick<EventoDB, 'id' | 'nome' | 'data_evento'>
  total_ingressos: number
  cadastros_completos: number
}

export default function AdminCamarotesPage() {
  const [camarotes, setCamarotes] = useState<CamaroteComIngressos[]>([])
  const [eventos, setEventos] = useState<EventoDB[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [linksGerados, setLinksGerados] = useState<string[] | null>(null)
  const [eventoFiltro, setEventoFiltro] = useState('todos')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [resCam, resEv] = await Promise.all([
        fetch('/api/ingressos/camarote'),
        fetch('/api/admin/eventos'),
      ])
      const [dataCam, dataEv] = await Promise.all([resCam.json(), resEv.json()])
      if (dataCam.camarotes) setCamarotes(dataCam.camarotes)
      if (dataEv.eventos) setEventos(dataEv.eventos)
    } catch { toast.error('Erro ao carregar camarotes') }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = camarotes.filter(c =>
    eventoFiltro === 'todos' || c.evento_id === eventoFiltro
  )

  const copiarLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  const copiarTodos = (links: string[]) => {
    navigator.clipboard.writeText(links.join('\n'))
    toast.success(`${links.length} links copiados!`)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Camarotes</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            Gerencie e distribua links de cadastro para camarotes
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModalAberto(true)} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Novo Camarote
          </button>
        </div>
      </div>

      {/* FILTRO EVENTO */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setEventoFiltro('todos')}
          className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
            ${eventoFiltro === 'todos' ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
          Todos
        </button>
        {eventos.map(ev => (
          <button key={ev.id} onClick={() => setEventoFiltro(ev.id)}
            className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
              ${eventoFiltro === ev.id ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
            {ev.nome}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="admin-card text-center py-16">
          <Users size={32} className="text-bege-escuro/20 mx-auto mb-3" />
          <p className="font-body text-bege-escuro/40">Nenhum camarote cadastrado.</p>
          <button onClick={() => setModalAberto(true)} className="btn-primary text-xs mt-4">
            Criar primeiro camarote
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtrados.map(camarote => {
            const pct = camarote.total_ingressos > 0
              ? Math.round((camarote.cadastros_completos / camarote.total_ingressos) * 100)
              : 0

            return (
              <div key={camarote.id} className="admin-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${camarote.disponivel ? 'bg-green-400' : 'bg-bege-escuro/30'}`} />
                      <span className="font-body text-xs text-bege-escuro/50 capitalize">
                        {camarote.evento?.nome ?? 'Evento'} · {camarote.evento?.data_evento
                          ? format(new Date(camarote.evento.data_evento), "dd/MM", { locale: ptBR })
                          : '—'}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-bege">{camarote.identificador}</h3>

                    {/* STATS */}
                    <div className="flex gap-5 mt-3 mb-3">
                      <div className="text-xs">
                        <span className="text-bege-escuro/50">Ingressos: </span>
                        <span className="text-bege">{camarote.total_ingressos}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-bege-escuro/50">Cadastrados: </span>
                        <span className="text-green-400">{camarote.cadastros_completos}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-bege-escuro/50">Pendentes: </span>
                        <span className="text-amber-400">{camarote.total_ingressos - camarote.cadastros_completos}</span>
                      </div>
                    </div>

                    {/* BARRA */}
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden w-full max-w-xs">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-bege-escuro/35 mt-0.5">{pct}% cadastrados</p>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex flex-col gap-2">
                    <GerarLinksButton
                      camaroteId={camarote.id}
                      onGerado={(links) => setLinksGerados(links)}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL LINKS GERADOS */}
      {linksGerados && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setLinksGerados(null)} />
          <div className="relative w-full max-w-lg bg-[#0f0c07] border border-dourado/30 rounded-sm max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-dourado/15">
              <h3 className="font-display text-xl text-bege">{linksGerados.length} Links Gerados</h3>
              <div className="flex gap-2">
                <button onClick={() => copiarTodos(linksGerados)}
                  className="btn-outline text-xs flex items-center gap-1.5">
                  <Copy size={12} /> Copiar Todos
                </button>
                <button onClick={() => setLinksGerados(null)} className="text-bege-escuro/50 hover:text-bege">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <p className="font-body text-xs text-bege-escuro/50 mb-4">
                Distribua cada link para uma pessoa diferente. Cada link é de uso único.
              </p>
              {linksGerados.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-black/30 rounded-sm border border-white/5">
                  <span className="font-body text-xs text-bege-escuro/40 w-6 flex-shrink-0">{i + 1}.</span>
                  <span className="font-mono text-xs text-bege-escuro/70 flex-1 truncate">{url}</span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => copiarLink(url)} className="p-1.5 text-bege-escuro/40 hover:text-dourado transition-colors" title="Copiar">
                      <Copy size={12} />
                    </button>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-bege-escuro/40 hover:text-dourado transition-colors" title="Abrir">
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO CAMAROTE */}
      {modalAberto && (
        <NovoCamaroteModal
          eventos={eventos}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

// ─── BOTÃO GERAR LINKS ────────────────────────────────────────

const GerarLinksButton: React.FC<{
  camaroteId: string
  onGerado: (links: string[]) => void
}> = ({ camaroteId, onGerado }) => {
  const [gerando, setGerando] = useState(false)

  const gerar = async () => {
    setGerando(true)
    try {
      const res = await fetch('/api/ingressos/camarote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camarote_id: camaroteId }),
      })
      const data = await res.json()
      if (data.links) {
        onGerado(data.links)
        toast.success(`${data.links.length} links gerados!`)
      } else {
        toast.error(data.erro ?? 'Erro ao gerar links')
      }
    } catch { toast.error('Erro de conexão') }
    finally { setGerando(false) }
  }

  return (
    <button onClick={gerar} disabled={gerando}
      className="flex items-center gap-1.5 text-xs border border-dourado/30 hover:border-dourado text-dourado/80 hover:text-dourado px-3 py-2 rounded-sm transition-all disabled:opacity-50 whitespace-nowrap">
      {gerando ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
      {gerando ? 'Gerando...' : 'Gerar Links'}
    </button>
  )
}

// ─── MODAL NOVO CAMAROTE ──────────────────────────────────────

const NovoCamaroteModal: React.FC<{
  eventos: EventoDB[]
  onClose: () => void
  onSalvo: () => void
}> = ({ eventos, onClose, onSalvo }) => {
  const [form, setForm] = useState({
    evento_id: '',
    nome: '',
    descricao: '',
    capacidade: 10,
  })
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!form.evento_id || !form.nome) { toast.error('Evento e nome são obrigatórios'); return }
    setSalvando(true)
    try {
      const res = await fetch('/api/admin/camarotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      toast.success('Camarote criado!')
      onSalvo()
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f0c07] border border-dourado/30 rounded-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dourado/15">
          <h3 className="font-display text-xl text-bege">Novo Camarote</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="admin-label">Evento *</label>
            <select className="admin-input" value={form.evento_id} onChange={e => setForm(p => ({ ...p, evento_id: e.target.value }))}>
              <option value="">Selecione o evento</option>
              {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Nome do Camarote *</label>
            <input className="admin-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Camarote VIP 1" />
          </div>
          <div>
            <label className="admin-label">Descrição</label>
            <input className="admin-input" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Mesa com 10 pessoas, open bar..." />
          </div>
          <div>
            <label className="admin-label">Capacidade (nº de ingressos)</label>
            <input type="number" min={1} max={100} className="admin-input" value={form.capacidade}
              onChange={e => setForm(p => ({ ...p, capacidade: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {salvando ? <><Loader2 size={12} className="animate-spin" /> Criando...</> : 'Criar Camarote'}
            </button>
            <button onClick={onClose} className="btn-outline">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
