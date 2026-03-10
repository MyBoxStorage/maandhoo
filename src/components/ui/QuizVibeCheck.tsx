'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, RotateCcw, ChevronRight, Sparkles, Lock, CheckCheck, Music, Share2, Loader2 } from 'lucide-react'
import { PERGUNTAS_QUIZ } from '@/lib/quiz-perguntas'
import { calcularPerfilQuiz, type PerfilQuiz } from '@/lib/quiz-perfis'

const VERSAO_LGPD = '1.0'

type Fase = 'cta' | 'consentimento' | 'quiz' | 'resultado'

interface Props {
  clienteId: string
  clienteNome: string
  quizJaFeito?: boolean
  perfilSalvo?: PerfilQuiz | null
  respostasSalvas?: Record<string, string> | null
  lgpdAceito?: boolean
  badgeAtivo?: boolean
  temaAtivo?: boolean
  onPerfilDefinido?: (p: PerfilQuiz, badge: boolean, tema: boolean) => void
}

// ── BADGE SVG ────────────────────────────────────────────────────
function BadgeSVG({ perfil, size = 100 }: { perfil: PerfilQuiz; size?: number }) {
  const cx = size / 2
  const icones: Record<string, string> = {
    coroa: `<path d="M${cx*0.5} ${cx*1.4} L${cx*1.5} ${cx*1.4} L${cx*1.4} ${cx} L${cx} ${cx*0.8} L${cx*0.6} ${cx} Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${cx*0.4}" cy="${cx}" r="${cx*0.08}" fill="white"/><circle cx="${cx*1.6}" cy="${cx}" r="${cx*0.08}" fill="white"/><circle cx="${cx}" cy="${cx*0.7}" r="${cx*0.08}" fill="white"/>`,
    chama: `<path d="M${cx} ${cx*0.5} C${cx} ${cx*0.5} ${cx*0.55} ${cx} ${cx*0.55} ${cx*1.2} C${cx*0.55} ${cx*1.5} ${cx*0.75} ${cx*1.65} ${cx} ${cx*1.65} C${cx*1.25} ${cx*1.65} ${cx*1.45} ${cx*1.5} ${cx*1.45} ${cx*1.2} C${cx*1.45} ${cx} ${cx} ${cx*0.5} ${cx} ${cx*0.5}Z" fill="rgba(255,255,255,0.8)"/>`,
    compasso: `<circle cx="${cx}" cy="${cx}" r="${cx*0.55}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/><circle cx="${cx}" cy="${cx}" r="${cx*0.1}" fill="white"/><line x1="${cx}" y1="${cx}" x2="${cx*1.25}" y2="${cx*0.6}" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
    bussola: `<circle cx="${cx}" cy="${cx}" r="${cx*0.55}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none"/><polygon points="${cx},${cx*0.55} ${cx*1.1},${cx} ${cx},${cx*0.9} ${cx*0.9},${cx}" fill="white" opacity="0.9"/><polygon points="${cx},${cx*1.45} ${cx*1.1},${cx} ${cx},${cx*1.1} ${cx*0.9},${cx}" fill="rgba(255,255,255,0.35)"/>`,
    lua: `<path d="M${cx*1.3} ${cx*0.75} C${cx*1.3} ${cx*1.35} ${cx*0.9} ${cx*1.6} ${cx*0.55} ${cx*1.5} C${cx*0.35} ${cx*1.75} ${cx*0.8} ${cx*1.85} ${cx} ${cx*1.75} C${cx*1.4} ${cx*1.75} ${cx*1.65} ${cx*1.3} ${cx*1.65} ${cx} C${cx*1.65} ${cx*0.8} ${cx*1.55} ${cx*0.6} ${cx*1.3} ${cx*0.75}Z" fill="rgba(255,255,255,0.8)"/>`,
    notas: `<circle cx="${cx*0.8}" cy="${cx*1.3}" r="${cx*0.18}" fill="rgba(255,255,255,0.85)"/><circle cx="${cx*1.2}" cy="${cx*1.1}" r="${cx*0.18}" fill="rgba(255,255,255,0.7)"/><line x1="${cx*0.98}" y1="${cx*1.3}" x2="${cx*0.98}" y2="${cx*0.55}" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="${cx*1.38}" y1="${cx*1.1}" x2="${cx*1.38}" y2="${cx*0.5}" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round"/><line x1="${cx*0.98}" y1="${cx*0.55}" x2="${cx*1.38}" y2="${cx*0.5}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>`,
    raio: `<polygon points="${cx*1.1},${cx*0.35} ${cx*0.65},${cx} ${cx},${cx} ${cx*0.9},${cx*1.65} ${cx*1.35},${cx*0.85} ${cx},${cx*0.85}" fill="rgba(255,255,255,0.9)"/>`,
    diamante: `<polygon points="${cx},${cx*0.4} ${cx*1.5},${cx} ${cx},${cx*1.6} ${cx*0.5},${cx}" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/><line x1="${cx*0.5}" y1="${cx}" x2="${cx*1.5}" y2="${cx}" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>`,
    trofeu: `<path d="M${cx*0.7} ${cx*0.55} L${cx*1.3} ${cx*0.55} L${cx*1.3} ${cx*1.05} C${cx*1.3} ${cx*1.3} ${cx*1.15} ${cx*1.45} ${cx} ${cx*1.45} C${cx*0.85} ${cx*1.45} ${cx*0.7} ${cx*1.3} ${cx*0.7} ${cx*1.05} Z" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/><line x1="${cx}" y1="${cx*1.45}" x2="${cx}" y2="${cx*1.65}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round"/><line x1="${cx*0.75}" y1="${cx*1.65}" x2="${cx*1.25}" y2="${cx*1.65}" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>`,
    estrelas: `<polygon points="${cx},${cx*0.4} ${cx*1.12},${cx*0.8} ${cx*1.55},${cx*0.8} ${cx*1.2},${cx*1.05} ${cx*1.32},${cx*1.5} ${cx},${cx*1.25} ${cx*0.68},${cx*1.5} ${cx*0.8},${cx*1.05} ${cx*0.45},${cx*0.8} ${cx*0.88},${cx*0.8}" fill="rgba(255,255,255,0.85)"/>`,
    flash: `<polygon points="${cx*1.1},${cx*0.35} ${cx*0.65},${cx*1.05} ${cx*0.97},${cx*1.05} ${cx*0.9},${cx*1.65} ${cx*1.35},${cx*0.9} ${cx*1.03},${cx*0.9}" fill="rgba(255,255,255,0.9)"/>`,
    diamante_oval: `<ellipse cx="${cx}" cy="${cx}" rx="${cx*0.55}" ry="${cx*0.7}" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/><line x1="${cx*0.45}" y1="${cx*0.7}" x2="${cx*1.55}" y2="${cx*0.7}" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/><line x1="${cx*0.45}" y1="${cx*1.3}" x2="${cx*1.55}" y2="${cx*1.3}" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>`,
  }
  const icone = icones[perfil.iconeId] || icones.estrelas
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`g${perfil.id}`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={perfil.corSecundaria} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={perfil.corPrimaria} stopOpacity="0.8"/>
        </radialGradient>
        <filter id={`gl${perfil.id}`}><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      </defs>
      <circle cx={cx} cy={cx} r={cx-2} fill={`url(#g${perfil.id})`}/>
      <circle cx={cx} cy={cx} r={cx-2} fill="none" stroke={perfil.corPrimaria} strokeWidth="2.5" opacity="0.7"/>
      <circle cx={cx} cy={cx} r={cx-6} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <g dangerouslySetInnerHTML={{ __html: icone }} filter={`url(#gl${perfil.id})`}/>
      <circle cx={cx} cy={cx*0.55} r={cx*0.3} fill="white" opacity="0.05"/>
    </svg>
  )
}

// ── CHECKBOX LGPD ────────────────────────────────────────────────
function CheckboxLGPD({ checked, onChange, variant = 'full' }: {
  checked: boolean; onChange: (v: boolean) => void; variant?: 'full' | 'compact'
}) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer group select-none ${variant === 'compact' ? 'p-4 border border-dourado/20 rounded-sm bg-dourado/[0.03] hover:bg-dourado/[0.06]' : ''} transition-all duration-200`}>
      <div
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-dourado border-dourado' : 'border-bege-escuro/30 group-hover:border-dourado/50'}`}
        onClick={() => onChange(!checked)}
      >
        {checked && <CheckCheck size={11} className="text-preto-profundo" strokeWidth={3}/>}
      </div>
      <div onClick={() => onChange(!checked)}>
        {variant === 'full' ? (
          <>
            <p className="font-body text-xs text-bege-escuro/80 leading-relaxed">
              <span className="text-dourado font-medium">Quero participar dos sorteios semanais</span> e receber ofertas personalizadas.
              Autorizo a Maandhoo e parceiros a compartilharem meu perfil para melhorar produtos, serviços e tornar minha experiência
              PREMIUM com propostas exclusivas e promoções em Balneário Camboriú.
            </p>
            <p className="font-body text-[10px] text-bege-escuro/35 mt-1.5 leading-relaxed">
              Você pode revogar este consentimento a qualquer momento em Configurações. Seus dados são tratados
              conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
            </p>
          </>
        ) : (
          <p className="font-body text-xs text-bege-escuro/70 leading-relaxed">
            <span className="text-dourado/90 font-medium">Desbloquear badge e tema</span> — autorize o compartilhamento do seu perfil
            com parceiros e participe dos sorteios semanais.
          </p>
        )}
      </div>
    </label>
  )
}

