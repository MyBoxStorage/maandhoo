'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Ticket, Users, BookMarked, TrendingUp, CalendarDays,
  ArrowRight, CheckCircle2, Clock, UserPlus, Loader2, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { labelTipoIngresso } from '@/lib/ingresso-utils'

type StatData = {
  ingressosAtivos: number
  ingressosUtilizados: number
  reservasPendentes: number
  leadsNovos: number
  totalIngressos: number
}

type EventoResumo = {
  id: string
  nome: string
  data_evento: string
  hora_abertura: string
  capacidade_total: number
  ativo: boolean
  lotes: { ativo: boolean; nome: string | null; preco_masc: number; preco_fem: number; vendidos_masc: number; vendidos_fem: number }[]
}

type IngressoRecente = {
  id: string
  tipo: string
  status: string
  preco_pago: number
  created_at: string
  cadastro: { nome_completo: string; email: string } | null
  evento: { nome: string } | null
}


export default function AdminDashboard() {
  const [stats, setStats] = useState<StatData | null>(null)
  const [eventos, setEventos] = useState<EventoResumo[]>([])
  const [recentes, setRecentes] = useState<IngressoRecente[]>([])
  const [receita, setReceita] = useState(0)
  const [carregando, setCarregando] = useState(true)

  const carregar = async () => {
    setCarregando(true)
    try {
      // stats usa rota dedicada (sem paginação) para receita/contagens corretas
      // ingressos usa a rota paginada só para mostrar os recentes (6 itens)
      const [resStats, resRecentes, resEv, resRes, resLeads] = await Promise.all([
        fetch('/api/admin/ingressos/stats'),
        fetch('/api/admin/ingressos?page=1'),
        fetch('/api/admin/eventos'),
        fetch('/api/reservas'),
        fetch('/api/leads'),
      ])

      const [dataStats, dataRecentes, dataEv, dataRes, dataLeads] = await Promise.all([
        resStats.json(), resRecentes.json(), resEv.json(), resRes.json(), resLeads.json(),
      ])

      // Recentes: só para exibição no card (máx 6)
      const recentes: IngressoRecente[] = (dataRecentes.ingressos ?? [])
        .filter((i: IngressoRecente) => i.status === 'ativo' || i.status === 'utilizado')
        .slice(0, 6)
      setRecentes(recentes)

      // Receita e contagens: dados agregados sem paginação
      setReceita(dataStats.receita ?? 0)

      const reservas = dataRes.reservas ?? []
      const leads = dataLeads.leads ?? []

      setStats({
        ingressosAtivos:     dataStats.ativos ?? 0,
        ingressosUtilizados: dataStats.utilizados ?? 0,
        totalIngressos:      dataStats.total ?? 0,
        reservasPendentes:   reservas.filter((r: { status: string }) => r.status === 'pendente').length,
        leadsNovos:          leads.filter((l: { status: string }) => l.status === 'novo').length,
      })

      setEventos(dataEv.eventos ?? [])
    } catch (err) {
      console.error('[dashboard]', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const statCards = stats
    ? [
        { label: 'Ingressos Ativos', valor: String(stats.ingressosAtivos), sub: `${stats.ingressosUtilizados} utilizados · ${stats.totalIngressos} total`, icon: <Ticket size={20} />, cor: 'text-dourado' },
        { label: 'Receita Total', valor: `R$ ${receita.toLocaleString('pt-BR')}`, sub: 'Ingressos pagos', icon: <TrendingUp size={20} />, cor: 'text-green-400' },
        { label: 'Reservas Pendentes', valor: String(stats.reservasPendentes), sub: 'Aguardando confirmação', icon: <BookMarked size={20} />, cor: 'text-amber-400' },
        { label: 'Leads Novos', valor: String(stats.leadsNovos), sub: 'Sem contato ainda', icon: <UserPlus size={20} />, cor: 'text-blue-400' },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Dashboard</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <Link href="/admin/eventos" className="btn-primary text-xs flex items-center gap-2">
            <CalendarDays size={14} /> Novo Evento
          </Link>
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(s => (
              <div key={s.label} className="admin-card">
                <div className={`${s.cor} mb-3`}>{s.icon}</div>
                <div className="font-display text-3xl text-bege mb-1">{s.valor}</div>
                <div className="font-body text-xs text-bege font-medium">{s.label}</div>
                <div className="font-body text-xs text-bege-escuro/50 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PRÓXIMOS EVENTOS */}
            <div className="admin-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Próximos Eventos</h3>
                <Link href="/admin/eventos" className="text-xs text-bege-escuro/60 hover:text-bege flex items-center gap-1 transition-colors">
                  Ver todos <ArrowRight size={12} />
                </Link>
              </div>
              {eventos.length === 0 ? (
                <p className="text-sm text-bege-escuro/40 text-center py-6">Nenhum evento cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {eventos.slice(0, 4).map(evento => {
                    const loteAtivo = evento.lotes?.find(l => l.ativo)
                    const vendidos = (evento.lotes ?? []).reduce((a, l) => a + l.vendidos_masc + l.vendidos_fem, 0)
                    const cap = evento.capacidade_total || 500
                    const pct = Math.min(100, Math.round((vendidos / cap) * 100))

                    return (
                      <div key={evento.id} className="flex items-start gap-3 p-3 rounded-sm bg-black/20 border border-white/5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${evento.ativo ? 'bg-green-400' : 'bg-bege-escuro/30'}`} />
                            <p className="font-body text-sm text-bege">{evento.nome}</p>
                          </div>
                          <p className="font-body text-xs text-bege-escuro/50">
                            {format(new Date(`${evento.data_evento}T00:00:00`), "dd/MM", { locale: ptBR })} · {loteAtivo?.nome ?? '—'}
                          </p>
                          <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-dourado rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-bege-escuro/40 mt-0.5">{vendidos}/{cap} ingressos · {pct}%</p>
                        </div>
                        <Link href="/admin/eventos"
                          className="text-xs text-dourado/70 hover:text-dourado border border-dourado/20 hover:border-dourado/50 px-2 py-1 rounded-sm transition-all whitespace-nowrap">
                          Editar
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* INGRESSOS RECENTES */}
            <div className="admin-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Ingressos Recentes</h3>
                <Link href="/admin/ingressos" className="text-xs text-bege-escuro/60 hover:text-bege flex items-center gap-1 transition-colors">
                  Ver todos <ArrowRight size={12} />
                </Link>
              </div>
              {recentes.length === 0 ? (
                <p className="text-sm text-bege-escuro/40 text-center py-6">Nenhum ingresso ativo ainda.</p>
              ) : (
                <div className="space-y-2">
                  {recentes.map(i => (
                    <div key={i.id} className="flex items-center gap-3 p-3 rounded-sm bg-black/20 border border-white/5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                        ${i.status === 'utilizado' ? 'bg-blue-500/15' : 'bg-green-500/15'}`}>
                        {i.status === 'utilizado'
                          ? <CheckCircle2 size={14} className="text-blue-400" />
                          : <Clock size={14} className="text-green-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs text-bege truncate">
                          {i.cadastro?.nome_completo ?? <span className="text-bege-escuro/40 italic">Sem cadastro</span>} — {labelTipoIngresso(i.tipo)}
                        </p>
                        <p className="font-body text-xs text-bege-escuro/50 truncate">{i.evento?.nome ?? '—'}</p>
                      </div>
                      <span className="font-display text-sm text-dourado flex-shrink-0">
                        {i.preco_pago > 0 ? `R$ ${i.preco_pago}` : 'Grátis'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div className="admin-card">
            <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-4">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/admin/listas', label: 'Ver Listas', icon: <Users size={14} /> },
                { href: '/admin/reservas', label: 'Reservas', icon: <BookMarked size={14} /> },
                { href: '/admin/camarotes', label: 'Camarotes', icon: <Ticket size={14} /> },
                { href: '/admin/porteiros', label: 'Porteiros', icon: <Users size={14} /> },
                { href: '/portaria', label: 'Abrir Portaria', icon: <CheckCircle2 size={14} /> },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-2 border border-white/10 hover:border-dourado/40 px-4 py-2.5 rounded-sm text-xs text-bege-escuro hover:text-bege transition-all duration-200">
                  <span className="text-dourado/70">{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
