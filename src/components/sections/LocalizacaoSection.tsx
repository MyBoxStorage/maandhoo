'use client'

import React, { useState } from 'react'
import { MapPin, Navigation, X, ExternalLink } from 'lucide-react'

const ENDERECO = 'Rua Brás Cubas, 35 - Nova Esperança, Balneário Camboriú - SC'
const GMAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3567.812!2d-48.6350!3d-26.9905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94d8dc7b6b3b3b3b%3A0x0!2sRua+Br%C3%A1s+Cubas%2C+35+-+Nova+Esperan%C3%A7a%2C+Balne%C3%A1rio+Cambori%C3%BA+-+SC!5e0!3m2!1spt-BR!2sbr!4v1'
const GMAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Rua+Br%C3%A1s+Cubas+35+Nova+Esperan%C3%A7a+Balne%C3%A1rio+Cambori%C3%BA+SC'

// Coordenadas da Rua Brás Cubas 35, Nova Esperança, BC
const LAT = -26.9905
const LNG = -48.6350

// Pontos de referência ao redor (estilo mapa customizado SVG)
const W = 600
const H = 380
const cx = W / 2
const cy = H / 2

// Converte lat/lng em coordenadas SVG relativas ao centro
function toSVG(lat: number, lng: number) {
  const scale = 6000
  const x = cx + (lng - LNG) * scale
  const y = cy - (lat - LAT) * scale
  return { x, y }
}

const blocos = [
  { lat: -26.989, lng: -48.637, w: 60, h: 18, label: 'Quarteirão' },
  { lat: -26.991, lng: -48.634, w: 50, h: 18, label: '' },
  { lat: -26.989, lng: -48.632, w: 55, h: 18, label: '' },
  { lat: -26.992, lng: -48.638, w: 65, h: 18, label: '' },
  { lat: -26.994, lng: -48.633, w: 55, h: 18, label: '' },
  { lat: -26.987, lng: -48.635, w: 48, h: 18, label: '' },
  { lat: -26.988, lng: -48.631, w: 52, h: 18, label: '' },
  { lat: -26.993, lng: -48.636, w: 60, h: 18, label: '' },
]

const ruas = [
  // horizontal principal (Rua Brás Cubas)
  { x1: 0, y1: cy, x2: W, y2: cy, label: 'R. Brás Cubas', lx: 12, ly: cy - 6 },
  // horizontal superior
  { x1: 0, y1: cy - 70, x2: W, y2: cy - 70, label: '', lx: 0, ly: 0 },
  // horizontal inferior
  { x1: 0, y1: cy + 70, x2: W, y2: cy + 70, label: '', lx: 0, ly: 0 },
  // vertical principal
  { x1: cx, y1: 0, x2: cx, y2: H, label: '', lx: 0, ly: 0 },
  // vertical esquerda
  { x1: cx - 90, y1: 0, x2: cx - 90, y2: H, label: 'Av. Central', lx: cx - 88, ly: 14 },
  // vertical direita
  { x1: cx + 90, y1: 0, x2: cx + 90, y2: H, label: '', lx: 0, ly: 0 },
]

