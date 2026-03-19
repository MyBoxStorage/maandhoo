'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Play, Loader2, Download, Lock } from 'lucide-react'

type MidiaGaleria = {
  id: string
  url: string
  alt: string | null
  orientacao: 'portrait' | 'landscape'
}

const isVideo = (url: string): boolean =>
  url.includes('/video/upload/') ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(url)

// Foto hospedada no Supabase Storage (upload direto pelo admin)
const isSupabase = (url: string): boolean =>
  url.includes('supabase.co') || url.includes('/storage/v1/object/public/')

// ─── Lightbox ────────────────────────────────────────────────
function Lightbox({
  midia,
  logado,
  onClose,
}: {
  midia: MidiaGaleria
  logado: boolean
  onClose: () => void
}) {
  const video = isVideo(midia.url)
  const podeDownload = !video && isSupabase(midia.url)
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDownload = async () => {
    if (!logado) {
      window.location.href = '/acesso'
      return
    }
    setBaixando(true)
    try {
      const res = await fetch(midia.url, { cache: 'no-store' })
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const ext = midia.url.split('.').pop()?.split('?')[0] ?? 'jpg'
      const nome = (midia.alt ?? 'maandhoo')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${nome}.${ext}`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      // silencioso
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-bege-escuro hover:text-bege bg-black/60 rounded-full p-2 transition-colors z-10"
      >
        <X size={22} />
      </button>



      <div
        className="relative max-w-4xl w-full flex flex-col items-center gap-3"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {video ? (
          <video
            src={midia.url} autoPlay loop playsInline controls
            className="w-full rounded-sm" style={{ maxHeight: '82vh', objectFit: 'contain' }}
          />
        ) : (
          <div className="relative w-full">
            <Image
              src={midia.url} alt={midia.alt ?? 'Maandhoo Club'} width={1200} height={800}
              className="object-contain w-full h-full rounded-sm" style={{ maxHeight: '82vh' }}
            />
            {/* Botão de download — fixo no canto superior direito da foto */}
            {podeDownload && (
              <button
                onClick={e => { e.stopPropagation(); handleDownload() }}
                disabled={baixando}
                title={logado ? 'Download em alta qualidade' : 'Faça login para baixar'}
                className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-accent tracking-widest uppercase transition-all
                  ${logado
                    ? 'border-dourado/60 bg-black/70 text-dourado hover:bg-dourado/20 hover:border-dourado'
                    : 'border-white/20 bg-black/70 text-bege-escuro/50 hover:border-white/40'
                  }`}
              >
                {baixando ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : logado ? (
                  <Download size={13} />
                ) : (
                  <Lock size={13} />
                )}
                {logado ? (baixando ? 'Baixando...' : 'Download') : 'Login para baixar'}
              </button>
            )}
          </div>
        )}
        {midia.alt && (
          <p className="font-body text-sm text-bege-escuro/60 text-center">{midia.alt}</p>
        )}
      </div>
    </div>
  )
}

// ─── Card de mídia ────────────────────────────────────────────
function MediaCard({ midia, onClick }: { midia: MidiaGaleria; onClick: () => void }) {
  const video = isVideo(midia.url)

  const aspectRatio = video
    ? '9/16'
    : midia.orientacao === 'portrait'
      ? '3/4'
      : '4/3'

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
        <>
          <Image
            src={midia.url} alt={midia.alt ?? 'Maandhoo Club'} fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          {/* Indicador de download disponível (só Supabase) */}
          {isSupabase(midia.url) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-dourado/30 px-1.5 py-1 rounded-sm">
                <Download size={9} className="text-dourado" />
              </div>
            </div>
          )}
        </>
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

// ─── Tipos de fileira ─────────────────────────────────────────
type TipoFileira = 'portrait' | 'landscape' | 'video'
type Fileira = { tipo: TipoFileira; itens: MidiaGaleria[] }

function montarFileiras(midias: MidiaGaleria[]): Fileira[] {
  const fileiras: Fileira[] = []
  let i = 0

  while (i < midias.length) {
    const atual = midias[i]
    const ehVideo = isVideo(atual.url)

    if (ehVideo) {
      const grupo: MidiaGaleria[] = []
      while (i < midias.length && isVideo(midias[i].url) && grupo.length < 3) {
        grupo.push(midias[i++])
      }
      fileiras.push({ tipo: 'video', itens: grupo })
      continue
    }

    if (atual.orientacao === 'portrait') {
      const grupo: MidiaGaleria[] = []
      while (i < midias.length && !isVideo(midias[i].url) && midias[i].orientacao === 'portrait' && grupo.length < 4) {
        grupo.push(midias[i++])
      }
      fileiras.push({ tipo: 'portrait', itens: grupo })
    } else {
      const grupo: MidiaGaleria[] = []
      while (i < midias.length && !isVideo(midias[i].url) && midias[i].orientacao === 'landscape' && grupo.length < 3) {
        grupo.push(midias[i++])
      }
      fileiras.push({ tipo: 'landscape', itens: grupo })
    }
  }

  return fileiras
}

// ─── Página principal ─────────────────────────────────────────
const INTERVALO_ATUALIZACAO = 30_000

export default function GaleriaPage() {
  const [midias, setMidias] = useState<MidiaGaleria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [midiaAberta, setMidiaAberta] = useState<MidiaGaleria | null>(null)
  const [logado, setLogado] = useState(false)

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    try {
      const res = await fetch('/api/galeria', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data = await res.json()
      setMidias(Array.isArray(data.fotos) ? data.fotos : [])
    } catch {
      // silencioso
    } finally {
      if (!silencioso) setCarregando(false)
    }
  }, [])

  // Verifica sessão do cliente silenciosamente
  const verificarSessao = useCallback(async () => {
    try {
      const res = await fetch('/api/cliente/auth', { cache: 'no-store' })
      const data = await res.json()
      setLogado(data.autenticado === true)
    } catch {
      setLogado(false)
    }
  }, [])

  useEffect(() => {
    carregar(false)
    verificarSessao()
  }, [carregar, verificarSessao])

  // Polling automático a cada 30s
  useEffect(() => {
    const intervalo = setInterval(() => carregar(true), INTERVALO_ATUALIZACAO)
    return () => clearInterval(intervalo)
  }, [carregar])

  // Recarrega ao voltar foco na aba
  useEffect(() => {
    const onFocus = () => carregar(true)
    window.addEventListener('visibilitychange', onFocus)
    return () => window.removeEventListener('visibilitychange', onFocus)
  }, [carregar])

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
              if (fileira.tipo === 'video') {
                return (
                  <div key={fi} className="grid grid-cols-3 gap-3">
                    {fileira.itens.map(midia => (
                      <MediaCard key={midia.id} midia={midia} onClick={() => setMidiaAberta(midia)} />
                    ))}
                  </div>
                )
              }
              if (fileira.tipo === 'portrait') {
                return (
                  <div key={fi} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {fileira.itens.map(midia => (
                      <MediaCard key={midia.id} midia={midia} onClick={() => setMidiaAberta(midia)} />
                    ))}
                  </div>
                )
              }
              return (
                <div key={fi} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        <Lightbox
          midia={midiaAberta}
          logado={logado}
          onClose={() => setMidiaAberta(null)}
        />
      )}
    </div>
  )
}
