'use client'

import React, { useState } from 'react'
import { Download, Users, Search, SortAsc } from 'lucide-react'
import { EVENTOS_INICIAIS } from '@/lib/eventos-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

// Dados simulados de lista
const listaSimulada = [
  { id: '1', nome: 'Ana Carolina Silva', email: 'ana@email.com', genero: 'feminino', criadoEm: new Date() },
  { id: '2', nome: 'Bruno Ferreira Santos', email: 'bruno@email.com', genero: 'masculino', criadoEm: new Date() },
  { id: '3', nome: 'Carla Rodrigues', email: 'carla@email.com', genero: 'feminino', criadoEm: new Date() },
  { id: '4', nome: 'Daniel Almeida Costa', email: 'daniel@email.com', genero: 'masculino', criadoEm: new Date() },
  { id: '5', nome: 'Eduarda Martins', email: 'edu@email.com', genero: 'feminino', criadoEm: new Date() },
  { id: '6', nome: 'Felipe Gonçalves', email: 'felipe@email.com', genero: 'masculino', criadoEm: new Date() },
  { id: '7', nome: 'Gabriela Lima', email: 'gabi@email.com', genero: 'feminino', criadoEm: new Date() },
  { id: '8', nome: 'Henrique Souza', email: 'henrique@email.com', genero: 'masculino', criadoEm: new Date() },
]

type GeneroFiltro = 'todos' | 'masculino' | 'feminino'

const sortByNome = (arr: typeof listaSimulada) =>
  [...arr].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

export default function AdminListasPage() {
  const [eventoSelecionado, setEventoSelecionado] = useState(EVENTOS_INICIAIS[0].id)
  const [filtro, setFiltro] = useState<GeneroFiltro>('todos')
  const [busca, setBusca] = useState('')

  const evento = EVENTOS_INICIAIS.find(e => e.id === eventoSelecionado)!
  const listaOrdenada = sortByNome(listaSimulada)

  const filtrada = listaOrdenada.filter(item => {
    const generoOk = filtro === 'todos' || item.genero === filtro
    const buscaOk = item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.email.toLowerCase().includes(busca.toLowerCase())
    return generoOk && buscaOk
  })

  const masc = listaOrdenada.filter(i => i.genero === 'masculino')
  const fem = listaOrdenada.filter(i => i.genero === 'feminino')

  const exportarExcel = async (tipo: 'masc_sem_email' | 'masc_com_email' | 'fem_sem_email' | 'fem_com_email') => {
    try {
      // Em produção: gera XLSX via API + XLSX.js
      const dados = tipo.startsWith('masc') ? masc : fem
      const comEmail = tipo.endsWith('com_email')

      const csvLines = [
        comEmail ? 'Nome,Email' : 'Nome',
        ...dados.map(d => comEmail ? `${d.nome},${d.email}` : d.nome),
      ]
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lista-${tipo}-${evento.slug}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Lista exportada! (CSV — configure XLSX para produção)')
    } catch {
      toast.error('Erro ao exportar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Listas Amigas</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">Gerencie e exporte as listas por evento</p>
        </div>
      </div>

      {/* SELETOR DE EVENTO */}
      <div className="admin-card">
        <label className="admin-label">Evento</label>
        <select className="admin-input max-w-md" value={eventoSelecionado}
          onChange={e => setEventoSelecionado(e.target.value)}>
          {EVENTOS_INICIAIS.map(e => (
            <option key={e.id} value={e.id}>
              {e.nome} — {format(e.data, "dd/MM/yyyy", { locale: ptBR })}
            </option>
          ))}
        </select>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', valor: listaOrdenada.length, cor: 'text-bege' },
          { label: 'Feminino', valor: fem.length, cor: 'text-pink-400' },
          { label: 'Masculino', valor: masc.length, cor: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="admin-card text-center">
            <div className={`font-display text-3xl ${s.cor}`}>{s.valor}</div>
            <div className="font-body text-xs text-bege-escuro/60 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* EXPORTAÇÕES */}
      <div className="admin-card">
        <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-4">Exportar Listas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'fem_sem_email' as const, label: 'Feminino (só nome)', icon: '♀', cor: 'text-pink-400 border-pink-400/30 hover:border-pink-400' },
            { id: 'fem_com_email' as const, label: 'Feminino (com email)', icon: '♀', cor: 'text-pink-400 border-pink-400/30 hover:border-pink-400' },
            { id: 'masc_sem_email' as const, label: 'Masculino (só nome)', icon: '♂', cor: 'text-blue-400 border-blue-400/30 hover:border-blue-400' },
            { id: 'masc_com_email' as const, label: 'Masculino (com email)', icon: '♂', cor: 'text-blue-400 border-blue-400/30 hover:border-blue-400' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => exportarExcel(btn.id)}
              className={`flex items-center gap-2 p-3 border rounded-sm text-xs transition-all duration-200 ${btn.cor}`}
            >
              <Download size={13} />
              <span>{btn.icon} {btn.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-bege-escuro/30 mt-3">
          As listas são exportadas ordenadas alfabeticamente por nome. Configure xlsx.js para formato Excel nativo.
        </p>
      </div>

      {/* LISTA */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
            <input
              className="admin-input pl-9 text-sm"
              placeholder="Buscar por nome ou email..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'feminino', 'masculino'] as GeneroFiltro[]).map(g => (
              <button
                key={g}
                onClick={() => setFiltro(g)}
                className={`px-3 py-2 text-xs font-accent tracking-wider border rounded-sm transition-all duration-200
                  ${filtro === g ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/30'}`}
              >
                {g === 'todos' ? 'Todos' : g === 'feminino' ? '♀ Fem' : '♂ Masc'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-accent tracking-wider text-bege-escuro/40 uppercase">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Nome</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Gênero</div>
          </div>
          {filtrada.map((item, i) => (
            <div key={item.id}
              className="grid grid-cols-12 gap-3 px-3 py-2.5 rounded-sm bg-black/20 border border-white/5 text-sm hover:border-white/10 transition-all">
              <div className="col-span-1 text-bege-escuro/40 text-xs">{i + 1}</div>
              <div className="col-span-5 text-bege font-medium truncate">{item.nome}</div>
              <div className="col-span-4 text-bege-escuro/60 text-xs truncate">{item.email}</div>
              <div className={`col-span-2 text-xs font-accent ${item.genero === 'feminino' ? 'text-pink-400' : 'text-blue-400'}`}>
                {item.genero === 'feminino' ? '♀ Fem' : '♂ Masc'}
              </div>
            </div>
          ))}
          {filtrada.length === 0 && (
            <p className="text-center text-bege-escuro/30 py-8 text-sm">Nenhum nome encontrado</p>
          )}
        </div>

        <p className="text-xs text-bege-escuro/30 mt-4">
          Exibindo {filtrada.length} de {listaOrdenada.length} · Ordenado alfabeticamente
        </p>
      </div>
    </div>
  )
}
