'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Loader2, CheckCircle2, XCircle, Clock,
  Phone, Mail, Users, MessageSquare, ChevronDown, Plus,
  MapPin, Edit3, X, Save
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type StatusReserva = 'pendente' | 'confirmada' | 'cancelada'
type TipoReserva = 'mesa' | 'camarote' | 'aniversario'

type Reserva = {
  id: string
  tipo: TipoReserva
  nome: string
  email: string | null
  whatsapp: string
  numero_pessoas: number
  area_desejada: string | null
  data_aniversario: string | null
  observacoes: string | null
  observacoes_admin: string | null
  status: StatusReserva
  created_at: string
}

type FormReserva = {
  nome: string
  email: string
  whatsapp: string
  tipo: TipoReserva
  area_desejada: string
  numero_pessoas: string
  data_aniversario: string
  observacoes: string
  observacoes_admin: string
  status: StatusReserva
}

const FORM_VAZIO: FormReserva = {
  nome: '', email: '', whatsapp: '', tipo: 'mesa',
  area_desejada: '', numero_pessoas: '2',
  data_aniversario: '', observacoes: '', observacoes_admin: '', status: 'pendente',
}

// ─── CONFIG VISUAL ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<StatusReserva, { label: string; cor: string; icon: JSX.Element }> = {
  pendente:   { label: 'Pendente',   cor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',  icon: <Clock size={12} /> },
  confirmada: { label: 'Confirmada', cor: 'text-green-400 bg-green-400/10 border-green-400/30',  icon: <CheckCircle2 size={12} /> },
  cancelada:  { label: 'Cancelada',  cor: 'text-red-400 bg-red-400/10 border-red-400/30',        icon: <XCircle size={12} /> },
}

const TIPO_CONFIG: Record<TipoReserva, { label: string; cor: string }> = {
  mesa:        { label: 'Mesa',        cor: 'text-blue-400' },
  camarote:    { label: 'Camarote',    cor: 'text-dourado' },
  aniversario: { label: 'Aniversário', cor: 'text-pink-400' },
}

// Áreas reservadas por setor no mapa (id → label)
const SETORES_MAPA: Record<string, { label: string; tipo: TipoReserva }> = {
  'c4':  { label: 'Camarote 4',  tipo: 'camarote' },
  'c5':  { label: 'Camarote 5',  tipo: 'camarote' },
  'c6':  { label: 'Camarote 6',  tipo: 'camarote' },
  'c7':  { label: 'Camarote 7',  tipo: 'camarote' },
  'c8':  { label: 'Camarote 8',  tipo: 'camarote' },
  'c9':  { label: 'Camarote 9',  tipo: 'camarote' },
  'c10': { label: 'Camarote 10', tipo: 'camarote' },
  'c11': { label: 'Camarote 11', tipo: 'camarote' },
  'c12': { label: 'Camarote 12', tipo: 'camarote' },
  'c13': { label: 'Camarote 13', tipo: 'camarote' },
  'c14': { label: 'Camarote 14', tipo: 'camarote' },
  'c15': { label: 'Camarote 15', tipo: 'camarote' },
  's1':  { label: 'Sofá 1',      tipo: 'camarote' },
  's2':  { label: 'Sofá 2',      tipo: 'camarote' },
  's3':  { label: 'Sofá 3',      tipo: 'camarote' },
}

// ─── COMPONENTE MAPA SVG ──────────────────────────────────────────────────────
interface MapaProps {
  setoresReservados: Set<string>   // ids de setores com reserva ativa
  setorSelecionado: string | null
  onSetorClick: (id: string) => void
  somenteLeitura?: boolean
}

