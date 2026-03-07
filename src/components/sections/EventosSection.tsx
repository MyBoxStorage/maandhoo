'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ticket } from 'lucide-react'
import { EVENTOS_INICIAIS, getLoteAtivo } from '@/lib/eventos-data'
import { Evento } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/* ─────────────────────────────────────────────
   CARD HERO — evento mais próximo
   Altura máxima controlada: max-h-[520px]
───────────────────────────────────────────── */
const EventoCardHero: React.FC<{ evento: Evento }> = ({ evento }) => {
  const loteAtivo = getLoteAtivo(evento)
  const dataFormatada = format(evento.data, "dd 'de' MMMM", { locale: ptBR })
  const diaSemana   = format(evento.data, 'EEEE', { locale: ptBR })

  return (
    <div className="group relative overflow-hidden rounded-sm border border-dourado/40 shadow-gold transition-all duration-500 hover:shadow-gold-strong hover:border-dourado/70 h-full">

      {/* Linha dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dourado to-transparent z-10" />

      {/* FLYER — altura controlada, não cresce infinitamente */}
      <div className="relative w-full h-full min-h-[680px] max-h-[820px] overflow-hidden">
        <Image
          src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
          alt={`Flyer ${evento.nome}`}
          fill
          priority
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Gradientes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent" />

        {/* BADGES TOPO */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex flex-col gap-1.5">
            <span className="bg-dourado text-preto-profundo px-3 py-1 text-[10px] font-accent font-semibold tracking-[0.18em] uppercase w-fit">
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
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
          <p className="font-accent text-[10px] tracking-[0.20em] uppercase text-dourado/80 mb-1.5 capitalize">
            {diaSemana} · {dataFormatada} · {evento.hora}
          </p>
          <h3 className="font-display text-2xl sm:text-3xl text-bege leading-tight mb-1">
            {evento.nome}
          </h3>
          {evento.descricao && (
            <p className="font-body text-xs text-bege-escuro/60 mb-3 line-clamp-1 leading-relaxed">
              {evento.descricao}
            </p>
          )}

          {/* PREÇOS */}
          <div className="flex items-center gap-3 mb-4">
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
              className="btn-primary flex-1 text-center text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <Ticket size={13} />
              Comprar Ingresso
            </Link>
            {evento.temLista && (
              <Link
                href={`/lista/${evento.slug}`}
                className="btn-outline text-xs py-2.5 px-4 flex-shrink-0"
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
   CARD SECUNDÁRIO
   Layout: flyer miniatura à esq + info à dir
   Altura fixa para preencher a coluna do hero
───────────────────────────────────────────── */
const EventoCardSecundario: React.FC<{ evento: Evento }> = ({ evento }) => {
  const loteAtivo = getLoteAtivo(evento)
  const dataFormatada = format(evento.data, "dd/MM", { locale: ptBR })
  const diaSemana   = format(evento.data, 'EEE', { locale: ptBR })

  return (
    <div className="group flex overflow-hidden rounded-sm border border-dourado/15 hover:border-dourado/40 bg-[#100d0a] transition-all duration-300 flex-1">

      {/* FLYER — proporção 9:14, largura fixa */}
      <div className="relative w-[90px] sm:w-[110px] flex-shrink-0">
        <div className="absolute inset-0">
          <Image
            src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
            alt={`Flyer ${evento.nome}`}
            fill
            className="object-cover object-top"
            sizes="110px"
          />
        </div>
      </div>

      {/* DIVISOR */}
      <div className="w-px flex-shrink-0 bg-dourado/10" />

      {/* INFO */}
      <div className="flex flex-col flex-1 min-w-0 px-4 py-3 gap-1.5 justify-between">

        {/* Topo: data + lote */}
        <div className="flex items-center justify-between gap-1">
          <span className="font-accent text-[9px] tracking-[0.15em] uppercase text-dourado/50 capitalize">
            {diaSemana} · {dataFormatada} · {evento.hora}
          </span>
          <span className="font-accent text-[9px] text-bege-escuro/25 border border-bege-escuro/10 px-1.5 py-0.5 flex-shrink-0">
            {loteAtivo.numero}º Lote
          </span>
        </div>

        {/* Nome */}
        <h3 className="font-display text-lg sm:text-[22px] text-bege leading-tight">
          {evento.nome}
        </h3>

        {/* Preços */}
        <div className="flex items-center gap-2">
          <span className="font-body text-[11px] text-bege-escuro/50">
            Masc <span className="text-bege/80">R$ {loteAtivo.precoMasculino}</span>
          </span>
          <span className="text-bege-escuro/15">·</span>
          <span className="font-body text-[11px] text-bege-escuro/50">
            Fem <span className="text-dourado/70">R$ {loteAtivo.precoFeminino}</span>
          </span>
          {evento.temLista && (
            <span className="font-body text-[9px] text-dourado/50 border border-dourado/20 px-1.5 py-0.5">
              Lista
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href={`/eventos/${evento.slug}`}
            className="inline-flex items-center gap-1.5 bg-dourado/85 hover:bg-dourado text-preto-profundo font-accent font-semibold tracking-[0.10em] uppercase text-[9px] px-3 py-1.5 transition-colors duration-200"
          >
            <Ticket size={9} />
            Comprar Ingresso
          </Link>
          {evento.temLista && (
            <Link
              href={`/lista/${evento.slug}`}
              className="inline-flex items-center border border-dourado/30 text-dourado/70 hover:border-dourado/60 hover:text-dourado font-accent tracking-[0.10em] uppercase text-[9px] px-3 py-1.5 transition-colors duration-200"
            >
              Lista
            </Link>
          )}
        </div>

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
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-subtitle mb-3">Agenda</p>
          <h2 className="section-title mb-4">Próximos Eventos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

          {/* ── HERO — coluna esquerda ── */}
          <div className="w-full lg:w-[48%] flex-shrink-0">
            {heroi && <EventoCardHero evento={heroi} />}
          </div>

          {/* ── SECUNDÁRIOS — coluna direita, stretch para igualar hero ── */}
          {secundarios.length > 0 && (
            <div className="w-full lg:w-[52%] flex flex-col gap-3 lg:gap-4">

              {/* Label */}
              <p className="font-accent text-[10px] tracking-[0.22em] uppercase text-bege-escuro/25 hidden lg:block -mb-1">
                Em breve
              </p>

              {/* Cards crescem para preencher a altura disponível */}
              <div className="flex flex-col gap-3 lg:gap-4 lg:flex-1">
                {secundarios.map((evento) => (
                  <EventoCardSecundario key={evento.id} evento={evento} />
                ))}
              </div>

              {/* Rodapé decorativo — ancora no fundo da coluna */}
              <p className="font-body text-xs text-bege-escuro/30 italic hidden lg:block mt-auto pt-2">
                🥂 04 drinks a cada 02 mulheres até 23h59
              </p>
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
