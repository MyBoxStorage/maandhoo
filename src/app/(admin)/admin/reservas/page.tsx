'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Loader2, CheckCircle2, XCircle, Clock,
  Phone, Mail, Users, MessageSquare, ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'

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

type FiltroStatus = 'todos' | StatusReserva

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState<string | null>(null)

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

  const atualizarStatus = async (id: string, status: StatusReserva) => {
    setAtualizando(id)
    try {
      const res = await fetch('/api/reservas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      setReservas(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      toast.success(`Reserva ${status === 'confirmada' ? 'confirmada' : 'cancelada'}!`)
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setAtualizando(null)
    }
  }

  const abrirWhatsApp = (numero: string, nome: string) => {
    const num = numero.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${nome}! Recebemos sua solicitação de reserva no Maandhoo Club. Vamos confirmar os detalhes?`)
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  const filtradas = reservas.filter(r => filtro === 'todos' || r.status === filtro)

  const totais = {
    pendente:   reservas.filter(r => r.status === 'pendente').length,
    confirmada: reservas.filter(r => r.status === 'confirmada').length,
    cancelada:  reservas.filter(r => r.status === 'cancelada').length,
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
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
        <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
          <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {(['todos', 'pendente', 'confirmada', 'cancelada'] as FiltroStatus[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
              ${filtro === f ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
            {f === 'todos' ? `Todos (${reservas.length})` : `${STATUS_CONFIG[f as StatusReserva].label} (${totais[f as StatusReserva]})`}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="admin-card text-center py-16">
          <Clock size={32} className="text-bege-escuro/20 mx-auto mb-3" />
          <p className="font-body text-bege-escuro/40">
            {filtro === 'todos' ? 'Nenhuma reserva ainda.' : `Nenhuma reserva ${STATUS_CONFIG[filtro as StatusReserva].label.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(reserva => {
            const sc = STATUS_CONFIG[reserva.status]
            const tc = TIPO_CONFIG[reserva.tipo]
            const aberto = expandido === reserva.id

            return (
              <div key={reserva.id} className="admin-card">
                {/* LINHA PRINCIPAL */}
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-accent tracking-wider ${tc.cor}`}>{tc.label}</span>
                      <span className="text-bege-escuro/20">·</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-xs ${sc.cor}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <p className="font-body text-bege text-base font-medium">{reserva.nome}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {reserva.whatsapp && (
                        <span className="flex items-center gap-1 text-xs text-bege-escuro/50">
                          <Phone size={10} /> {reserva.whatsapp}
                        </span>
                      )}
                      {reserva.email && (
                        <span className="flex items-center gap-1 text-xs text-bege-escuro/50">
                          <Mail size={10} /> {reserva.email}
                        </span>
                      )}
                      {reserva.numero_pessoas && (
                        <span className="flex items-center gap-1 text-xs text-bege-escuro/50">
                          <Users size={10} /> {reserva.numero_pessoas} pessoas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-body text-xs text-bege-escuro/30 hidden sm:block">
                      {format(new Date(reserva.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </span>

                    {/* WhatsApp */}
                    <button
                      onClick={() => abrirWhatsApp(reserva.whatsapp, reserva.nome)}
                      className="p-2 border border-green-500/30 hover:border-green-500 text-green-500/60 hover:text-green-400 rounded-sm transition-all"
                      title="Responder no WhatsApp"
                    >
                      <MessageSquare size={14} />
                    </button>

                    {/* Confirmar */}
                    {reserva.status === 'pendente' && (
                      <button
                        onClick={() => atualizarStatus(reserva.id, 'confirmada')}
                        disabled={atualizando === reserva.id}
                        className="p-2 border border-green-500/30 hover:border-green-500 text-green-500/60 hover:text-green-400 rounded-sm transition-all disabled:opacity-40"
                        title="Confirmar reserva"
                      >
                        {atualizando === reserva.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      </button>
                    )}

                    {/* Cancelar */}
                    {reserva.status !== 'cancelada' && (
                      <button
                        onClick={() => atualizarStatus(reserva.id, 'cancelada')}
                        disabled={atualizando === reserva.id}
                        className="p-2 border border-red-500/20 hover:border-red-500/50 text-red-500/40 hover:text-red-400 rounded-sm transition-all disabled:opacity-40"
                        title="Cancelar reserva"
                      >
                        <XCircle size={14} />
                      </button>
                    )}

                    {/* Expandir */}
                    <button
                      onClick={() => setExpandido(aberto ? null : reserva.id)}
                      className="p-2 border border-white/10 hover:border-white/20 text-bege-escuro/40 rounded-sm transition-all"
                    >
                      <ChevronDown size={14} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* DETALHES EXPANDIDOS */}
                {aberto && (
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
                    <div className="sm:col-span-2">
                      <p className="font-accent text-[9px] tracking-widest text-bege-escuro/40 uppercase mb-1">Recebido em</p>
                      <p className="font-body text-bege-escuro/50 text-xs">
                        {format(new Date(reserva.created_at), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
