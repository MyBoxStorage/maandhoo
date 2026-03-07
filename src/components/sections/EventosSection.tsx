'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Ticket } from 'lucide-react'
import { EVENTOS_INICIAIS, getLoteAtivo } from '@/lib/eventos-data'
import { Evento } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const EventoCard: React.FC<{ evento: Evento; index: number }> = ({ evento, index }) => {
  const loteAtivo = getLoteAtivo(evento)
  const dataFormatada = format(evento.data, "dd 'de' MMMM", { locale: ptBR })
  const diaSemana = format(evento.data, 'EEEE', { locale: ptBR })

  return (
    <div
      className="group relative overflow-hidden rounded-sm border border-gold/20 hover:border-gold/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* FLYER — protagonista absoluto */}
      <div className="relative aspect-[9/14] overflow-hidden">
        <Image
          src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
          alt={`Flyer ${evento.nome}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Gradiente base — sempre visível no rodapé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* BADGES TOPO */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="bg-preto-profundo/80 backdrop-blur-sm border border-bege/10 text-bege px-2.5 py-1 text-[10px] font-accent tracking-widest uppercase">
            {loteAtivo.numero}º Lote
          </div>
          {evento.temLista && (
            <div className="bg-dourado/90 text-preto-profundo px-2.5 py-1 text-[10px] font-accent tracking-widest uppercase">
              Lista aberta
            </div>
          )}
        </div>

        {/* INFO SOBRE O GRADIENTE — sempre visível */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-accent text-[10px] tracking-widest uppercase text-dourado/80 mb-1 capitalize">
            {diaSemana} · {dataFormatada} · {evento.hora}
          </p>
          <h3 className="font-display text-2xl sm:text-3xl text-bege leading-tight mb-3">
            {evento.nome}
          </h3>

          {/* PREÇOS — inline e discretos */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-body text-xs text-bege-escuro/70">
              Masc <span className="text-bege font-medium">R$ {loteAtivo.precoMasculino}</span>
            </span>
            <span className="text-bege-escuro/30">·</span>
            <span className="font-body text-xs text-bege-escuro/70">
              Fem <span className="text-dourado font-medium">R$ {loteAtivo.precoFeminino}</span>
            </span>
            <span className="text-bege-escuro/30">·</span>
            <span className="font-body text-xs text-bege-escuro/50">
              VIP R$ 120/60
            </span>
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <Link
              href={`/eventos/${evento.slug}`}
              className="btn-primary flex-1 text-center text-[11px] py-2.5 flex items-center justify-center gap-1.5"
            >
              <Ticket size={13} />
              Comprar Ingresso
            </Link>
            {evento.temLista && (
              <Link
                href={`/lista/${evento.slug}`}
                className="btn-outline text-[11px] py-2.5 px-4 flex-shrink-0"
              >
                Lista
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const EventosSection: React.FC = () => {
  return (
    <section id="eventos" className="py-16 sm:py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-16">
          <p className="section-subtitle mb-3">Agenda</p>
          <h2 className="section-title mb-4">Próximos Eventos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENTOS_INICIAIS.map((evento, i) => (
            <EventoCard key={evento.id} evento={evento} index={i} />
          ))}
        </div>

        {/* NOTA MULHERES */}
        <div className="mt-10 text-center">
          <p className="font-body text-sm text-bege-escuro/60 italic">
            🥂 04 drinks a cada 02 mulheres até 23h59 em todos os eventos
          </p>
        </div>

      </div>
    </section>
  )
}

export default EventosSection