// ── CARD PLAYLIST BLOQUEADO ───────────────────────────────────────
// Aparece na tela CTA antes do quiz, sempre visível mas trancado
function PlaylistBloqueadaCard({ onFazerQuiz }: { onFazerQuiz: () => void }) {
  return (
    <div className="relative border border-white/8 rounded-sm overflow-hidden bg-black/30">
      {/* Waveform simulado — fica atrás do overlay */}
      <div className="flex items-end gap-0.5 px-4 pt-3 pb-2 opacity-15 pointer-events-none select-none" aria-hidden>
        {[30,55,40,72,48,65,28,82,52,38,68,44,78,35,60,42,75,33,58,45].map((h, i) => (
          <div key={i} className="flex-1 bg-dourado rounded-full" style={{ height: `${h * 0.45}px` }}/>
        ))}
      </div>
      {/* Linha de progresso falsa */}
      <div className="flex items-center gap-2 px-4 pb-3 pointer-events-none select-none" aria-hidden>
        <span className="font-body text-[9px] text-bege-escuro/15">0:00</span>
        <div className="flex-1 h-0.5 bg-white/8 rounded-full">
          <div className="w-1/4 h-full bg-dourado/20 rounded-full"/>
        </div>
        <span className="font-body text-[9px] text-bege-escuro/15">--:--</span>
      </div>
      {/* Overlay principal */}
      <div className="absolute inset-0 backdrop-blur-[3px] bg-black/55 flex flex-col items-center justify-center gap-3 py-4">
        {/* Anel pulsante + cadeado */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-14 h-14 rounded-full border border-dourado/20 animate-ping" style={{ animationDuration: '2.8s' }}/>
          <div className="absolute w-10 h-10 rounded-full border border-dourado/15 animate-ping" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }}/>
          <div className="relative w-11 h-11 rounded-full border border-dourado/30 bg-black/60 flex items-center justify-center">
            <Lock size={15} className="text-dourado/45" />
          </div>
        </div>
        {/* Texto */}
        <div className="text-center px-5">
          <p className="font-accent text-[9px] tracking-[0.4em] text-bege-escuro/35 uppercase mb-1.5">Playlist personalizada</p>
          <p className="font-body text-xs text-bege-escuro/50 leading-snug">
            Faça o quiz e desbloqueie<br/>a trilha sonora do seu perfil
          </p>
        </div>
        {/* CTA */}
        <button
          onClick={onFazerQuiz}
          className="font-accent text-[9px] tracking-[0.35em] uppercase text-dourado/55 border border-dourado/18 px-5 py-2 rounded-sm hover:border-dourado/50 hover:text-dourado/90 transition-all duration-300 hover:bg-dourado/[0.05]"
        >
          Fazer Quiz
        </button>
      </div>
      {/* Rodapé com ícone de música */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/5 bg-black/20">
        <Music size={10} className="text-bege-escuro/15" />
        <p className="font-accent text-[9px] tracking-[0.3em] text-bege-escuro/20 uppercase">Sua playlist te aguarda</p>
      </div>
    </div>
  )
}

