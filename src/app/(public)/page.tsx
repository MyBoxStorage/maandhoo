import React from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { EventosSection } from '@/components/sections/EventosSection'
import { MapaInterativo } from '@/components/sections/MapaInterativo'
import { CardapioPreview } from '@/components/sections/CardapioPreview'
import { GaleriaPreview } from '@/components/sections/GaleriaPreview'
import { ReservasSection } from '@/components/sections/ReservasSection'
import { LocalizacaoSection } from '@/components/sections/LocalizacaoSection'
import { PopupLista } from '@/components/ui/PopupLista'

export default function HomePage() {
  return (
    <>
      <PopupLista />
      <HeroSection />
      <EventosSection />
      <MapaInterativo />
      <ReservasSection />
      <CardapioPreview />
      <GaleriaPreview />
      <LocalizacaoSection />
    </>
  )
}
