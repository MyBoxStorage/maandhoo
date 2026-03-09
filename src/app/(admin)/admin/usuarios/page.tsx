'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Loader2, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'

type Lead = {
  id: string
  nome: string
  email: string | null
  whatsapp: string | null
  origem: string
  evento_nome: string | null
  status: string
  consentimento_lgpd: boolean
  created_at: string
}

const ORIGEM_LABEL: Record<string, string> = {
  popup_lista:          'Lista (popup)',
  reserva_mesa:         'Reserva Mesa',
  reserva_camarote:     'Reserva Camarote',
  reserva_aniversario:  'Aniversário',
  compra_ingresso:      'Compra Ingresso',
  contato:              'Contato',
}

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  novo:        { label: 'Novo',       cor: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  contatado:   { label: 'Contatado',  cor: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
  convertido:  { label: 'Convertido', cor: 'text-green-400 border-green-400/30 bg-green-400/10' },
  descartado:  { label: 'Descartado', cor: 'text-bege-escuro/40 border-white/10 bg-white/5' },
}

export default function AdminUsuariosPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [atualizando, setAtualizando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch {
      toast.error('Erro ao carregar leads')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const atualizarStatus = async (id: string, status: string) => {
    setAtualizando(id)
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
      toast.success('Status atualizado!')
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setAtualizando(null)
    }
  }

  const exportarCSV = () => {
    const filtrados = filtroStatus === 'todos' ? leads : leads.filter(l => l.status === filtroStatus)
    const linhas = ['Nome,Email,WhatsApp,Origem,Status,Data']
    filtrados.forEach(l => {
      linhas.push([
        `"${l.nome}"`,
        `"${l.email ?? ''}"`,
        `"${l.whatsapp ?? ''}"`,
        `"${ORIGEM_LABEL[l.origem] ?? l.origem}"`,
        `"${STATUS_CONFIG[l.status]?.label ?? l.status}"`,
        `"${format(new Date(l.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}"`,
      ].join(','))
    })
    const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-maandhoo-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filtrados.length} leads exportados!`)
  }

  const filtrados = filtroStatus === 'todos' ? leads : leads.filter(l => l.status === filtroStatus)

  const totais = {
    novo:       leads.filter(l => l.status === 'novo').length,
    contatado:  leads.filter(l => l.status === 'contatado').length,
    convertido: leads.filter(l => l.status === 'convertido').length,
    descartado: leads.filter(l => l.status === 'descartado').length,
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Usuários / Leads</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            <span className="text-blue-400">{totais.novo} novos</span>
            {' · '}
            <span className="text-green-400">{totais.convertido} convertidos</span>
            {' · '}
            {leads.length} total
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

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(totais).map(([s, v]) => (
          <div key={s} className="admin-card text-center">
            <div className={`font-display text-3xl ${STATUS_CONFIG[s]?.cor.split(' ')[0] ?? 'text-bege'}`}>{v}</div>
            <div className="font-body text-xs text-bege-escuro/60 mt-1">{STATUS_CONFIG[s]?.label ?? s}</div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {['todos', 'novo', 'contatado', 'convertido', 'descartado'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all
              ${filtroStatus === s ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro/60 hover:border-dourado/30'}`}>
            {s === 'todos' ? `Todos (${leads.length})` : `${STATUS_CONFIG[s]?.label} (${totais[s as keyof typeof totais] ?? 0})`}
          </button>
        ))}
      </div>

      {/* TABELA */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="font-body text-bege-escuro/40">Nenhum lead encontrado.</p>
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/8">
                {['Nome', 'Contato', 'Origem', 'Status', 'Data'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-accent text-xs tracking-wider text-bege-escuro/50 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtrados.map(lead => {
                const sc = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG['novo']
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-body text-bege text-sm">{lead.nome}</p>
                    </td>
                    <td className="py-3 px-3">
                      {lead.email && <p className="font-body text-xs text-bege-escuro/60">{lead.email}</p>}
                      {lead.whatsapp && (
                        <a
                          href={`https://wa.me/55${lead.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Olá ${lead.nome}!`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="font-body text-xs text-green-400/70 hover:text-green-400 transition-colors"
                        >
                          {lead.whatsapp}
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-body text-xs text-bege-escuro/70">{ORIGEM_LABEL[lead.origem] ?? lead.origem}</p>
                      {lead.evento_nome && (
                        <p className="font-body text-[10px] text-bege-escuro/35">{lead.evento_nome}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={lead.status}
                        onChange={e => atualizarStatus(lead.id, e.target.value)}
                        disabled={atualizando === lead.id}
                        className={`text-xs border rounded-sm px-2 py-1 bg-transparent outline-none cursor-pointer transition-all ${sc.cor}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                          <option key={s} value={s} className="bg-[#0f0c07] text-bege">{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-xs text-bege-escuro/40 whitespace-nowrap">
                      {format(new Date(lead.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
