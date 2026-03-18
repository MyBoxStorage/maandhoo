'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera } from 'lucide-react'

type MidiaSlot = {
  id: string
  url: string
  alt: string | null
} | null

const isVideo = (url: string): boolean =>
  url.includes('/video/upload/') ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(url)

function MediaTile({ midia, className }: { midia: MidiaSlot; className?: string }) {
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
        />
      ) : (
        <Image
          src={midia.url}
          alt={midia.alt ?? 'Maandhoo Club'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute inset-0 border border-dourado/0 group-hover:border-dourado/30 rounded-sm transition-all duration-400" />
    </div>
  )
}

export const GaleriaPreview: React.FC = () => {
  const [slots, setSlots] = useState<MidiaSlot[]>(Array(7).fill(null))

  useEffect(() => {
    fetch('/api/galeria-home')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.slots)) setSlots(data.slots) })
      .catch(() => {})
  }, [])

  const [v0, v1, v2, h0, h1, h2, h3] = slots

  return (
    <section id="galeria" className="py-16 sm:py-24 px-4 bg-cinza-escuro/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14 sm:mb-16">
          <p className="section-subtitle mb-3">Experiência</p>
          <h2 className="section-title mb-4">A Experiência Maandhoo</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* ── MOBILE ── */}
        <div className="md:hidden space-y-3 mb-8">
          <div className="grid grid-cols-2 gap-3">
            <MediaTile midia={v0} className="aspect-[9/16]" />
            <MediaTile midia={v1} className="aspect-[9/16]" />
          </div>
          <MediaTile midia={v2} className="aspect-[9/16]" />
          <div className="grid grid-cols-2 gap-3">
            <MediaTile midia={h0} className="h-[160px]" />
            <MediaTile midia={h1} className="h-[160px]" />
          </div>
          <MediaTile midia={h2} className="h-[180px]" />
          <MediaTile midia={h3} className="h-[160px]" />
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden md:block mb-8">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MediaTile midia={v0} className="aspect-[9/16]" />
            <MediaTile midia={v1} className="aspect-[9/16]" />
            <MediaTile midia={v2} className="aspect-[9/16]" />
          </div>
          <div className="grid grid-cols-12 gap-3">
            <MediaTile midia={h0} className="col-span-3 h-[180px] lg:h-[200px]" />
            <MediaTile midia={h1} className="col-span-3 h-[180px] lg:h-[200px]" />
            <MediaTile midia={h2} className="col-span-4 h-[180px] lg:h-[200px]" />
            <MediaTile midia={h3} className="col-span-2 h-[180px] lg:h-[200px]" />
          </div>
        </div>

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
