'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { LogoElefante } from '@/components/ui/LogoElefante'
import {
  CheckCircle2, XCircle, QrCode, Search,
  RefreshCw, LogOut, Camera, CameraOff,
  ChevronDown, Clock, Shield
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { labelTipoIngresso } from '@/lib/ingresso-utils'

// ─── TIPOS ───────────────────────────────────────────────────

type Porteiro = { id: string; nome: string; nivel: string }
type Evento = { id: string; nome: string; data_evento: string; hora_abertura: string; flyer_url?: string }

type StatusTela = 'aprovado' | 'ja_utilizado' | 'lista_expirada' | 'ingresso_expirado' | 'ingresso_cancelado' | 'ingresso_invalido' | 'evento_errado' | 'idle'

type ResultadoScan = {
  status: StatusTela
  mensagem: string
  nome?: string
  tipo_ingresso?: string
  evento_nome?: string
}

type HistoricoItem = ResultadoScan & { ts: string }

// ─── HELPERS ─────────────────────────────────────────────────

const CORES: Record<StatusTela, { border: string; bg: string; texto: string }> = {
  idle:               { border: 'border-white/10',    bg: 'bg-black/20',       texto: 'text-bege-escuro/40' },
  aprovado:           { border: 'border-green-500',   bg: 'bg-green-500/10',   texto: 'text-green-400' },
  ja_utilizado:       { border: 'border-amber-500',   bg: 'bg-amber-500/10',   texto: 'text-amber-400' },
  lista_expirada:     { border: 'border-orange-500',  bg: 'bg-orange-500/10',  texto: 'text-orange-400' },
  ingresso_expirado:  { border: 'border-red-700',     bg: 'bg-red-700/10',     texto: 'text-red-500' },
  ingresso_cancelado: { border: 'border-red-500',     bg: 'bg-red-500/10',     texto: 'text-red-400' },
  ingresso_invalido:  { border: 'border-red-500',     bg: 'bg-red-500/10',     texto: 'text-red-400' },
  evento_errado:      { border: 'border-purple-500',  bg: 'bg-purple-500/10',  texto: 'text-purple-400' },
}

const ICONE: Record<StatusTela, JSX.Element> = {
  idle:               <QrCode size={64} className="text-bege-escuro/15 mx-auto" />,
  aprovado:           <CheckCircle2 size={72} className="text-green-400 mx-auto animate-[bounceIn_0.4s_ease]" />,
  ja_utilizado:       <XCircle size={72} className="text-amber-400 mx-auto" />,
  lista_expirada:     <Clock size={72} className="text-orange-400 mx-auto" />,
  ingresso_expirado:  <XCircle size={72} className="text-red-500 mx-auto" />,
  ingresso_cancelado: <XCircle size={72} className="text-red-400 mx-auto" />,
  ingresso_invalido:  <XCircle size={72} className="text-red-400 mx-auto" />,
  evento_errado:      <Shield size={72} className="text-purple-400 mx-auto" />,
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function PortariaPage() {
  // Auth
  const [porteiro, setPorteiro] = useState<Porteiro | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Scanner
  const [resultado, setResultado] = useState<ResultadoScan>({ status: 'idle', mensagem: '' })
  const [inputManual, setInputManual] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null)
  // Ref sempre atualizada com a versão mais recente de validarToken
  // para evitar closure stale dentro do callback da câmera
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validarTokenRef = useRef<(token: string) => void>(() => {})
  const scannerDivId = 'qr-reader'
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restaurar sessão do localStorage (expira em 12 horas)
  useEffect(() => {
    const saved = localStorage.getItem('portaria_sessao')
    if (saved) {
      try {
        const { porteiro: p, eventos: e, exp } = JSON.parse(saved)
        if (exp && Date.now() > exp) {
          localStorage.removeItem('portaria_sessao')
        } else {
          setPorteiro(p)
          setEventos(e)
        }
      } catch { localStorage.removeItem('portaria_sessao') }
    }
  }, [])

  // Auto-foco no input quando logado
  useEffect(() => {
    if (porteiro && eventoSelecionado) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [porteiro, eventoSelecionado])

  // Capturar QR da URL (quando câmera genérica redireciona para cá)
  // Usa a ref para evitar chamar validarToken antes de sua declaração
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qrParam = params.get('qr')
    if (qrParam && porteiro && eventoSelecionado) {
      validarTokenRef.current(qrParam)
      window.history.replaceState({}, '', '/portaria')
    }
  }, [porteiro, eventoSelecionado])

  // ── LOGIN ──────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginEmail || !loginSenha) { toast.error('Preencha email e senha'); return }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/ingressos/portaria-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      })
      const data = await res.json()
      if (!data.sucesso) { toast.error(data.erro ?? 'Credenciais inválidas'); return }
      setPorteiro(data.porteiro)
      setEventos(data.eventos)
      localStorage.setItem('portaria_sessao', JSON.stringify({
        porteiro: data.porteiro,
        eventos: data.eventos,
        exp: Date.now() + 12 * 60 * 60 * 1000, // 12 horas
      }))
      toast.success(`Bem-vindo, ${data.porteiro.nome}!`)
    } catch { toast.error('Erro de conexão') }
    finally { setLoginLoading(false) }
  }

  const handleLogout = async () => {
    await pararCamera()
    setPorteiro(null)
    setEventos([])
    setEventoSelecionado(null)
    setHistorico([])
    setResultado({ status: 'idle', mensagem: '' })
    localStorage.removeItem('portaria_sessao')
  }

  // ── CÂMERA ─────────────────────────────────────────────────
  const iniciarCamera = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(scannerDivId)
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extrair token do QR Code
          let token = decodedText
          try {
            const url = new URL(decodedText)
            token = url.searchParams.get('token') ?? decodedText
          } catch { /* não é URL, usar texto direto */ }
          // Usa ref para evitar closure stale com eventoSelecionado / porteiro
          validarTokenRef.current(token)
        },
        () => { /* erros de frame ignorados */ }
      )
      scannerRef.current = scanner
      setCameraAtiva(true)
    } catch (err) {
      toast.error('Não foi possível acessar a câmera. Verifique as permissões.')
      console.error('[camera]', err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pararCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.clear() } catch { /* ignorar */ }
      scannerRef.current = null
    }
    setCameraAtiva(false)
  }

  const toggleCamera = () => {
    if (cameraAtiva) pararCamera()
    else iniciarCamera()
  }

  // ── VALIDAÇÃO ──────────────────────────────────────────────
  const validarToken = useCallback(async (token: string) => {
    if (!token.trim() || !porteiro || !eventoSelecionado || loading) return
    setLoading(true)
    setInputManual('')

    try {
      const res = await fetch('/api/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: token.trim(),
          porteiro_id: porteiro.id,
          evento_id: eventoSelecionado.id,
        }),
      })
      const data = await res.json()

      const novoResultado: ResultadoScan = {
        status: data.resultado as StatusTela,
        mensagem: data.mensagem,
        nome: data.nome,
        tipo_ingresso: data.tipo_ingresso,
        evento_nome: data.evento_nome,
      }

      setResultado(novoResultado)
      setHistorico(prev => [{ ...novoResultado, ts: new Date().toLocaleTimeString('pt-BR') }, ...prev.slice(0, 19)])

      // Feedback sonoro/visual
      if (data.aprovado) {
        toast.success('✅ Entrada autorizada!', { duration: 2000 })
      } else {
        toast.error(data.mensagem, { duration: 3000 })
      }

      // Reset automático após 6s
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => {
        setResultado({ status: 'idle', mensagem: '' })
        inputRef.current?.focus()
      }, 6000)

    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [porteiro, eventoSelecionado, loading])

  // Mantém a ref sempre atualizada com a versão mais recente de validarToken
  // Declarado APÓS validarToken para evitar "used before declaration"
  useEffect(() => {
    validarTokenRef.current = validarToken
  }, [validarToken])

  // ─── TELA: LOGIN ───────────────────────────────────────────
  if (!porteiro) {
    return (
      <div className="min-h-screen bg-preto-profundo flex flex-col items-center justify-center px-4">
        <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <LogoElefante width={52} height={58} color="#C9A84C" />
            <div className="text-center">
              <p className="font-accent text-xs tracking-[0.4em] text-dourado/70 uppercase">Maandhoo Club</p>
              <p className="font-body text-[10px] text-bege-escuro/35 tracking-widest uppercase mt-1">Sistema de Portaria</p>
            </div>
          </div>

          {/* Card de login */}
          <div className="border border-dourado/20 bg-black/30 rounded-sm p-7">
            <h2 className="font-accent text-sm tracking-[0.25em] text-bege uppercase mb-6 text-center">Acesso Restrito</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm px-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                  placeholder="porteiro@maandhoo.com"
                  autoComplete="email"
                  disabled={loginLoading}
                />
              </div>
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Senha</label>
                <input
                  type="password"
                  value={loginSenha}
                  onChange={e => setLoginSenha(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm px-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loginLoading}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full bg-dourado hover:bg-dourado/90 disabled:bg-dourado/40 text-preto-profundo font-accent text-xs tracking-[0.25em] uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loginLoading ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                {loginLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </div>
          </div>

          <p className="font-body text-[10px] text-bege-escuro/20 text-center mt-6">
            Acesso exclusivo para equipe autorizada
          </p>
        </div>
      </div>
    )
  }

  // ─── TELA: SELECIONAR EVENTO ───────────────────────────────
  if (!eventoSelecionado) {
    return (
      <div className="min-h-screen bg-preto-profundo flex flex-col items-center justify-center px-4">
        <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-2 mb-8">
            <LogoElefante width={40} height={45} color="#C9A84C" />
            <p className="font-accent text-xs tracking-[0.3em] text-dourado/60 uppercase">Portaria</p>
          </div>

          <div className="border border-dourado/20 bg-black/30 rounded-sm p-6">
            <h2 className="font-accent text-sm tracking-[0.2em] text-bege mb-1">Olá, {porteiro.nome}</h2>
            <p className="font-body text-xs text-bege-escuro/45 mb-6">Selecione o evento desta noite</p>

            {eventos.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-body text-sm text-bege-escuro/40">Nenhum evento ativo no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventos.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setEventoSelecionado(ev)}
                    className="w-full flex items-center gap-4 p-4 border border-dourado/15 hover:border-dourado/40 bg-black/20 hover:bg-dourado/5 rounded-sm transition-all text-left group"
                  >
                    {ev.flyer_url && (
                      <img src={ev.flyer_url} alt="" className="w-10 h-14 object-cover rounded-sm flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div>
                      <p className="font-display text-base text-bege group-hover:text-dourado transition-colors">{ev.nome}</p>
                      <p className="font-body text-xs text-bege-escuro/45 mt-0.5 capitalize">
                        {format(new Date(`${ev.data_evento}T00:00:00`), "dd 'de' MMMM", { locale: ptBR })} · {ev.hora_abertura}
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-bege-escuro/30 group-hover:text-dourado/60 -rotate-90 ml-auto transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 mt-4 py-2 font-body text-xs text-bege-escuro/30 hover:text-bege-escuro/60 transition-colors">
            <LogOut size={12} /> Sair
          </button>
        </div>
      </div>
    )
  }

  // ─── TELA: SCANNER ─────────────────────────────────────────
  const cores = CORES[resultado.status]

  return (
    <div className="min-h-screen bg-preto-profundo pb-12">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      {/* HEADER FIXO */}
      <div className="sticky top-0 z-10 bg-preto-profundo/95 backdrop-blur-sm border-b border-dourado/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoElefante width={28} height={31} color="#C9A84C" />
            <div>
              <p className="font-accent text-xs tracking-widest text-bege leading-none">PORTARIA</p>
              <p className="font-body text-[10px] text-bege-escuro/40 mt-0.5 truncate max-w-[180px]">{eventoSelecionado.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-body text-[10px] text-green-400">Online</span>
            </div>
            <button
              onClick={() => { pararCamera(); setEventoSelecionado(null) }}
              className="font-body text-[10px] text-bege-escuro/30 hover:text-bege-escuro/70 transition-colors flex items-center gap-1"
            >
              <ChevronDown size={12} className="rotate-90" /> trocar evento
            </button>
            <button onClick={handleLogout} className="text-bege-escuro/30 hover:text-bege-escuro/70 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* RESULTADO PRINCIPAL */}
        <div className={`border-2 rounded-sm p-7 text-center transition-all duration-300 ${cores.border} ${cores.bg}`}>
          <div className="mb-4">{ICONE[resultado.status]}</div>

          {resultado.status === 'idle' && (
            <>
              <p className="font-body text-sm text-bege-escuro/45">Aguardando leitura do QR Code...</p>
              <p className="font-body text-xs text-bege-escuro/25 mt-1">Câmera ou digitação manual</p>
            </>
          )}

          {resultado.status === 'aprovado' && (
            <>
              <p className={`font-accent text-lg tracking-widest mb-3 ${cores.texto}`}>ENTRADA AUTORIZADA</p>
              {resultado.nome && <p className="font-display text-2xl text-bege mb-1">{resultado.nome}</p>}
              {resultado.tipo_ingresso && (
                <p className="font-body text-sm text-bege-escuro/60">
                  {labelTipoIngresso(resultado.tipo_ingresso ?? '')}
                </p>
              )}
            </>
          )}

          {resultado.status !== 'idle' && resultado.status !== 'aprovado' && (
            <>
              <p className={`font-accent text-base tracking-widest mb-2 ${cores.texto}`}>
                {resultado.status === 'ja_utilizado'       && 'JÁ UTILIZADO'}
                {resultado.status === 'lista_expirada'     && 'LISTA ENCERRADA'}
                {resultado.status === 'ingresso_expirado'  && 'INGRESSO EXPIRADO'}
                {resultado.status === 'ingresso_cancelado' && 'INGRESSO CANCELADO'}
                {resultado.status === 'ingresso_invalido'  && 'QR CODE INVÁLIDO'}
                {resultado.status === 'evento_errado'      && 'EVENTO INCORRETO'}
              </p>
              {resultado.nome && <p className="font-display text-xl text-bege mb-1">{resultado.nome}</p>}
              <p className="font-body text-xs text-bege-escuro/50 mt-2">{resultado.mensagem}</p>
            </>
          )}
        </div>

        {/* CÂMERA QR CODE */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Scanner</h3>
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-sm border transition-all ${
                cameraAtiva
                  ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                  : 'border-dourado/30 text-dourado/70 hover:bg-dourado/10'
              }`}
            >
              {cameraAtiva ? <><CameraOff size={12} /> Parar</> : <><Camera size={12} /> Câmera</>}
            </button>
          </div>

          {/* Container da câmera — sempre renderizado no DOM para o html5-qrcode */}
          <div className={`relative scanner-frame mb-4 overflow-hidden ${!cameraAtiva ? 'flex items-center justify-center bg-black/40' : ''}`}>
            <div id={scannerDivId} className={cameraAtiva ? 'w-full' : 'hidden'} />

            {!cameraAtiva && (
              <button
                onClick={toggleCamera}
                className="flex flex-col items-center gap-2 text-bege-escuro/30 hover:text-dourado/60 transition-colors"
              >
                <Camera size={36} />
                <span className="font-body text-xs">Ativar câmera</span>
              </button>
            )}

            {cameraAtiva && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="scanner-corner-tr" />
                <div className="scanner-corner-bl" />
                <div className="absolute w-full h-0.5 bg-dourado/50 animate-scan top-1/2" />
              </div>
            )}
          </div>

          {/* Input manual */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/35 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputManual}
                onChange={e => setInputManual(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') validarToken(inputManual) }}
                className="admin-input pl-8 font-mono text-sm w-full"
                placeholder="Token manual ou Enter após scan"
                autoComplete="off"
                disabled={loading}
              />
            </div>
            <button
              onClick={() => validarToken(inputManual)}
              disabled={loading || !inputManual.trim()}
              className="btn-primary px-4 py-3 flex items-center gap-2 text-xs disabled:opacity-40 whitespace-nowrap"
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Validar
            </button>
          </div>
        </div>

        {/* HISTÓRICO */}
        {historico.length > 0 && (
          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Histórico</h3>
              <span className="font-body text-xs text-bege-escuro/35">{historico.length} validações</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {historico.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2.5 rounded-sm border ${
                    h.status === 'aprovado'
                      ? 'border-green-500/20 bg-green-500/5'
                      : h.status === 'ja_utilizado'
                      ? 'border-amber-500/20 bg-amber-500/5'
                      : 'border-red-500/15 bg-red-500/5'
                  }`}
                >
                  {h.status === 'aprovado'
                    ? <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                    : h.status === 'ja_utilizado'
                    ? <XCircle size={13} className="text-amber-400 flex-shrink-0" />
                    : <XCircle size={13} className="text-red-400 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-bege truncate">{h.nome ?? 'Desconhecido'}</p>
                    <p className="font-body text-[10px] text-bege-escuro/35 truncate">
                      {h.tipo_ingresso ?? h.status}
                    </p>
                  </div>
                  <span className="font-body text-[10px] text-bege-escuro/30 flex-shrink-0">{h.ts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INFO DO PORTEIRO */}
        <div className="flex items-center justify-between px-1">
          <p className="font-body text-[10px] text-bege-escuro/25">{porteiro.nome} · {porteiro.nivel}</p>
          <p className="font-body text-[10px] text-bege-escuro/25">
            {format(new Date(), "HH:mm", { locale: ptBR })}
          </p>
        </div>

      </div>
    </div>
  )
}
