'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Download, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, QrCode } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'
import type { IngressoDB, CadastroDB } from '@/types/ingressos'

type IngressoComCadastro = IngressoDB & { cadastro?: CadastroDB | null }
type StatusFiltro = 'todos' | 'ativo' | 'utilizado' | 'expirado' | 'cancelado' | 'pendente'

const STATUS_CONFIG: Record<string, { label: string; cor: string; icon: JSX.Element }> = {
  ativo:     { label: 'Ativo',     cor: 'text-green-400 bg-green-400/10 border-green-400/30',   icon: <CheckCircle2 size={12} /> },
  utilizado: { label: 'Utilizado', cor: 'text-blue-400 bg-blue-400/10 border-blue-400/30',     icon: <CheckCircle2 size={12} /> },
  expirado:  { label: 'Expirado',  cor: 'text-bege-escuro/50 bg-white/5 border-white/10',      icon: <Clock size={12} /> },
  cancelado: { label: 'Cancelado', cor: 'text-red-400 bg-red-400/10 border-red-400/30',        icon: <XCircle size={12} /> },
  pendente:  { label: 'Pendente',  cor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',  icon: <Clock size={12} /> },
}

const TIPO_LABEL: Record<string, string> = {
  lista_masc:  'Lista Masculino',
  lista_fem:   'Lista Feminino',
  pista_masc:  'Pista Masculino',
  pista_fem:   'Pista Feminino',
  camarote:    'Camarote',
  cortesia:    'Cortesia',
}

export default function AdminIngressosPage() {
  const [ingressos, setIngressos] = useState<IngressoComCadastro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos')
  const [filtroEvento, setFiltroEvento] = useState('todos')
  const [busca, setBusca] = useState('')
  const [eventos, setEventos] = useState<{ id: string; nome: string }[]>([])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [resIng, resEv] = await Promise.all([
        fetch('/api/admin/ingressos'),
        fetch('/api/admin/eventos'),
      ])
      const [dataIng, dataEv] = await Promise.all([resIng.json(), resEv.json()])
      if (dataIng.ingressos) setIngressos(dataIng.ingressos)
      if (dataEv.eventos) setEventos(dataEv.eventos.map((e: { id: string; nome: string }) => ({ id: e.id, nome: e.nome })))
    } catch { toast.error('Erro ao carregar dados') }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = ingressos.filter(i => {
    const statusOk = filtroStatus === 'todos' || i.status === filtroStatus
    const eventoOk = filtroEvento === 'todos' || i.evento_id === filtroEvento
    const termo = busca.toLowerCase()
    const buscaOk = !busca ||
      (i.cadastro?.nome_completo ?? '').toLowerCase().includes(termo) ||
      (i.cadastro?.email ?? '').toLowerCase().includes(termo) ||
      (i.serial ?? '').toLowerCase().includes(termo)
    return statusOk && eventoOk && buscaOk
  })

  const exportarCSV = () => {
    const linhas = ['Nome,Email,Tipo,Serial,Status,QR Enviado,Criado']
    filtrados.forEach(i => {
      const c = i.cadastro
      linhas.push([
        `"${c?.nome_completo ?? ''}"`,
        `"${c?.email ?? ''}"`,
        `"${TIPO_LABEL[i.tipo] ?? i.tipo}"`,
        `"${i.serial ?? ''}"`,
        `"${i.status}"`,
        `"${i.qr_enviado ? 'Sim' : 'Não'}"`,
        `"${i.created_at ? format(new Date(i.created_at), 'dd/MM/yyyy HH:mm') : ''}"`,
      ].join(','))
    })
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ingressos-maandhoo-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
    toast.success(`${filtrados.length} ingressos exportados!`)
  }

  const totalAtivos    = ingressos.filter(i => i.status === 'ativo').length
  const totalUtilizados = ingressos.filter(i => i.status === 'utilizado').length

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Ingressos</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            <span className="text-green-400">{totalAtivos} ativos</span>
            {' · '}
            <span className="text-blue-400">{totalUtilizados} utilizados</span>
            {' · '}
            {ingressos.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5" title="Recarregar">
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
            <input className="admin-input pl-8 text-sm" placeholder="Nome, email, serial..."
              value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <select className="admin-input w-auto text-sm" value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)}>
            <option value="todos">Todos os eventos</option>
            {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['todos', 'ativo', 'utilizado', 'pendente', 'expirado', 'cancelado'] as StatusFiltro[]).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
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
                {['Nome / Email', 'Tipo', 'Serial', 'Status', 'QR', 'Criado'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-accent text-xs tracking-wider text-bege-escuro/50 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtrados.map(ingresso => {
                const sc = STATUS_CONFIG[ingresso.status] ?? STATUS_CONFIG['pendente']
                const c = ingresso.cadastro
                return (
                  <tr key={ingresso.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-body text-bege text-sm">{c?.nome_completo ?? <span className="text-bege-escuro/30 italic">Sem cadastro</span>}</p>
                      <p className="font-body text-xs text-bege-escuro/40">{c?.email ?? '—'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-body text-xs text-bege-escuro/80 whitespace-nowrap">{TIPO_LABEL[ingresso.tipo] ?? ingresso.tipo}</p>
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
                    <span title={ingresso.qr_enviado ? 'QR enviado' : 'QR não enviado'}>
                      <QrCode size={14} className={ingresso.qr_enviado ? 'text-green-400' : 'text-bege-escuro/25'} />
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
          {filtrados.length === 0 && !carregando && (
            <p className="text-center text-bege-escuro/30 py-12 font-body text-sm">Nenhum ingresso encontrado.</p>
          )}
        </div>
      )}
    </div>
  )
}
