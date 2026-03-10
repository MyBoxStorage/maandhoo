'use client'

import { useState, useCallback } from 'react'
import { X, RotateCcw, ChevronRight, Sparkles, Lock, CheckCheck, Music, Share2, Download, Loader2 } from 'lucide-react'
import { PERGUNTAS_QUIZ } from '@/lib/quiz-perguntas'
import { calcularPerfilQuiz, PERFIS_QUIZ, type PerfilQuiz } from '@/lib/quiz-perfis'

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
              <span className="text-dourado font-medium">Quero participar dos sorteios semanais</span> e receber experiências personalizadas.
              Autorizo a Maandhoo a compartilhar meu perfil com empresas parceiras em Balneário Camboriú para envio de
              ofertas e promoções exclusivas.
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

// ── PLAYER SPOTIFY ───────────────────────────────────────────────
function SpotifyPlayer({ perfil, desbloqueado }: { perfil: PerfilQuiz; desbloqueado: boolean }) {
  if (!desbloqueado) {
    return (
      <div className="border border-white/8 rounded-sm p-5 flex items-center gap-4 bg-black/20">
        <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Lock size={16} className="text-bege-escuro/30" />
        </div>
        <div>
          <p className="font-accent text-[10px] tracking-[0.25em] text-bege-escuro/30 uppercase mb-0.5">Playlist bloqueada</p>
          <p className="font-body text-xs text-bege-escuro/40">Faça o quiz e descubra sua trilha sonora personalizada</p>
        </div>
      </div>
    )
  }

  const embedUrl = perfil.playlistUrl.replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/') + '?utm_source=generator&theme=0'

  return (
    <div
      className="border border-dourado/20 rounded-sm overflow-hidden"
      style={{ boxShadow: `0 0 20px ${perfil.corGlow}` }}
    >
      {/* Header com info do perfil */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-dourado/10 bg-black/30">
        <Music size={12} className="text-dourado/60" />
        <p className="font-accent text-[10px] tracking-[0.25em] text-dourado/60 uppercase">Sua Playlist</p>
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

  // Confirmar refazer
  const iniciarRefazer = () => setRefazendo(true)
  const confirmarRefazer = () => {
    setRefazendo(false); setFase('consentimento')
    setPerguntaIdx(0); setRespostas({}); setOpcaoSelecionada(null)
    setPerfil(null); setBadgeAtivo(false); setTemaAtivo(false)
  }

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
        setTimeout(() => setFase('resultado'), 350)
      }
    }, 550)
  }, [opcaoSelecionada, respostas, perguntaIdx, lgpdChecked])

  const salvarQuiz = async (resp: Record<string, string>, p: PerfilQuiz, lgpd: boolean) => {
    setSalvando(true)
    try {
      await fetch('/api/cliente/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: resp, perfil_id: p.id, perfil_nome: p.nome, lgpd_aceito: lgpd, lgpd_versao: VERSAO_LGPD }),
      })
    } catch {}
    setSalvando(false)
  }

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
      // Tenta Web Share API (mobile nativo)
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const res = await fetch(url)
          const blob = await res.blob()
          const file = new File([blob], `maandhoo-${perfil.id}.png`, { type: 'image/png' })
          await navigator.share({
            title: `Sou ${perfil.nome} na Maandhoo`,
            text: `${perfil.subtitulo} — Maandhoo Club, Balneário Camboriú`,
            files: [file],
          })
          setCompartilhando(false)
          return
        } catch {
          // share cancelado ou não suporta files — cai no fallback
        }
      }
      // Fallback: abre imagem em nova aba para salvar
      window.open(url, '_blank')
    } catch {}
    setCompartilhando(false)
  }

  // ── FASE: CTA ──────────────────────────────────────────────────
  if (fase === 'cta') return (
    <div className="relative border border-dourado/15 rounded-sm overflow-hidden bg-gradient-to-br from-black/40 via-[#0d0900]/60 to-black/40 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_-10%,rgba(201,168,76,0.09),transparent_65%)] pointer-events-none"/>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="flex-shrink-0 w-14 h-14 rounded-sm border border-dourado/25 flex items-center justify-center bg-dourado/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-dourado/10 animate-pulse" style={{ animationDuration: '2.5s' }}/>
          <Sparkles size={24} className="text-dourado relative z-10"/>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-accent text-[10px] tracking-[0.4em] text-dourado/60 uppercase mb-1">Exclusivo para membros</p>
          <h3 className="font-display text-xl text-bege mb-1">Qual é o seu <span style={{ color: '#C9A84C' }}>Vibe</span> na Maandhoo?</h3>
          <p className="font-body text-xs text-bege-escuro/50 leading-relaxed">7 perguntas · descubra seu perfil, badge exclusivo e playlist personalizada.</p>
        </div>
        <button
          onClick={() => setFase('consentimento')}
          className="flex-shrink-0 group flex items-center gap-2 bg-dourado hover:bg-dourado/90 text-preto-profundo font-accent text-xs tracking-widest uppercase px-5 py-3 rounded-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(201,168,76,0.35)] whitespace-nowrap"
        >
          Fazer Quiz <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform"/>
        </button>
      </div>
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
            Seus dados enriquecem sua experiência na Maandhoo. A autorização abaixo é opcional, mas desbloqueia badge exclusivo, tema personalizado e participação nos sorteios semanais com parceiros.
          </p>
        </div>
        <CheckboxLGPD checked={lgpdChecked} onChange={setLgpdChecked} variant="full"/>
        <button
          onClick={() => setFase('quiz')}
          className="w-full bg-dourado hover:bg-dourado/90 text-preto-profundo font-accent text-xs tracking-widest uppercase py-3 rounded-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"
        >
          {lgpdChecked ? 'Confirmar e iniciar quiz →' : 'Iniciar quiz sem autorização →'}
        </button>
        {!lgpdChecked && (
          <p className="font-body text-[10px] text-bege-escuro/25 text-center">
            Sem autorização: quiz disponível, mas badge, tema e sorteios bloqueados.
          </p>
        )}
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
          {/* Barra progresso */}
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

    // Modal confirmar refazer
    if (refazendo) return (
      <div className="border border-dourado/20 rounded-sm overflow-hidden bg-gradient-to-b from-black/50 to-black/30 p-6">
        <h3 className="font-display text-xl text-bege mb-3">Refazer o quiz?</h3>
        <p className="font-body text-xs text-bege-escuro/50 mb-4 leading-relaxed">Suas respostas anteriores:</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {Object.entries(respostas).map(([k, v]) => (
            <div key={k} className="border border-white/8 rounded-sm px-3 py-2">
              <p className="font-accent text-[9px] tracking-widest text-bege-escuro/30 uppercase">{k}</p>
              <p className="font-body text-xs text-bege-escuro/60">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setRefazendo(false)} className="flex-1 border border-white/15 text-bege-escuro/60 font-accent text-xs tracking-widest uppercase py-2.5 rounded-sm hover:border-white/25 transition-colors">Cancelar</button>
          <button onClick={confirmarRefazer} className="flex-1 bg-dourado/80 hover:bg-dourado text-preto-profundo font-accent text-xs tracking-widest uppercase py-2.5 rounded-sm transition-colors">Sim, refazer</button>
        </div>
      </div>
    )

    return (
      <div className="border rounded-sm overflow-hidden" style={{ borderColor: `${perfil.corPrimaria}30` }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ background: `radial-gradient(ellipse at 50% 0%, ${perfil.corPrimaria}, transparent 70%)` }}/>
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

          {/* Playlist */}
          <div className="mb-5">
            <SpotifyPlayer perfil={perfil} desbloqueado={true}/>
          </div>

          {/* Badge + Tema */}
          {podeDesbloquear ? (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={aplicarBadge}
                disabled={badgeAtivo}
                className={`flex items-center justify-center gap-2 py-3 rounded-sm border font-accent text-[10px] tracking-widest uppercase transition-all duration-200 ${badgeAtivo ? 'border-dourado/40 text-dourado bg-dourado/10' : 'border-white/15 text-bege-escuro/50 hover:border-dourado/40 hover:text-bege-escuro/80'}`}
              >
                {badgeAtivo ? <><CheckCheck size={11}/> Badge ativo</> : '✦ Aplicar badge'}
              </button>
              <button
                onClick={aplicarTema}
                disabled={temaAtivo}
                className={`flex items-center justify-center gap-2 py-3 rounded-sm border font-accent text-[10px] tracking-widest uppercase transition-all duration-200 ${temaAtivo ? 'border-dourado/40 text-dourado bg-dourado/10' : 'border-white/15 text-bege-escuro/50 hover:border-dourado/40 hover:text-bege-escuro/80'}`}
              >
                {temaAtivo ? <><CheckCheck size={11}/> Tema ativo</> : '◈ Aplicar tema'}
              </button>
            </div>
          ) : (
            <div className="mb-5">
              <CheckboxLGPD checked={lgpdChecked} onChange={setLgpdChecked} variant="compact"/>
              {lgpdChecked && (
                <button
                  onClick={() => salvarQuiz(respostas, perfil, true)}
                  className="mt-2 w-full border border-dourado/30 text-dourado font-accent text-[10px] tracking-widest uppercase py-2.5 rounded-sm hover:bg-dourado/10 transition-colors"
                >
                  Confirmar e desbloquear badge + tema
                </button>
              )}
            </div>
          )}

          {/* Compartilhar badge */}
          <button
            onClick={compartilharBadge}
            disabled={compartilhando}
            className="w-full flex items-center justify-center gap-2 border border-white/10 text-bege-escuro/40 hover:text-bege-escuro/70 hover:border-white/20 disabled:opacity-50 font-accent text-[10px] tracking-widest uppercase py-2.5 rounded-sm transition-all duration-200 mb-3"
          >
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
    )
  }

  return null
}

export default QuizVibeCheck
