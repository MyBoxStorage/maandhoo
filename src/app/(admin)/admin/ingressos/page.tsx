'use client'

import React, { useState } from 'react'
import { Search, Download, CheckCircle2, Clock, XCircle, QrCode, Filter } from 'lucide-react'
import { EVENTOS_INICIAIS } from '@/lib/eventos-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

type StatusFiltro = 'todos' | 'pago' | 'pendente' | 'usado' | 'cancelado'

const ingressosSimulados = [
  { id: 'i001', nome: 'João Silva Santos', cpf: '123.***.***-45', email: 'joao@email.com', tipo: 'Pista Masculino', evento: 'Me Leva Pro Pagode', data: '07/03', valor: 50, status: 'pago', serial: 'MAANDHOO-20250307-001', criadoEm: '04/03 18:32' },
  { id: 'i002', nome: 'Maria Oliveira Costa', cpf: '234.***.***-56', email: 'maria@email.com', tipo: 'Backstage Feminino', evento: 'Fluxou', data: '14/03', valor: 60, status: 'pago', serial: 'MAANDHOO-20250314-002', criadoEm: '04/03 19:10' },
  { id: 'i003', nome: 'Carlos Eduardo Lima', cpf: '345.***.***-67', email: 'carlos@email.com', tipo: 'Pista Masculino', evento: 'Fluxou', data: '14/03', valor: 50, status: 'pendente', serial: 'MAANDHOO-20250314-003', criadoEm: '04/03 19:45' },
  { id: 'i004', nome: 'Ana Paula Rodrigues', cpf: '456.***.***-78', email: 'ana@email.com', tipo: 'Backstage Masculino', evento: 'Me Leva Pro Pagode', data: '07/03', valor: 120, status: 'usado', serial: 'MAANDHOO-20250307-004', criadoEm: '02/03 14:20' },
  { id: 'i005', nome: 'Pedro Henrique Souza', cpf: '567.***.***-89', email: 'pedro@email.com', tipo: 'Pista Feminino', evento: 'DJ Narru', data: '21/03', valor: 20, status: 'pago', serial: 'MAANDHOO-20250321-005', criadoEm: '04/03 20:15' },
  { id: 'i006', nome: 'Fernanda Santos Lima', cpf: '678.***.***-90', email: 'fer@email.com', tipo: 'Pista Feminino', evento: 'DJ Narru', data: '21/03', valor: 20, status: 'cancelado', serial: 'MAANDHOO-20250321-006', criadoEm: '03/03 11:05' },
  { id: 'i007', nome: 'Ricardo Alves Costa', cpf: '789.***.***-01', email: 'ricky@email.com', tipo: 'Backstage Masculino', evento: 'Fluxou', data: '14/03', valor: 120, status: 'pago', serial: 'MAANDHOO-20250314-007', criadoEm: '04/03 21:00' },
]

const statusConfig = {
  pago: { label: 'Pago', icon: <CheckCircle2 size={13} />, cor: 'text-green-400 bg-green-400/10 border-green-400/30' },
  pendente: { label: 'Pendente', icon: <Clock size={13} />, cor: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  usado: { label: 'Usado', icon: <CheckCircle2 size={13} />, cor: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  cancelado: { label: 'Cancelado', icon: <XCircle size={13} />, cor: 'text-red-400 bg-red-400/10 border-red-400/30' },
}

export default function AdminIngressosPage() {
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos')
  const [filtroEvento, setFiltroEvento] = useState('todos')
  const [busca, setBusca] = useState('')

  const filtrados = ingressosSimulados.filter(i => {
    const statusOk = filtroStatus === 'todos' || i.status === filtroStatus
    const eventoOk = filtroEvento === 'todos' || i.evento.includes(filtroEvento)
    const buscaOk = i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      i.serial.toLowerCase().includes(busca.toLowerCase()) ||
      i.email.toLowerCase().includes(busca.toLowerCase())
    return statusOk && eventoOk && buscaOk
  })

  const totalReceita = filtrados.filter(i => i.status === 'pago' || i.status === 'usado')
    .reduce((a, i) => a + i.valor, 0)

  const exportarCSV = () => {
    const linhas = ['Nome,CPF,Email,Tipo,Evento,Valor,Status,Serial,Data']
    filtrados.forEach(i => linhas.push(`${i.nome},${i.cpf},${i.email},${i.tipo},${i.evento},${i.valor},${i.status},${i.serial},${i.criadoEm}`))
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ingressos-maandhoo.csv'; a.click()
    toast.success('Ingressos exportados!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Ingressos</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {filtrados.length} ingressos · Receita: <span className="text-dourado">R$ {totalReceita.toFixed(2).replace('.', ',')}</span>
          </p>
        </div>
        <button onClick={exportarCSV} className="btn-outline flex items-center gap-2 text-xs">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* FILTROS */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
            <input className="admin-input pl-9 text-sm" placeholder="Nome, email, serial..."
              value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <select className="admin-input w-auto text-sm" value={filtroEvento}
            onChange={e => setFiltroEvento(e.target.value)}>
            <option value="todos">Todos os eventos</option>
            {EVENTOS_INICIAIS.map(ev => <option key={ev.id} value={ev.nome}>{ev.nome}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['todos', 'pago', 'pendente', 'usado', 'cancelado'] as StatusFiltro[]).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all duration-200
                ${filtroStatus === s ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/30'}`}>
              {s === 'todos' ? 'Todos' : statusConfig[s as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              {['Nome / CPF', 'Ingresso', 'Evento', 'Valor', 'Status', 'Serial', 'Criado'].map(h => (
                <th key={h} className="text-left py-3 px-3 font-accent text-xs tracking-wider text-bege-escuro/50 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtrados.map(ingresso => {
              const sc = statusConfig[ingresso.status as keyof typeof statusConfig]
              return (
                <tr key={ingresso.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-body text-bege text-sm">{ingresso.nome}</p>
                    <p className="font-mono text-xs text-bege-escuro/40">{ingresso.cpf}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-body text-xs text-bege-escuro">{ingresso.tipo}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-body text-xs text-bege-escuro">{ingresso.evento}</p>
                    <p className="font-body text-xs text-bege-escuro/40">{ingresso.data}</p>
                  </td>
                  <td className="py-3 px-3 font-display text-bege">
                    R$ {ingresso.valor}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-xs ${sc?.cor}`}>
                      {sc?.icon} {sc?.label}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-mono text-xs text-bege-escuro/50">{ingresso.serial}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-bege-escuro/40">{ingresso.criadoEm}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <p className="text-center text-bege-escuro/30 py-10">Nenhum ingresso encontrado</p>
        )}
      </div>
    </div>
  )
}