function MapaCasa({ setoresReservados, setorSelecionado, onSetorClick, somenteLeitura }: MapaProps) {
  const cor = (id: string) => {
    if (setorSelecionado === id) return { fill: 'rgba(201,168,76,0.5)', stroke: '#C9A84C', sw: '2' }
    if (setoresReservados.has(id)) return { fill: 'rgba(255,80,80,0.18)', stroke: '#ff5050', sw: '1.5' }
    return { fill: 'rgba(201,168,76,0.07)', stroke: '#C9A84C66', sw: '1.2' }
  }

  const Cam = ({ id, x, y, w, h, label }: { id: string; x: number; y: number; w: number; h: number; label: string }) => {
    const c = cor(id)
    const reservado = setoresReservados.has(id)
    const titulo = label.replace('Camarote ', '').replace('Sofá ', 'S')
    return (
      <g
        onClick={() => !somenteLeitura && onSetorClick(id)}
        style={{ cursor: somenteLeitura ? 'default' : 'pointer' }}
      >
        <rect x={x} y={y} width={w} height={h} rx="3"
          fill={c.fill} stroke={c.stroke} strokeWidth={c.sw}
          style={{ transition: 'fill 0.15s, stroke 0.15s' }}
        />
        <circle cx={x + w / 2} cy={y + 11} r={9}
          fill={c.stroke} opacity="0.85"
        />
        <text x={x + w / 2} y={y + 15} textAnchor="middle"
          fill="#0a0604" fontSize="7.5" fontFamily="Cinzel" fontWeight="700">{titulo}</text>
        {reservado && (
          <text x={x + w / 2} y={y + h - 6} textAnchor="middle"
            fill="#ff8080" fontSize="6.5" fontFamily="DM Sans">reservado</text>
        )}
        {setorSelecionado === id && (
          <rect x={x} y={y} width={w} height={h} rx="3"
            fill="none" stroke="#C9A84C" strokeWidth="2" strokeDasharray="3,2" />
        )}
      </g>
    )
  }

  return (
    <svg viewBox="0 0 700 760" width="100%" style={{ maxHeight: 600 }}>
      {/* FUNDO */}
      <rect width="700" height="760" fill="#0d0805" rx="4" />
      <rect x="10" y="10" width="680" height="740" fill="#130905" rx="3" stroke="#2a140a" strokeWidth="1" />
      <text x="350" y="38" textAnchor="middle" fill="#C9A84C" fontSize="10" fontFamily="Cinzel" letterSpacing="5" opacity="0.6">MAANDHOO</text>

      {/* ESTRUTURA: paredes e escadas */}
      <rect x="150" y="48" width="310" height="148" fill="rgba(201,168,76,0.04)" stroke="#2a1408" strokeWidth="1" rx="2" />
      <rect x="508" y="48" width="162" height="510" fill="rgba(201,168,76,0.04)" stroke="#2a1408" strokeWidth="1" rx="2" />
      <rect x="200" y="128" width="260" height="28" fill="#1a0d05" stroke="#2a1408" strokeWidth="0.8" rx="1" />
      <text x="330" y="146" textAnchor="middle" fill="#3a2008" fontSize="8" fontFamily="DM Sans">escadas</text>

      {/* DIVISÓRIAS */}
      <line x1="108" y1="340" x2="108" y2="660" stroke="#2a1408" strokeWidth="1" />
      <line x1="22" y1="340" x2="108" y2="340" stroke="#2a1408" strokeWidth="1" />
      <line x1="190" y1="340" x2="190" y2="580" stroke="#2a1408" strokeWidth="0.7" strokeDasharray="3,2" />
      <line x1="22" y1="660" x2="620" y2="660" stroke="#2a1408" strokeWidth="1" />

      {/* PALCO */}
      <ellipse cx="570" cy="360" rx="68" ry="80" fill="rgba(201,168,76,0.06)" stroke="#C9A84C55" strokeWidth="1.2" />
      <text x="570" y="364" textAnchor="middle" fill="#C9A84C66" fontSize="9" fontFamily="Cinzel" letterSpacing="2">PALCO</text>

      {/* CAMAROTES SUPERIORES */}
      <Cam id="c4"  x={168} y={58}  w={68} h={58} label="Camarote 4" />
      <Cam id="c5"  x={242} y={58}  w={68} h={58} label="Camarote 5" />
      <Cam id="c6"  x={316} y={58}  w={68} h={58} label="Camarote 6" />
      <Cam id="c7"  x={390} y={58}  w={68} h={58} label="Camarote 7" />
      {/* CAMAROTES LATERAIS DIREITOS */}
      <Cam id="c8"  x={530} y={165} w={72} h={58} label="Camarote 8" />
      <Cam id="c9"  x={530} y={232} w={72} h={58} label="Camarote 9" />
      <Cam id="c10" x={530} y={420} w={72} h={58} label="Camarote 10" />
      {/* CAMAROTES LATERAIS ESQUERDOS */}
      <Cam id="c11" x={22}  y={348} w={80} h={62} label="Camarote 11" />
      <Cam id="c12" x={22}  y={418} w={80} h={62} label="Camarote 12" />
      <Cam id="c13" x={22}  y={488} w={80} h={62} label="Camarote 13" />
      <Cam id="c14" x={22}  y={558} w={80} h={62} label="Camarote 14" />
      <Cam id="c15" x={22}  y={628} w={80} h={62} label="Camarote 15" />

      {/* SOFÁS */}
      <Cam id="s1" x={112} y={500} w={72} h={55} label="Sofá 1" />
      <Cam id="s2" x={112} y={430} w={72} h={55} label="Sofá 2" />
      <Cam id="s3" x={112} y={360} w={72} h={55} label="Sofá 3" />

      {/* MESAS — apenas marcadores circulares (não clicáveis individualmente) */}
      {[
        [200,184],[248,184],[296,184],[344,184],[392,184],[440,184],
        [200,224],[296,224],[440,224],
        [200,290],[200,340],[200,390],[200,440],[200,490],[200,540],
        [268,290],[268,340],[268,390],[268,440],[268,490],[268,540],
        [336,290],[336,340],[336,390],[336,440],
        [110,290],[110,340],[110,390],[110,440],[110,490],[110,540],
        [150,620],[218,620],[286,620],[354,620],[422,620],
        [120,690],[200,690],[280,690],[360,690],[440,690],
      ].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={13} fill="rgba(201,168,76,0.06)" stroke="#C9A84C33" strokeWidth="1" />
      ))}

      {/* LEGENDA */}
      <g transform="translate(16, 710)">
        <rect x={0} y={0} width={10} height={10} rx="2" fill="rgba(201,168,76,0.07)" stroke="#C9A84C66" strokeWidth="1" />
        <text x={14} y={9} fill="#5a3518" fontSize="9" fontFamily="DM Sans">Disponível</text>
        <rect x={90} y={0} width={10} height={10} rx="2" fill="rgba(255,80,80,0.18)" stroke="#ff5050" strokeWidth="1" />
        <text x={104} y={9} fill="#ff8080" fontSize="9" fontFamily="DM Sans">Reservado</text>
        <rect x={188} y={0} width={10} height={10} rx="2" fill="rgba(201,168,76,0.5)" stroke="#C9A84C" strokeWidth="2" />
        <text x={202} y={9} fill="#C9A84C" fontSize="9" fontFamily="DM Sans">Selecionado</text>
      </g>
    </svg>
  )
}


