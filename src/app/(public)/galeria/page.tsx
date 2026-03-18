'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Play, Loader2 } from 'lucide-react'

type MidiaGaleria = {
  id: string
  url: string
  alt: string | null
  orientacao: 'portrait' | 'landscape'
}

const isVideo = (url: string): boolean =>
  url.includes('/video/upload/') ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(url)

// Lightbox
function Lightbox({ midia, onClose }: { midia: MidiaGaleria; onClose: () => void }) {
  const video = isVideo(midia.url)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 text-bege-escuro hover:text-bege bg-black/60 rounded-full p-2 transition-colors z-10">
        <X size={22} />
      </button>
      <div className="relative max-w-4xl w-full flex flex-col items-center gap-3" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {video ? (
          <video src={midia.url} autoPlay loop playsInline controls className="w-full rounded-sm" style={{ maxHeight: '82vh', objectFit: 'contain' }} />
        ) : (
          <Image src={midia.url} alt={midia.alt ?? 'Maandhoo Club'} width={1200} height={800}
            className="object-contain w-full h-full rounded-sm" style={{ maxHeight: '82vh' }} />
        )}
        {midia.alt && <p className="font-body text-sm text-bege-escuro/60 text-center">{midia.alt}</p>}
      </div>
    </div>
  )
}

// Card de mídia com aspect-ratio correto por orientação
function MediaCard({ midia, onClick }: { midia: MidiaGaleria; onClick: () => void }) {
  const video = isVideo(midia.url)
  // portrait = 9:16, landscape = 4:3
  const aspectRatio = midia.orientacao === 'portrait' ? '9/16' : '4/3'

  return (
    <div
      className="group relative overflow-hidden rounded-sm border border-white/8 hover:border-dourado/40 cursor-pointer transition-all duration-300"
      style={{ aspectRatio }}
      onClick={onClick}
    >
      {video ? (
        <>
          <video src={midia.url} autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-sm">
            <Play size={9} className="text-dourado fill-dourado" />
            <span className="font-accent text-[9px] tracking-widest uppercase text-dourado/80">Vídeo</span>
          </div>
        </>
      ) : (
        <Image src={midia.url} alt={midia.alt ?? 'Maandhoo Club'} fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {midia.alt && (
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-body text-sm text-bege truncate block">{midia.alt}</span>
        </div>
      )}
    </div>
  )
}

export default function GaleriaPage() {
  const [midias, setMidias] = useState<MidiaGaleria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [midiaAberta, setMidiaAberta] = useState<MidiaGaleria | null>(null)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const res = await fetch('/api/galeria')
        const data = await res.json()
        setMidias(Array.isArray(data.fotos) ? data.fotos : [])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  // Separar portrait e landscape para colunas independentes (masonry sem JS)
  const portraits  = midias.filter(m => m.orientacao === 'portrait')
  const landscapes = midias.filter(m => m.orientacao === 'landscape')

  // Distribuir em 3 colunas de forma equilibrada (sem quebra)
  const col1: MidiaGaleria[] = []
  const col2: MidiaGaleria[] = []
  const col3: MidiaGaleria[] = []
  midias.forEach((m, i) => {
    if (i % 3 === 0) col1.push(m)
    else if (i % 3 === 1) col2.push(m)
    else col3.push(m)
  })

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Experiência</p>
          <h1 className="section-title mb-4">Galeria</h1>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60">
            A Maandhoo em fotos e vídeos — o ambiente que te espera toda semana
          </p>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-dourado/50" />
          </div>
        ) : midias.length === 0 ? (
          <p className="text-center text-sm text-bege-escuro/45 py-20">Nenhuma mídia publicada no momento.</p>
        ) : (
          // Grid de 3 colunas — cada item mantém seu aspect-ratio natural
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-4">
                {col.map(midia => (
                  <MediaCard key={midia.id} midia={midia} onClick={() => setMidiaAberta(midia)} />
                ))}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-bege-escuro/35 mt-10 italic">
          Novas fotos e vídeos são adicionados após cada evento
        </p>
      </div>

      {midiaAberta && <Lightbox midia={midiaAberta} onClose={() => setMidiaAberta(null)} />}
    </div>
  )
}
