import React from 'react'
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

// Transição do hero para o primeiro conteúdo — fade de volta ao preto
const HeroFade = () => (
  <div className="h-12 bg-gradient-to-b from-preto-profundo/0 to-preto-profundo pointer-events-none -mt-12 relative z-10" />
)

export default function HomePage() {
  return (
    <>
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
    </>
  )
}
