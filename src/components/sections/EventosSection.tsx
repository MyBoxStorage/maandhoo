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
      <div className="relative flex flex-col flex-1 min-w-0 px-4 py-3 gap-1.5 justify-between overflow-hidden">

        {/* LOGO WATERMARK — decoração de fundo sumindo */}
        <div className="absolute -right-4 -bottom-6 opacity-[0.045] pointer-events-none select-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 218" width={160} height={174} fill="none" stroke="#C4A050" strokeWidth="1.8" strokeLinejoin="miter" strokeLinecap="butt">
            <line x1="2" y1="55" x2="38" y2="15" /><line x1="38" y1="15" x2="70" y2="35" /><line x1="70" y1="35" x2="58" y2="75" /><line x1="58" y1="75" x2="22" y2="95" /><line x1="22" y1="95" x2="2" y2="75" /><line x1="2" y1="75" x2="2" y2="55" /><line x1="2" y1="55" x2="22" y2="95" /><line x1="38" y1="15" x2="22" y2="95" /><line x1="2" y1="55" x2="58" y2="75" /><line x1="22" y1="95" x2="70" y2="35" />
            <line x1="198" y1="55" x2="162" y2="15" /><line x1="162" y1="15" x2="130" y2="35" /><line x1="130" y1="35" x2="142" y2="75" /><line x1="142" y1="75" x2="178" y2="95" /><line x1="178" y1="95" x2="198" y2="75" /><line x1="198" y1="75" x2="198" y2="55" /><line x1="198" y1="55" x2="178" y2="95" /><line x1="162" y1="15" x2="178" y2="95" /><line x1="198" y1="55" x2="142" y2="75" /><line x1="178" y1="95" x2="130" y2="35" />
            <line x1="70" y1="35" x2="100" y2="24" /><line x1="100" y1="24" x2="130" y2="35" /><line x1="70" y1="35" x2="130" y2="35" />
            <line x1="70" y1="35" x2="75" y2="65" /><line x1="130" y1="35" x2="125" y2="65" /><line x1="75" y1="65" x2="125" y2="65" /><line x1="100" y1="24" x2="75" y2="65" /><line x1="100" y1="24" x2="125" y2="65" /><line x1="70" y1="35" x2="100" y2="45" /><line x1="130" y1="35" x2="100" y2="45" /><line x1="100" y1="45" x2="100" y2="24" />
            <line x1="58" y1="75" x2="75" y2="65" /><line x1="58" y1="75" x2="62" y2="105" /><line x1="75" y1="65" x2="62" y2="105" /><line x1="62" y1="105" x2="78" y2="115" /><line x1="75" y1="65" x2="78" y2="115" />
            <line x1="142" y1="75" x2="125" y2="65" /><line x1="142" y1="75" x2="138" y2="105" /><line x1="125" y1="65" x2="138" y2="105" /><line x1="138" y1="105" x2="122" y2="115" /><line x1="125" y1="65" x2="122" y2="115" />
            <line x1="75" y1="65" x2="85" y2="95" /><line x1="125" y1="65" x2="115" y2="95" /><line x1="85" y1="95" x2="100" y2="88" /><line x1="115" y1="95" x2="100" y2="88" /><line x1="100" y1="88" x2="100" y2="65" /><line x1="75" y1="65" x2="100" y2="65" /><line x1="125" y1="65" x2="100" y2="65" />
            <line x1="62" y1="105" x2="78" y2="115" /><line x1="78" y1="115" x2="85" y2="95" /><line x1="85" y1="95" x2="115" y2="95" /><line x1="115" y1="95" x2="122" y2="115" /><line x1="122" y1="115" x2="138" y2="105" />
            <polygon points="85,95 100,88 115,95 108,120 92,120" fill="none" /><line x1="100" y1="88" x2="92" y2="120" /><line x1="100" y1="88" x2="108" y2="120" />
            <polygon points="92,120 108,120 105,148 95,148" fill="none" /><line x1="92" y1="120" x2="105" y2="148" /><line x1="108" y1="120" x2="95" y2="148" />
            <polygon points="95,148 105,148 108,170 92,175" fill="none" /><line x1="95" y1="148" x2="108" y2="170" />
            <polygon points="92,175 108,170 110,190 94,195 86,182" fill="none" /><line x1="92" y1="175" x2="110" y2="190" /><line x1="86" y1="182" x2="110" y2="190" />
          </svg>
        </div>

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