// ─── MODAL DE FORMULÁRIO ──────────────────────────────────────────────────────
interface ModalFormProps {
  modo: 'criar' | 'editar'
  form: FormReserva
  onChange: (f: Partial<FormReserva>) => void
  onSalvar: () => void
  onFechar: () => void
  salvando: boolean
}

function ModalForm({ modo, form, onChange, onSalvar, onFechar, salvando }: ModalFormProps) {
  const inputCls = 'admin-input w-full'
  const labelCls = 'font-accent text-[9px] tracking-[0.25em] uppercase text-bege-escuro/50 mb-1 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#100a04] border border-dourado/20 rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display text-xl text-bege">
            {modo === 'criar' ? 'Nova Reserva' : 'Editar Reserva'}
          </h2>
          <button onClick={onFechar} className="text-bege-escuro/40 hover:text-bege-escuro transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* CORPO */}
        <div className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className={labelCls}>Nome do cliente *</label>
            <input value={form.nome} onChange={e => onChange({ nome: e.target.value })}
              className={inputCls} placeholder="Nome completo" />
          </div>

          {/* Tipo */}
          <div>
            <label className={labelCls}>Tipo de reserva *</label>
            <div className="flex gap-2">
              {(['mesa', 'camarote', 'aniversario'] as TipoReserva[]).map(t => (
                <button key={t} onClick={() => onChange({ tipo: t })}
                  className={`flex-1 py-2 text-xs font-accent tracking-wider uppercase border rounded-sm transition-all
                    ${form.tipo === t ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/50 hover:border-dourado/30'}`}>
                  {TIPO_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Área desejada */}
          <div>
            <label className={labelCls}>Área / Setor desejado</label>
            <input value={form.area_desejada} onChange={e => onChange({ area_desejada: e.target.value })}
              className={inputCls} placeholder="Ex: Camarote 7, Mesa próxima ao palco..." />
          </div>

          {/* Whatsapp + Nº pessoas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>WhatsApp *</label>
              <input value={form.whatsapp} onChange={e => onChange({ whatsapp: e.target.value })}
                className={inputCls} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className={labelCls}>Nº de pessoas</label>
              <input type="number" min="1" max="50" value={form.numero_pessoas}
                onChange={e => onChange({ numero_pessoas: e.target.value })}
                className={inputCls} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={e => onChange({ email: e.target.value })}
              className={inputCls} placeholder="email@exemplo.com" />
          </div>

          {/* Data aniversário (só se tipo = aniversario) */}
          {form.tipo === 'aniversario' && (
            <div>
              <label className={labelCls}>Data do aniversário</label>
              <input type="date" value={form.data_aniversario} onChange={e => onChange({ data_aniversario: e.target.value })}
                className={inputCls} />
            </div>
          )}

          {/* Obs cliente */}
          <div>
            <label className={labelCls}>Observações do cliente</label>
            <textarea value={form.observacoes} onChange={e => onChange({ observacoes: e.target.value })}
              rows={2} className={inputCls + ' resize-none'} placeholder="Pedidos especiais, alergias, etc." />
          </div>

          {/* Obs admin */}
          <div>
            <label className={labelCls}>Notas internas (admin)</label>
            <textarea value={form.observacoes_admin} onChange={e => onChange({ observacoes_admin: e.target.value })}
              rows={2} className={inputCls + ' resize-none'} placeholder="Anotações internas não visíveis ao cliente" />
          </div>

          {/* Status (só no editar) */}
          {modo === 'editar' && (
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => onChange({ status: e.target.value as StatusReserva })}
                className={inputCls}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#0f0c07]">{v.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onFechar} className="btn-outline flex-1 text-sm">Cancelar</button>
          <button onClick={onSalvar} disabled={salvando || !form.nome || !form.whatsapp}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-40">
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {modo === 'criar' ? 'Criar Reserva' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | StatusReserva>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  // Mapa / modal
  const [abaAtiva, setAbaAtiva] = useState<'lista' | 'mapa'>('lista')
  const [modalAberto, setModalAberto] = useState(false)
  const [modoModal, setModoModal] = useState<'criar' | 'editar'>('criar')
  const [reservaEditando, setReservaEditando] = useState<Reserva | null>(null)
  const [form, setForm] = useState<FormReserva>(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null)

  // ── carregar ──
  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/reservas')
      const data = await res.json()
      setReservas(data.reservas ?? [])
    } catch {
      toast.error('Erro ao carregar reservas')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Setores com reserva ativa (pendente ou confirmada)
  const setoresReservados = new Set(
    reservas
      .filter(r => r.status !== 'cancelada' && r.area_desejada)
      .map(r => {
        // tenta mapear area_desejada de volta para um id de setor
        const areaLower = (r.area_desejada ?? '').toLowerCase()
        const entry = Object.entries(SETORES_MAPA).find(([, v]) =>
          areaLower.includes(v.label.toLowerCase()) ||
          areaLower.includes(v.label.toLowerCase().replace('camarote ', 'c').replace('sofá ', 's'))
        )
        return entry ? entry[0] : null
      })
      .filter(Boolean) as string[]
  )


  // ── abrir modal novo ──
  const abrirCriar = (setorId?: string) => {
    const setor = setorId ? SETORES_MAPA[setorId] : null
    setForm({
      ...FORM_VAZIO,
      tipo: setor?.tipo ?? 'mesa',
      area_desejada: setor?.label ?? '',
    })
    setSetorSelecionado(setorId ?? null)
    setModoModal('criar')
    setReservaEditando(null)
    setModalAberto(true)
  }

  // ── abrir modal editar ──
  const abrirEditar = (r: Reserva) => {
    setForm({
      nome: r.nome,
      email: r.email ?? '',
      whatsapp: r.whatsapp,
      tipo: r.tipo,
      area_desejada: r.area_desejada ?? '',
      numero_pessoas: String(r.numero_pessoas),
      data_aniversario: r.data_aniversario?.slice(0, 10) ?? '',
      observacoes: r.observacoes ?? '',
      observacoes_admin: r.observacoes_admin ?? '',
      status: r.status,
    })
    setModoModal('editar')
    setReservaEditando(r)
    setModalAberto(true)
  }

  // ── clique no mapa ──
  const handleSetorClick = (id: string) => {
    setSetorSelecionado(id)
    // Se já tem reserva aqui, abre a reserva correspondente
    const reservaDoSetor = reservas.find(r =>
      r.status !== 'cancelada' && (r.area_desejada ?? '').toLowerCase()
        .includes(SETORES_MAPA[id]?.label.toLowerCase() ?? '')
    )
    if (reservaDoSetor) {
      abrirEditar(reservaDoSetor)
    } else {
      abrirCriar(id)
    }
  }

  // ── salvar (criar ou editar) ──
  const salvarReserva = async () => {
    if (!form.nome.trim() || !form.whatsapp.trim()) {
      toast.error('Nome e WhatsApp são obrigatórios')
      return
    }
    setSalvando(true)
    try {
      const payload = {
        tipo: form.tipo,
        nome: form.nome.trim(),
        email: form.email.trim() || null,
        whatsapp: form.whatsapp,
        numeroPessoas: Number(form.numero_pessoas) || 1,
        areaDesejada: form.area_desejada.trim() || null,
        dataAniversario: form.data_aniversario || null,
        observacoes: form.observacoes.trim() || null,
        observacoes_admin: form.observacoes_admin.trim() || null,
        status: form.status,
      }

      let res: Response
      if (modoModal === 'criar') {
        res = await fetch('/api/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        res = await fetch('/api/reservas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reservaEditando!.id, ...payload }) })
      }

      const data = await res.json()
      if (data.erro || data.error) throw new Error(data.erro ?? data.error)

      toast.success(modoModal === 'criar' ? 'Reserva criada!' : 'Reserva atualizada!')
      setModalAberto(false)
      setSetorSelecionado(null)
      carregar()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar reserva')
    } finally {
      setSalvando(false)
    }
  }


  // ── atualizar só status ──
  const atualizarStatus = async (id: string, status: StatusReserva) => {
    setAtualizando(id)
    try {
      const res = await fetch('/api/reservas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (data.erro) throw new Error(data.erro)
      setReservas(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      toast.success(status === 'confirmada' ? 'Reserva confirmada!' : status === 'cancelada' ? 'Reserva cancelada.' : 'Status atualizado.')
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setAtualizando(null)
    }
  }

  const filtradas = reservas.filter(r => filtro === 'todos' || r.status === filtro)

  const totais = {
    pendente:   reservas.filter(r => r.status === 'pendente').length,
    confirmada: reservas.filter(r => r.status === 'confirmada').length,
    cancelada:  reservas.filter(r => r.status === 'cancelada').length,
  }


  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      {/* MODAL */}
      {modalAberto && (
        <ModalForm
          modo={modoModal}
          form={form}
          onChange={p => setForm(prev => ({ ...prev, ...p }))}
          onSalvar={salvarReserva}
          onFechar={() => { setModalAberto(false); setSetorSelecionado(null) }}
          salvando={salvando}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl text-bege">Reservas</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            <span className="text-amber-400">{totais.pendente} pendente{totais.pendente !== 1 ? 's' : ''}</span>
            {' · '}
            <span className="text-green-400">{totais.confirmada} confirmada{totais.confirmada !== 1 ? 's' : ''}</span>
            {' · '}
            {reservas.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => abrirCriar()} className="btn-primary text-xs flex items-center gap-2 px-4">
            <Plus size={14} /> Nova Reserva
          </button>
        </div>
      </div>

      {/* ABAS LISTA / MAPA */}
      <div className="flex gap-1 border-b border-white/10">
        <button onClick={() => setAbaAtiva('lista')}
          className={`px-5 py-2.5 font-accent text-xs tracking-widest uppercase border-b-2 transition-all -mb-px flex items-center gap-2
            ${abaAtiva === 'lista' ? 'border-dourado text-dourado' : 'border-transparent text-bege-escuro/50 hover:text-bege-escuro/80'}`}>
          <Users size={13} /> Lista
        </button>
        <button onClick={() => setAbaAtiva('mapa')}
          className={`px-5 py-2.5 font-accent text-xs tracking-widest uppercase border-b-2 transition-all -mb-px flex items-center gap-2
            ${abaAtiva === 'mapa' ? 'border-dourado text-dourado' : 'border-transparent text-bege-escuro/50 hover:text-bege-escuro/80'}`}>
          <MapPin size={13} /> Mapa da Casa
        </button>
      </div>


      {/* ═══════════ ABA: MAPA ═══════════ */}
      {abaAtiva === 'mapa' && (
        <div className="space-y-3">
          {/* Instrução */}
          <div className="admin-card py-3 flex items-start gap-3">
            <MapPin size={16} className="text-dourado/60 flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-bege-escuro/70">
              <span className="text-bege">Clique num camarote ou sofá</span> para reservar ou editar.
              Setores em <span className="text-red-400">vermelho</span> já têm reserva ativa.
              Setores em <span className="text-dourado">dourado</span> estão disponíveis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* MAPA */}
            <div className="lg:col-span-2 admin-card p-3">
              {carregando ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 size={28} className="animate-spin text-dourado/40" />
                </div>
              ) : (
                <MapaCasa
                  setoresReservados={setoresReservados}
                  setorSelecionado={setorSelecionado}
                  onSetorClick={handleSetorClick}
                />
              )}
            </div>

            {/* PAINEL LATERAL — reservas de setores */}
            <div className="admin-card space-y-2 overflow-y-auto max-h-[620px]">
              <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-3">
                Reservas ativas
              </h3>
              {reservas.filter(r => r.status !== 'cancelada' && r.area_desejada).length === 0 ? (
                <p className="font-body text-xs text-bege-escuro/40 text-center py-8">
                  Nenhum setor reservado ainda.
                </p>
              ) : (
                reservas
                  .filter(r => r.status !== 'cancelada' && r.area_desejada)
                  .map(r => {
                    const sc = STATUS_CONFIG[r.status]
                    const tc = TIPO_CONFIG[r.tipo]
                    return (
                      <div key={r.id}
                        className="border border-white/8 rounded-sm p-3 hover:border-dourado/20 transition-colors cursor-pointer"
                        onClick={() => abrirEditar(r)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-accent text-[10px] tracking-wider ${tc.cor}`}>{tc.label}</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border text-[10px] ${sc.cor}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </div>
                        <p className="font-body text-sm text-bege">{r.nome}</p>
                        {r.area_desejada && (
                          <p className="font-body text-xs text-bege-escuro/50 mt-0.5">{r.area_desejada}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          {r.whatsapp && (
                            <span className="flex items-center gap-1 text-[10px] text-green-400/70">
                              <Phone size={9} />{r.whatsapp}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-bege-escuro/40">
                            <Users size={9} />{r.numero_pessoas} pessoas
                          </span>
                        </div>
                      </div>
                    )
                  })
              )}
              <button onClick={() => abrirCriar()}
                className="w-full mt-2 border border-dashed border-dourado/20 hover:border-dourado/40 text-bege-escuro/40 hover:text-dourado/60 py-3 rounded-sm text-xs font-accent tracking-wider uppercase transition-all flex items-center justify-center gap-2">
                <Plus size={12} /> Adicionar reserva
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ═══════════ ABA: LISTA ═══════════ */}
      {abaAtiva === 'lista' && (
        <div className="space-y-4">
          {/* FILTROS */}
          <div className="flex gap-2 flex-wrap">
            {(['todos', 'pendente', 'confirmada', 'cancelada'] as const).map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
                  ${filtro === f ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
                {f === 'todos'
                  ? `Todos (${reservas.length})`
                  : `${STATUS_CONFIG[f].label} (${totais[f]})`}
              </button>
            ))}
          </div>

          {/* CARDS */}
          {carregando ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-dourado/50" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="admin-card text-center py-16">
              <Clock size={32} className="text-bege-escuro/20 mx-auto mb-3" />
              <p className="font-body text-bege-escuro/40">
                {filtro === 'todos' ? 'Nenhuma reserva ainda.' : `Nenhuma reserva ${STATUS_CONFIG[filtro].label.toLowerCase()}.`}
              </p>
              <button onClick={() => abrirCriar()} className="btn-primary text-xs mt-4 inline-flex items-center gap-2 px-4">
                <Plus size={13} /> Criar primeira reserva
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtradas.map(reserva => {
                const sc = STATUS_CONFIG[reserva.status]
                const tc = TIPO_CONFIG[reserva.tipo]
                const aberto = expandido === reserva.id

                return (
                  <div key={reserva.id} className="admin-card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-accent tracking-wider ${tc.cor}`}>{tc.label}</span>
                          <span className="text-bege-escuro/20">·</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-xs ${sc.cor}`}>
                            {sc.icon} {sc.label}
                          </span>
                          {reserva.area_desejada && (
                            <>
                              <span className="text-bege-escuro/20">·</span>
                              <span className="font-body text-xs text-bege-escuro/50">{reserva.area_desejada}</span>
                            </>
                          )}
                        </div>
                        <p className="font-body text-bege text-base">{reserva.nome}</p>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {reserva.whatsapp && (
                            <span className="flex items-center gap-1 text-xs text-bege-escuro/50"><Phone size={10} /> {reserva.whatsapp}</span>
                          )}
                          {reserva.email && (
                            <span className="flex items-center gap-1 text-xs text-bege-escuro/50"><Mail size={10} /> {reserva.email}</span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-bege-escuro/50"><Users size={10} /> {reserva.numero_pessoas} pessoas</span>
                        </div>
                      </div>

                      {/* AÇÕES */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-body text-xs text-bege-escuro/30 hidden sm:block">
                          {format(new Date(reserva.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                        </span>
                        {/* WhatsApp */}
                        <a href={`https://wa.me/55${reserva.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Olá ${reserva.nome}! Sobre sua reserva no Maandhoo Club...`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-2 border border-green-500/30 hover:border-green-500 text-green-500/60 hover:text-green-400 rounded-sm transition-all" title="WhatsApp">
                          <MessageSquare size={14} />
                        </a>
                        {/* Editar */}
                        <button onClick={() => abrirEditar(reserva)}
                          className="p-2 border border-dourado/20 hover:border-dourado/50 text-dourado/50 hover:text-dourado rounded-sm transition-all" title="Editar">
                          <Edit3 size={14} />
                        </button>
                        {/* Confirmar */}
                        {reserva.status === 'pendente' && (
                          <button onClick={() => atualizarStatus(reserva.id, 'confirmada')} disabled={atualizando === reserva.id}
                            className="p-2 border border-green-500/30 hover:border-green-500 text-green-500/60 hover:text-green-400 rounded-sm transition-all disabled:opacity-40" title="Confirmar">
                            {atualizando === reserva.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          </button>
                        )}
                        {/* Cancelar */}
                        {reserva.status !== 'cancelada' && (
                          <button onClick={() => atualizarStatus(reserva.id, 'cancelada')} disabled={atualizando === reserva.id}
                            className="p-2 border border-red-500/20 hover:border-red-500/50 text-red-500/40 hover:text-red-400 rounded-sm transition-all disabled:opacity-40" title="Cancelar">
                            <XCircle size={14} />
                          </button>
                        )}
                        {/* Expandir */}
                        <button onClick={() => setExpandido(aberto ? null : reserva.id)}
                          className="p-2 border border-white/10 hover:border-white/20 text-bege-escuro/40 rounded-sm transition-all">
                          <ChevronDown size={14} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>


                    {/* DETALHES EXPANDIDOS */}
                    {aberto && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {reserva.area_desejada && (
                            <div>
                              <p className="font-accent text-[9px] tracking-widest text-bege-escuro/40 uppercase mb-1">Área desejada</p>
                              <p className="font-body text-bege-escuro/80">{reserva.area_desejada}</p>
                            </div>
                          )}
                          {reserva.data_aniversario && (
                            <div>
                              <p className="font-accent text-[9px] tracking-widest text-bege-escuro/40 uppercase mb-1">Data do aniversário</p>
                              <p className="font-body text-bege-escuro/80">
                                {format(new Date(reserva.data_aniversario), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                            </div>
                          )}
                          {reserva.observacoes && (
                            <div className="sm:col-span-2">
                              <p className="font-accent text-[9px] tracking-widest text-bege-escuro/40 uppercase mb-1">Observações do cliente</p>
                              <p className="font-body text-bege-escuro/70 text-xs leading-relaxed">{reserva.observacoes}</p>
                            </div>
                          )}
                          {reserva.observacoes_admin && (
                            <div className="sm:col-span-2">
                              <p className="font-accent text-[9px] tracking-widest text-dourado/50 uppercase mb-1">Notas internas</p>
                              <p className="font-body text-bege-escuro/60 text-xs leading-relaxed italic">{reserva.observacoes_admin}</p>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <p className="font-accent text-[9px] tracking-widest text-bege-escuro/40 uppercase mb-1">Recebido em</p>
                            <p className="font-body text-bege-escuro/50 text-xs">
                              {format(new Date(reserva.created_at), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
