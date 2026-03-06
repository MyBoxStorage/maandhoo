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

  // Partículas de laser animadas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const lasers: {
      x: number; y: number; angle: number; length: number;
      speed: number; opacity: number; color: string;
    }[] = []

    const colors = [
      'rgba(201,168,76,',
      'rgba(232,221,208,',
      'rgba(255,100,100,',
      'rgba(100,180,255,',
      'rgba(180,100,255,',
      'rgba(100,220,180,',
    ]

    // Lasers saindo de trás do nome MAANDHOO — centro horizontal, altura do título (~55% da tela)
    // Ângulos distribuídos em 360° para apontar em todas as direções
    for (let i = 0; i < 18; i++) {
      // Origem espalhada levemente ao redor do centro do nome
      const originX = canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.18
      const originY = canvas.height * 0.52 + (Math.random() - 0.5) * canvas.height * 0.06
      // Ângulo distribuído uniformemente em 360°, com leve viés para os lados
      const baseAngle = (i / 18) * Math.PI * 2
      lasers.push({
        x: originX,
        y: originY,
        angle: baseAngle + (Math.random() - 0.5) * 0.4,
        length: Math.random() * 550 + 350,
        speed: Math.random() * 0.007 + 0.003,
        opacity: Math.random() * 0.4 + 0.12,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    // Lasers secundários — origem fixa no centro do nome, ângulos aleatórios
    for (let i = 0; i < 8; i++) {
      lasers.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.1,
        y: canvas.height * 0.51,
        angle: Math.random() * Math.PI * 2,
        length: Math.random() * 400 + 250,
        speed: Math.random() * 0.005 + 0.002,
        opacity: Math.random() * 0.2 + 0.06,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      lasers.forEach((l, i) => {
        const oscillation = Math.sin(frame * l.speed + i) * 0.15
        const currentAngle = l.angle + oscillation
        const opacity = l.opacity * (0.6 + Math.sin(frame * l.speed * 2 + i) * 0.4)

        ctx.save()
        ctx.globalAlpha = opacity
        const gradient = ctx.createLinearGradient(
          l.x, l.y,
          l.x + Math.cos(currentAngle) * l.length,
          l.y + Math.sin(currentAngle) * l.length
        )
        gradient.addColorStop(0, l.color + '0.8)')
        gradient.addColorStop(0.3, l.color + '0.5)')
        gradient.addColorStop(1, l.color + '0)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(l.x, l.y)
        ctx.lineTo(
          l.x + Math.cos(currentAngle) * l.length,
          l.y + Math.sin(currentAngle) * l.length
        )
        ctx.stroke()
        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
    }, 5000)
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
      <div className="absolute inset-0 bg-gradient-to-b from-preto-profundo/80 via-preto-profundo/60 to-preto-profundo" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-preto-profundo/90" />

      {/* CANVAS DE LASERS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
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
