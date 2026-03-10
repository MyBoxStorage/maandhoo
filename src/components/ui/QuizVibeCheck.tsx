'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, ChevronRight, X, RotateCcw } from 'lucide-react'

/* ─── TIPOS ─────────────────────────────────────────── */
interface Opcao {
  emoji: string
  label: string
  valor: string
}

interface Pergunta {
  id: string
  texto: string
  subtexto?: string
  opcoes: Opcao[]
}

interface Perfil {
  titulo: string
  subtitulo: string
  descricao: string
  cor: string
  emoji: string
  tagline: string
}

/* ─── DADOS DO QUIZ ──────────────────────────────────── */
const PERGUNTAS: Pergunta[] = [
  {
    id: 'chegada',
    texto: 'Que horas você chega na balada?',
    subtexto: 'Seja honesto(a) 👀',
    opcoes: [
      { emoji: '🌙', label: 'Logo que abre', valor: 'cedo' },
      { emoji: '✨', label: 'Na hora certa', valor: 'medio' },
      { emoji: '🔥', label: 'Quando tá bombando', valor: 'tarde' },
      { emoji: '🌅', label: 'Quando os outros vão embora', valor: 'madrugada' },
    ],
  },
  {
    id: 'drink',
    texto: 'Qual o seu drink da noite?',
    subtexto: 'O que não pode faltar no seu copo',
    opcoes: [
      { emoji: '🥂', label: 'Champagne / Espumante', valor: 'vip' },
      { emoji: '🍹', label: 'Drinks tropicais', valor: 'festeiro' },
      { emoji: '🥃', label: 'Whisky / Dry', valor: 'sofisticado' },
      { emoji: '💧', label: 'Água — odeio ressaca', valor: 'controlado' },
    ],
  },
  {
    id: 'musica',
    texto: 'Qual som faz você pirar?',
    subtexto: 'A trilha sonora da sua noite',
    opcoes: [
      { emoji: '🎵', label: 'Funk & Pagodão', valor: 'funk' },
      { emoji: '⚡', label: 'Eletrônico / House', valor: 'eletro' },
      { emoji: '🎤', label: 'Pop & Hits nacionais', valor: 'pop' },
      { emoji: '🌊', label: 'De tudo — curto variar', valor: 'eclético' },
    ],
  },
  {
    id: 'grupo',
    texto: 'Como você curte mais?',
    subtexto: 'O seu estilo na noite',
    opcoes: [
      { emoji: '👑', label: 'Camarote com a galera', valor: 'vip' },
      { emoji: '💃', label: 'Na pista até o fim', valor: 'pista' },
      { emoji: '🥂', label: 'No bar, boa conversa', valor: 'bar' },
      { emoji: '🎯', label: 'Tudo — depende do humor', valor: 'flex' },
    ],
  },
  {
    id: 'traje',
    texto: 'O que você veste pra sair?',
    subtexto: 'Primeira impressão é tudo',
    opcoes: [
      { emoji: '🖤', label: 'All black sempre', valor: 'dark' },
      { emoji: '✨', label: 'Algo que brilhe', valor: 'glam' },
      { emoji: '😎', label: 'Casual mas arrumado', valor: 'casual' },
      { emoji: '💫', label: 'Look temático / diferente', valor: 'criativo' },
    ],
  },
]

const PERFIS: Record<string, Perfil> = {
  vip: {
    titulo: 'O Anfitrião VIP',
    subtitulo: 'Você manda na noite',
    descricao: 'Camarote, drinks premium e a melhor visão da pista. Você sabe que uma boa noite começa com o ambiente certo — e é você quem define o padrão.',
    cor: '#C9A84C',
    emoji: '👑',
    tagline: 'A Maandhoo foi feita pra você.',
  },
  festeiro: {
    titulo: 'A Alma da Festa',
    subtitulo: 'Onde você está, a festa acontece',
    descricao: 'Todo mundo conhece você. Você chega e o nível da festa sobe automaticamente. Drinks na mão, sorriso no rosto e energia que contagia.',
    cor: '#FF6B6B',
    emoji: '🔥',
    tagline: 'Venha ser o coração da Maandhoo.',
  },
  sofisticado: {
    titulo: 'O Elegante',
    subtitulo: 'Refinado com intensidade',
    descricao: 'Você aprecia o que é bom. Drinks autorais, ambiente premium e uma noite com qualidade do início ao fim. Você não sai pra qualquer lugar.',
    cor: '#A8C5DA',
    emoji: '🥃',
    tagline: 'Maandhoo Club: seu novo lugar favorito.',
  },
  eclético: {
    titulo: 'O Viajante',
    subtitulo: 'Uma noite, mil momentos',
    descricao: 'Pista, bar, camarote — você está em todo lugar. Sua noite é uma aventura sem roteiro. Você vive cada momento como se fosse o último.',
    cor: '#B5A9FF',
    emoji: '🌊',
    tagline: 'Cada noite na Maandhoo é uma nova história.',
  },
}