// ── PLAYER SPOTIFY (desbloqueado, com efeito de unlock) ──────────
function SpotifyPlayer({ perfil, recemDesbloqueado = false }: {
  perfil: PerfilQuiz; recemDesbloqueado?: boolean
}) {
  const embedUrl = perfil.playlistUrl.replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/') + '?utm_source=generator&theme=0'

  return (
    <div
      className="relative border rounded-sm overflow-hidden"
      style={{
        borderColor: `${perfil.corPrimaria}35`,
        boxShadow: recemDesbloqueado
          ? `0 0 40px ${perfil.corGlow}, 0 0 80px ${perfil.corGlow}`
          : `0 0 16px ${perfil.corGlow}`,
        transition: 'box-shadow 1.2s ease-out',
      }}
    >
      {/* Onda de luz varrendo o card ao desbloquear */}
      {recemDesbloqueado && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `linear-gradient(110deg, transparent 20%, ${perfil.corPrimaria}50 50%, transparent 80%)`,
            animation: 'swipeUnlock 0.85s ease-out forwards',
          }}
        />
      )}
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-black/40" style={{ borderColor: `${perfil.corPrimaria}15` }}>
        <Music size={12} style={{ color: `${perfil.corPrimaria}90` }} />
        <p className="font-accent text-[10px] tracking-[0.25em] uppercase" style={{ color: `${perfil.corPrimaria}80` }}>
          Sua Playlist
        </p>
        <span className="font-body text-[10px] text-bege-escuro/40 ml-auto">{perfil.playlistNome}</span>
      </div>
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ border: 'none', display: 'block', background: 'transparent' }}
      />
    </div>
  )
}

