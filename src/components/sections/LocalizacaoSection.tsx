'use client'

import React, { useState } from 'react'
import { MapPin, Navigation, X, ExternalLink, Clock, Car } from 'lucide-react'

const GMAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Rua+Br%C3%A1s+Cubas+35+Nova+Esperan%C3%A7a+Balne%C3%A1rio+Cambori%C3%BA+SC'

// Embed real do endereço — tema dark via filtro CSS
const EMBED_URL =
  'https://maps.google.com/maps?q=Rua+Br%C3%A1s+Cubas,+35,+Nova+Esperan%C3%A7a,+Balne%C3%A1rio+Cambori%C3%BA,+SC,+Brasil&z=17&output=embed'

export function LocalizacaoSection() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section className="py-24 px-4 bg-preto-profundo">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Onde nos encontrar</p>
          <h2 className="section-title mb-4">Localização</h2>
          <div className="divider-gold w-24 mx-auto mb-6" />
          <p className="font-body text-sm text-bege-escuro/60 flex items-center justify-center gap-2">
            <MapPin size={14} className="text-dourado" />
            Rua Brás Cubas, 35 — Nova Esperança, Balneário Camboriú - SC
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* MAPA GOOGLE — ocupa 2/3 */}
          <div
            className="lg:col-span-2 relative rounded-sm overflow-hidden border border-dourado/20 cursor-pointer group"
            style={{ minHeight: '380px' }}
            onClick={() => setModalOpen(true)}
          >
            {/* Iframe com filtro dark */}
            <iframe
              src={EMBED_URL}
              width="100%"
              height="100%"
              style={{
                border: 0,
                display: 'block',
                width: '100%',
                height: '100%',
                minHeight: '380px',
                filter: 'invert(92%) hue-rotate(180deg) saturate(0.75) brightness(0.88) contrast(0.95)',
                pointerEvents: 'none',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Maandhoo Club"
            />

            {/* Overlay hover — bloqueia interação e convida ao clique */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-preto-profundo/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95 bg-preto-profundo/90 border border-dourado/50 px-6 py-3 rounded-sm flex items-center gap-2 shadow-lg">
                <ExternalLink size={14} className="text-dourado" />
                <span className="font-accent text-xs tracking-widest uppercase text-dourado">
                  Ver no Google Maps
                </span>
              </div>
            </div>

            {/* Badge endereço fixo no canto */}
            <div className="absolute bottom-4 left-4 bg-preto-profundo/90 border border-dourado/30 rounded-sm px-3 py-2 flex items-center gap-2 pointer-events-none">
              <MapPin size={12} className="text-dourado flex-shrink-0" />
              <span className="font-body text-xs text-bege">Rua Brás Cubas, 35 · Nova Esperança</span>
            </div>
          </div>

          {/* CARD INFO — ocupa 1/3 */}
          <div className="flex flex-col gap-4">
            <div className="bg-card border border-dourado/20 rounded-sm p-6 space-y-5 flex-1">

              <div>
                <p className="font-accent text-xs tracking-widest text-dourado uppercase mb-2">Endereço</p>
                <p className="font-body text-sm text-bege leading-relaxed">
                  Rua Brás Cubas, 35<br />
                  Nova Esperança<br />
                  Balneário Camboriú — SC
                </p>
              </div>

              <div className="h-px bg-dourado/15" />

              <div className="flex items-start gap-3">
                <Clock size={14} className="text-dourado mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-accent text-xs tracking-widest text-dourado uppercase mb-1">Funcionamento</p>
                  <p className="font-body text-xs text-bege-escuro/60 leading-relaxed">
                    Sextas e Sábados<br />
                    A partir das 23h
                  </p>
                </div>
              </div>

              <div className="h-px bg-dourado/15" />

              <div className="flex items-start gap-3">
                <Car size={14} className="text-dourado mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-accent text-xs tracking-widest text-dourado uppercase mb-1">Estacionamento</p>
                  <p className="font-body text-xs text-bege-escuro/60">
                    Valets e estacionamentos próximos disponíveis
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <Navigation size={14} />
              Como Chegar
            </button>

            <a
              href={GMAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline flex items-center justify-center gap-2 w-full text-xs"
            >
              <ExternalLink size={13} />
              Abrir no Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* MODAL GOOGLE MAPS — interativo */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.88)' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-sm overflow-hidden border border-dourado/30 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-card border-b border-dourado/20">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-dourado" />
                <span className="font-accent text-xs tracking-widest uppercase text-dourado">Maandhoo Club</span>
                <span className="font-body text-xs text-bege-escuro/40 ml-1">· Rua Brás Cubas, 35</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={GMAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-body text-xs text-bege-escuro/60 hover:text-dourado transition-colors"
                >
                  <ExternalLink size={12} />
                  Abrir no Maps
                </a>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-bege-escuro/40 hover:text-dourado transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Iframe interativo no modal — sem filtro, original */}
            <div style={{ height: '520px' }}>
              <iframe
                src={EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Maandhoo Club — Google Maps"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
