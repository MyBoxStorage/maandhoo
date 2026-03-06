'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sofa, UtensilsCrossed, Cake, ArrowRight, MessageCircle } from 'lucide-react'

const tiposReserva = [
  {
    id: 'mesa',
    icone: <UtensilsCrossed size={28} />,
    titulo: 'Mesa',
    descricao: 'Reserve sua mesa e garanta seu espaço com conforto. Até 5 pessoas por mesa.',
    detalhes: ['Até 5 pessoas', 'Consumação mínima via WhatsApp', 'Garçom dedicado'],
    cor: 'from-marrom to-marrom-claro',
    href: '/reservas?tipo=mesa',
  },
  {
    id: 'camarote',
    icone: <Sofa size={28} />,
    titulo: 'Camarote',
    descricao: 'Experiência VIP completa. Vista privilegiada da pista e do palco. Até 10 pessoas.',
    detalhes: ['Até 10 pessoas', 'Vista privilegiada', 'Serviço exclusivo'],
    cor: 'from-dourado-escuro to-marrom',
    href: '/reservas?tipo=camarote',
    destaque: true,
  },
  {
    id: 'aniversario',
    icone: <Cake size={28} />,
    titulo: 'Aniversário VIP',
    descricao: 'Comemore do jeito certo. Aniversariante entra grátis com confirmação prévia.',
    detalhes: ['Entrada gratuita do aniversariante', 'Área reservada', 'Confirmação via WhatsApp'],
    cor: 'from-marrom-claro to-marrom',
    href: '/reservas?tipo=aniversario',
  },
]

export const ReservasSection: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section id="reservas" className="py-24 px-4 relative">
      {/* BG decorativo */}
      <div className="absolute inset-0 bg-gradient-to-b from-preto-profundo via-marrom/5 to-preto-profundo pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="section-subtitle mb-3">Exclusividade</p>
          <h2 className="section-title mb-4">Faça sua Reserva</h2>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60 max-w-md mx-auto">
            Garanta sua experiência premium. Todas as reservas são confirmadas via WhatsApp em até 24h.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiposReserva.map((tipo) => (
            <div
              key={tipo.id}
              onMouseEnter={() => setHovered(tipo.id)}
              onMouseLeave={() => setHovered(null)}
              className={`relative rounded-sm border transition-all duration-500 overflow-hidden
                ${tipo.destaque
                  ? 'border-dourado shadow-gold scale-[1.02]'
                  : 'border-gold/20 hover:border-gold/50 hover:-translate-y-1'
                }
              `}
            >
              {tipo.destaque && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-dourado to-transparent" />
              )}

              <div className="bg-card p-8 h-full flex flex-col">
                {tipo.destaque && (
                  <div className="mb-4">
                    <span className="font-accent text-xs tracking-widest text-dourado border border-dourado/50 px-3 py-1">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className={`w-14 h-14 rounded-sm flex items-center justify-center mb-5
                  ${tipo.destaque ? 'bg-dourado/20 text-dourado' : 'bg-bege/5 text-bege-escuro'}`}>
                  {tipo.icone}
                </div>

                <h3 className="font-display text-2xl text-bege mb-3">{tipo.titulo}</h3>
                <p className="font-body text-sm text-bege-escuro/70 leading-relaxed mb-5 flex-1">
                  {tipo.descricao}
                </p>

                <ul className="space-y-2 mb-6">
                  {tipo.detalhes.map(d => (
                    <li key={d} className="flex items-center gap-2 text-xs text-bege-escuro/80">
                      <span className="w-1 h-1 rounded-full bg-dourado flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tipo.href}
                  className={`flex items-center justify-center gap-2 py-3 text-xs font-accent tracking-widest uppercase transition-all duration-300
                    ${tipo.destaque
                      ? 'btn-primary'
                      : 'btn-outline'
                    }`}
                >
                  <MessageCircle size={14} />
                  Solicitar via WhatsApp
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-bege-escuro/40 mt-8">
          Reservas confirmadas com até 1 dia de antecedência · Aniversários requerem confirmação prévia pelo WhatsApp
        </p>
      </div>
    </section>
  )
}

export default ReservasSection
