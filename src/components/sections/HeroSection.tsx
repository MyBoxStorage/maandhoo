'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'

const FOTOS = [
  '/images/galeria/Espaço_1.webp',
  '/images/galeria/Espaço_2.jpg',
  '/images/galeria/Espaço_3.webp',
]

export const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fotoAtual, setFotoAtual] = useState(0)
  const [fotoProxima, setFotoProxima] = useState(1)
  const [transitioning, setTransitioning] = useState(false)

  // Paleta de cores por banner — muda junto com a foto
  const PALETAS: [number, number, number][][] = [
    // Banner 0 — Espaço_1: rosa choque / magenta
    [
      [255,  40, 160],  // rosa choque
      [220,   0, 120],  // magenta
      [255, 100, 200],  // rosa claro
      [180,   0, 100],  // vinho rosado
      [255, 255, 255],  // branco
    ],
    // Banner 1 — Espaço_2: azul choque + vermelho
    [
      [ 30, 100, 255],  // azul elétrico
      [ 60, 160, 255],  // azul claro
      [220,  30,  30],  // vermelho
      [  0,  60, 220],  // azul profundo
      [255, 255, 255],  // branco
    ],
    // Banner 2 — Espaço_3: azul claro absoluto
    [
      [ 80, 200, 255],  // azul céu
      [140, 220, 255],  // azul gelo
      [ 40, 160, 255],  // azul médio
      [200, 240, 255],  // azul quase branco
      [255, 255, 255],  // branco
    ],
  ]

  // Ref para a paleta alvo — atualiza sem recriar beams
  const paletaAlvoRef = useRef<[number, number, number][]>(PALETAS[0])
  useEffect(() => {
    paletaAlvoRef.current = PALETAS[fotoAtual]
  }, [fotoAtual])

  // Lasers — criados UMA VEZ, cores interpolam suavemente ao trocar banner
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    // Paleta inicial
    const palette = PALETAS[0]

    type Beam = {
      ox: number; oy: number
      angle: number
      spread: number
      length: number
      swingRange: number; swingSpeed: number; swingOffset: number
      color: [number, number, number]      // cor atual (interpolada)
      colorIdx: number                     // índice na paleta
      opacity: number
      phase: number
    }
    const beams: Beam[] = []

    const W = canvas.width
    const H = canvas.height

    // ── TOPO: 9 holofotes — cones grandes e visíveis ──
    const topPositions = [0.05, 0.16, 0.28, 0.41, 0.54, 0.66, 0.78, 0.88, 0.96]
    topPositions.forEach((pos, i) => {
      const ci = i % palette.length
      beams.push({
        ox: W * pos, oy: -5,
        angle: Math.PI * 0.5 + (Math.random() - 0.5) * 0.4,
        spread: 0.040 + Math.random() * 0.035,
        length: H * (0.6 + Math.random() * 0.45),
        swingRange: 0.06 + Math.random() * 0.16,
        swingSpeed: 0.0008 + Math.random() * 0.002,
        swingOffset: (i / topPositions.length) * Math.PI * 2,
        color: [...palette[ci]] as [number,number,number],
        colorIdx: ci,
        opacity: 0.18 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
      })
    })

    // ── 5 holofotes da BORDA ESQUERDA ──
    ;[0.10, 0.28, 0.50, 0.72, 0.90].forEach((pos, i) => {
      const ci = (i + 2) % palette.length
      beams.push({
        ox: -5, oy: H * pos,
        angle: -(0.05 + Math.random() * 0.25),
        spread: 0.035 + Math.random() * 0.030,
        length: W * (0.45 + Math.random() * 0.40),
        swingRange: 0.04 + Math.random() * 0.12,
        swingSpeed: 0.0006 + Math.random() * 0.0016,
        swingOffset: Math.random() * Math.PI * 2,
        color: [...palette[ci]] as [number,number,number],
        colorIdx: ci,
        opacity: 0.14 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
      })
    })

    // ── 5 holofotes da BORDA DIREITA ──
    ;[0.10, 0.28, 0.50, 0.72, 0.90].forEach((pos, i) => {
      const ci = (i + 1) % palette.length
      beams.push({
        ox: W + 5, oy: H * pos,
        angle: Math.PI + (0.05 + Math.random() * 0.25),
        spread: 0.035 + Math.random() * 0.030,
        length: W * (0.45 + Math.random() * 0.40),
        swingRange: 0.04 + Math.random() * 0.12,
        swingSpeed: 0.0006 + Math.random() * 0.0016,
        swingOffset: Math.random() * Math.PI * 2,
        color: [...palette[ci]] as [number,number,number],
        colorIdx: ci,
        opacity: 0.14 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
      })
    })

    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      beams.forEach(b => {
        // Interpola suavemente a cor atual → cor alvo da nova paleta (lerp por frame)
        const target = paletaAlvoRef.current[b.colorIdx]
        const lerpSpeed = 0.012  // ~80 frames ≈ 1.3s para trocar completamente
        b.color[0] += (target[0] - b.color[0]) * lerpSpeed
        b.color[1] += (target[1] - b.color[1]) * lerpSpeed
        b.color[2] += (target[2] - b.color[2]) * lerpSpeed

        const curAngle = b.angle + Math.sin(frame * b.swingSpeed + b.swingOffset) * b.swingRange
        const breathe  = 0.82 + Math.sin(frame * 0.018 + b.phase) * 0.18
        const alpha    = b.opacity * breathe

        const tipX = b.ox + Math.cos(curAngle) * b.length
        const tipY = b.oy + Math.sin(curAngle) * b.length
        const halfW = b.spread * b.length
        const perp  = curAngle + Math.PI / 2
        const baseL = { x: tipX + Math.cos(perp) * halfW, y: tipY + Math.sin(perp) * halfW }
        const baseR = { x: tipX - Math.cos(perp) * halfW, y: tipY - Math.sin(perp) * halfW }

        const [r, g, bl] = b.color

        ctx.save()
        ctx.globalCompositeOperation = 'screen'

        // Cone principal — largo e visível
        const grad = ctx.createLinearGradient(b.ox, b.oy, tipX, tipY)
        grad.addColorStop(0,    `rgba(${r},${g},${bl},0)`)
        grad.addColorStop(0.03, `rgba(${r},${g},${bl},${alpha})`)
        grad.addColorStop(0.25, `rgba(${r},${g},${bl},${alpha * 0.65})`)
        grad.addColorStop(0.65, `rgba(${r},${g},${bl},${alpha * 0.25})`)
        grad.addColorStop(1,    `rgba(${r},${g},${bl},0)`)
        ctx.beginPath()
        ctx.moveTo(b.ox, b.oy)
        ctx.lineTo(baseL.x, baseL.y)
        ctx.lineTo(baseR.x, baseR.y)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // Halo difuso — névoa de luz ao redor do cone
        const haloW = halfW * 2.2
        const haloL = { x: tipX + Math.cos(perp) * haloW, y: tipY + Math.sin(perp) * haloW }
        const haloR = { x: tipX - Math.cos(perp) * haloW, y: tipY - Math.sin(perp) * haloW }
        const halo = ctx.createLinearGradient(b.ox, b.oy, tipX, tipY)
        halo.addColorStop(0,    `rgba(${r},${g},${bl},0)`)
        halo.addColorStop(0.04, `rgba(${r},${g},${bl},${alpha * 0.35})`)
        halo.addColorStop(0.40, `rgba(${r},${g},${bl},${alpha * 0.12})`)
        halo.addColorStop(1,    `rgba(${r},${g},${bl},0)`)
        ctx.beginPath()
        ctx.moveTo(b.ox, b.oy)
        ctx.lineTo(haloL.x, haloL.y)
        ctx.lineTo(haloR.x, haloR.y)
        ctx.closePath()
        ctx.fillStyle = halo
        ctx.fill()

        // Núcleo brilhante com ponta branca
        const core = ctx.createLinearGradient(b.ox, b.oy, tipX, tipY)
        core.addColorStop(0,    `rgba(${r},${g},${bl},0)`)
        core.addColorStop(0.02, `rgba(255,255,255,${alpha * 0.9})`)
        core.addColorStop(0.25, `rgba(${r},${g},${bl},${alpha * 0.8})`)
        core.addColorStop(0.70, `rgba(${r},${g},${bl},${alpha * 0.3})`)
        core.addColorStop(1,    `rgba(${r},${g},${bl},0)`)
        ctx.beginPath()
        ctx.moveTo(b.ox, b.oy)
        ctx.lineTo(tipX, tipY)
        ctx.strokeStyle = core
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])  // ← sem dependências: beams vivem para sempre, só as cores interpolam

  // Rotação aleatória das fotos de fundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setFotoAtual(prev => {
          const next = (prev + 1) % FOTOS.length
          setFotoProxima((next + 1) % FOTOS.length)
          return next
        })
        setTransitioning(false)
      }, 1200)
    }, 7300)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* FUNDO — fotos rotacionando com crossfade */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-none"
        style={{ backgroundImage: `url(${FOTOS[fotoProxima]})` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${FOTOS[fotoAtual]})`,
          opacity: transitioning ? 0 : 1,
          transition: transitioning ? 'opacity 1.2s ease-in-out' : 'none',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-preto-profundo/50 via-preto-profundo/30 to-preto-profundo/80" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-preto-profundo/60" />

      {/* LAVAGEM DE COR — tinge todo o hero com a identidade do banner */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'rgba(255, 0, 130, 0.10)',
            'rgba(10, 60, 255, 0.10)',
            'rgba(30, 170, 255, 0.10)',
          ][fotoAtual],
          transition: 'background 2s ease-in-out',
          mixBlendMode: 'screen',
          zIndex: 5,
        }}
      />

      {/* CANVAS DE LASERS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* CONTEÚDO */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">

        {/* LOGO ANIMADO */}
        <div className="flex justify-center mb-8 animate-float">
          <LogoElefante
            width={100}
            height={110}
            color="#E8DDD0"
            animated
          />
        </div>

        {/* NOME */}
        <h1
          className="font-accent text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.12em] mb-3 animate-fade-up"
          style={{ color: '#E8DDD0', textShadow: '0 0 60px rgba(201,168,76,0.3)' }}
        >
          maandhoo
        </h1>

        {/* SUBTÍTULO */}
        <p className="font-display text-xl md:text-2xl italic text-bege-escuro mb-3 animate-fade-up delay-200">
          Suas noites são na Maandhoo
        </p>
        <p className="font-accent text-xs tracking-[0.4em] uppercase text-dourado mb-10 animate-fade-up delay-300">
          O melhor club de Balneário Camboriú
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-400">
          <Link href="/#eventos" className="btn-primary">
            Ver Próximos Eventos
          </Link>
          <Link href="/reservas" className="btn-outline">
            Fazer Reserva
          </Link>
        </div>

        {/* BADGES INFO */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-up delay-500">
          {[
            { value: '500–800', label: 'pessoas por noite' },
            { value: 'BC', label: 'Balneário Camboriú' },
            { value: '15', label: 'camarotes' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="font-display text-2xl text-gradient-gold">{item.value}</div>
              <div className="font-body text-xs text-bege-escuro/60 tracking-wider uppercase mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown size={24} className="text-dourado/60" />
      </div>
    </section>
  )
}

export default HeroSection
