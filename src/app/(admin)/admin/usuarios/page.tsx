'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, Download, RefreshCw, Phone, Mail,
  CheckCircle, XCircle, Clock, MessageCircle,
  Loader2, UserCircle2, Search, DatabaseZap
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type OrigemLead =
  | 'popup_lista' | 'reserva_mesa' | 'reserva_camarote'
  | 'reserva_aniversario' | 'compra_ingresso' | 'contato'

type StatusLead = 'novo' | 'contatado' | 'convertido' | 'descartado'

type Lead = {
  id: string
  nome: string
  email: string | null
  whatsapp: string | null
  origem: OrigemLead
  evento_nome: string | null
  observacoes: string | null
  status: StatusLead
  consentimento_lgpd: boolean
  created_at: string
}

type Cliente = {
  id: string
  nome: string
  email: string
  whatsapp: string | null
  quiz_perfil_nome: string | null
  quiz_feito: boolean
  lgpd_aceito: boolean
  created_at: string
  ultimo_acesso: string | null
}

// ─── CONFIGS ──────────────────────────────────────────────────────────────────
const ORIGENS: Record<OrigemLead, string> = {
  popup_lista:         'Lista Amiga',
  reserva_mesa:        'Reserva Mesa',
  reserva_camarote:    'Reserva Camarote',
  reserva_aniversario: 'Aniversário VIP',
  compra_ingresso:     'Compra Ingresso',
  contato:             'Contato',
}