// ── OVERLAY DE DESBLOQUEIO ────────────────────────────────────────
// Tela cheia momentânea com logo Maandhoo + cor do perfil
function DesbloqueioOverlay({ perfil, onFim }: { perfil: PerfilQuiz; onFim: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFim, 2400)
    return () => clearTimeout(t)
  }, [onFim])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#09070400', animation: 'overlayFade 2.4s ease-in-out forwards' }}
    >
      <style>{`
        @keyframes overlayFade {
          0%   { opacity: 0; background: #090704; }
          12%  { opacity: 1; background: #090704; }
          75%  { opacity: 1; background: #090704; }
          100% { opacity: 0; background: #090704; }
        }
        @keyframes ringGrow {
          0%   { transform: scale(0.2); opacity: 0.9; }
          100% { transform: scale(4.5); opacity: 0; }
        }
        @keyframes logoEntry {
          0%   { transform: scale(0.5) rotate(-8deg); opacity: 0; filter: brightness(0.5) blur(8px); }
          50%  { transform: scale(1.12) rotate(2deg); opacity: 1; filter: brightness(2.5) blur(0px); }
          75%  { transform: scale(1.0) rotate(0deg); opacity: 1; filter: brightness(1.8); }
          100% { transform: scale(1.0); opacity: 1; filter: brightness(1.2); }
        }
        @keyframes textUp {
          0%   { opacity: 0; transform: translateY(16px); letter-spacing: 0.6em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.4em; }
        }
        @keyframes subtextUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes swipeUnlock {
          0%   { transform: translateX(-110%); }
          100% { transform: translateX(210%); }
        }
      `}</style>

      {/* Fundo radial na cor do perfil */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${perfil.corGlow}, transparent 65%)`,
          opacity: 0.25,
        }}
      />

      {/* Anéis expansivos — 3 com delay escalonado */}
      {[0, 0.25, 0.5].map((delay, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 100, height: 100,
            border: `1.5px solid ${perfil.corPrimaria}`,
            opacity: 0,
            animation: `ringGrow 1.8s cubic-bezier(0.2, 0.8, 0.4, 1) ${delay}s forwards`,
          }}
        />
      ))}

      {/* Logo Maandhoo — símbolo ✦ com estilo */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ animation: 'logoEntry 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}
      >
        {/* Glow layer atrás do ícone */}
        <div
          className="absolute rounded-full"
          style={{
            width: 120, height: 120,
            background: `radial-gradient(circle, ${perfil.corGlow}, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            border: `2px solid ${perfil.corPrimaria}80`,
            background: `radial-gradient(circle at 40% 35%, ${perfil.corSecundaria}cc, ${perfil.corPrimaria}88)`,
            boxShadow: `0 0 40px ${perfil.corGlow}, inset 0 0 20px rgba(255,255,255,0.1)`,
          }}
        >
          <span style={{ fontSize: 42, color: 'rgba(255,255,255,0.9)', lineHeight: 1, textShadow: '0 0 20px rgba(255,255,255,0.6)' }}>✦</span>
        </div>
      </div>

      {/* Textos */}
      <div className="relative z-10 mt-10 text-center px-6">
        <p
          className="font-accent text-[10px] uppercase mb-3"
          style={{ color: `${perfil.corPrimaria}90`, animation: 'textUp 0.6s ease-out 0.55s both' }}
        >
          Playlist desbloqueada
        </p>
        <p
          className="font-display text-3xl"
          style={{ color: perfil.corPrimaria, textShadow: `0 0 24px ${perfil.corGlow}`, animation: 'subtextUp 0.6s ease-out 0.65s both' }}
        >
          {perfil.nome}
        </p>
        <p
          className="font-body text-sm mt-2"
          style={{ color: `${perfil.corPrimaria}70`, animation: 'subtextUp 0.6s ease-out 0.8s both' }}
        >
          {perfil.playlistNome}
        </p>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export function QuizVibeCheck({
  clienteId, clienteNome,
  quizJaFeito = false, perfilSalvo = null, respostasSalvas = null,
  lgpdAceito: lgpdInicial = false,
  badgeAtivo: badgeInicial = false, temaAtivo: temaInicial = false,
  onPerfilDefinido,
}: Props) {
  const primeiroNome = clienteNome.split(' ')[0]
  const [fase, setFase] = useState<Fase>(quizJaFeito && perfilSalvo ? 'resultado' : 'cta')
  const [lgpdChecked, setLgpdChecked] = useState(lgpdInicial)
  const [perguntaIdx, setPerguntaIdx] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>(respostasSalvas || {})
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null)
  const [saindo, setSaindo] = useState(false)
  const [perfil, setPerfil] = useState<PerfilQuiz | null>(perfilSalvo)
  const [badgeAtivo, setBadgeAtivo] = useState(badgeInicial)
  const [temaAtivo, setTemaAtivo] = useState(temaInicial)
  const [salvando, setSalvando] = useState(false)
  const [refazendo, setRefazendo] = useState(false)
  const [compartilhando, setCompartilhando] = useState(false)
  // Controla o overlay de desbloqueio e o efeito no player
  const [mostrarOverlay, setMostrarOverlay] = useState(false)
  const [recemDesbloqueado, setRecemDesbloqueado] = useState(false)

  // Reset do efeito "recém desbloqueado" no player após a animação
  useEffect(() => {
    if (recemDesbloqueado) {
      const t = setTimeout(() => setRecemDesbloqueado(false), 3000)
      return () => clearTimeout(t)
    }
  }, [recemDesbloqueado])

  const iniciarRefazer = () => setRefazendo(true)
  const confirmarRefazer = () => {
    setRefazendo(false)
    // Se LGPD já foi aceito antes, pula tela de consentimento e vai direto ao quiz
    setFase(lgpdInicial ? 'quiz' : 'consentimento')
    setPerguntaIdx(0); setRespostas({}); setOpcaoSelecionada(null)
    setPerfil(null); setBadgeAtivo(false); setTemaAtivo(false)
    setRecemDesbloqueado(false)
  }

  const salvarQuiz = useCallback(async (resp: Record<string, string>, p: PerfilQuiz, lgpd: boolean) => {
    setSalvando(true)
    try {
      await fetch('/api/cliente/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: resp, perfil_id: p.id, perfil_nome: p.nome, lgpd_aceito: lgpd, lgpd_versao: VERSAO_LGPD }),
      })
    } catch {}
    setSalvando(false)
  }, [])

  const selecionar = useCallback((valor: string) => {
    if (opcaoSelecionada) return
    setOpcaoSelecionada(valor)
    const novasRespostas = { ...respostas, [PERGUNTAS_QUIZ[perguntaIdx].id]: valor }
    setRespostas(novasRespostas)

    setTimeout(() => {
      if (perguntaIdx < PERGUNTAS_QUIZ.length - 1) {
        setSaindo(true)
        setTimeout(() => {
          setPerguntaIdx(p => p + 1)
          setOpcaoSelecionada(null)
          setSaindo(false)
        }, 280)
      } else {
        const p = calcularPerfilQuiz(novasRespostas)
        setPerfil(p)
        salvarQuiz(novasRespostas, p, lgpdChecked)
        // Vai para resultado imediatamente, depois dispara overlay sobre ele
        setFase('resultado')
        setTimeout(() => {
          setMostrarOverlay(true)
          setRecemDesbloqueado(true)
        }, 100)
      }
    }, 550)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opcaoSelecionada, respostas, perguntaIdx, lgpdChecked, salvarQuiz])

  const aplicarBadge = async () => {
    try {
      await fetch('/api/cliente/preferencias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge_ativo: true }),
      })
      setBadgeAtivo(true)
      onPerfilDefinido?.(perfil!, true, temaAtivo)
    } catch {}
  }

  const aplicarTema = async () => {
    try {
      await fetch('/api/cliente/preferencias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema_ativo: true }),
      })
      setTemaAtivo(true)
      onPerfilDefinido?.(perfil!, badgeAtivo, true)
    } catch {}
  }

  const compartilharBadge = async () => {
    if (!perfil) return
    setCompartilhando(true)
    try {
      const url = `/api/cliente/badge-share?perfil=${perfil.id}&nome=${encodeURIComponent(clienteNome)}`
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const res = await fetch(url)
          const blob = await res.blob()
          const file = new File([blob], `maandhoo-${perfil.id}.svg`, { type: 'image/svg+xml' })
          await navigator.share({
            title: `Sou ${perfil.nome} na Maandhoo`,
            text: `${perfil.subtitulo} — Maandhoo Club, Balneário Camboriú`,
            files: [file],
          })
          setCompartilhando(false)
          return
        } catch { /* share cancelado, cai no fallback */ }
      }
      window.open(url, '_blank')
    } catch {}
    setCompartilhando(false)
  }

  // ── FASE: CTA ──────────────────────────────────────────────────
  if (fase === 'cta') return (
    <div className="space-y-3">
      {/* Card principal do quiz */}
      <div className="relative border border-dourado/20 rounded-sm overflow-hidden bg-gradient-to-br from-black/50 via-[#0d0900]/70 to-black/50">
        {/* Glow radial no canto superior direito */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(201,168,76,0.12),transparent_60%)] pointer-events-none"/>
        {/* Linha dourada no topo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dourado/40 to-transparent"/>

        <div className="relative px-5 py-5">
          {/* Label topo */}
          <p className="font-accent text-[9px] tracking-[0.45em] text-dourado/50 uppercase mb-3">Exclusivo para membros</p>

          <div className="flex items-start gap-4">
            {/* Ícone */}
            <div className="flex-shrink-0 w-12 h-12 rounded-sm border border-dourado/25 flex items-center justify-center bg-dourado/5 relative overflow-hidden mt-0.5">
              <div className="absolute inset-0 bg-dourado/10 animate-pulse" style={{ animationDuration: '2.5s' }}/>
              <Sparkles size={22} className="text-dourado relative z-10"/>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl text-bege leading-tight mb-2">
                Qual é a sua <span style={{ color: '#C9A84C' }}>vibe</span> na Maandhoo?
              </h3>
              <p className="font-body text-xs text-bege-escuro/55 leading-relaxed">
                7 perguntas · descubra seu perfil na noite, badge exclusivo e playlist personalizada para o seu gosto.{' '}
                <span className="text-dourado/70">Da play na sua música e fica à vontade, porque aqui é sua casa.</span>
              </p>
            </div>
          </div>

          {/* Botão full-width na base */}
          <button
            onClick={() => setFase('consentimento')}
            className="mt-4 w-full group flex items-center justify-center gap-2 bg-dourado hover:bg-dourado/90 text-preto-profundo font-accent text-xs tracking-widest uppercase px-5 py-3 rounded-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(201,168,76,0.35)]"
          >
            Fazer Quiz <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform"/>
          </button>
        </div>
      </div>
      {/* Card de playlist bloqueada — sempre visível, convida a fazer quiz */}
      <PlaylistBloqueadaCard onFazerQuiz={() => setFase('consentimento')} />
    </div>
  )

  // ── FASE: CONSENTIMENTO ─────────────────────────────────────────
  if (fase === 'consentimento') return (
    <div className="border border-dourado/20 rounded-sm overflow-hidden bg-gradient-to-b from-black/50 to-black/30">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-dourado/60"/>
          <span className="font-accent text-[10px] tracking-[0.3em] text-dourado/60 uppercase">Vibe Check · Antes de começar</span>
        </div>
        <button onClick={() => setFase('cta')} className="text-bege-escuro/20 hover:text-bege-escuro/50 transition-colors"><X size={14}/></button>
      </div>
      <div className="px-6 py-6 space-y-5">
        <div>
          <h3 className="font-display text-xl text-bege mb-1">Personalização e sorteios</h3>
          <p className="font-body text-xs text-bege-escuro/45 leading-relaxed">
            Suas informações enriquecem a experiência na Maandhoo. A autorização abaixo é opcional, mas desbloqueia sorteios em Balneário Camboriú toda semana e um badge e tema exclusivo para você personalizar sua página na Maandhoo.
          </p>
        </div>
        <CheckboxLGPD checked={lgpdChecked} onChange={setLgpdChecked} variant="full"/>
        {/* Botão vazado minimalista */}
        <button
          onClick={() => setFase('quiz')}
          className="w-full border border-dourado/35 text-dourado/70 hover:text-dourado hover:border-dourado/70 font-accent text-[11px] tracking-[0.4em] uppercase py-3.5 rounded-sm transition-all duration-200 hover:bg-dourado/[0.05]"
        >
          Iniciar Quiz
        </button>
      </div>
    </div>
  )

  // ── FASE: QUIZ ──────────────────────────────────────────────────
  if (fase === 'quiz') {
    const perg = PERGUNTAS_QUIZ[perguntaIdx]
    return (
      <div className="border border-dourado/20 rounded-sm overflow-hidden bg-gradient-to-b from-black/50 to-black/30">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-dourado/60"/>
            <span className="font-accent text-[10px] tracking-[0.3em] text-dourado/60 uppercase">Vibe Check</span>
          </div>
          <button onClick={() => setFase('cta')} className="text-bege-escuro/20 hover:text-bege-escuro/50 transition-colors"><X size={14}/></button>
        </div>
        <div className={`px-6 py-6 transition-opacity duration-200 ${saindo ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10 relative overflow-hidden rounded-full">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-dourado/60 to-dourado transition-all duration-700 rounded-full" style={{ width: `${((perguntaIdx + 1) / PERGUNTAS_QUIZ.length) * 100}%` }}/>
            </div>
            <span className="font-accent text-[10px] tracking-widest text-dourado/50 whitespace-nowrap">{perguntaIdx + 1}/{PERGUNTAS_QUIZ.length}</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-bege mb-1 leading-tight">{perg.texto}</h3>
          <p className="font-body text-xs text-bege-escuro/40 mb-5">{perg.subtexto}</p>
          <div className="grid grid-cols-2 gap-3">
            {perg.opcoes.map(op => {
              const sel = opcaoSelecionada === op.valor
              const out = !!opcaoSelecionada && !sel
              return (
                <button
                  key={op.valor}
                  onClick={() => selecionar(op.valor)}
                  disabled={!!opcaoSelecionada}
                  className={`relative group text-left p-4 rounded-sm border transition-all duration-300 overflow-hidden ${sel ? 'border-dourado bg-dourado/10 scale-[1.02] shadow-[0_0_20px_rgba(201,168,76,0.2)]' : out ? 'border-white/5 opacity-30' : 'border-white/10 hover:border-dourado/40 hover:bg-dourado/[0.04] active:scale-[0.98]'}`}
                >
                  {sel && <div className="absolute inset-0 bg-gradient-to-br from-dourado/10 to-transparent pointer-events-none"/>}
                  <div className={`absolute top-0 left-0 h-px transition-all duration-500 ${sel ? 'w-full bg-dourado/60' : 'w-4 bg-dourado/20 group-hover:w-8'}`}/>
                  <div className="relative flex flex-col gap-2.5">
                    <div className={`w-7 h-7 transition-colors ${sel ? 'text-dourado' : 'text-bege-escuro/40 group-hover:text-bege-escuro/70'}`} dangerouslySetInnerHTML={{ __html: op.svg }}/>
                    <span className={`font-body text-xs leading-tight ${sel ? 'text-dourado' : 'text-bege-escuro/65'}`}>{op.label}</span>
                  </div>
                  {sel && <div className="absolute top-2 right-2"><CheckCheck size={11} className="text-dourado"/></div>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── FASE: RESULTADO ─────────────────────────────────────────────
  if (fase === 'resultado' && perfil) {
    const podeDesbloquear = lgpdChecked || lgpdInicial

    if (refazendo) return (
      <div className="border border-dourado/20 rounded-sm overflow-hidden bg-gradient-to-b from-black/50 to-black/30 p-6">
        <h3 className="font-display text-xl text-bege mb-2">Refazer o quiz?</h3>
        <p className="font-body text-xs text-bege-escuro/45 mb-5 leading-relaxed">
          Seu perfil atual é <span className="font-medium" style={{ color: perfil.corPrimaria }}>{perfil.nome}</span>.
          Ao refazer, seu perfil será atualizado com as novas respostas.
          {lgpdInicial && (
            <span className="block mt-2 text-bege-escuro/30">
              Seu consentimento LGPD já está registrado — não é necessário aceitar novamente.
            </span>
          )}
        </p>
        <div className="flex gap-3">
          <button onClick={() => setRefazendo(false)} className="flex-1 border border-white/15 text-bege-escuro/60 font-accent text-xs tracking-widest uppercase py-2.5 rounded-sm hover:border-white/25 transition-colors">Cancelar</button>
          <button onClick={confirmarRefazer} className="flex-1 bg-dourado/80 hover:bg-dourado text-preto-profundo font-accent text-xs tracking-widest uppercase py-2.5 rounded-sm transition-colors">Sim, refazer</button>
        </div>
      </div>
    )

    return (
      <>
        {/* Overlay de desbloqueio — fixed fora de qualquer overflow */}
        {mostrarOverlay && (
          <DesbloqueioOverlay perfil={perfil} onFim={() => setMostrarOverlay(false)} />
        )}

        <div className="border rounded-sm overflow-hidden" style={{ borderColor: `${perfil.corPrimaria}30` }}>
          <div className="pointer-events-none opacity-[0.07]" style={{ background: `radial-gradient(ellipse at 50% 0%, ${perfil.corPrimaria}, transparent 70%)`, position: 'absolute', inset: 0 }}/>
          <div className="relative px-6 py-6">
            {/* Topo */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles size={12} style={{ color: perfil.corPrimaria }}/>
                <span className="font-accent text-[10px] tracking-[0.3em] uppercase" style={{ color: `${perfil.corPrimaria}90` }}>Seu perfil revelado</span>
              </div>
              <button onClick={iniciarRefazer} className="flex items-center gap-1 text-bege-escuro/25 hover:text-bege-escuro/50 transition-colors">
                <RotateCcw size={11}/><span className="font-body text-[10px]">Refazer</span>
              </button>
            </div>

            {/* Badge + Identidade */}
            <div className="flex items-center gap-5 mb-5">
              <div className="flex-shrink-0" style={{ filter: `drop-shadow(0 0 12px ${perfil.corGlow})` }}>
                <BadgeSVG perfil={perfil} size={88}/>
              </div>
              <div>
                <p className="font-accent text-[10px] tracking-[0.35em] uppercase mb-1" style={{ color: perfil.corPrimaria }}>{primeiroNome}, você é...</p>
                <h3 className="font-display text-2xl text-bege leading-tight">{perfil.nome}</h3>
                <p className="font-body text-sm mt-0.5" style={{ color: `${perfil.corPrimaria}CC` }}>{perfil.subtitulo}</p>
              </div>
            </div>

            <div className="h-px mb-4" style={{ background: `linear-gradient(to right, transparent, ${perfil.corPrimaria}35, transparent)` }}/>
            <p className="font-body text-sm text-bege-escuro/55 leading-relaxed mb-4">{perfil.descricao}</p>
            <div className="border rounded-sm px-4 py-3 mb-5 text-center" style={{ borderColor: `${perfil.corPrimaria}20`, background: `${perfil.corPrimaria}08` }}>
              <p className="font-display text-base italic" style={{ color: perfil.corPrimaria }}>"{perfil.tagline}"</p>
            </div>

            {/* Playlist desbloqueada — com efeito de unlock se recém feito */}
            <div className="mb-5">
              <SpotifyPlayer perfil={perfil} recemDesbloqueado={recemDesbloqueado} />
            </div>

            {/* Badge + Tema — só mostra checkbox LGPD se ainda não foi aceito */}
            {podeDesbloquear ? (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={aplicarBadge} disabled={badgeAtivo}
                  className={`flex items-center justify-center gap-2 py-3 rounded-sm border font-accent text-[10px] tracking-widest uppercase transition-all duration-200 ${badgeAtivo ? 'border-dourado/40 text-dourado bg-dourado/10' : 'border-white/15 text-bege-escuro/50 hover:border-dourado/40 hover:text-bege-escuro/80'}`}>
                  {badgeAtivo ? <><CheckCheck size={11}/> Badge ativo</> : '✦ Aplicar badge'}
                </button>
                <button onClick={aplicarTema} disabled={temaAtivo}
                  className={`flex items-center justify-center gap-2 py-3 rounded-sm border font-accent text-[10px] tracking-widest uppercase transition-all duration-200 ${temaAtivo ? 'border-dourado/40 text-dourado bg-dourado/10' : 'border-white/15 text-bege-escuro/50 hover:border-dourado/40 hover:text-bege-escuro/80'}`}>
                  {temaAtivo ? <><CheckCheck size={11}/> Tema ativo</> : '◈ Aplicar tema'}
                </button>
              </div>
            ) : (
              // Checkbox LGPD só aparece se o cliente ainda NÃO aceitou os termos.
              // Se lgpdInicial=true, o termo já foi registrado — não volta a aparecer aqui.
              !lgpdInicial && (
                <div className="mb-5">
                  <CheckboxLGPD checked={lgpdChecked} onChange={setLgpdChecked} variant="compact"/>
                  {lgpdChecked && (
                    <button onClick={() => salvarQuiz(respostas, perfil, true)}
                      className="mt-2 w-full border border-dourado/30 text-dourado font-accent text-[10px] tracking-widest uppercase py-2.5 rounded-sm hover:bg-dourado/10 transition-colors">
                      Confirmar e desbloquear badge + tema
                    </button>
                  )}
                </div>
              )
            )}

            {/* Compartilhar */}
            <button onClick={compartilharBadge} disabled={compartilhando}
              className="w-full flex items-center justify-center gap-2 border border-white/10 text-bege-escuro/40 hover:text-bege-escuro/70 hover:border-white/20 disabled:opacity-50 font-accent text-[10px] tracking-widest uppercase py-2.5 rounded-sm transition-all duration-200 mb-3">
              {compartilhando
                ? <><Loader2 size={11} className="animate-spin"/> Gerando imagem...</>
                : <><Share2 size={11}/> Compartilhar meu perfil</>
              }
            </button>

            <a href="/#eventos" className="flex items-center justify-center gap-2 w-full py-3 rounded-sm font-accent text-xs tracking-widest uppercase transition-all duration-200 hover:opacity-90" style={{ background: perfil.corPrimaria, color: '#0d0a07' }}>
              Ver próximos eventos <ChevronRight size={13}/>
            </a>
          </div>
        </div>
      </>
    )
  }

  return null
}

export default QuizVibeCheck
