'use client'

import React, { useEffect, useState } from 'react'
import { PreloadScreen } from '@/components/ui/PreloadScreen'
import { HeroSection } from '@/components/sections/HeroSection'
import { EventosSection } from '@/components/sections/EventosSection'
import { MapaInterativo } from '@/components/sections/MapaInterativo'
import { CardapioPreview } from '@/components/sections/CardapioPreview'
import { GaleriaPreview } from '@/components/sections/GaleriaPreview'
import { ReservasSection } from '@/components/sections/ReservasSection'
import { LocalizacaoSection } from '@/components/sections/LocalizacaoSection'
import { PopupLista } from '@/components/ui/PopupLista'

const Divisor = () => (
  <div className="max-w-4xl mx-auto px-4">
    <div className="h-px bg-gradient-to-r from-transparent via-dourado/20 to-transparent" />
  </div>
)

const HeroFade = () => (
  <div className="h-12 bg-gradient-to-b from-preto-profundo/0 to-preto-profundo pointer-events-none -mt-12 relative z-10" />
)

const PRELOAD_KEY = 'maandhoo_preload_ts'
const PRELOAD_COOLDOWN_MS = 10 * 60 * 1000

export default function HomeClient() {
  const [preloadDone, setPreloadDone] = useState(false)

  useEffect(() => {
    try {
      const ts = sessionStorage.getItem(PRELOAD_KEY)
      if (!ts) return

      const elapsed = Date.now() - Number(ts)
      if (elapsed < PRELOAD_COOLDOWN_MS) {
        setPreloadDone(true)
      }
    } catch {
      // Ignora leitura de storage indisponivel
    }
  }, [])

  const handlePreloadComplete = () => {
    try {
      sessionStorage.setItem(PRELOAD_KEY, Date.now().toString())
    } catch {
      // Ignora escrita de storage indisponivel
    }
    setPreloadDone(true)
  }

  return (
    <>
      {!preloadDone && (
        <PreloadScreen onComplete={handlePreloadComplete} />
      )}

      {/* Conteúdo fica montado atrás para não re-hidratar depois */}
      <div
        style={{
          opacity: preloadDone ? 1 : 0,
          transition: 'opacity 0.4s ease 0.1s',
          pointerEvents: preloadDone ? 'all' : 'none',
        }}
      >
        <PopupLista />
        <HeroSection />
        <HeroFade />
        <EventosSection />
        <Divisor />
        <MapaInterativo />
        <Divisor />
        <ReservasSection />
        <Divisor />
        <CardapioPreview />
        <Divisor />
        <GaleriaPreview />
        <Divisor />
        <LocalizacaoSection />
      </div>
    </>
  )
}
