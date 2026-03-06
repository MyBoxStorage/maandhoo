'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Ticket, Users } from 'lucide-react'
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
      className="group relative overflow-hidden rounded-sm border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* FLYER */}
      <div className="relative aspect-[9/16] overflow-hidden">
        <Image
          src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
          alt={`Flyer ${evento.nome}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo via-preto-profundo/30 to-transparent" />

        {/* BADGE LOTE */}
        <div className="absolute top-4 right-4 bg-dourado text-preto-profundo px-3 py-1 text-xs font-accent tracking-wider">
          {loteAtivo.numero}º LOTE
        </div>

        {/* BADGE LISTA */}
        {evento.temLista && (
          <div className="absolute top-4 left-4 bg-preto-profundo/80 border border-bege/20 text-bege px-3 py-1 text-xs font-body tracking-wider">
            Lista Disponível
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-6 bg-card">
        {/* DATA */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-dourado" />
          <span className="font-body text-xs text-bege-escuro capitalize">
            {diaSemana} · {dataFormatada}
          </span>
          <Clock size={14} className="text-dourado ml-2" />
          <span className="font-body text-xs text-bege-escuro">{evento.hora}</span>
        </div>

        {/* NOME */}
        <h3 className="font-display text-2xl text-bege mb-2 leading-tight">
          {evento.nome}
        </h3>
        <p className="font-body text-sm text-bege-escuro/70 mb-5 leading-relaxed line-clamp-2">
          {evento.descricao}
        </p>

        {/* PREÇOS */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-black/30 rounded-sm p-3 border border-white/5">
            <div className="font-body text-xs text-bege-escuro/60 mb-1 flex items-center gap-1">
              <Users size={11} /> Masculino
            </div>
            <div className="font-display text-lg text-bege">
              R$ {loteAtivo.precoMasculino.toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="bg-black/30 rounded-sm p-3 border border-white/5">
            <div className="font-body text-xs text-bege-escuro/60 mb-1 flex items-center gap-1">
              <Users size={11} /> Feminino
            </div>
            <div className="font-display text-lg text-dourado">
              R$ {loteAtivo.precoFeminino.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>

        {/* BACKSTAGE */}
        <div className="flex items-center justify-between text-xs text-bege-escuro/50 mb-5 pb-4 border-b border-white/5">
          <span>Backstage Masc: <span className="text-bege/70">R$ 120,00</span></span>
          <span>Fem: <span className="text-dourado">R$ 60,00</span></span>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link
            href={`/eventos/${evento.slug}`}
            className="btn-primary flex-1 text-center text-xs py-2.5 flex items-center justify-center gap-2"
          >
            <Ticket size={14} />
            Comprar Ingresso
          </Link>
          {evento.temLista && (
            <Link
              href={`/lista/${evento.slug}`}
              className="btn-outline flex-shrink-0 text-xs py-2.5 px-4"
            >
              Lista
            </Link>
          )}
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
