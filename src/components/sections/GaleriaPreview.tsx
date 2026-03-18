'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera } from 'lucide-react'

type MidiaGaleria = {
  id: string
  url: string
  alt: string | null
  posicao_destaque: number | null
}

// Detecta vídeo pelo URL — Cloudinary video ou extensão .mp4/.webm/.mov
const isVideo = (url: string): boolean =>
  url.includes('/video/upload/') ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(url)

// ─── Tile de mídia ────────────────────────────────────────────
function MediaTile({
  midia,
  className,
  objectPosition = 'center',
}: {
  midia: MidiaGaleria | null
  className?: string
  objectPosition?: string
}) {
  if (!midia) {
    return (
      <div className={`relative rounded-sm border border-white/10 bg-black/35 flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center gap-2 text-bege-escuro/25">
          <Camera size={16} />
          <span className="font-body text-[11px] tracking-widest uppercase">Em breve</span>
        </div>
      </div>
    )
  }

  const video = isVideo(midia.url)

  return (
    <div className={`relative rounded-sm overflow-hidden group ${className ?? ''}`}>
      {video ? (
        <video
          src={midia.url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition }}
        />
      ) : (
        <Image
          src={midia.url}
          alt={midia.alt ?? 'Maandhoo Club'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      {/* Hover overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      {/* Borda dourada no hover */}
      <div className="absolute inset-0 border border-dourado/0 group-hover:border-dourado/30 rounded-sm transition-all duration-400" />
    </div>
  )
}

// ─── Seção principal ──────────────────────────────────────────
export const GaleriaPreview: React.FC = () => {
  const [midias, setMidias] = useState<MidiaGaleria[]>([])

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch('/api/galeria?destaques=true')
        const data = await res.json()
        setMidias(Array.isArray(data.fotos) ? data.fotos.slice(0, 7) : [])
      } catch {
        setMidias([])
      }
    }
    carregar()
  }, [])

  // 7 slots: posições 0-2 = verticais (portrait), posições 3-6 = horizontais (landscape)
  const slots = useMemo(
    () => Array.from({ length: 7 }, (_, i) => midias[i] ?? null),
    [midias],
  )

  // Slots por zona
  const [v0, v1, v2, h0, h1, h2, h3] = slots

  return (
    <section id="galeria" className="py-16 sm:py-24 px-4 bg-cinza-escuro/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <p className="section-subtitle mb-3">Experiência</p>
          <h2 className="section-title mb-4">A Maandhoo em Fotos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* ── MOBILE ─────────────────────────────────────────── */}
        {/* Alternância portrait/landscape para criar ritmo */}
        <div className="md:hidden space-y-3 mb-8">
          {/* 2 verticais lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <MediaTile midia={v0} className="h-[280px]" />
            <MediaTile midia={v1} className="h-[280px]" />
          </div>
          {/* 1 vertical largo */}
          <MediaTile midia={v2} className="h-[340px]" />
          {/* 2 horizontais lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <MediaTile midia={h0} className="h-[160px]" />
            <MediaTile midia={h1} className="h-[160px]" />
          </div>
          {/* 1 horizontal largo */}
          <MediaTile midia={h2} className="h-[180px]" />
          {/* 1 horizontal */}
          <MediaTile midia={h3} className="h-[160px]" />
        </div>

        {/* ── DESKTOP ────────────────────────────────────────── */}
        {/*
          Layout em 2 linhas:
          ┌──────────────┬──────────────┬──────────────┐
          │              │              │              │  ← LINHA 1 (altura ~400px)
          │  VERTICAL    │  VERTICAL    │  VERTICAL    │    3 cards portrait 9:16
          │   (slot 0)   │   (slot 1)   │   (slot 2)   │
          │              │              │              │
          ├──────┬───────┴──┬───────────┴──────┬───────┤
          │HORIZ │  HORIZ   │  HORIZ           │ HORIZ │  ← LINHA 2 (altura ~180px)
          │(sl 3)│  (sl 4)  │  (sl 5)          │ (sl6) │    4 cards landscape
          └──────┴──────────┴──────────────────┴───────┘
        */}
        <div className="hidden md:block mb-8">

          {/* Linha 1 — 3 cards verticais iguais */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MediaTile midia={v0} className="h-[380px] lg:h-[440px]" />
            <MediaTile midia={v1} className="h-[380px] lg:h-[440px]" />
            <MediaTile midia={v2} className="h-[380px] lg:h-[440px]" />
          </div>

          {/* Linha 2 — 4 cards horizontais, pesos diferentes */}
          {/* 2 menores + 1 largo + 1 médio para criar assimetria elegante */}
          <div className="grid grid-cols-12 gap-3">
            <MediaTile midia={h0} className="col-span-3 h-[170px] lg:h-[190px]" />
            <MediaTile midia={h1} className="col-span-3 h-[170px] lg:h-[190px]" />
            <MediaTile midia={h2} className="col-span-4 h-[170px] lg:h-[190px]" />
            <MediaTile midia={h3} className="col-span-2 h-[170px] lg:h-[190px]" />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-2">
          <Link href="/galeria" className="btn-outline inline-flex items-center gap-2">
            Galeria Completa
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default GaleriaPreview
