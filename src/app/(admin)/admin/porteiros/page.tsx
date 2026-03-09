'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Loader2, X, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'

type Porteiro = {
  id: string
  nome: string
  email: string
  nivel: 'porteiro' | 'supervisor' | 'admin_saida'
  ativo: boolean
  created_at: string
  eventos_permitidos?: string[]
}

type Evento = { id: string; nome: string; data_evento: string }

const NIVEL_CONFIG = {
  porteiro:    { label: 'Porteiro',    cor: 'text-bege-escuro/70 bg-white/5 border-white/10',            icon: <Shield size={12} /> },
  supervisor:  { label: 'Supervisor',  cor: 'text-blue-400 bg-blue-400/10 border-blue-400/30',           icon: <Shield size={12} /> },
  admin_saida: { label: 'Admin Saída', cor: 'text-dourado bg-dourado/10 border-dourado/30',              icon: <ShieldCheck size={12} /> },
}

export default function AdminPorteirosPage() {
  const [porteiros, setPorteiros] = useState<Porteiro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Porteiro | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [resP, resE] = await Promise.all([
        fetch('/api/admin/porteiros'),
        fetch('/api/admin/eventos'),
      ])
      const [dataP, dataE] = await Promise.all([resP.json(), resE.json()])
      if (dataP.porteiros) setPorteiros(dataP.porteiros)
      if (dataE.eventos) setEventos(dataE.eventos)
    } catch { toast.error('Erro ao carregar dados') }
    finally { setCarregando(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const toggleAtivo = async (id: string, atual: boolean) => {
    const res = await fetch(`/api/admin/porteiros/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !atual }),
    })
    if (res.ok) {
      setPorteiros(prev => prev.map(p => p.id === id ? { ...p, ativo: !atual } : p))
      toast.success(!atual ? 'Porteiro ativado!' : 'Porteiro desativado!')
    } else {
      toast.error('Erro ao atualizar')
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-bege">Porteiros</h1>
          <p className="font-body text-sm text-bege-escuro/60 mt-1">
            {porteiros.filter(p => p.ativo).length} ativo{porteiros.filter(p => p.ativo).length !== 1 ? 's' : ''} · {porteiros.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} className="btn-outline p-2.5">
            <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Novo Porteiro
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-dourado/50" />
        </div>
      ) : porteiros.length === 0 ? (
        <div className="admin-card text-center py-16">
          <Shield size={32} className="text-bege-escuro/20 mx-auto mb-3" />
          <p className="font-body text-bege-escuro/40">Nenhum porteiro cadastrado.</p>
          <button onClick={() => { setEditando(null); setModalAberto(true) }} className="btn-primary text-xs mt-4">
            Cadastrar porteiro
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {porteiros.map(porteiro => {
            const nc = NIVEL_CONFIG[porteiro.nivel] ?? NIVEL_CONFIG['porteiro']
            return (
              <div key={porteiro.id} className={`admin-card flex items-center gap-4 transition-opacity ${porteiro.ativo ? '' : 'opacity-50'}`}>
                {/* AVATAR */}
                <div className="w-10 h-10 rounded-full bg-dourado/10 border border-dourado/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-sm text-dourado">
                    {porteiro.nome.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-body text-bege text-sm font-medium">{porteiro.nome}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-xs ${nc.cor}`}>
                      {nc.icon} {nc.label}
                    </span>
                    {!porteiro.ativo && (
                      <span className="text-xs text-bege-escuro/30 border border-white/5 px-2 py-0.5 rounded-sm">Inativo</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-bege-escuro/50 mt-0.5">{porteiro.email}</p>
                  {porteiro.eventos_permitidos && porteiro.eventos_permitidos.length > 0 && (
                    <p className="font-body text-xs text-bege-escuro/35 mt-0.5">
                      {porteiro.eventos_permitidos.length} evento{porteiro.eventos_permitidos.length !== 1 ? 's' : ''} permitido{porteiro.eventos_permitidos.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="font-body text-xs text-bege-escuro/25 hidden sm:block">
                    {porteiro.created_at ? format(new Date(porteiro.created_at), "dd/MM/yy", { locale: ptBR }) : ''}
                  </span>
                  <button onClick={() => toggleAtivo(porteiro.id, porteiro.ativo)}
                    className="p-2 border border-white/10 hover:border-dourado/30 text-bege-escuro/50 hover:text-dourado rounded-sm transition-all"
                    title={porteiro.ativo ? 'Desativar' : 'Ativar'}>
                    {porteiro.ativo ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => { setEditando(porteiro); setModalAberto(true) }}
                    className="p-2 border border-white/10 hover:border-dourado/30 text-bege-escuro/50 hover:text-dourado rounded-sm transition-all"
                    title="Editar">
                    <Shield size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <PorteiroModal
          porteiro={editando}
          eventos={eventos}
          onClose={() => setModalAberto(false)}
          onSalvo={() => { setModalAberto(false); carregar() }}
        />
      )}
    </div>
  )
}

// ─── MODAL PORTEIRO ───────────────────────────────────────────

const PorteiroModal: React.FC<{
  porteiro: Porteiro | null
  eventos: Evento[]
  onClose: () => void
  onSalvo: () => void
}> = ({ porteiro, eventos, onClose, onSalvo }) => {
  const [form, setForm] = useState({
    nome: porteiro?.nome ?? '',
    email: porteiro?.email ?? '',
    senha: '',
    nivel: porteiro?.nivel ?? 'porteiro',
    ativo: porteiro?.ativo ?? true,
    eventos_permitidos: porteiro?.eventos_permitidos ?? [] as string[],
  })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const toggleEvento = (id: string) => {
    setForm(p => ({
      ...p,
      eventos_permitidos: p.eventos_permitidos.includes(id)
        ? p.eventos_permitidos.filter(e => e !== id)
        : [...p.eventos_permitidos, id],
    }))
  }

  const salvar = async () => {
    if (!form.nome || !form.email) { toast.error('Nome e email são obrigatórios'); return }
    if (!porteiro && !form.senha) { toast.error('Senha é obrigatória para novo porteiro'); return }
    setSalvando(true)
    try {
      const url = porteiro ? `/api/admin/porteiros/${porteiro.id}` : '/api/admin/porteiros'
      const method = porteiro ? 'PUT' : 'POST'
      const body = porteiro && !form.senha
        ? { nome: form.nome, nivel: form.nivel, ativo: form.ativo, eventos_permitidos: form.eventos_permitidos }
        : form
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.erro) { toast.error(data.erro); return }
      toast.success(porteiro ? 'Porteiro atualizado!' : 'Porteiro criado!')
      onSalvo()
    } catch { toast.error('Erro de conexão') }
    finally { setSalvando(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f0c07] border border-dourado/30 rounded-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dourado/15">
          <h3 className="font-display text-xl text-bege">{porteiro ? 'Editar Porteiro' : 'Novo Porteiro'}</h3>
          <button onClick={onClose} className="text-bege-escuro/50 hover:text-bege"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="admin-label">Nome *</label>
            <input className="admin-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
          </div>
          <div>
            <label className="admin-label">Email *</label>
            <input type="email" className="admin-input" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="porteiro@email.com"
              disabled={!!porteiro} />
          </div>
          <div>
            <label className="admin-label">{porteiro ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha *'}</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="admin-input pr-10"
                value={form.senha}
                onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                placeholder={porteiro ? '••••••••' : 'Mínimo 8 caracteres'}
              />
              <button type="button" onClick={() => setMostrarSenha(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bege-escuro/40 hover:text-bege-escuro transition-colors">
                {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="admin-label">Nível de Acesso</label>
            <select className="admin-input" value={form.nivel} onChange={e => setForm(p => ({ ...p, nivel: e.target.value as Porteiro['nivel'] }))}>
              <option value="porteiro">Porteiro — Leitura básica</option>
              <option value="supervisor">Supervisor — Pode ver histórico</option>
              <option value="admin_saida">Admin Saída — Acesso total à portaria</option>
            </select>
          </div>

          {/* EVENTOS PERMITIDOS */}
          <div>
            <label className="admin-label">Eventos Permitidos</label>
            <div className="space-y-2 mt-2">
              {eventos.length === 0 && (
                <p className="text-xs text-bege-escuro/35">Nenhum evento disponível.</p>
              )}
              {eventos.map(ev => (
                <label key={ev.id} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => toggleEvento(ev.id)}
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                      ${form.eventos_permitidos.includes(ev.id)
                        ? 'bg-dourado border-dourado'
                        : 'border-white/15 group-hover:border-dourado/40'}`}>
                    {form.eventos_permitidos.includes(ev.id) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#1a1208" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span onClick={() => toggleEvento(ev.id)} className="font-body text-sm text-bege-escuro/70 group-hover:text-bege transition-colors cursor-pointer">
                    {ev.nome}
                    {ev.data_evento && <span className="text-bege-escuro/40 ml-1.5 text-xs">
                      {format(new Date(ev.data_evento), "dd/MM", { locale: ptBR })}
                    </span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))}
              className={`w-11 h-6 rounded-full transition-all relative ${form.ativo ? 'bg-dourado' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.ativo ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="font-body text-sm text-bege-escuro/70">{form.ativo ? 'Ativo' : 'Inativo'}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={salvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {salvando ? <><Loader2 size={12} className="animate-spin" /> Salvando...</> : (porteiro ? 'Salvar Alterações' : 'Criar Porteiro')}
            </button>
            <button onClick={onClose} className="btn-outline">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