function calcularPerfil(respostas: Record<string, string>): Perfil {
  const contagem: Record<string, number> = {}
  Object.values(respostas).forEach(v => { contagem[v] = (contagem[v] || 0) + 1 })
  const maisFrequente = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] || 'eclético'
  const chave = ['vip', 'festeiro', 'sofisticado', 'eclético'].includes(maisFrequente)
    ? maisFrequente
    : 'eclético'
  return PERFIS[chave]
}

/* ─── PARTÍCULAS ─────────────────────────────────────── */
function Particle({ delay, x }: { delay: number; x: number }) {
  return (
    <div
      className="absolute bottom-0 w-1 h-1 rounded-full bg-dourado/60 animate-float-particle"
      style={{
        left: `${x}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }}
    />
  )
}

/* ─── BARRA DE PROGRESSO ─────────────────────────────── */
function ProgressBar({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex-1 h-px bg-white/10 relative overflow-hidden rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-dourado/60 to-dourado transition-all duration-700 ease-out rounded-full"
          style={{ width: `${(atual / total) * 100}%` }}
        />
      </div>
      <span className="font-accent text-[10px] tracking-[0.25em] text-dourado/50 whitespace-nowrap">
        {atual}/{total}
      </span>
    </div>
  )
}

/* ─── COMPONENTE PRINCIPAL ───────────────────────────── */
export function QuizVibeCheck({ clienteNome }: { clienteNome: string }) {
  const [fase, setFase] = useState<'cta' | 'quiz' | 'resultado'>('cta')
  const [perguntaIdx, setPerguntaIdx] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [partículas] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({ delay: i * 0.4, x: (i * 8.3) % 100 }))
  )
  const primeiroNome = clienteNome.split(' ')[0]

  const selecionar = (valor: string) => {
    if (opcaoSelecionada) return
    setOpcaoSelecionada(valor)
    const novasRespostas = { ...respostas, [PERGUNTAS[perguntaIdx].id]: valor }
    setRespostas(novasRespostas)

    setTimeout(() => {
      if (perguntaIdx < PERGUNTAS.length - 1) {
        setEntrando(true)
        setTimeout(() => {
          setPerguntaIdx(p => p + 1)
          setOpcaoSelecionada(null)
          setEntrando(false)
        }, 350)
      } else {
        const p = calcularPerfil(novasRespostas)
        setPerfil(p)
        salvarPerfil(novasRespostas, p)
        setTimeout(() => setFase('resultado'), 400)
      }
    }, 600)
  }

  const salvarPerfil = async (resp: Record<string, string>, p: Perfil) => {
    setSalvando(true)
    try {
      await fetch('/api/cliente/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: resp, perfil: p.titulo }),
      })
    } catch { /* silencioso */ }
    setSalvando(false)
  }

  const reiniciar = () => {
    setFase('cta')
    setPerguntaIdx(0)
    setRespostas({})
    setOpcaoSelecionada(null)
    setPerfil(null)
  }

  /* ── CTA ───────────────────────────── */
  if (fase === 'cta') return (
    <div className="relative border border-dourado/15 rounded-sm overflow-hidden bg-gradient-to-br from-black/40 via-[#0d0900]/60 to-black/40 p-7">
      {/* Brilho de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(201,168,76,0.08),transparent_70%)] pointer-events-none" />

      {/* Partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {partículas.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* Ícone animado */}
        <div className="flex-shrink-0 w-16 h-16 rounded-sm border border-dourado/25 flex items-center justify-center bg-dourado/5 relative">
          <div className="absolute inset-0 rounded-sm bg-dourado/10 animate-pulse" style={{ animationDuration: '2s' }} />
          <Sparkles size={28} className="text-dourado relative z-10" />
        </div>

        {/* Texto */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-accent text-[10px] tracking-[0.4em] text-dourado/60 uppercase mb-1.5">
            Exclusivo para membros
          </p>
          <h3 className="font-display text-xl text-bege mb-1">
            Qual é o seu <span style={{ color: '#C9A84C' }}>Vibe</span> na Maandhoo?
          </h3>
          <p className="font-body text-xs text-bege-escuro/50 leading-relaxed">
            5 perguntas · 60 segundos · Descubra seu perfil de festa e ganhe experiências personalizadas.
          </p>
        </div>

        {/* Botão */}
        <button
          onClick={() => setFase('quiz')}
          className="flex-shrink-0 group flex items-center gap-2 bg-dourado hover:bg-dourado/90 text-preto-profundo font-accent text-xs tracking-widest uppercase px-5 py-3 rounded-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] whitespace-nowrap"
        >
          Fazer Quiz
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )

  /* ── QUIZ ──────────────────────────── */
  if (fase === 'quiz') {
    const perg = PERGUNTAS[perguntaIdx]
    return (
      <div className="relative border border-dourado/20 rounded-sm overflow-hidden bg-gradient-to-b from-black/50 to-black/30">
        {/* Header do quiz */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-dourado/60" />
            <span className="font-accent text-[10px] tracking-[0.3em] text-dourado/60 uppercase">
              Vibe Check
            </span>
          </div>
          <button onClick={reiniciar} className="text-bege-escuro/20 hover:text-bege-escuro/50 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className={`px-6 py-6 transition-opacity duration-300 ${entrando ? 'opacity-0' : 'opacity-100'}`}>
          <ProgressBar atual={perguntaIdx + 1} total={PERGUNTAS.length} />

          {/* Pergunta */}
          <div className="mb-6">
            <h3 className="font-display text-xl sm:text-2xl text-bege mb-1 leading-tight">
              {perg.texto}
            </h3>
            {perg.subtexto && (
              <p className="font-body text-xs text-bege-escuro/40">{perg.subtexto}</p>
            )}
          </div>

          {/* Opções */}
          <div className="grid grid-cols-2 gap-3">
            {perg.opcoes.map((op) => {
              const selecionada = opcaoSelecionada === op.valor
              const outra = opcaoSelecionada && opcaoSelecionada !== op.valor
              return (
                <button
                  key={op.valor}
                  onClick={() => selecionar(op.valor)}
                  disabled={!!opcaoSelecionada}
                  className={`
                    relative group text-left p-4 rounded-sm border transition-all duration-300
                    ${selecionada
                      ? 'border-dourado bg-dourado/10 scale-[1.02]'
                      : outra
                        ? 'border-white/5 opacity-40'
                        : 'border-white/10 hover:border-dourado/40 hover:bg-dourado/[0.04] active:scale-[0.98]'
                    }
                  `}
                >
                  {/* Glow ao selecionar */}
                  {selecionada && (
                    <div className="absolute inset-0 rounded-sm bg-dourado/10 animate-pulse" />
                  )}
                  <div className="relative">
                    <span className="text-2xl block mb-2">{op.emoji}</span>
                    <span className={`font-body text-xs leading-tight block ${selecionada ? 'text-dourado' : 'text-bege-escuro/70'}`}>
                      {op.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ── RESULTADO ─────────────────────── */
  if (fase === 'resultado' && perfil) return (
    <div className="relative border rounded-sm overflow-hidden" style={{ borderColor: `${perfil.cor}30` }}>
      {/* Fundo com cor do perfil */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${perfil.cor}, transparent 70%)` }}
      />

      <div className="relative px-6 py-7">
        {/* Topo */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={12} style={{ color: perfil.cor }} />
            <span className="font-accent text-[10px] tracking-[0.3em] uppercase" style={{ color: `${perfil.cor}99` }}>
              Seu perfil revelado
            </span>
          </div>
          <button onClick={reiniciar} className="text-bege-escuro/20 hover:text-bege-escuro/50 transition-colors flex items-center gap-1">
            <RotateCcw size={12} />
            <span className="font-body text-[10px]">Refazer</span>
          </button>
        </div>

        {/* Emoji grande */}
        <div className="text-5xl mb-4 animate-bounce-slow">{perfil.emoji}</div>

        {/* Identidade */}
        <p className="font-accent text-[10px] tracking-[0.35em] uppercase mb-1" style={{ color: perfil.cor }}>
          {primeiroNome}, você é...
        </p>
        <h3 className="font-display text-2xl sm:text-3xl text-bege mb-0.5">{perfil.titulo}</h3>
        <p className="font-body text-sm mb-4" style={{ color: `${perfil.cor}CC` }}>{perfil.subtitulo}</p>

        {/* Divisor */}
        <div className="h-px mb-4" style={{ background: `linear-gradient(to right, transparent, ${perfil.cor}40, transparent)` }} />

        {/* Descrição */}
        <p className="font-body text-sm text-bege-escuro/60 leading-relaxed mb-5">
          {perfil.descricao}
        </p>

        {/* Tagline dourada */}
        <div className="border rounded-sm px-4 py-3 mb-5 text-center" style={{ borderColor: `${perfil.cor}25`, background: `${perfil.cor}08` }}>
          <p className="font-display text-base italic" style={{ color: perfil.cor }}>
            "{perfil.tagline}"
          </p>
        </div>

        {/* CTA */}
        <a
          href="/#eventos"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-sm font-accent text-xs tracking-widest uppercase transition-all duration-200 hover:opacity-90"
          style={{ background: perfil.cor, color: '#0d0a07' }}
        >
          Ver próximos eventos
          <ChevronRight size={14} />
        </a>
      </div>
    </div>
  )

  return null
}
