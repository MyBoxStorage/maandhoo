'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Users, Download, Filter, RefreshCw, Phone, Mail, Tag, Calendar, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react'
import { Lead, OrigemLead, StatusLead } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ORIGENS: Record<OrigemLead, string> = {
  popup_lista: 'Lista Amiga',
  reserva_mesa: 'Reserva Mesa',
  reserva_camarote: 'Reserva Camarote',
  reserva_aniversario: 'Aniversário VIP',
  compra_ingresso: 'Compra Ingresso',
  contato: 'Contato',
}

const STATUS_CONFIG: Record<StatusLead, { label: string; cor: string; icon: React.ReactNode }> = {
  novo:       { label: 'Novo',       cor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',    icon: <Clock size={11} /> },
  contatado:  { label: 'Contatado',  cor: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <MessageCircle size={11} /> },
  convertido: { label: 'Convertido', cor: 'text-green-400 bg-green-400/10 border-green-400/20', icon: <CheckCircle size={11} /> },
  descartado: { label: 'Descartado', cor: 'text-red-400/70 bg-red-400/10 border-red-400/20',    icon: <XCircle size={11} /> },
}

// Dados de exemplo para visualização (em produção virão da API)
const LEADS_EXEMPLO: Lead[] = [
  { id: '1', nome: 'Ana Carolina Silva', email: 'ana@email.com', whatsapp: '47991234567', origem: 'popup_lista', eventoNome: 'Fluxou', status: 'novo', consentimentoLGPD: true, dataConsentimento: new Date(), criadoEm: new Date('2026-03-05T22:14:00'), atualizadoEm: new Date() },
  { id: '2', nome: 'Pedro Henrique Santos', email: 'pedro@email.com', whatsapp: '47987654321', origem: 'reserva_camarote', status: 'contatado', consentimentoLGPD: true, dataConsentimento: new Date(), criadoEm: new Date('2026-03-05T21:05:00'), atualizadoEm: new Date() },
  { id: '3', nome: 'Juliana Ferreira', email: 'ju@email.com', whatsapp: '47912345678', origem: 'reserva_aniversario', status: 'convertido', consentimentoLGPD: true, dataConsentimento: new Date(), criadoEm: new Date('2026-03-04T19:30:00'), atualizadoEm: new Date() },
  { id: '4', nome: 'Rafael Almeida', whatsapp: '47998765432', origem: 'reserva_mesa', status: 'novo', consentimentoLGPD: true, dataConsentimento: new Date(), criadoEm: new Date('2026-03-04T18:00:00'), atualizadoEm: new Date() },
  { id: '5', nome: 'Camila Rodrigues', email: 'cami@email.com', whatsapp: '47956789012', origem: 'compra_ingresso', eventoNome: 'Me Leva Pro Pagode', status: 'convertido', consentimentoLGPD: true, dataConsentimento: new Date(), criadoEm: new Date('2026-03-03T20:45:00'), atualizadoEm: new Date() },
  { id: '6', nome: 'Bruno Costa', email: 'bruno@email.com', whatsapp: '47923456789', origem: 'popup_lista', eventoNome: 'DJ Narru', status: 'novo', consentimentoLGPD: true, dataConsentimento: new Date(), criadoEm: new Date('2026-03-03T15:20:00'), atualizadoEm: new Date() },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(LEADS_EXEMPLO)
  const [filtroOrigem, setFiltroOrigem] = useState<OrigemLead | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<StatusLead | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [atualizando, setAtualizando] = useState(false)

  const leadsFiltrados = leads.filter(l => {
    if (filtroOrigem !== 'todos' && l.origem !== filtroOrigem) return false
    if (filtroStatus !== 'todos' && l.status !== filtroStatus) return false
    if (busca && !l.nome.toLowerCase().includes(busca.toLowerCase()) &&
        !l.email?.toLowerCase().includes(busca.toLowerCase()) &&
        !l.whatsapp?.includes(busca)) return false
    return true
  })

  const atualizarStatus = async (leadId: string, novoStatus: StatusLead) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: novoStatus } : l))
    // await fetch('/api/leads', { method: 'PATCH', body: JSON.stringify({ leadId, status: novoStatus }) })
  }

  const exportarCSV = () => {
    const header = 'Nome,Email,WhatsApp,Origem,Evento,Status,Data\n'
    const rows = leadsFiltrados.map(l =>
      `"${l.nome}","${l.email || ''}","${l.whatsapp || ''}","${ORIGENS[l.origem]}","${l.eventoNome || ''}","${STATUS_CONFIG[l.status].label}","${format(new Date(l.criadoEm), 'dd/MM/yyyy HH:mm')}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_maandhoo_${format(new Date(), 'dd-MM-yyyy')}.csv`
    a.click()
  }

  const contadores = {
    total: leads.length,
    novos: leads.filter(l => l.status === 'novo').length,
    contatados: leads.filter(l => l.status === 'contatado').length,
    convertidos: leads.filter(l => l.status === 'convertido').length,
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Leads & Contatos</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            Cadastros capturados no site · LGPD compliant
          </p>
        </div>
        <button onClick={exportarCSV} className="btn-primary text-xs flex items-center gap-2 px-5">
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads',  valor: contadores.total,      cor: 'text-dourado',    icon: <Users size={18} /> },
          { label: 'Novos',           valor: contadores.novos,      cor: 'text-blue-400',   icon: <Clock size={18} /> },
          { label: 'Contatados',      valor: contadores.contatados, cor: 'text-amber-400',  icon: <MessageCircle size={18} /> },
          { label: 'Convertidos',     valor: contadores.convertidos, cor: 'text-green-400', icon: <CheckCircle size={18} /> },
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
          <input
            type="text"
            placeholder="Buscar por nome, email ou WhatsApp..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="admin-input flex-1"
          />
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

      {/* TABELA */}
      <div className="admin-card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">
            {leadsFiltrados.length} leads encontrados
          </h3>
          <p className="font-body text-xs text-bege-escuro/40">
            Consentimento LGPD registrado em todos os cadastros
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Nome', 'Contato', 'Origem', 'Evento', 'Data', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-accent text-[10px] tracking-widest uppercase text-bege-escuro/50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leadsFiltrados.map(lead => {
                const sc = STATUS_CONFIG[lead.status]
                return (
                  <tr key={lead.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-bege">{lead.nome}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-body text-xs text-bege-escuro/70 hover:text-green-400 transition-colors"
                          >
                            <Phone size={11} /> {lead.whatsapp}
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1.5 font-body text-xs text-bege-escuro/50 hover:text-dourado transition-colors"
                          >
                            <Mail size={11} /> {lead.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-xs text-bege-escuro/70 bg-white/5 px-2 py-0.5 rounded-sm">
                        {ORIGENS[lead.origem]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-xs text-bege-escuro/50">{lead.eventoNome || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-xs text-bege-escuro/50 whitespace-nowrap">
                        {format(new Date(lead.criadoEm), "dd/MM · HH:mm", { locale: ptBR })}
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
                        className="bg-black/30 border border-white/10 text-bege-escuro text-xs px-2 py-1.5 rounded-sm focus:outline-none focus:border-dourado/50 cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {leadsFiltrados.length === 0 && (
            <div className="text-center py-16">
              <Users size={32} className="text-bege-escuro/20 mx-auto mb-3" />
              <p className="font-body text-sm text-bege-escuro/40">Nenhum lead encontrado com os filtros aplicados</p>
            </div>
          )}
        </div>

        {/* RODAPÉ LGPD */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/10">
          <p className="font-body text-xs text-bege-escuro/30 flex items-center gap-2">
            <CheckCircle size={11} className="text-green-400/50" />
            Todos os dados foram coletados com consentimento explícito (LGPD — Lei nº 13.709/2018).
            Dados armazenados com finalidade declarada e prazo de retenção de 2 anos.
          </p>
        </div>
      </div>
    </div>
  )
}
