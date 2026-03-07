'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera } from 'lucide-react'

const fotos = [
  { src: '/images/galeria/Espaço_1.webp', alt: 'Maandhoo Club — Show ao vivo com lasers e fumaça' },
  { src: '/images/galeria/Espaço_2.jpg', alt: 'Maandhoo Club — Ambiente interno com luzes e decoração' },
  { src: '/images/galeria/Espaço_3.webp', alt: 'Maandhoo Club — Artista no palco com luzes coloridas' },
]

export const GaleriaPreview: React.FC = () => {
  return (
    <section id="galeria" className="py-16 sm:py-24 px-4 bg-cinza-escuro/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="section-subtitle mb-3">Experiência</p>
          <h2 className="section-title mb-4">A Maandhoo em Fotos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* GRID ASSIMÉTRICO — mobile: coluna única; desktop: grid 12 col */}
        <div className="flex flex-col md:grid md:grid-cols-12 md:grid-rows-2 gap-3 md:h-[520px] mb-8">
          {/* Foto grande esquerda */}
          <div className="md:col-span-7 md:row-span-2 relative rounded-sm overflow-hidden group h-64 md:h-auto">
            <Image
              src={fotos[0].src}
              alt={fotos[0].alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Fotos direita */}
          <div className="md:col-span-5 md:row-span-1 relative rounded-sm overflow-hidden group h-44 md:h-auto">
            <Image
              src={fotos[1].src}
              alt={fotos[1].alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="md:col-span-5 md:row-span-1 relative rounded-sm overflow-hidden group h-44 md:h-auto">
            <Image
              src={fotos[2].src}
              alt={fotos[2].alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* badge */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-preto-profundo/80 px-3 py-1.5 rounded-sm border border-gold/30">
              <Camera size={12} className="text-dourado" />
              <span className="font-body text-xs text-bege-escuro">Ver mais fotos</span>
            </div>
          </div>
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
