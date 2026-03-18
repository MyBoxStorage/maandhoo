'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Download, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'
import type { IngressoDB, CadastroDB } from '@/types/ingressos'
import { labelTipoIngresso } from '@/lib/ingresso-utils'

type IngressoComCadastro = IngressoDB & { cadastro?: CadastroDB | null }
type StatusFiltro = 'todos' | 'ativo' | 'utilizado' | 'expirado' | 'cancelado' | 'pendente'

interface Paginacao { page: number; pageSize: number; total: number; totalPages: number }

const STATUS_CONFIG: Record<string, { label: string; cor: string; icon: JSX.Element }> = {
  ativo:               { label: 'Ativo',              cor: 'text-green-400 bg-green-400/10 border-green-400/30',  icon: <CheckCircle2 size={12} /> },
  utilizado:           { label: 'Utilizado',           cor: 'text-blue-400 bg-blue-400/10 border-blue-400/30',    icon: <CheckCircle2 size={12} /> },
  expirado:            { label: 'Expirado',            cor: 'text-bege-escuro/50 bg-white/5 border-white/10',     icon: <Clock size={12} /> },
  cancelado:           { label: 'Cancelado',           cor: 'text-red-400 bg-red-400/10 border-red-400/30',       icon: <XCircle size={12} /> },
  pendente:            { label: 'Pendente',            cor: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: <Clock size={12} /> },
  aguardando_cadastro: { label: 'Aguard. Cadastro',   cor: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: <Clock size={12} /> },
  pendente_pagamento:  { label: 'Aguard. Pagamento',  cor: 'text-amber-300 bg-amber-300/10 border-amber-300/30', icon: <Clock size={12} /> },
}

