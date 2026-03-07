'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'

/* ─────────────────────────────────────────────
   FOTOS DO HERO
───────────────────────────────────────────── */
const FOTOS = [
  '/images/galeria/Espaço_1.webp',
  '/images/galeria/Espaço_2.jpg',
  '/images/galeria/Espaço_3.webp',
]

/* ─────────────────────────────────────────────
   PALETA POR BANNER
   Cada entry: [R, G, B] — cores quentes de balada
───────────────────────────────────────────── */
const PALETAS: [number, number, number][][] = [
  // Banner 0 — rosa / magenta
  [[255, 30, 150], [220, 0, 110], [255, 80, 190], [200, 0, 90], [255, 255, 255]],
  // Banner 1 — azul / vermelho elétrico
  [[20, 90, 255], [50, 150, 255], [220, 20, 20], [0, 50, 220], [255, 255, 255]],
  // Banner 2 — azul gelo
  [[60, 190, 255], [120, 210, 255], [30, 140, 255], [180, 235, 255], [255, 255, 255]],
]

/* ─────────────────────────────────────────────
   TIPOS INTERNOS DO ENGINE
───────────────────────────────────────────── */
type RGB = [number, number, number]

/* Feixe de luz direcional — simula moving-head fixture */
interface Beam {
  ox: number; oy: number          // origem (fora da tela)
  baseAngle: number               // ângulo central
  swingAmp: number                // amplitude do balanço (rad)
  swingFreq: number               // frequência do balanço (rad/frame)
  swingPhase: number              // fase inicial
  length: number                  // comprimento máximo do feixe
  coneHalf: number                // metade do ângulo do cone (rad)
  color: RGB                      // cor atual (interpolada)
  colorIdx: number                // índice na paleta
  opacity: number                 // opacidade base
  breathePhase: number            // fase do "pulso" de intensidade
  breatheFreq: number
}

/* Flash estroboscópico — burst instantâneo + decay exponencial */
interface Strobe {
  x: number; y: number            // posição
  radius: number                  // raio máximo
  color: RGB
  life: number                    // 0–1, decresce exponencialmente
  decay: number                   // taxa de decaimento
  active: boolean
}

/* Partícula de névoa — revela o feixe no ar */
interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number                    // 0–1
  maxLife: number
  size: number
  color: RGB
  opacity: number
}

/* ─────────────────────────────────────────────
   MATH HELPERS
───────────────────────────────────────────── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/* Falloff quadrático de luz: intensidade ∝ 1 - (dist/r)²  */
const quadFalloff = (dist: number, radius: number) =>
  clamp(1 - (dist / radius) ** 2, 0, 1)

/* Easing exponencial para strobe: rápida subida, cauda longa */
const strobeAlpha = (life: number) =>
  life > 0.9
    ? (1 - life) / 0.1          // attack: 0→1 em 10% do ciclo
    : Math.exp(-4 * (1 - life)) // decay exponencial

