'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera } from 'lucide-react'

type FotoGaleriaPublica = {
  id: string
  url: string
  alt: string | null
  posicao_destaque: number | null
}

const DESKTOP_LAYOUT_CLASSES = [
  'col-span-7 row-span-2',
  'col-span-2 row-span-1',
  'col-span-3 row-span-1',
  'col-span-3 row-span-1',
  'col-span-2 row-span-1',
  'col-span-3 row-span-1',
  'col-span-6 row-span-1',
  'col-span-3 row-span-1',
]

const MOBILE_HEIGHTS = ['h-72', 'h-56', 'h-56', 'h-64', 'h-56', 'h-64', 'h-72', 'h-56']

function FotoTile({ foto, className }: { foto: FotoGaleriaPublica | null; className?: string }) {
  if (!foto) {
    return (
      <div className={`relative rounded-sm border border-white/10 bg-black/35 flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center gap-2 text-bege-escuro/35">
          <Camera size={18} />
          <span className="font-body text-xs">Em breve</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-sm overflow-hidden group ${className ?? ''}`}>
      <Image
        src={foto.url}
        alt={foto.alt ?? 'Foto da Maandhoo Club'}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

export const GaleriaPreview: React.FC = () => {
  const [fotos, setFotos] = useState<FotoGaleriaPublica[]>([])

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch('/api/galeria?destaques=true')
        const data = await res.json()
        setFotos(Array.isArray(data.fotos) ? data.fotos.slice(0, 8) : [])
      } catch {
        setFotos([])
      }
    }
    carregar()
  }, [])

  const slots = useMemo(
    () => Array.from({ length: 8 }, (_, i) => fotos[i] ?? null),
    [fotos],
  )

  return (
    <section id="galeria" className="py-16 sm:py-24 px-4 bg-cinza-escuro/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="section-subtitle mb-3">Experiência</p>
          <h2 className="section-title mb-4">A Maandhoo em Fotos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* Mobile: coluna única com alturas variadas */}
        <div className="md:hidden space-y-3 mb-8">
          {slots.map((foto, i) => (
            <FotoTile key={`m-${i}`} foto={foto} className={MOBILE_HEIGHTS[i]} />
          ))}
        </div>

        {/* Desktop: grid 12 colunas, 3 linhas, h-[600px] */}
        <div className="hidden md:grid md:grid-cols-12 md:grid-rows-3 gap-3 h-[600px] mb-8">
          {slots.map((foto, i) => (
            <FotoTile key={`d-${i}`} foto={foto} className={DESKTOP_LAYOUT_CLASSES[i]} />
          ))}
        </div>

        <div className="text-center">
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
