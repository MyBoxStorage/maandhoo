'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Search, RefreshCw, Loader2, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'

type GeneroFiltro = 'todos' | 'masculino' | 'feminino'

type ItemLista = {
  id: string
  nome_completo: string
  email: string
  whatsapp: string
  genero: string
  status: string
  tipo: string
  qr_enviado: boolean
  created_at: string
  evento_nome?: string
}

type EventoOpt = { id: string; nome: string; data_evento: string }

export default function AdminListasPage() {
  const [lista, setLista] = useState<ItemLista[]>([])
  const [eventos, setEventos] = useState<EventoOpt[]>([])
  const [eventoSelecionado, setEventoSelecionado] = useState('todos')
  const [filtroGenero, setFiltroGenero] = useState<GeneroFiltro>('todos')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [resIng, resEv] = await Promise.all([
        fetch('/api/admin/ingressos'),
        fetch('/api/admin/eventos'),
      ])
      const [dataIng, dataEv] = await Promise.all([resIng.json(), resEv.json()])

      // Filtrar só ingressos de lista com cadastro completo
      const ingressos = (dataIng.ingressos ?? []) as Array<{
        id: string; tipo: string; status: string; qr_enviado: boolean; created_at: string; evento_id: string;
        cadastro?: { nome_completo: string; email: string; whatsapp: string; genero: string } | null
        evento?: { nome: string } | null
      }>

      const listaitens: ItemLista[] = ingressos
        .filter(i => i.tipo === 'lista_masc' || i.tipo === 'lista_fem')
        .map(i => ({
          id: i.id,
          nome_completo: i.cadastro?.nome_completo ?? '(Sem cadastro)',
          email: i.cadastro?.email ?? '',
          whatsapp: i.cadastro?.whatsapp ?? '',
          genero: i.cadastro?.genero ?? (i.tipo === 'lista_fem' ? 'feminino' : 'masculino'),
          status: i.status,
          tipo: i.tipo,
          qr_enviado: i.qr_enviado ?? false,
          created_at: i.created_at,
          evento_nome: i.evento?.nome ?? '',
        }))

      // Ordenar alfabeticamente por nome
      listaitens.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, 'pt-BR'))
      setLista(listaitens)
      setEventos(dataEv.eventos ?? [])
    } catch {
      toast.error('Erro ao carregar listas')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtrada = lista.filter(item => {
    const generoOk = filtroGenero === 'todos' || item.genero === filtroGenero
    const eventoOk = eventoSelecionado === 'todos' // TODO: filtrar por evento_id quando API retornar
    const termo = busca.toLowerCase()
    const buscaOk = !busca ||
      item.nome_completo.toLowerCase().includes(termo) ||
      item.email.toLowerCase().includes(termo)
    return generoOk && eventoOk && buscaOk
  })

  const masc = filtrada.filter(i => i.genero === 'masculino')
  const fem  = filtrada.filter(i => i.genero === 'feminino')

  const exportarCSV = (subconjunto: ItemLista[], sufixo: string, comEmail: boolean) => {
    const linhas = [comEmail ? 'Nome,Email,WhatsApp,Status,QR Enviado' : 'Nome']
    subconjunto.forEach(i => {
      linhas.push(comEmail
        ? `"${i.nome_completo}","${i.email}","${i.whatsapp}","${i.status}","${i.qr_enviado ? 'Sim' : 'Não'}"`
        : `"${i.nome_completo}"`
      )
    })
    const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-${sufixo}-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${subconjunto.length} nomes exportados!`)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Listas</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            Gerencie e exporte as listas de convidados por evento
          </p>
        </div>
        <button onClick={carregar} className="btn-outline p-2.5">
          <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* SELETOR DE EVENTO */}
      <div className="admin-card">
        <label className="admin-label">Evento</label>
        <select className="admin-input max-w-md" value={eventoSelecionado}
          onChange={e => setEventoSelecionado(e.target.value)}>
          <option value="todos">Todos os eventos</option>
          {eventos.map(e => (
            <option key={e.id} value={e.id}>
              {e.nome} — {format(new Date(e.data_evento), "dd/MM/yyyy", { locale: ptBR })}
            </option>
          ))}
        </select>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', valor: filtrada.length, cor: 'text-bege' },
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
            <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-4">Exportar CSV</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '♀ Feminino (só nome)',   subconjunto: fem,  sufixo: 'feminino-nomes',   comEmail: false, cor: 'text-pink-400 border-pink-400/30 hover:border-pink-400' },
                { label: '♀ Feminino (com email)', subconjunto: fem,  sufixo: 'feminino-completo', comEmail: true,  cor: 'text-pink-400 border-pink-400/30 hover:border-pink-400' },
                { label: '♂ Masculino (só nome)',  subconjunto: masc, sufixo: 'masculino-nomes',   comEmail: false, cor: 'text-blue-400 border-blue-400/30 hover:border-blue-400' },
                { label: '♂ Masculino (com email)',subconjunto: masc, sufixo: 'masculino-completo',comEmail: true,  cor: 'text-blue-400 border-blue-400/30 hover:border-blue-400' },
              ].map(btn => (
                <button
                  key={btn.sufixo}
                  onClick={() => exportarCSV(btn.subconjunto, btn.sufixo, btn.comEmail)}
                  className={`flex items-center gap-2 p-3 border rounded-sm text-xs transition-all duration-200 ${btn.cor}`}
                >
                  <Download size={13} /> {btn.label}
                </button>
              ))}
            </div>
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
                  <button key={g} onClick={() => setFiltroGenero(g)}
                    className={`px-3 py-2 text-xs font-accent tracking-wider border rounded-sm transition-all duration-200
                      ${filtroGenero === g ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/30'}`}>
                    {g === 'todos' ? 'Todos' : g === 'feminino' ? '♀ Fem' : '♂ Masc'}
                  </button>
                ))}
              </div>
            </div>

            {filtrada.length === 0 ? (
              <div className="text-center py-12">
                <Users size={28} className="text-bege-escuro/20 mx-auto mb-3" />
                <p className="font-body text-sm text-bege-escuro/40">Nenhum cadastro de lista encontrado.</p>
                <p className="font-body text-xs text-bege-escuro/25 mt-1">Os cadastros aparecem quando os links de lista são utilizados.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-accent tracking-wider text-bege-escuro/40 uppercase border-b border-white/5 mb-1">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Nome</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Gênero</div>
                  <div className="col-span-1">QR</div>
                  <div className="col-span-1">Status</div>
                </div>
                <div className="space-y-1">
                  {filtrada.map((item, i) => (
                    <div key={item.id}
                      className="grid grid-cols-12 gap-3 px-3 py-2.5 rounded-sm bg-black/20 border border-white/5 text-sm hover:border-white/10 transition-all">
                      <div className="col-span-1 text-bege-escuro/40 text-xs self-center">{i + 1}</div>
                      <div className="col-span-4 text-bege font-medium truncate self-center">{item.nome_completo}</div>
                      <div className="col-span-3 text-bege-escuro/60 text-xs truncate self-center">{item.email || '—'}</div>
                      <div className={`col-span-2 text-xs font-accent self-center ${item.genero === 'feminino' ? 'text-pink-400' : 'text-blue-400'}`}>
                        {item.genero === 'feminino' ? '♀ Fem' : '♂ Masc'}
                      </div>
                      <div className="col-span-1 self-center">
                        <span className={`text-xs ${item.qr_enviado ? 'text-green-400' : 'text-bege-escuro/30'}`}>
                          {item.qr_enviado ? '✓' : '—'}
                        </span>
                      </div>
                      <div className="col-span-1 self-center">
                        <span className={`text-xs ${
                          item.status === 'ativo' ? 'text-green-400' :
                          item.status === 'utilizado' ? 'text-blue-400' :
                          item.status === 'aguardando_cadastro' ? 'text-amber-400' : 'text-bege-escuro/40'
                        }`}>
                          {item.status === 'aguardando_cadastro' ? 'Pend.' :
                           item.status === 'ativo' ? 'OK' :
                           item.status === 'utilizado' ? 'Usado' : item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs text-bege-escuro/30 mt-4">
              {filtrada.length} registro{filtrada.length !== 1 ? 's' : ''} · Ordenado alfabeticamente
            </p>
          </div>
        </>
      )}
    </div>
  )
}