const STATUS_CONFIG: Record<StatusLead, { label: string; cor: string; icon: React.ReactNode }> = {
  novo:       { label: 'Novo',       cor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',    icon: <Clock size={11} /> },
  contatado:  { label: 'Contatado',  cor: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <MessageCircle size={11} /> },
  convertido: { label: 'Convertido', cor: 'text-green-400 bg-green-400/10 border-green-400/20', icon: <CheckCircle size={11} /> },
  descartado: { label: 'Descartado', cor: 'text-red-400/70 bg-red-400/10 border-red-400/20',    icon: <XCircle size={11} /> },
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function UsuariosLeadsPage() {
  const [aba, setAba] = useState<'leads' | 'clientes'>('leads')

  // ── LEADS ──
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregandoLeads, setCarregandoLeads] = useState(true)
  const [filtroOrigem, setFiltroOrigem] = useState<OrigemLead | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<StatusLead | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [atualizando, setAtualizando] = useState<string | null>(null)

  // ── CLIENTES ──
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregandoClientes, setCarregandoClientes] = useState(false)
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clientesCarregados, setClientesCarregados] = useState(false)

  // ─── CARREGAR LEADS ───────────────────────────────────────────────────────
  const carregarLeads = useCallback(async () => {
    setCarregandoLeads(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch {
      toast.error('Erro ao carregar leads')
    } finally {
      setCarregandoLeads(false)
    }
  }, [])

  useEffect(() => { carregarLeads() }, [carregarLeads])

  // ─── CARREGAR CLIENTES (só quando aba é ativada) ──────────────────────────
  const carregarClientes = useCallback(async () => {
    if (clientesCarregados) return
    setCarregandoClientes(true)
    try {
      const res = await fetch('/api/admin/usuarios')
      const data = await res.json()
      if (data.erro) throw new Error(data.erro)
      setClientes(data.clientes ?? [])
      setClientesCarregados(true)
    } catch {
      toast.error('Erro ao carregar clientes registrados')
    } finally {
      setCarregandoClientes(false)
    }
  }, [clientesCarregados])

  useEffect(() => {
    if (aba === 'clientes') carregarClientes()
  }, [aba, carregarClientes])

  const [sincronizando, setSincronizando] = useState(false)

  // ─── SINCRONIZAÇÃO RETROATIVA ─────────────────────────────────────────────
  const sincronizarLeads = async () => {
    setSincronizando(true)
    try {
      const res = await fetch('/api/admin/sync-leads', { method: 'POST' })
      const data = await res.json()
      if (data.sucesso) {
        toast.success(`${data.total_importados} leads importados! (Lista: ${data.detalhes.lista_amiga}, Clientes: ${data.detalhes.clientes}, Reservas: ${data.detalhes.reservas})`)
        carregarLeads()
      } else {
        toast.error('Erro na sincronização')
      }
    } catch {
      toast.error('Erro ao sincronizar leads')
    } finally {
      setSincronizando(false)
    }
  }


  const atualizarStatus = async (leadId: string, novoStatus: StatusLead) => {
    setAtualizando(leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: novoStatus } : l))
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: novoStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success('Status atualizado!')
    } catch {
      toast.error('Erro ao atualizar status')
      carregarLeads()
    } finally {
      setAtualizando(null)
    }
  }


  // ─── FILTROS LEADS ────────────────────────────────────────────────────────
  const leadsFiltrados = leads.filter(l => {
    if (filtroOrigem !== 'todos' && l.origem !== filtroOrigem) return false
    if (filtroStatus !== 'todos' && l.status !== filtroStatus) return false
    if (busca) {
      const t = busca.toLowerCase()
      return (
        l.nome.toLowerCase().includes(t) ||
        l.email?.toLowerCase().includes(t) ||
        l.whatsapp?.includes(t)
      )
    }
    return true
  })

  const clientesFiltrados = clientes.filter(c => {
    if (!buscaCliente) return true
    const t = buscaCliente.toLowerCase()
    return c.nome.toLowerCase().includes(t) || c.email.toLowerCase().includes(t)
  })

  // ─── EXPORTAR CSV ─────────────────────────────────────────────────────────
  const exportarCSV = () => {
    const linhas = ['Nome,Email,WhatsApp,Origem,Evento,Status,Data']
    leadsFiltrados.forEach(l => {
      linhas.push([
        `"${l.nome}"`,
        `"${l.email ?? ''}"`,
        `"${l.whatsapp ?? ''}"`,
        `"${ORIGENS[l.origem] ?? l.origem}"`,
        `"${l.evento_nome ?? ''}"`,
        `"${STATUS_CONFIG[l.status]?.label ?? l.status}"`,
        `"${format(new Date(l.created_at), 'dd/MM/yyyy HH:mm')}"`,
      ].join(','))
    })
    const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-maandhoo-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${leadsFiltrados.length} leads exportados!`)
  }

  const contadores = {
    total:       leads.length,
    novos:       leads.filter(l => l.status === 'novo').length,
    contatados:  leads.filter(l => l.status === 'contatado').length,
    convertidos: leads.filter(l => l.status === 'convertido').length,
  }


  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl text-bege">Usuários & Leads</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            CRM · Leads capturados · Clientes registrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={sincronizarLeads}
            disabled={sincronizando}
            className="btn-outline text-xs flex items-center gap-2 px-4"
            title="Importar retroativamente leads de lista amiga, reservas e clientes cadastrados"
          >
            {sincronizando ? <Loader2 size={14} className="animate-spin" /> : <DatabaseZap size={14} />}
            {sincronizando ? 'Sincronizando...' : 'Sincronizar dados'}
          </button>
          <button
            onClick={aba === 'leads' ? carregarLeads : () => { setClientesCarregados(false); carregarClientes() }}
            className="btn-outline p-2.5"
          >
            <RefreshCw size={14} className={(aba === 'leads' ? carregandoLeads : carregandoClientes) ? 'animate-spin' : ''} />
          </button>
          {aba === 'leads' && (
            <button onClick={exportarCSV} className="btn-primary text-xs flex items-center gap-2 px-5">
              <Download size={14} /> Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* ABAS */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        <button
          onClick={() => setAba('leads')}
          className={`px-5 py-2.5 font-accent text-xs tracking-widest uppercase border-b-2 transition-all -mb-px
            ${aba === 'leads' ? 'border-dourado text-dourado' : 'border-transparent text-bege-escuro/50 hover:text-bege-escuro/80'}`}
        >
          <span className="flex items-center gap-2">
            <Users size={13} /> Leads & Contatos
            <span className="bg-white/10 text-bege-escuro/60 px-1.5 py-0.5 rounded-sm text-[9px]">{leads.length}</span>
          </span>
        </button>
        <button
          onClick={() => setAba('clientes')}
          className={`px-5 py-2.5 font-accent text-xs tracking-widest uppercase border-b-2 transition-all -mb-px
            ${aba === 'clientes' ? 'border-dourado text-dourado' : 'border-transparent text-bege-escuro/50 hover:text-bege-escuro/80'}`}
        >
          <span className="flex items-center gap-2">
            <UserCircle2 size={13} /> Clientes Registrados
            {clientesCarregados && (
              <span className="bg-white/10 text-bege-escuro/60 px-1.5 py-0.5 rounded-sm text-[9px]">{clientes.length}</span>
            )}
          </span>
        </button>
      </div>


      {/* ═══════════ ABA: LEADS ═══════════ */}
      {aba === 'leads' && (
        <div className="space-y-4">
          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total',      valor: contadores.total,       cor: 'text-dourado',   icon: <Users size={18} /> },
              { label: 'Novos',      valor: contadores.novos,       cor: 'text-blue-400',  icon: <Clock size={18} /> },
              { label: 'Contatados', valor: contadores.contatados,  cor: 'text-amber-400', icon: <MessageCircle size={18} /> },
              { label: 'Convertidos',valor: contadores.convertidos, cor: 'text-green-400', icon: <CheckCircle size={18} /> },
            ].map(s => (
              <div key={s.label} className="admin-card">
                <div className={`${s.cor} mb-3`}>{s.icon}</div>
                <div className="font-display text-3xl text-bege mb-1">{s.valor}</div>
                <div className="font-body text-xs text-bege-escuro/60">{s.label}</div>
              </div>
            ))}
          </div>

          {/* FILTROS */}
          <div className="admin-card">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/35 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou WhatsApp..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="admin-input pl-8 w-full"
                />
              </div>
              <select
                value={filtroOrigem}
                onChange={e => setFiltroOrigem(e.target.value as OrigemLead | 'todos')}
                className="admin-input sm:w-52"
              >
                <option value="todos">Todas as origens</option>
                {Object.entries(ORIGENS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value as StatusLead | 'todos')}
                className="admin-input sm:w-44"
              >
                <option value="todos">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>


          {/* TABELA LEADS */}
          <div className="admin-card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">
                {leadsFiltrados.length} leads encontrados
              </h3>
              <p className="font-body text-xs text-bege-escuro/40">Consentimento LGPD registrado</p>
            </div>

            {carregandoLeads ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-dourado/50" />
              </div>
            ) : leadsFiltrados.length === 0 ? (
              <div className="text-center py-16">
                <Users size={32} className="text-bege-escuro/20 mx-auto mb-3" />
                <p className="font-body text-sm text-bege-escuro/40">
                  {leads.length === 0 ? 'Nenhum lead cadastrado ainda.' : 'Nenhum lead com os filtros aplicados.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Nome', 'Contato', 'Origem', 'Evento', 'Data', 'Status', 'Ação'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-accent text-[10px] tracking-widest uppercase text-bege-escuro/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leadsFiltrados.map(lead => {
                      const sc = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.novo
                      return (
                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-body text-sm text-bege">{lead.nome}</p>
                            {lead.observacoes && (
                              <p className="font-body text-xs text-bege-escuro/35 mt-0.5 max-w-[180px] truncate">{lead.observacoes}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              {lead.whatsapp && (
                                <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 font-body text-xs text-bege-escuro/70 hover:text-green-400 transition-colors">
                                  <Phone size={11} /> {lead.whatsapp}
                                </a>
                              )}
                              {lead.email && (
                                <a href={`mailto:${lead.email}`}
                                  className="flex items-center gap-1.5 font-body text-xs text-bege-escuro/50 hover:text-dourado transition-colors">
                                  <Mail size={11} /> {lead.email}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-body text-xs text-bege-escuro/70 bg-white/5 px-2 py-0.5 rounded-sm">
                              {ORIGENS[lead.origem] ?? lead.origem}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-body text-xs text-bege-escuro/50">{lead.evento_nome ?? '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-body text-xs text-bege-escuro/50 whitespace-nowrap">
                              {format(new Date(lead.created_at), 'dd/MM · HH:mm', { locale: ptBR })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 font-accent text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm border ${sc.cor}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={lead.status}
                              onChange={e => atualizarStatus(lead.id, e.target.value as StatusLead)}
                              disabled={atualizando === lead.id}
                              className="bg-black/30 border border-white/10 text-bege-escuro text-xs px-2 py-1.5 rounded-sm focus:outline-none focus:border-dourado/50 cursor-pointer disabled:opacity-40"
                            >
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k} className="bg-[#0f0c07] text-bege">{v.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-3 border-t border-white/5 bg-black/10">
              <p className="font-body text-xs text-bege-escuro/30 flex items-center gap-2">
                <CheckCircle size={11} className="text-green-400/50" />
                Dados coletados com consentimento explícito (LGPD — Lei nº 13.709/2018).
              </p>
            </div>
          </div>
        </div>
      )}


      {/* ═══════════ ABA: CLIENTES REGISTRADOS ═══════════ */}
      {aba === 'clientes' && (
        <div className="space-y-4">
          {/* BUSCA */}
          <div className="admin-card">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/35 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={buscaCliente}
                onChange={e => setBuscaCliente(e.target.value)}
                className="admin-input pl-8 w-full"
              />
            </div>
          </div>

          {carregandoClientes ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-dourado/50" />
            </div>
          ) : !clientesCarregados ? (
            <div className="admin-card text-center py-16">
              <UserCircle2 size={32} className="text-bege-escuro/20 mx-auto mb-3" />
              <p className="font-body text-sm text-bege-escuro/40">Carregando clientes...</p>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="admin-card text-center py-16">
              <UserCircle2 size={32} className="text-bege-escuro/20 mx-auto mb-3" />
              <p className="font-body text-sm text-bege-escuro/40">
                {clientes.length === 0
                  ? 'Nenhum cliente registrado ainda. Clientes aparecem ao criar conta em /minha-conta.'
                  : 'Nenhum cliente encontrado com esse filtro.'}
              </p>
            </div>
          ) : (
            <div className="admin-card overflow-hidden p-0">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">
                  {clientesFiltrados.length} clientes registrados
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Nome', 'Contato', 'Perfil Quiz', 'LGPD', 'Cadastro', 'Último acesso'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-accent text-[10px] tracking-widest uppercase text-bege-escuro/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clientesFiltrados.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-body text-sm text-bege">{c.nome}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-body text-xs text-bege-escuro/60">{c.email}</p>
                          {c.whatsapp && (
                            <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                              className="font-body text-xs text-green-400/70 hover:text-green-400 transition-colors">
                              {c.whatsapp}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.quiz_feito ? (
                            <span className="font-body text-xs text-dourado/80 bg-dourado/10 px-2 py-0.5 rounded-sm">
                              {c.quiz_perfil_nome ?? 'Feito'}
                            </span>
                          ) : (
                            <span className="font-body text-xs text-bege-escuro/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.lgpd_aceito
                            ? <CheckCircle size={14} className="text-green-400/70" />
                            : <XCircle size={14} className="text-red-400/40" />}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-body text-xs text-bege-escuro/50 whitespace-nowrap">
                            {format(new Date(c.created_at), 'dd/MM/yy', { locale: ptBR })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-body text-xs text-bege-escuro/40 whitespace-nowrap">
                            {c.ultimo_acesso
                              ? format(new Date(c.ultimo_acesso), 'dd/MM HH:mm', { locale: ptBR })
                              : '—'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
