'use client'

import React, { useEffect, useState } from 'react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-5 right-5 text-bege-escuro hover:text-bege bg-black/60 rounded-full p-2 transition-colors z-10">
        <X size={22} />
      </button>
      <div
        className="relative max-w-4xl w-full flex flex-col items-center gap-3"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {video ? (
          <video src={midia.url} autoPlay loop playsInline controls
            className="w-full rounded-sm" style={{ maxHeight: '82vh', objectFit: 'contain' }} />
        ) : (
          <Image src={midia.url} alt={midia.alt ?? 'Maandhoo Club'} width={1200} height={800}
            className="object-contain w-full h-full rounded-sm" style={{ maxHeight: '82vh' }} />
        )}
        {midia.alt && (
          <p className="font-body text-sm text-bege-escuro/60 text-center">{midia.alt}</p>
        )}
      </div>
    </div>
  )
}

// Card de mídia
// Layout em fileiras mistas:
//   - Foto portrait  → ocupa 1 coluna em grid de 4  → mesma altura que landscape 4/3
//   - Foto landscape → ocupa 1 coluna em grid de 3  → 4/3
//   - Vídeo portrait → ocupa 1 coluna, mantém 9/16  → destaque visual
//   - Vídeo landscape→ 16/9
//
// Regra para o admin:
//   Fotos portrait: adicionar 4 seguidas (preenchem 1 fileira de 4)
//   Fotos landscape: adicionar 3 seguidas (preenchem 1 fileira de 3)

function MediaCard({ midia, onClick }: { midia: MidiaGaleria; onClick: () => void }) {
  const video = isVideo(midia.url)

  // Vídeos mantêm proporção real (destacados)
  // Fotos portrait e landscape têm a MESMA altura-alvo via aspect-ratio
  // portrait num grid de 4 colunas ≈ landscape num grid de 3 colunas (largura ~75%)
  // Usamos aspect-[3/4] para portrait e aspect-[4/3] para landscape — alturas quase idênticas
  const aspectRatio = video
    ? (midia.orientacao === 'portrait' ? '9/16' : '16/9')
    : (midia.orientacao === 'portrait' ? '3/4'  : '4/3')

  return (
    <div
      className="group relative overflow-hidden rounded-sm border border-white/8 hover:border-dourado/40 cursor-pointer transition-all duration-300"
      style={{ aspectRatio }}
      onClick={onClick}
    >
      {video ? (
        <>
          <video
            src={midia.url} autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-sm">
            <Play size={9} className="text-dourado fill-dourado" />
            <span className="font-accent text-[9px] tracking-widest uppercase text-dourado/80">Vídeo</span>
          </div>
        </>
      ) : (
        <Image
          src={midia.url} alt={midia.alt ?? 'Maandhoo Club'} fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {midia.alt && (
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-body text-xs text-bege truncate block">{midia.alt}</span>
        </div>
      )}
    </div>
  )
}

// ─── Agrupa mídias em fileiras mistas ────────────────────────
// Lê a sequência e monta fileiras:
//   - 4 portraits seguidos → fileira de 4 colunas
//   - 3 landscapes seguidos → fileira de 3 colunas
//   - Vídeos → fileira própria de 1 (destaque)
//   - Misto → fileira de 3 colunas genérica
type Fileira = { itens: MidiaGaleria[]; cols: number }

function montarFileiras(midias: MidiaGaleria[]): Fileira[] {
  const fileiras: Fileira[] = []
  let i = 0

  while (i < midias.length) {
    const atual = midias[i]
    const ehVideo = isVideo(atual.url)

    if (ehVideo) {
      // Vídeo: fileira própria com 1 item (destaque largo)
      fileiras.push({ itens: [atual], cols: 1 })
      i++
      continue
    }

    if (atual.orientacao === 'portrait') {
      // Coletar até 4 portraits seguidos (sem vídeos)
      const grupo: MidiaGaleria[] = []
      while (i < midias.length && grupo.length < 4 && !isVideo(midias[i].url) && midias[i].orientacao === 'portrait') {
        grupo.push(midias[i++])
      }
      fileiras.push({ itens: grupo, cols: 4 })
    } else {
      // Coletar até 3 landscapes seguidos (sem vídeos)
      const grupo: MidiaGaleria[] = []
      while (i < midias.length && grupo.length < 3 && !isVideo(midias[i].url) && midias[i].orientacao === 'landscape') {
        grupo.push(midias[i++])
      }
      fileiras.push({ itens: grupo, cols: 3 })
    }
  }

  return fileiras
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

  const fileiras = montarFileiras(midias)

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
          <p className="text-center text-sm text-bege-escuro/45 py-20">
            Nenhuma mídia publicada no momento.
          </p>
        ) : (
          <div className="space-y-4">
            {fileiras.map((fileira, fi) => {
              const ehVideoDestaque = fileira.cols === 1 && isVideo(fileira.itens[0]?.url)

              if (ehVideoDestaque) {
                // Vídeo: ocupa até metade da largura, centralizado
                return (
                  <div key={fi} className="flex justify-center">
                    <div className="w-full max-w-sm">
                      <MediaCard midia={fileira.itens[0]} onClick={() => setMidiaAberta(fileira.itens[0])} />
                    </div>
                  </div>
                )
              }

              // Fileira de fotos: cols=4 (portrait) ou cols=3 (landscape)
              const gridClass = fileira.cols === 4
                ? 'grid grid-cols-2 sm:grid-cols-4 gap-3'
                : 'grid grid-cols-1 sm:grid-cols-3 gap-3'

              return (
                <div key={fi} className={gridClass}>
                  {fileira.itens.map(midia => (
                    <MediaCard key={midia.id} midia={midia} onClick={() => setMidiaAberta(midia)} />
                  ))}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-bege-escuro/35 mt-10 italic">
          Novas fotos e vídeos são adicionados após cada evento
        </p>
      </div>

      {midiaAberta && (
        <Lightbox midia={midiaAberta} onClose={() => setMidiaAberta(null)} />
      )}
    </div>
  )
}
