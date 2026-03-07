'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ticket, ChevronRight } from 'lucide-react'
import { EVENTOS_INICIAIS, getLoteAtivo } from '@/lib/eventos-data'
import { Evento } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/* ─────────────────────────────────────────────
   CARD HERO — evento mais próximo, protagonista
───────────────────────────────────────────── */
const EventoCardHero: React.FC<{ evento: Evento }> = ({ evento }) => {
  const loteAtivo = getLoteAtivo(evento)
  const dataFormatada = format(evento.data, "dd 'de' MMMM", { locale: ptBR })
  const diaSemana   = format(evento.data, 'EEEE',          { locale: ptBR })

  return (
    <div className="group relative overflow-hidden rounded-sm border border-dourado/40 shadow-gold transition-all duration-500 hover:shadow-gold-strong hover:border-dourado/70">

      {/* Linha dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dourado to-transparent z-10" />

      {/* FLYER */}
      <div className="relative aspect-[9/14] overflow-hidden">
        <Image
          src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
          alt={`Flyer ${evento.nome}`}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        {/* Gradiente topo sutil para badges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

        {/* BADGES TOPO */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          {/* Badge "Próximo Evento" */}
          <div className="flex flex-col gap-1.5">
            <span className="bg-dourado text-preto-profundo px-3 py-1 text-[10px] font-accent font-semibold tracking-[0.18em] uppercase">
              Próximo Evento
            </span>
            <span className="bg-preto-profundo/70 backdrop-blur-sm border border-bege/10 text-bege px-2.5 py-1 text-[10px] font-accent tracking-widest uppercase w-fit">
              {loteAtivo.numero}º Lote
            </span>
          </div>
          {evento.temLista && (
            <div className="bg-preto-profundo/70 backdrop-blur-sm border border-dourado/40 text-dourado px-2.5 py-1 text-[10px] font-accent tracking-widest uppercase">
              Lista aberta
            </div>
          )}
        </div>

        {/* INFO INFERIOR */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-10">
          <p className="font-accent text-[10px] tracking-[0.20em] uppercase text-dourado/80 mb-2 capitalize">
            {diaSemana} · {dataFormatada} · {evento.hora}
          </p>
          <h3 className="font-display text-3xl sm:text-4xl text-bege leading-tight mb-1">
            {evento.nome}
          </h3>
          {evento.descricao && (
            <p className="font-body text-xs text-bege-escuro/60 mb-4 line-clamp-2 leading-relaxed">
              {evento.descricao}
            </p>
          )}

          {/* PREÇOS */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-body text-xs text-bege-escuro/70">
              Masc <span className="text-bege font-semibold">R$ {loteAtivo.precoMasculino}</span>
            </span>
            <span className="text-bege-escuro/30">·</span>
            <span className="font-body text-xs text-bege-escuro/70">
              Fem <span className="text-dourado font-semibold">R$ {loteAtivo.precoFeminino}</span>
            </span>
            <span className="text-bege-escuro/30">·</span>
            <span className="font-body text-xs text-bege-escuro/50">VIP R$ 120/60</span>
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <Link
              href={`/eventos/${evento.slug}`}
              className="btn-primary flex-1 text-center text-xs py-3 flex items-center justify-center gap-2"
            >
              <Ticket size={14} />
              Comprar Ingresso
            </Link>
            {evento.temLista && (
              <Link
                href={`/lista/${evento.slug}`}
                className="btn-outline text-xs py-3 px-5 flex-shrink-0"
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

/* ─────────────────────────────────────────────
   CARD SECUNDÁRIO — eventos futuros, compactos
───────────────────────────────────────────── */
const EventoCardSecundario: React.FC<{ evento: Evento; index: number }> = ({ evento, index }) => {
  const loteAtivo = getLoteAtivo(evento)
  const dataFormatada = format(evento.data, "dd 'de' MMMM", { locale: ptBR })
  const diaSemana   = format(evento.data, "EEE",            { locale: ptBR })

  return (
    <div
      className="group relative flex overflow-hidden rounded-sm border border-gold/15 hover:border-gold/35 transition-all duration-400 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* FLYER — quadrado pequeno à esquerda */}
      <div className="relative w-24 sm:w-28 flex-shrink-0 overflow-hidden">
        <Image
          src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
          alt={`Flyer ${evento.nome}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="112px"
        />
        {/* Overlay escuro leve para não competir com o hero */}
        <div className="absolute inset-0 bg-preto-profundo/30" />
      </div>

      {/* CONTEÚDO */}
      <div className="flex flex-col justify-between flex-1 bg-card px-4 py-3.5 min-w-0">
        {/* Data e lote */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="font-accent text-[9px] tracking-[0.18em] uppercase text-dourado/60 capitalize truncate">
            {diaSemana} · {dataFormatada} · {evento.hora}
          </p>
          <span className="flex-shrink-0 font-accent text-[9px] tracking-wider text-bege-escuro/40 border border-bege-escuro/10 px-2 py-0.5">
            {loteAtivo.numero}º Lote
          </span>
        </div>

        {/* Nome */}
        <h3 className="font-display text-lg sm:text-xl text-bege/80 leading-tight mb-2 truncate">
          {evento.nome}
        </h3>

        {/* Preços inline */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="font-body text-[11px] text-bege-escuro/50">
            M <span className="text-bege-escuro/70">R$ {loteAtivo.precoMasculino}</span>
          </span>
          <span className="text-bege-escuro/20">·</span>
          <span className="font-body text-[11px] text-bege-escuro/50">
            F <span className="text-dourado/70">R$ {loteAtivo.precoFeminino}</span>
          </span>
          {evento.temLista && (
            <>
              <span className="text-bege-escuro/20">·</span>
              <span className="font-body text-[10px] text-dourado/50 border border-dourado/20 px-1.5 py-0.5">
                Lista
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/eventos/${evento.slug}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-accent tracking-widest uppercase text-bege-escuro/60 hover:text-dourado transition-colors duration-200 group/link"
        >
          Ver e Comprar
          <ChevronRight size={11} className="transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION
───────────────────────────────────────────── */
export const EventosSection: React.FC = () => {
  const [heroi, ...restantes] = EVENTOS_INICIAIS
  const secundarios = restantes.slice(0, 2)

  return (
    <section id="eventos" className="py-16 sm:py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-16">
          <p className="section-subtitle mb-3">Agenda</p>
          <h2 className="section-title mb-4">Próximos Eventos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 lg:items-stretch">

          {/* ── HERO (coluna esquerda, ~50%) ── */}
          <div className="w-full lg:w-1/2 lg:flex-shrink-0">
            {heroi && <EventoCardHero evento={heroi} />}
          </div>

          {/* ── SECUNDÁRIOS (coluna direita, empilhados) ── */}
          {secundarios.length > 0 && (
            <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:justify-start">

              {/* Label coluna direita */}
              <p className="font-accent text-[10px] tracking-[0.22em] uppercase text-bege-escuro/30 hidden lg:block">
                Em breve
              </p>

              {secundarios.map((evento, i) => (
                <EventoCardSecundario key={evento.id} evento={evento} index={i} />
              ))}

              {/* Espaçador decorativo apenas no desktop quando há 2 cards e sobra espaço */}
              <div className="hidden lg:flex flex-1 items-end">
                <p className="font-body text-xs text-bege-escuro/30 italic">
                  🥂 04 drinks a cada 02 mulheres até 23h59
                </p>
              </div>
            </div>
          )}
        </div>

        {/* NOTA MOBILE */}
        <div className="mt-8 text-center lg:hidden">
          <p className="font-body text-sm text-bege-escuro/40 italic">
            🥂 04 drinks a cada 02 mulheres até 23h59 em todos os eventos
          </p>
        </div>

      </div>
    </section>
  )
}

export default EventosSection
