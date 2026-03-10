'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, Loader2 } from 'lucide-react'

type FotoGaleria = {
  id: string
  url: string
  alt: string | null
}

export default function GaleriaPage() {
  const [fotos, setFotos] = useState<FotoGaleria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [fotoAberta, setFotoAberta] = useState<FotoGaleria | null>(null)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const res = await fetch('/api/galeria')
        const data = await res.json()
        setFotos(Array.isArray(data.fotos) ? data.fotos : [])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

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

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-dourado/50" />
          </div>
        ) : fotos.length === 0 ? (
          <p className="text-center text-sm text-bege-escuro/45 py-20">
            Nenhuma foto publicada no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fotos.map((foto, i) => (
            <div
              key={foto.id}
              className="group relative overflow-hidden rounded-sm border border-white/8 hover:border-dourado/40 cursor-zoom-in transition-all duration-300"
              style={{ aspectRatio: i === 1 ? '9/16' : '4/3' }}
              onClick={() => setFotoAberta(foto)}
            >
              <Image
                src={foto.url}
                alt={foto.alt ?? 'Foto da Maandhoo Club'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between">
                <span className="font-body text-sm text-bege truncate">{foto.alt ?? 'Experiencia Maandhoo'}</span>
                <ZoomIn size={18} className="text-dourado" />
              </div>
            </div>
          ))}
          </div>
        )}

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
              src={fotoAberta.url}
              alt={fotoAberta.alt ?? 'Foto da Maandhoo Club'}
              width={1200}
              height={800}
              className="object-contain w-full h-full rounded-sm"
              style={{ maxHeight: '85vh' }}
            />
            <p className="text-center font-body text-sm text-bege-escuro/70 mt-3">{fotoAberta.alt ?? 'Experiencia Maandhoo'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