/* ─────────────────────────────────────────────
   COMPONENTE
───────────────────────────────────────────── */
export const HeroSection: React.FC = () => {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const paletaRef  = useRef<RGB[]>(PALETAS[0])
  const tituloRef  = useRef<HTMLHeadingElement>(null)
  const shineRef   = useRef<HTMLCanvasElement>(null)

  const [fotoAtual,  setFotoAtual]  = useState(0)
  const [fotoProxima, setFotoProxima] = useState(1)
  const [transitioning, setTransitioning] = useState(false)

  /* Sincroniza paleta de referência sempre que troca de foto */
  useEffect(() => {
    paletaRef.current = PALETAS[fotoAtual]
  }, [fotoAtual])

  /* ── ENGINE DE LUZ ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* ── Resize ── */
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* ──────────────────────────────────────────
       CRIAÇÃO DOS BEAMS
       Fixtures reais posicionados como em palco:
       - moving-heads no topo (9)
       - PAR cans na lateral esquerda (5)
       - PAR cans na lateral direita (5)
    ────────────────────────────────────────── */
    const createBeams = (): Beam[] => {
      const W = canvas.width
      const H = canvas.height
      const pal = PALETAS[0]
      const beams: Beam[] = []

      /* TOPO — moving-heads em arco */
      const topPos = [0.05, 0.15, 0.26, 0.38, 0.50, 0.62, 0.74, 0.85, 0.95]
      topPos.forEach((pos, i) => {
        /* Ângulo base: todos apontam para baixo, variação pelo índice */
        const deviation = ((i / (topPos.length - 1)) - 0.5) * 0.5  // -0.25 a +0.25 rad
        beams.push({
          ox: W * pos, oy: -4,
          baseAngle: Math.PI / 2 + deviation,
          swingAmp:  0.08 + Math.random() * 0.18,
          swingFreq: 0.0022 + Math.random() * 0.0035,
          swingPhase: (i / topPos.length) * Math.PI * 2,
          length: H * (0.55 + Math.random() * 0.45),
          coneHalf: 0.022 + Math.random() * 0.028,  // cone fino (~2–5°)
          color: [...pal[i % pal.length]] as RGB,
          colorIdx: i % pal.length,
          opacity: 0.55 + Math.random() * 0.30,
          breathePhase: Math.random() * Math.PI * 2,
          breatheFreq: 0.012 + Math.random() * 0.010,
        })
      })

      /* ESQUERDA — PAR cans apontando para o centro/direita */
      ;[0.10, 0.28, 0.50, 0.72, 0.90].forEach((pos, i) => {
        const ci = (i + 1) % pal.length
        beams.push({
          ox: -4, oy: H * pos,
          baseAngle: -0.12 + (Math.random() - 0.5) * 0.4,
          swingAmp:  0.05 + Math.random() * 0.14,
          swingFreq: 0.0019 + Math.random() * 0.0032,
          swingPhase: Math.random() * Math.PI * 2,
          length: W * (0.50 + Math.random() * 0.45),
          coneHalf: 0.020 + Math.random() * 0.025,
          color: [...pal[ci]] as RGB,
          colorIdx: ci,
          opacity: 0.45 + Math.random() * 0.25,
          breathePhase: Math.random() * Math.PI * 2,
          breatheFreq: 0.010 + Math.random() * 0.012,
        })
      })

      /* DIREITA — PAR cans apontando para o centro/esquerda */
      ;[0.10, 0.28, 0.50, 0.72, 0.90].forEach((pos, i) => {
        const ci = (i + 2) % pal.length
        beams.push({
          ox: W + 4, oy: H * pos,
          baseAngle: Math.PI + 0.12 + (Math.random() - 0.5) * 0.4,
          swingAmp:  0.05 + Math.random() * 0.14,
          swingFreq: 0.0019 + Math.random() * 0.0032,
          swingPhase: Math.random() * Math.PI * 2,
          length: W * (0.50 + Math.random() * 0.45),
          coneHalf: 0.020 + Math.random() * 0.025,
          color: [...pal[ci]] as RGB,
          colorIdx: ci,
          opacity: 0.45 + Math.random() * 0.25,
          breathePhase: Math.random() * Math.PI * 2,
          breatheFreq: 0.010 + Math.random() * 0.012,
        })
      })

      return beams
    }

    /* ──────────────────────────────────────────
       POOL DE STROBES
    ────────────────────────────────────────── */
    const createStrobePool = (count: number): Strobe[] =>
      Array.from({ length: count }, () => ({
        x: 0, y: 0, radius: 0,
        color: [255, 255, 255] as RGB,
        life: 0, decay: 0, active: false,
      }))

    /* ──────────────────────────────────────────
       POOL DE PARTÍCULAS
    ────────────────────────────────────────── */
    const createParticlePool = (count: number): Particle[] =>
      Array.from({ length: count }, () => ({
        x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 1, size: 0,
        color: [255, 255, 255] as RGB, opacity: 0,
      }))

    const beams     = createBeams()
    const strobes   = createStrobePool(24)
    const particles = createParticlePool(60)

    /* ──────────────────────────────────────────
       SPAWN HELPERS
    ────────────────────────────────────────── */
    const spawnStrobe = (frame: number) => {
      if (frame % 18 !== 0 && Math.random() > 0.04) return
      const s = strobes.find(s => !s.active)
      if (!s) return
      const W = canvas.width
      const H = canvas.height
      const pal = paletaRef.current
      const col = pal[Math.floor(Math.random() * pal.length)]
      s.x = W * (0.1 + Math.random() * 0.8)
      s.y = H * (0.1 + Math.random() * 0.7)
      s.radius = 18 + Math.random() * 30
      s.color  = [...col] as RGB
      s.life   = 1
      s.decay  = 0.035 + Math.random() * 0.05
      s.active = true
    }

    const spawnParticle = (b: Beam, frame: number) => {
      if (Math.random() > 0.06) return
      const p = particles.find(p => p.life <= 0)
      if (!p) return
      /* Posição aleatória ao longo do feixe */
      const t = Math.random()
      const curAngle = b.baseAngle +
        Math.sin(frame * b.swingFreq + b.swingPhase) * b.swingAmp
      p.x = b.ox + Math.cos(curAngle) * b.length * t
      p.y = b.oy + Math.sin(curAngle) * b.length * t
      /* Deriva suave perpendicular ao feixe */
      const perp = curAngle + Math.PI / 2
      const drift = (Math.random() - 0.5) * 0.6
      p.vx = Math.cos(perp) * drift + (Math.random() - 0.5) * 0.3
      p.vy = Math.sin(perp) * drift - 0.15  // sobe levemente
      p.maxLife = 0.6 + Math.random() * 1.4
      p.life    = p.maxLife
      p.size    = 1.2 + Math.random() * 2.8
      p.color   = [...b.color] as RGB
      p.opacity = 0.4 + Math.random() * 0.5
    }

    /* ──────────────────────────────────────────
       DRAW — BEAM
       Física real: cone fino + halo gaussiano
       + núcleo branco + source glow
    ────────────────────────────────────────── */
    const drawBeam = (b: Beam, frame: number) => {
      const W = canvas.width
      const H = canvas.height

      /* Interpola cor suavemente (lerp por frame) */
      const tgt = paletaRef.current[b.colorIdx]
      const sp  = 0.010
      b.color[0] = lerp(b.color[0], tgt[0], sp)
      b.color[1] = lerp(b.color[1], tgt[1], sp)
      b.color[2] = lerp(b.color[2], tgt[2], sp)

      const curAngle = b.baseAngle +
        Math.sin(frame * b.swingFreq + b.swingPhase) * b.swingAmp
      const breathe = 0.78 + Math.sin(frame * b.breatheFreq + b.breathePhase) * 0.22
      const alpha   = b.opacity * breathe

      const [r, g, bl] = b.color
      const tipX = b.ox + Math.cos(curAngle) * b.length
      const tipY = b.oy + Math.sin(curAngle) * b.length

      /* ── Layers do feixe (do mais externo ao mais interno) ── */

      /* 1. Halo difuso largo — névoa ao redor do cone */
      const haloHalf = b.coneHalf * 5.5
      const halfWHalo = haloHalf * b.length
      const perp = curAngle + Math.PI / 2
      const hLx = tipX + Math.cos(perp) * halfWHalo
      const hLy = tipY + Math.sin(perp) * halfWHalo
      const hRx = tipX - Math.cos(perp) * halfWHalo
      const hRy = tipY - Math.sin(perp) * halfWHalo

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      const haloGrad = ctx.createLinearGradient(b.ox, b.oy, tipX, tipY)
      haloGrad.addColorStop(0,    `rgba(${r},${g},${bl},0)`)
      haloGrad.addColorStop(0.05, `rgba(${r},${g},${bl},${alpha * 0.18})`)
      haloGrad.addColorStop(0.35, `rgba(${r},${g},${bl},${alpha * 0.07})`)
      haloGrad.addColorStop(1,    `rgba(${r},${g},${bl},0)`)
      ctx.beginPath()
      ctx.moveTo(b.ox, b.oy)
      ctx.lineTo(hLx, hLy)
      ctx.lineTo(hRx, hRy)
      ctx.closePath()
      ctx.fillStyle = haloGrad
      ctx.fill()
      ctx.restore()

      /* 2. Cone principal — spread médio, intensidade boa */
      const mainHalf = b.coneHalf * 2.2
      const halfWMain = mainHalf * b.length
      const mLx = tipX + Math.cos(perp) * halfWMain
      const mLy = tipY + Math.sin(perp) * halfWMain
      const mRx = tipX - Math.cos(perp) * halfWMain
      const mRy = tipY - Math.sin(perp) * halfWMain

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      const mainGrad = ctx.createLinearGradient(b.ox, b.oy, tipX, tipY)
      mainGrad.addColorStop(0,    `rgba(${r},${g},${bl},0)`)
      mainGrad.addColorStop(0.03, `rgba(${r},${g},${bl},${alpha * 0.70})`)
      mainGrad.addColorStop(0.20, `rgba(${r},${g},${bl},${alpha * 0.50})`)
      mainGrad.addColorStop(0.60, `rgba(${r},${g},${bl},${alpha * 0.18})`)
      mainGrad.addColorStop(1,    `rgba(${r},${g},${bl},0)`)
      ctx.beginPath()
      ctx.moveTo(b.ox, b.oy)
      ctx.lineTo(mLx, mLy)
      ctx.lineTo(mRx, mRy)
      ctx.closePath()
      ctx.fillStyle = mainGrad
      ctx.fill()
      ctx.restore()

      /* 3. Núcleo fino — feixe concentrado, quase branco na origem */
      const coreHalf = b.coneHalf * 0.35
      const halfWCore = coreHalf * b.length
      const cLx = tipX + Math.cos(perp) * halfWCore
      const cLy = tipY + Math.sin(perp) * halfWCore
      const cRx = tipX - Math.cos(perp) * halfWCore
      const cRy = tipY - Math.sin(perp) * halfWCore

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      const coreGrad = ctx.createLinearGradient(b.ox, b.oy, tipX, tipY)
      coreGrad.addColorStop(0,    `rgba(255,255,255,0)`)
      coreGrad.addColorStop(0.02, `rgba(255,255,255,${alpha * 0.95})`)
      coreGrad.addColorStop(0.15, `rgba(${r},${g},${bl},${alpha * 0.85})`)
      coreGrad.addColorStop(0.55, `rgba(${r},${g},${bl},${alpha * 0.30})`)
      coreGrad.addColorStop(1,    `rgba(${r},${g},${bl},0)`)
      ctx.beginPath()
      ctx.moveTo(b.ox, b.oy)
      ctx.lineTo(cLx, cLy)
      ctx.lineTo(cRx, cRy)
      ctx.closePath()
      ctx.fillStyle = coreGrad
      ctx.fill()
      ctx.restore()



      /* 4. Source glow — corona da lâmpada na origem */
      const sourceR = 28 + breathe * 14
      const isOnscreen =
        b.ox >= -sourceR && b.ox <= W + sourceR &&
        b.oy >= -sourceR && b.oy <= H + sourceR
      if (isOnscreen) {
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const srcGrad = ctx.createRadialGradient(b.ox, b.oy, 0, b.ox, b.oy, sourceR)
        srcGrad.addColorStop(0,   `rgba(255,255,255,${alpha * 0.80})`)
        srcGrad.addColorStop(0.25,`rgba(${r},${g},${bl},${alpha * 0.50})`)
        srcGrad.addColorStop(0.65,`rgba(${r},${g},${bl},${alpha * 0.12})`)
        srcGrad.addColorStop(1,   `rgba(${r},${g},${bl},0)`)
        ctx.beginPath()
        ctx.arc(b.ox, b.oy, sourceR, 0, Math.PI * 2)
        ctx.fillStyle = srcGrad
        ctx.fill()
        ctx.restore()
      }

      /* 5. Spawn partículas de névoa ao longo deste beam */
      spawnParticle(b, frame)
    }

    /* ──────────────────────────────────────────
       DRAW — STROBE
       Radial com falloff quadrático + anel de choque
    ────────────────────────────────────────── */
    const drawStrobe = (s: Strobe) => {
      if (!s.active) return
      const [r, g, bl] = s.color
      const a = strobeAlpha(s.life)

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      /* Corpo principal — radial com falloff quad */
      const rg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius)
      rg.addColorStop(0,   `rgba(255,255,255,${a * 0.90})`)
      rg.addColorStop(0.15,`rgba(${r},${g},${bl},${a * 0.70})`)
      rg.addColorStop(0.45,`rgba(${r},${g},${bl},${a * 0.25})`)
      rg.addColorStop(0.80,`rgba(${r},${g},${bl},${a * 0.06})`)
      rg.addColorStop(1,   `rgba(${r},${g},${bl},0)`)
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
      ctx.fillStyle = rg
      ctx.fill()

      /* Anel de choque — aparece só no burst (life > 0.85) */
      if (s.life > 0.85) {
        const ringProgress = 1 - (s.life - 0.85) / 0.15  // 0→1 durante o burst
        const ringR = s.radius * 0.3 + s.radius * 0.7 * ringProgress
        const ringA = (1 - ringProgress) * a * 0.6
        ctx.beginPath()
        ctx.arc(s.x, s.y, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r},${g},${bl},${ringA})`
        ctx.lineWidth = 3 + (1 - ringProgress) * 6
        ctx.stroke()
      }

      ctx.restore()

      /* Decay */
      s.life -= s.decay
      if (s.life <= 0) s.active = false
    }

    /* ──────────────────────────────────────────
       DRAW — PARTICLE
       Soft circle com glow
    ────────────────────────────────────────── */
    const drawParticle = (p: Particle) => {
      if (p.life <= 0) return
      const t = p.life / p.maxLife          // 0→1 (começa em 1, vai a 0)
      const fadeAlpha = t < 0.2
        ? t / 0.2                           // fade-in suave
        : t > 0.7
          ? (1 - t) / 0.3                  // fade-out suave
          : 1

      const [r, g, bl] = p.color
      const a = p.opacity * fadeAlpha * 0.7

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      /* Glow externo */
      const glowR = p.size * 3.5
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR)
      glow.addColorStop(0,   `rgba(${r},${g},${bl},${a * 0.5})`)
      glow.addColorStop(0.5, `rgba(${r},${g},${bl},${a * 0.12})`)
      glow.addColorStop(1,   `rgba(${r},${g},${bl},0)`)
      ctx.beginPath()
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      /* Core brilhante */
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`
      ctx.fill()

      ctx.restore()

      /* Física */
      p.x += p.vx
      p.y += p.vy
      p.vy -= 0.004   // leve flutuabilidade
      p.life -= 0.016
    }

    /* ──────────────────────────────────────────
       LOOP PRINCIPAL
    ────────────────────────────────────────── */
    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      /* Spawn strobe aleatório */
      spawnStrobe(frame)

      /* Desenha na ordem: strobes → beams → partículas */
      strobes.forEach(drawStrobe)
      beams.forEach(b => drawBeam(b, frame))
      particles.forEach(drawParticle)

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  /* ── Rotação de fotos ── */
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

  /* ── Shine canvas sobre o título ── */
  useEffect(() => {
    const h1 = tituloRef.current
    const cv = shineRef.current
    if (!h1 || !cv) return

    const rect = h1.getBoundingClientRect()
    cv.width  = rect.width
    cv.height = rect.height

    const ctx = cv.getContext('2d')
    if (!ctx) return

    // Aguarda o fade-up do título (~0.7s delay-100 + 0.6s anim)
    let raf: number
    let start: number | null = null
    const DURATION = 2600  // ms — duração total do sweep
    const DELAY    = 900   // ms — espera antes de começar

    const draw = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start

      ctx.clearRect(0, 0, cv.width, cv.height)

      if (elapsed < DELAY) {
        raf = requestAnimationFrame(draw)
        return
      }

      const t = Math.min((elapsed - DELAY) / DURATION, 1)

      // Posição do raio: começa em -30% e vai até 130%
      const x = (t * 1.6 - 0.3) * cv.width

      // Opacity: fade in nos primeiros 8%, fade out nos últimos 8%
      const fadeIn  = Math.min(t / 0.08, 1)
      const fadeOut = Math.min((1 - t) / 0.08, 1)
      const alpha   = fadeIn * fadeOut

      if (alpha > 0) {
        const bw = cv.width * 0.22  // largura do feixe
        const grad = ctx.createLinearGradient(x - bw, 0, x + bw, 0)
        grad.addColorStop(0,    `rgba(255,255,255,0)`)
        grad.addColorStop(0.35, `rgba(255,255,255,${0.06 * alpha})`)
        grad.addColorStop(0.48, `rgba(220,185,80,${0.70 * alpha})`)
        grad.addColorStop(0.52, `rgba(255,240,180,${0.85 * alpha})`)
        grad.addColorStop(0.65, `rgba(255,255,255,${0.06 * alpha})`)
        grad.addColorStop(1,    `rgba(255,255,255,0)`)

        // Skew via transform
        ctx.save()
        ctx.transform(1, 0, -0.18, 1, cv.height * 0.18, 0)
        ctx.fillStyle = grad
        ctx.fillRect(x - bw * 1.5, 0, bw * 3, cv.height)
        ctx.restore()
      }

      if (t < 1) raf = requestAnimationFrame(draw)
      // Quando t === 1: canvas fica transparente — texto volta limpo
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
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

      {/* Gradientes de escurecimento */}
      <div className="absolute inset-0 bg-gradient-to-b from-preto-profundo/55 via-preto-profundo/25 to-preto-profundo/80" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-preto-profundo/60" />

      {/* Lavagem de cor sincronizada com o banner */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'rgba(255, 0, 130, 0.08)',
            'rgba(10,  60, 255, 0.08)',
            'rgba(30, 170, 255, 0.08)',
          ][fotoAtual],
          transition: 'background 2s ease-in-out',
          mixBlendMode: 'screen',
          zIndex: 5,
        }}
      />

      {/* CANVAS DE LUZ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* CONTEÚDO */}
      <div className="relative z-20 text-center px-6 sm:px-8 max-w-3xl mx-auto w-full">

        <div className="flex justify-center mb-6 sm:mb-9 animate-float">
          <LogoElefante width={120} height={134} color="#E8DDD0" animated />
        </div>

        <div className="relative mb-5 animate-fade-up delay-100">
          <h1
            ref={tituloRef}
            className="font-brand text-[18vw] sm:text-8xl md:text-9xl leading-none maandhoo-title"
            style={{ letterSpacing: '-0.01em', fontWeight: 600 }}
          >
            Maandhoo
          </h1>
          <canvas
            ref={shineRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>

        <div className="mb-8 sm:mb-10 animate-fade-up delay-200 space-y-1">
          <p
            className="font-display text-xl sm:text-2xl md:text-3xl italic"
            style={{
              color: 'rgba(240,232,220,0.90)',
              textShadow: '0 1px 30px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.8)',
              letterSpacing: '0.01em',
            }}
          >
            Suas noites são na Maandhoo.
          </p>
          <p
            className="font-accent text-sm sm:text-base tracking-[0.22em] uppercase"
            style={{
              color: 'rgba(220,190,90,1)',
              textShadow: '0 0 30px rgba(201,168,76,0.8), 0 1px 30px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,1)',
              fontWeight: 600,
            }}
          >
            O melhor club de Balneário Camboriú
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up delay-300 w-full">
          <Link href="/#eventos" className="btn-primary w-full sm:w-auto text-center">
            Ver Próximos Eventos
          </Link>
          <Link href="/reservas" className="btn-outline w-full sm:w-auto text-center">
            Fazer Reserva
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10 sm:mt-12 animate-fade-up delay-400">
          <div className="h-px w-12 bg-dourado/30" />
          <div className="w-1 h-1 rounded-full bg-dourado/50" />
          <div className="h-px w-12 bg-dourado/30" />
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-5 animate-fade-up delay-500">
          {[
            { value: '500–800', label: 'pessoas / noite' },
            { value: 'BC',      label: 'Balneário Camboriú' },
            { value: '15+',     label: 'camarotes' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="font-display text-xl sm:text-2xl md:text-3xl text-gradient-gold mb-0.5"
                style={{ letterSpacing: '0.02em' }}
              >{item.value}</div>
              <div className="font-body text-[9px] sm:text-xs text-bege-escuro/50 tracking-[0.10em] sm:tracking-[0.15em] uppercase">
                {item.label}
              </div>
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
