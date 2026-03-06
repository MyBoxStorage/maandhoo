'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'

const fotos = [
  { src: '/images/galeria/Espaço_1.webp', alt: 'Maandhoo Club — Show ao vivo com lasers e fumaça', titulo: 'Maandhoo ao Vivo' },
  { src: '/images/galeria/Espaço_2.jpg',  alt: 'Maandhoo Club — Ambiente interno com luzes e decoração', titulo: 'Ambiente Interno' },
  { src: '/images/galeria/Espaço_3.webp', alt: 'Maandhoo Club — Artista no palco com luzes coloridas', titulo: 'Palco Principal' },
]

export default function GaleriaPage() {
  const [fotoAberta, setFotoAberta] = useState<typeof fotos[0] | null>(null)

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Experiência</p>
          <h1 className="section-title mb-4">Galeria</h1>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60">
            A Maandhoo em fotos — o ambiente que te espera toda semana
          </p>
        </div>

        {/* GRID FOTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fotos.map((foto, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-sm border border-white/8 hover:border-dourado/40 cursor-zoom-in transition-all duration-300"
              style={{ aspectRatio: i === 1 ? '9/16' : '4/3' }}
              onClick={() => setFotoAberta(foto)}
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between">
                <span className="font-body text-sm text-bege">{foto.titulo}</span>
                <ZoomIn size={18} className="text-dourado" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-bege-escuro/35 mt-10 italic">
          Novas fotos são adicionadas após cada evento
        </p>
      </div>

      {/* LIGHTBOX */}
      {fotoAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setFotoAberta(null)}
        >
          <button
            onClick={() => setFotoAberta(null)}
            className="absolute top-6 right-6 text-bege-escuro hover:text-bege bg-black/60 rounded-full p-2"
          >
            <X size={24} />
          </button>
          <div
            className="relative max-w-4xl w-full"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={fotoAberta.src}
              alt={fotoAberta.alt}
              width={1200}
              height={800}
              className="object-contain w-full h-full rounded-sm"
              style={{ maxHeight: '85vh' }}
            />
            <p className="text-center font-body text-sm text-bege-escuro/70 mt-3">{fotoAberta.titulo}</p>
          </div>
        </div>
      )}
    </div>
  )
}