export default function AdminIngressosPage() {
  const [ingressos, setIngressos]       = useState<IngressoComCadastro[]>([])
  const [paginacao, setPaginacao]       = useState<Paginacao>({ page: 1, pageSize: 50, total: 0, totalPages: 1 })
  const [carregando, setCarregando]     = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos')
  const [filtroEvento, setFiltroEvento] = useState('todos')
  const [busca, setBusca]               = useState('')
  const [buscaInput, setBuscaInput]     = useState('')
  const [page, setPage]                 = useState(1)
  const [eventos, setEventos]           = useState<{ id: string; nome: string }[]>([])

  const carregar = useCallback(async (pg = page) => {
    setCarregando(true)
    try {
      const params = new URLSearchParams({ page: String(pg) })
      if (filtroEvento !== 'todos') params.set('evento_id', filtroEvento)
      if (filtroStatus !== 'todos') params.set('status', filtroStatus)
      if (busca) params.set('busca', busca)

      const [resIng, resEv] = await Promise.all([
        fetch(`/api/admin/ingressos?${params}`),
        eventos.length ? Promise.resolve(null) : fetch('/api/admin/eventos'),
      ])
      const dataIng = await resIng.json()
      if (dataIng.ingressos) {
        setIngressos(dataIng.ingressos)
        setPaginacao(dataIng.paginacao)
      }
      if (resEv) {
        const dataEv = await resEv.json()
        if (dataEv.eventos) setEventos(dataEv.eventos.map((e: { id: string; nome: string }) => ({ id: e.id, nome: e.nome })))
      }
    } catch { toast.error('Erro ao carregar dados') }
    finally { setCarregando(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtroStatus, filtroEvento, busca])

  useEffect(() => { carregar() }, [carregar])

  const mudarFiltro = (fn: () => void) => { fn(); setPage(1) }

  const exportarCSV = () => {
    const linhas = ['Nome,Email,Tipo,Serial,Status,Cadastro,Criado']
    ingressos.forEach(i => {
      const c = i.cadastro
      linhas.push([
        `"${c?.nome_completo ?? ''}"`,
        `"${c?.email ?? ''}"`,
        `"${labelTipoIngresso(i.tipo)}"`,
        `"${i.serial ?? ''}"`,
        `"${i.status}"`,
        `"${c ? 'Sim' : 'Não'}"`,
        `"${i.created_at ? format(new Date(i.created_at), 'dd/MM/yyyy HH:mm') : ''}"`,
      ].join(','))
    })
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `ingressos-maandhoo-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
    toast.success(`${ingressos.length} ingressos exportados!`)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Ingressos</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {paginacao.total} no total · página {paginacao.page}/{paginacao.totalPages}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => carregar(page)} className="btn-outline p-2.5" title="Recarregar">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={exportarCSV} className="btn-outline flex items-center gap-2 text-xs">
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40 pointer-events-none" />
            <input className="admin-input pl-8 text-sm" placeholder="Nome ou serial..."
              value={buscaInput}
              onChange={e => setBuscaInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') mudarFiltro(() => setBusca(buscaInput)) }}
            />
          </div>
          <select className="admin-input w-auto text-sm" value={filtroEvento}
            onChange={e => mudarFiltro(() => setFiltroEvento(e.target.value))}>
            <option value="todos">Todos os eventos</option>
            {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['todos', 'ativo', 'utilizado', 'aguardando_cadastro', 'pendente', 'expirado', 'cancelado'] as (StatusFiltro | 'aguardando_cadastro')[]).map(s => (
            <button key={s} onClick={() => mudarFiltro(() => setFiltroStatus(s as StatusFiltro))}
              className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
                ${filtroStatus === s ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
              {s === 'todos' ? 'Todos' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/8">
                {['Nome / Email', 'Tipo', 'Serial', 'Status', 'Cadastro', 'Criado'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-accent text-xs tracking-wider text-bege-escuro/50 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ingressos.map(ingresso => {
                const sc = STATUS_CONFIG[ingresso.status] ?? STATUS_CONFIG['pendente']
                const c = ingresso.cadastro
                const temCadastro = !!c?.nome_completo
                return (
                  <tr key={ingresso.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-body text-bege text-sm">
                        {c?.nome_completo ?? <span className="text-bege-escuro/30 italic">Sem cadastro</span>}
                      </p>
                      <p className="font-body text-xs text-bege-escuro/40">{c?.email ?? '—'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-body text-xs text-bege-escuro/80 whitespace-nowrap">{labelTipoIngresso(ingresso.tipo)}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono text-xs text-bege-escuro/50 whitespace-nowrap">{ingresso.serial ?? '—'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm border text-xs whitespace-nowrap ${sc.cor}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {/* Indica se o portador já preencheu o cadastro (nome, cpf, email) */}
                      <span title={temCadastro ? 'Cadastro realizado' : 'Aguardando cadastro do portador'}>
                        <User
                          size={14}
                          className={temCadastro ? 'text-green-400' : 'text-bege-escuro/25'}
                        />
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-bege-escuro/40 whitespace-nowrap">
                      {ingresso.created_at ? format(new Date(ingresso.created_at), "dd/MM HH:mm", { locale: ptBR }) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {ingressos.length === 0 && (
            <p className="text-center text-bege-escuro/30 py-12 font-body text-sm">Nenhum ingresso encontrado.</p>
          )}
        </div>
      )}

      {/* PAGINAÇÃO */}
      {paginacao.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-bege-escuro/40">
            Mostrando {((paginacao.page - 1) * paginacao.pageSize) + 1}–{Math.min(paginacao.page * paginacao.pageSize, paginacao.total)} de {paginacao.total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => { const p = page - 1; setPage(p); carregar(p) }}
              disabled={page <= 1 || carregando}
              className="btn-outline p-2 disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, paginacao.totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(paginacao.totalPages - 4, page - 2)) + i
              return (
                <button key={p} onClick={() => { setPage(p); carregar(p) }}
                  className={`px-3 py-1.5 rounded-sm border text-xs transition-all
                    ${p === page ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/50 hover:border-dourado/30'}`}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => { const p = page + 1; setPage(p); carregar(p) }}
              disabled={page >= paginacao.totalPages || carregando}
              className="btn-outline p-2 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
