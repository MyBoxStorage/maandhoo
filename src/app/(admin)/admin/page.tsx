'use client'

import React from 'react'
import Link from 'next/link'
import { Ticket, Users, BookMarked, TrendingUp, CalendarDays, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { EVENTOS_INICIAIS } from '@/lib/eventos-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const stats = [
  { label: 'Ingressos Vendidos', valor: '247', sub: 'Este mês', icon: <Ticket size={20} />, cor: 'text-dourado' },
  { label: 'Receita Total', valor: 'R$ 12.350', sub: 'Este mês', icon: <TrendingUp size={20} />, cor: 'text-green-400' },
  { label: 'Reservas Pendentes', valor: '8', sub: 'Aguardando confirmação', icon: <BookMarked size={20} />, cor: 'text-amber-400' },
  { label: 'Listas Amigas', valor: '183', sub: 'Inscrições ativas', icon: <Users size={20} />, cor: 'text-blue-400' },
]

const ultimasVendas = [
  { nome: 'João S.', ingresso: 'Pista Masc', evento: 'Fluxou 14/03', valor: 50, status: 'pago' },
  { nome: 'Maria L.', ingresso: 'Backstage Fem', evento: 'Me Leva 07/03', valor: 60, status: 'pago' },
  { nome: 'Carlos M.', ingresso: 'Pista Masc', evento: 'DJ Narru 21/03', valor: 50, status: 'pendente' },
  { nome: 'Ana P.', ingresso: 'Backstage Masc', evento: 'Fluxou 14/03', valor: 120, status: 'pago' },
  { nome: 'Pedro R.', ingresso: 'Pista Fem', evento: 'DJ Narru 21/03', valor: 20, status: 'pago' },
]

export default function AdminDashboard() {
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
        <Link href="/admin/eventos" className="btn-primary text-xs flex items-center gap-2">
          <CalendarDays size={14} /> Novo Evento
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
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
          <div className="space-y-3">
            {EVENTOS_INICIAIS.map(evento => {
              const loteAtivo = evento.lotes.find(l => l.ativo)
              const vendidos = evento.lotes.reduce((acc, l) => acc + l.vendidoMasculino + l.vendidoFeminino, 0)
              const total = evento.lotes.reduce((acc, l) => acc + l.qtdMasculino + l.qtdFeminino, 0)
              const pct = Math.round((vendidos / total) * 100)

              return (
                <div key={evento.id} className="flex items-start gap-3 p-3 rounded-sm bg-black/20 border border-white/5">
                  <div className="flex-1">
                    <p className="font-body text-sm text-bege">{evento.nome}</p>
                    <p className="font-body text-xs text-bege-escuro/50">
                      {format(evento.data, "dd/MM", { locale: ptBR })} · {loteAtivo?.nome || 'Esgotado'}
                    </p>
                    <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-dourado rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-bege-escuro/40 mt-0.5">{vendidos}/{total} ingressos · {pct}%</p>
                  </div>
                  <Link href={`/admin/eventos?editar=${evento.id}`}
                    className="text-xs text-dourado/70 hover:text-dourado border border-dourado/20 hover:border-dourado/50 px-2 py-1 rounded-sm transition-all">
                    Editar
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* ÚLTIMAS VENDAS */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Últimas Vendas</h3>
            <Link href="/admin/ingressos" className="text-xs text-bege-escuro/60 hover:text-bege flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {ultimasVendas.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-sm bg-black/20 border border-white/5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                  ${v.status === 'pago' ? 'bg-green-500/15' : 'bg-amber-500/15'}`}>
                  {v.status === 'pago'
                    ? <CheckCircle2 size={14} className="text-green-400" />
                    : <Clock size={14} className="text-amber-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-bege truncate">{v.nome} — {v.ingresso}</p>
                  <p className="font-body text-xs text-bege-escuro/50 truncate">{v.evento}</p>
                </div>
                <span className="font-display text-sm text-dourado flex-shrink-0">R$ {v.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="admin-card">
        <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/listas', label: 'Exportar Listas', icon: <Users size={14} /> },
            { href: '/admin/reservas', label: 'Ver Reservas', icon: <BookMarked size={14} /> },
            { href: '/admin/ingressos', label: 'Validar Ingresso', icon: <Ticket size={14} /> },
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
    </div>
  )
}
