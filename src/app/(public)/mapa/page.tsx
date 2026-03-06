'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Phone, Clock, Navigation } from 'lucide-react'
import { MapaInterativo } from '@/components/sections/MapaInterativo'

export default function MapaPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Localização</p>
          <h1 className="section-title mb-4">Como Chegar</h1>
          <div className="divider-gold w-24 mx-auto mb-4" />
        </div>

        {/* GRID INFO + MAPA FOTO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          {/* INFO */}
          <div className="space-y-6">
            <div className="bg-card border border-gold/20 rounded-sm p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-dourado/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={18} className="text-dourado" />
                </div>
                <div>
                  <p className="font-accent text-xs text-dourado tracking-wider uppercase mb-1">Endereço</p>
                  <p className="font-body text-sm text-bege leading-relaxed">
                    Rua Cel. Procópio Gomes, 35<br />
                    Centro — Balneário Camboriú, SC
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-dourado/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={18} className="text-dourado" />
                </div>
                <div>
                  <p className="font-accent text-xs text-dourado tracking-wider uppercase mb-1">Funcionamento</p>
                  <p className="font-body text-sm text-bege leading-relaxed">
                    Sextas e Sábados · A partir das 22h<br />
                    <span className="text-bege-escuro/60 text-xs">Confira a agenda para eventos especiais</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-dourado/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={18} className="text-dourado" />
                </div>
                <div>
                  <p className="font-accent text-xs text-dourado tracking-wider uppercase mb-1">Contato</p>
                  <a
                    href="https://wa.me/5547999300283"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-bege hover:text-dourado transition-colors"
                  >
                    (47) 9 9930-0283
                  </a>
                </div>
              </div>
            </div>

            {/* BOTÃO ABRIR NO GOOGLE MAPS */}
            <a
              href="https://maps.google.com/?q=Rua+Cel.+Procópio+Gomes,+35,+Balneário+Camboriú,+SC"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Abrir no Google Maps
            </a>
          </div>

          {/* MAPA DA CASA (foto) */}
          <div className="relative rounded-sm overflow-hidden border border-gold/20" style={{ minHeight: '320px' }}>
            <Image
              src="/images/Mapa_da_Casa.webp"
              alt="Mapa da Casa — Maandhoo Club"
              fill
              className="object-contain bg-card"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* MAPA INTERATIVO */}
        <MapaInterativo />

      </div>
    </div>
  )
}
