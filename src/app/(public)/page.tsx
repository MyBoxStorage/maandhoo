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

export default function HomePage() {
  return (
    <>
      <PopupLista />
      <HeroSection />
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
