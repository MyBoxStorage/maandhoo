'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import { QuizVibeCheck } from '@/components/ui/QuizVibeCheck'
import { PERFIS_QUIZ, type PerfilQuiz } from '@/lib/quiz-perfis'
import {
  Loader2, LogOut, Ticket,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock,
  ZoomIn, X, ShieldAlert,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'
import { labelTipoIngresso } from '@/lib/ingresso-utils'

interface Evento { id: string; nome: string; data_evento: string; hora_abertura: string; flyer_url?: string }
interface Ingresso {
  id: string; tipo: string; status: string; serial?: string
  expira_em?: string; created_at: string
  eventos: Evento
  cadastro?: { nome_completo: string; email: string }
}
interface ClienteData {
  id: string; nome: string; email: string
  quiz_feito?: boolean
  quiz_perfil_id?: string
  quiz_respostas?: Record<string, string>
  lgpd_aceito?: boolean
  badge_ativo?: boolean
  tema_ativo?: boolean
}

const STATUS_COR: Record<string, string> = {
  ativo:     'text-green-400 border-green-400/30 bg-green-400/8',
  utilizado: 'text-blue-400 border-blue-400/30 bg-blue-400/8',
  expirado:  'text-bege-escuro/40 border-white/10 bg-white/3',
  cancelado: 'text-red-400 border-red-400/30 bg-red-400/8',
  pendente:  'text-amber-400 border-amber-400/30 bg-amber-400/8',
}
const STATUS_LABEL: Record<string, string> = {
  ativo: 'Ativo', utilizado: 'Utilizado', expirado: 'Expirado',
  cancelado: 'Cancelado', pendente: 'Aguardando',
}

// ── QR Code protegido com zoom e anti-print/screenshot ─────────
function QRProtegido({ src }: { src: string }) {
  const [ampliado, setAmpliado] = useState(false)
  const [printBlock, setPrintBlock] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Renderiza QR em canvas (impede download via salvar imagem)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !src) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = src
  }, [src, ampliado])

  // Detecta tentativa de print/screenshot e exibe bloqueio
  useEffect(() => {
    const bloquear = () => setPrintBlock(true)
    const desbloquear = () => setPrintBlock(false)
    window.addEventListener('beforeprint', bloquear)
    window.addEventListener('afterprint', desbloquear)
    // iOS/Android screenshot heuristic via visibilitychange
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') setPrintBlock(true)
      else setTimeout(() => setPrintBlock(false), 1500)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('beforeprint', bloquear)
      window.removeEventListener('afterprint', desbloquear)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <>
      {/* ── Modal ampliado ── */}
      {ampliado && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: 'rgba(10,8,5,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={() => setAmpliado(false)}
        >
          {/* Overlay de bloqueio de print — dentro do modal */}
          {printBlock && (
            <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center gap-4"
              style={{ background: 'rgba(10,8,5,1)' }}>
              <ShieldAlert size={48} color="#C9A84C" />
              <p style={{ color: '#e8ddd0', fontFamily: 'Georgia,serif', fontSize: '16px', letterSpacing: '3px', textAlign: 'center' }}>
                PROTEÇÃO ATIVADA
              </p>
              <p style={{ color: 'rgba(232,221,208,0.35)', fontSize: '11px', textAlign: 'center', maxWidth: '280px', lineHeight: '1.8' }}>
                O QR Code é protegido contra capturas de tela.<br/>Apresente pessoalmente na entrada.
              </p>
            </div>
          )}

          <div className="relative flex flex-col items-center gap-5 p-8" onClick={e => e.stopPropagation()}>
            <p className="font-accent text-xs tracking-[0.3em] text-dourado/60 uppercase">QR Code — Entrada</p>

            {/* Canvas do QR ampliado */}
            <div
              className="relative bg-[#fefbf5] rounded-sm p-4"
              style={{ boxShadow: '0 0 60px rgba(201,168,76,0.20)' }}
              onContextMenu={e => e.preventDefault()}
            >
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                style={{
                  display: 'block',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  WebkitTouchCallout: 'none',
                }}
              />
              {/* Marca d'água diagonal discreta */}
              <div
                className="absolute inset-0 pointer-events-none select-none"
                style={{
                  background: 'repeating-linear-gradient(-45deg, transparent, transparent 48px, rgba(201,168,76,0.04) 48px, rgba(201,168,76,0.04) 50px)',
                  borderRadius: '2px',
                }}
              />
            </div>

            <p className="font-accent text-[9px] tracking-[0.3em] text-dourado/40 uppercase">Apresente na entrada</p>
            <p className="font-body text-[10px] text-bege-escuro/30">Uso único &middot; Não compartilhe</p>

            <button
              onClick={() => setAmpliado(false)}
              className="flex items-center gap-2 px-5 py-2.5 border border-dourado/25 rounded-sm text-bege-escuro/50 hover:text-bege hover:border-dourado/40 transition-colors"
            >
              <X size={13} />
              <span className="font-accent text-[10px] tracking-[0.2em] uppercase">Fechar</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Visualização inline (miniatura) ── */}
      <div
        className="flex flex-col items-center gap-3"
        onContextMenu={e => e.preventDefault()}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {/* Miniatura do QR em canvas */}
        <div
          className="relative bg-[#fefbf5] p-2.5 rounded-sm cursor-pointer group"
          style={{ border: '1px solid rgba(201,168,76,0.20)' }}
          onClick={() => setAmpliado(true)}
        >
          <img
            src={src}
            width={160}
            height={160}
            alt="QR Code"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            style={{
              display: 'block',
              pointerEvents: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          />
          {/* Overlay hover com ícone de zoom */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-sm flex items-center justify-center">
            <ZoomIn size={28} className="text-white/0 group-hover:text-white/80 transition-all drop-shadow-lg" />
          </div>
        </div>

        <button
          onClick={() => setAmpliado(true)}
          className="flex items-center gap-1.5 text-dourado/50 hover:text-dourado transition-colors"
        >
          <ZoomIn size={12} />
          <span className="font-accent text-[9px] tracking-[0.2em] uppercase">Ampliar QR Code</span>
        </button>

        <p className="font-accent text-[9px] tracking-[0.3em] text-dourado/40 uppercase">Apresente na entrada</p>
        <p className="font-body text-[10px] text-bege-escuro/25">Uso único &middot; Não compartilhe</p>
      </div>
    </>
  )
}


function BadgeMini({ perfil }: { perfil: PerfilQuiz }) {
  return (
    <div className="relative flex items-center justify-center" style={{ filter: `drop-shadow(0 0 6px ${perfil.corGlow})` }}>
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`hbg-${perfil.id}`} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor={perfil.corSecundaria} stopOpacity="0.95"/>
            <stop offset="100%" stopColor={perfil.corPrimaria} stopOpacity="0.8"/>
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill={`url(#hbg-${perfil.id})`}/>
        <circle cx="16" cy="16" r="14" fill="none" stroke={perfil.corPrimaria} strokeWidth="1.5" opacity="0.7"/>
        <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <circle cx="16" cy="10" r="2" fill="rgba(255,255,255,0.8)"/>
        <circle cx="10" cy="19" r="2" fill="rgba(255,255,255,0.6)"/>
        <circle cx="22" cy="19" r="2" fill="rgba(255,255,255,0.6)"/>
        <line x1="10" y1="19" x2="16" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
        <line x1="22" y1="19" x2="16" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
        <line x1="10" y1="19" x2="22" y2="19" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
      </svg>
    </div>
  )
}

export default function MinhaContaPage() {
  const router = useRouter()
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aberto, setAberto] = useState<string | null>(null)
  const [qrMap, setQrMap] = useState<Record<string, string>>({})
  const [qrLoading, setQrLoading] = useState<string | null>(null)
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilQuiz | null>(null)
  const [badgeAtivo, setBadgeAtivo] = useState(false)
  const [temaAtivo, setTemaAtivo] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const [resAuth, resIng] = await Promise.all([
      fetch('/api/cliente/auth'),
      fetch('/api/cliente/ingressos'),
    ])
    if (!resAuth.ok) { router.replace('/acesso'); return }
    const { cliente: c } = await resAuth.json()
    const { ingressos: ing } = await resIng.json()
    setCliente(c)
    setIngressos(ing ?? [])

    // Carrega perfil salvo
    if (c.quiz_perfil_id && PERFIS_QUIZ[c.quiz_perfil_id]) {
      setPerfilAtivo(PERFIS_QUIZ[c.quiz_perfil_id])
    }
    setBadgeAtivo(!!c.badge_ativo)
    setTemaAtivo(!!c.tema_ativo)
    setCarregando(false)
  }, [router])

  useEffect(() => { carregar() }, [carregar])

  const carregarQR = async (ingressoId: string) => {
    if (qrMap[ingressoId]) { setAberto(ingressoId); return }
    setQrLoading(ingressoId)
    try {
      const res = await fetch(`/api/cliente/qr?ingresso_id=${ingressoId}`)
      const data = await res.json()
      if (data.qr) {
        setQrMap(prev => ({ ...prev, [ingressoId]: data.qr }))
        setAberto(ingressoId)
      } else { toast.error(data.erro ?? 'Erro ao carregar QR Code') }
    } catch { toast.error('Erro de conexão') }
    finally { setQrLoading(null) }
  }

  const toggleIngresso = (id: string, status: string) => {
    if (aberto === id) { setAberto(null); return }
    if (status === 'ativo') carregarQR(id)
    else setAberto(id)
  }

  const logout = async () => {
    await fetch('/api/cliente/auth', { method: 'DELETE' })
    router.replace('/acesso')
  }

  const handlePerfilDefinido = (p: PerfilQuiz, badge: boolean, tema: boolean) => {
    setPerfilAtivo(p)
    setBadgeAtivo(badge)
    setTemaAtivo(tema)
  }

  if (carregando) return (
    <div className="min-h-screen bg-preto-profundo flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-dourado/40" />
    </div>
  )

  // Variáveis CSS de tema dinâmico
  const temaVars = temaAtivo && perfilAtivo ? {
    '--tema-cor': perfilAtivo.corPrimaria,
    '--tema-glow': perfilAtivo.corGlow,
    '--tema-border': `${perfilAtivo.corPrimaria}25`,
  } as React.CSSProperties : {}

  return (
    <>
      <style>{`
        /* ── Anti-print global ── */
        @media print {
          body * { visibility: hidden !important; display: none !important; }
          .print-block-overlay {
            display: flex !important;
            visibility: visible !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 99999 !important;
          }
        }
        /* Impede seleção de texto e arrastar em toda a página */
        .qr-zona {
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        /* Desabilita pointer events nos elementos de QR */
        .qr-zona img, .qr-zona canvas {
          pointer-events: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        /* Tema dinâmico do perfil */
        .tema-ativo .border-dourado\\/10 { border-color: var(--tema-border, rgba(201,168,76,0.1)); }
        .tema-ativo .border-dourado\\/20 { border-color: var(--tema-border, rgba(201,168,76,0.2)); }
        .tema-ativo .text-dourado { color: var(--tema-cor, #C9A84C); }
        .tema-ativo .border-b.border-dourado\\/10 {
          border-bottom-color: var(--tema-border);
          box-shadow: 0 1px 0 0 var(--tema-glow);
        }
      `}</style>

      {/* ── Overlay global de bloqueio de print ── */}
      <div
        className="print-block-overlay"
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: '#0d0a07',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <ShieldAlert size={52} color="#C9A84C" />
        <p style={{ color: '#e8ddd0', fontFamily: 'Georgia,serif', fontSize: '18px', letterSpacing: '3px', textAlign: 'center' }}>
          IMPRESSÃO NÃO PERMITIDA
        </p>
        <p style={{ color: 'rgba(232,221,208,0.4)', fontSize: '12px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.8' }}>
          O QR Code é de uso único e pessoal.<br />Apresente diretamente pelo celular na entrada.
        </p>
      </div>

      <div
        className={`min-h-screen bg-preto-profundo pb-16 ${temaAtivo && perfilAtivo ? 'tema-ativo' : ''}`}
        style={temaVars}
      >
        <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-preto-profundo/95 backdrop-blur-sm border-b border-dourado/10 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoElefante width={28} height={31} color="#C9A84C" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-accent text-xs tracking-widest text-bege leading-none">MINHA CONTA</p>
                  {/* Badge no header — só aparece se quiz feito + badge ativo */}
                  {badgeAtivo && perfilAtivo && (
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <BadgeMini perfil={perfilAtivo} />
                      <span
                        className="font-accent text-[9px] tracking-[0.2em] uppercase hidden sm:block"
                        style={{ color: perfilAtivo.corPrimaria }}
                      >
                        {perfilAtivo.nome}
                      </span>
                    </div>
                  )}
                </div>
                <p className="font-body text-[10px] text-bege-escuro/40 mt-0.5">{cliente?.nome}</p>
              </div>
            </div>
            <button onClick={logout} className="text-bege-escuro/30 hover:text-bege-escuro/70 transition-colors flex items-center gap-1.5">
              <LogOut size={14} />
              <span className="font-body text-xs">Sair</span>
            </button>
          </div>

          {/* Linha de tema sob o header */}
          {temaAtivo && perfilAtivo && (
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(to right, transparent, ${perfilAtivo.corPrimaria}50, transparent)` }}
            />
          )}
        </div>

        {/* ── CORPO ──────────────────────────────────────────────── */}
        <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

          {/* ── INGRESSOS — primeiro ──────────────────────────────── */}
          <div className="flex items-center gap-2">
            <Ticket size={14} className="text-dourado/60" />
            <h2 className="font-accent text-xs tracking-[0.3em] uppercase text-bege-escuro/60">Meus Ingressos</h2>
            <span className="font-body text-xs text-bege-escuro/30">({ingressos.length})</span>
          </div>

          {ingressos.length === 0 && (
            <div className="border border-dourado/15 rounded-sm p-10 text-center">
              <Ticket size={32} className="text-bege-escuro/15 mx-auto mb-3" />
              <p className="font-body text-sm text-bege-escuro/40">Nenhum ingresso encontrado.</p>
              <p className="font-body text-xs text-bege-escuro/25 mt-1">Seus ingressos aparecerão aqui após o cadastro.</p>
            </div>
          )}

          {ingressos.map(ing => {
            const dataISO = ing.eventos?.data_evento?.length === 10
              ? `${ing.eventos.data_evento}T00:00:00` : ing.eventos?.data_evento
            const dataFormatada = dataISO ? format(new Date(dataISO), 'dd/MM/yyyy', { locale: ptBR }) : '—'
            const cor = STATUS_COR[ing.status] ?? STATUS_COR['pendente']
            const isAberto = aberto === ing.id
            const qrAtivo = ing.status === 'ativo'

            return (
              <div key={ing.id} className={`border rounded-sm overflow-hidden transition-all ${isAberto ? 'border-dourado/30' : 'border-white/8'}`}>
                <button onClick={() => toggleIngresso(ing.id, ing.status)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
                  {ing.eventos?.flyer_url && (
                    <img src={ing.eventos.flyer_url} alt="" className="w-10 h-14 object-cover rounded-sm flex-shrink-0 opacity-75" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-bege truncate">{ing.eventos?.nome ?? '—'}</p>
                    <p className="font-body text-xs text-bege-escuro/45 mt-0.5">{dataFormatada} · {labelTipoIngresso(ing.tipo)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs border px-2 py-1 rounded-sm font-accent tracking-wider ${cor}`}>
                      {STATUS_LABEL[ing.status] ?? ing.status}
                    </span>
                    {isAberto ? <ChevronUp size={14} className="text-bege-escuro/40" /> : <ChevronDown size={14} className="text-bege-escuro/40" />}
                  </div>
                </button>

                {isAberto && (
                  <div className="border-t border-dourado/10 bg-black/20 p-5">
                    {qrAtivo && (
                      <div className="qr-zona flex flex-col items-center mb-5">
                        {qrLoading === ing.id ? (
                          <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 size={28} className="animate-spin text-dourado/40" />
                            <p className="font-body text-xs text-bege-escuro/40">Carregando QR Code...</p>
                          </div>
                        ) : qrMap[ing.id] ? (
                          <QRProtegido src={qrMap[ing.id]} />
                        ) : null}
                      </div>
                    )}
                    {ing.status === 'utilizado' && (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <CheckCircle2 size={32} className="text-blue-400" />
                        <p className="font-accent text-xs tracking-widest text-blue-400 uppercase">Ingresso Utilizado</p>
                        <p className="font-body text-xs text-bege-escuro/40">Entrada registrada com sucesso.</p>
                      </div>
                    )}
                    {(ing.status === 'expirado' || ing.status === 'cancelado') && (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <AlertTriangle size={28} className="text-bege-escuro/30" />
                        <p className="font-body text-xs text-bege-escuro/40">
                          {ing.status === 'cancelado' ? 'Este ingresso foi cancelado.' : 'Este ingresso expirou.'}
                        </p>
                      </div>
                    )}
                    {ing.status === 'pendente' && (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <Clock size={28} className="text-amber-400/50" />
                        <p className="font-body text-xs text-bege-escuro/40">Aguardando confirmação do pagamento.</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {ing.cadastro?.nome_completo && (
                        <div>
                          <p className="font-accent text-[8px] tracking-[0.3em] uppercase text-bege-escuro/35 mb-1">Portador</p>
                          <p className="font-body text-xs text-bege-escuro/60">{ing.cadastro.nome_completo}</p>
                        </div>
                      )}
                      {ing.serial && (
                        <div>
                          <p className="font-accent text-[8px] tracking-[0.3em] uppercase text-bege-escuro/35 mb-1">Serial</p>
                          <p className="font-mono text-xs text-bege-escuro/40">{ing.serial}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-dourado/15 to-transparent" />

          {/* ── QUIZ VIBE CHECK — após ingressos ─────────────────── */}
          <QuizVibeCheck
            clienteId={cliente!.id}
            clienteNome={cliente!.nome}
            quizJaFeito={!!cliente?.quiz_feito}
            perfilSalvo={perfilAtivo}
            respostasSalvas={cliente?.quiz_respostas ?? null}
            lgpdAceito={!!cliente?.lgpd_aceito}
            badgeAtivo={badgeAtivo}
            temaAtivo={temaAtivo}
            onPerfilDefinido={handlePerfilDefinido}
          />

        </div>
      </div>
    </>
  )
}