export function LocalizacaoSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const pin = toSVG(LAT, LNG)

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
            {ENDERECO}
          </p>
        </div>

        {/* MAPA CUSTOMIZADO + INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* MAPA SVG PERSONALIZADO */}
          <div
            className="lg:col-span-2 relative rounded-sm overflow-hidden border border-dourado/20 cursor-pointer group"
            onClick={() => setModalOpen(true)}
          >
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-dourado/0 group-hover:bg-dourado/5 transition-all duration-300 z-10 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-preto-profundo/80 border border-dourado/40 px-5 py-2.5 rounded-sm flex items-center gap-2">
                <ExternalLink size={14} className="text-dourado" />
                <span className="font-accent text-xs tracking-widest uppercase text-dourado">Abrir no Google Maps</span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              className="block"
              style={{ background: '#0d0a07' }}
            >
              {/* Fundo de quadras */}
              <rect width={W} height={H} fill="#0d0a07" />

              {/* Grade de quadras escuras */}
              {[...Array(8)].map((_, i) => (
                <rect
                  key={`col-${i}`}
                  x={i * (W / 8)}
                  y={0}
                  width={W / 8 - 1}
                  height={H}
                  fill="#13100c"
                  opacity="0.7"
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <rect
                  key={`row-${i}`}
                  x={0}
                  y={i * (H / 5)}
                  width={W}
                  height={H / 5 - 1}
                  fill="#13100c"
                  opacity="0.5"
                />
              ))}

              {/* Ruas */}
              {ruas.map((r, i) => (
                <g key={i}>
                  <line
                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                    stroke="#1e1710" strokeWidth={i === 0 ? 14 : i === 3 ? 10 : 8}
                  />
                  <line
                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                    stroke="#2a2015" strokeWidth={i === 0 ? 12 : i === 3 ? 8 : 6}
                  />
                  {r.label && (
                    <text
                      x={r.lx} y={r.ly}
                      fill="#5a4a2a"
                      fontSize="9"
                      fontFamily="DM Sans"
                      letterSpacing="1"
                    >
                      {r.label}
                    </text>
                  )}
                </g>
              ))}

              {/* Destaque Rua Brás Cubas */}
              <line x1={0} y1={cy} x2={W} y2={cy} stroke="#C9A84C" strokeWidth="1.5" opacity="0.25" />
              <text x={12} y={cy - 8} fill="#C9A84C" fontSize="9" fontFamily="DM Sans" letterSpacing="1.5" opacity="0.7">
                RUA BRÁS CUBAS
              </text>

              {/* Blocos de quarteirões */}
              {blocos.map((b, i) => {
                const pos = toSVG(b.lat, b.lng)
                return (
                  <rect
                    key={i}
                    x={pos.x - b.w / 2}
                    y={pos.y - b.h / 2}
                    width={b.w}
                    height={b.h}
                    rx={2}
                    fill="#1a150f"
                    stroke="#2a2015"
                    strokeWidth="1"
                  />
                )
              })}

              {/* Raio de alcance ao redor do pin */}
              <circle cx={pin.x} cy={pin.y} r={36} fill="#C9A84C" opacity="0.04" />
              <circle cx={pin.x} cy={pin.y} r={22} fill="#C9A84C" opacity="0.07" />

              {/* PIN — Maandhoo Club */}
              <g transform={`translate(${pin.x}, ${pin.y})`}>
                {/* Sombra */}
                <ellipse cx={0} cy={28} rx={10} ry={4} fill="#000" opacity="0.5" />
                {/* Haste */}
                <line x1={0} y1={0} x2={0} y2={24} stroke="#C9A84C" strokeWidth="2" />
                {/* Corpo do pin */}
                <circle cx={0} cy={-14} r={16} fill="#C9A84C" />
                <circle cx={0} cy={-14} r={12} fill="#0d0a07" />
                {/* M estilizado */}
                <text
                  x={0} y={-9}
                  textAnchor="middle"
                  fill="#C9A84C"
                  fontSize="11"
                  fontFamily="Cinzel"
                  fontWeight="700"
                >
                  M
                </text>
              </g>

              {/* Label endereço */}
              <rect x={pin.x + 20} y={pin.y - 26} width={148} height={26} rx={3} fill="#0d0a07" opacity="0.92" />
              <rect x={pin.x + 20} y={pin.y - 26} width={148} height={26} rx={3} fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.4" />
              <text x={pin.x + 28} y={pin.y - 14} fill="#C9A84C" fontSize="8.5" fontFamily="DM Sans" fontWeight="600">
                Maandhoo Club
              </text>
              <text x={pin.x + 28} y={pin.y - 4} fill="#7a6535" fontSize="7.5" fontFamily="DM Sans">
                Rua Brás Cubas, 35
              </text>
            </svg>
          </div>

          {/* CARD INFO */}
          <div className="flex flex-col gap-4">
            <div className="bg-card border border-dourado/20 rounded-sm p-6 space-y-5">

              <div>
                <p className="font-accent text-xs tracking-widest text-dourado uppercase mb-1">Endereço</p>
                <p className="font-body text-sm text-bege leading-relaxed">
                  Rua Brás Cubas, 35<br />
                  Nova Esperança<br />
                  Balneário Camboriú — SC
                </p>
              </div>

              <div className="divider-gold opacity-20" />

              <div>
                <p className="font-accent text-xs tracking-widest text-dourado uppercase mb-1">Funcionamento</p>
                <p className="font-body text-xs text-bege-escuro/60 leading-relaxed">
                  Sextas e Sábados<br />
                  A partir das 23h
                </p>
              </div>

              <div className="divider-gold opacity-20" />

              <div>
                <p className="font-accent text-xs tracking-widest text-dourado uppercase mb-1">Estacionamento</p>
                <p className="font-body text-xs text-bege-escuro/60">
                  Valets e estacionamentos próximos disponíveis
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <Navigation size={14} />
              Como Chegar
            </button>
          </div>
        </div>
      </div>

      {/* MODAL GOOGLE MAPS */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-sm overflow-hidden border border-dourado/30 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-card border-b border-dourado/20">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-dourado" />
                <span className="font-accent text-xs tracking-widest uppercase text-dourado">Maandhoo Club</span>
              </div>
              <div className="flex items-center gap-3">
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

            {/* Iframe Google Maps */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://maps.google.com/maps?q=Rua+Br%C3%A1s+Cubas+35+Nova+Esperan%C3%A7a+Balne%C3%A1rio+Cambori%C3%BA+SC&output=embed&z=17`}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8) brightness(0.85)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
