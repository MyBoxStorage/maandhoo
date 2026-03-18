'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ticket, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type LotePublico = {
  numero: number
  preco_masc: number
  preco_fem: number
  ativo: boolean
}

type EventoPublico = {
  id: string
  nome: string
  descricao?: string | null
  data_evento: string
  hora_abertura: string
  flyer_url?: string | null
  ativo: boolean
  lotes: LotePublico[]
}

const getLoteAtivo = (evento: EventoPublico) =>
  evento.lotes?.find(l => l.ativo) ?? evento.lotes?.[0] ?? null

const formatarData = (dataEvento: string) => {
  const data = new Date(`${dataEvento}T00:00:00`)
  return {
    dia:       format(data, 'dd', { locale: ptBR }),
    mes:       format(data, 'MMM', { locale: ptBR }).toUpperCase(),
    diaSemana: format(data, 'EEEE', { locale: ptBR }),
    completa:  format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
  }
}

const gerarSlug = (evento: EventoPublico) =>
  `${evento.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${evento.data_evento.slice(0, 10)}`

// ─── CARD PADRÃO — funciona sozinho, em dupla ou em grupo ─────────────────────
// Modo "destaque" = card vertical com flyer grande (para evento principal)
// Modo "par"      = card vertical com flyer médio (quando 2 eventos lado a lado)
// Modo "lista"    = card horizontal compacto (para eventos secundários)

const EventoCard: React.FC<{
  evento: EventoPublico
  modo: 'destaque' | 'par' | 'lista'
  primeiro?: boolean
}> = ({ evento, modo, primeiro }) => {
  const lote = getLoteAtivo(evento)
  const { dia, mes, diaSemana, completa } = formatarData(evento.data_evento)
  const slug = gerarSlug(evento)
  const temPrecos = !!lote

  // ── MODO LISTA (horizontal) ────────────────────────────────────────────────
  if (modo === 'lista') {
    return (
      <Link href={`/eventos/${slug}`} className="group flex overflow-hidden rounded-sm border border-dourado/15 hover:border-dourado/50 bg-black/20 hover:bg-dourado/[0.04] transition-all duration-300">
        {/* Flyer */}
        <div className="relative w-24 sm:w-28 flex-shrink-0 overflow-hidden">
          <Image
            src={evento.flyer_url || '/images/flyers/placeholder.webp'}
            alt={evento.nome}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="112px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between px-4 py-3.5 flex-1 min-w-0">
          {/* Data badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-accent text-[9px] tracking-[0.25em] uppercase text-dourado/60 capitalize">
              {diaSemana} · {dia}/{mes.toLowerCase()} · {evento.hora_abertura}
            </span>
          </div>

          {/* Nome */}
          <h3 className="font-display text-lg sm:text-xl text-bege leading-tight mb-2 group-hover:text-dourado transition-colors duration-200">
            {evento.nome}
          </h3>

          {/* Preços + CTA */}
          <div className="flex items-center justify-between gap-2">
            {temPrecos ? (
              <div className="flex items-center gap-3">
                <span className="font-body text-[11px] text-bege-escuro/55">
                  Masc <span className="text-bege font-medium">R$ {lote.preco_masc}</span>
                </span>
                <span className="text-bege-escuro/20">·</span>
                <span className="font-body text-[11px] text-bege-escuro/55">
                  Fem <span className="text-dourado font-medium">R$ {lote.preco_fem}</span>
                </span>
              </div>
            ) : (
              <span className="font-body text-[11px] text-bege-escuro/40 italic">Em breve</span>
            )}
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-dourado/90 hover:bg-dourado text-preto-profundo font-accent text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors duration-200">
              <Ticket size={9} />
              Comprar
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // ── MODO VERTICAL (destaque ou par) ───────────────────────────────────────
  const alturaFlyer = modo === 'destaque' ? 'h-[520px] sm:h-[620px] lg:h-[680px]' : 'h-[420px] sm:h-[520px]'

  return (
    <Link href={`/eventos/${slug}`} className="group relative flex flex-col overflow-hidden rounded-sm border border-dourado/20 hover:border-dourado/60 bg-black/20 transition-all duration-500 shadow-[0_0_0_1px_rgba(201,168,76,0)] hover:shadow-[0_8px_40px_rgba(201,168,76,0.12)]">
      {/* Linha dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dourado/70 to-transparent z-20" />

      {/* Badge "Próximo Evento" — só no destaque principal */}
      {primeiro && modo === 'destaque' && (
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-dourado text-preto-profundo px-3 py-1 font-accent text-[9px] tracking-[0.2em] uppercase font-semibold">
            Próximo Evento
          </span>
        </div>
      )}

      {/* Flyer */}
      <div className={`relative w-full ${alturaFlyer} overflow-hidden flex-shrink-0`}>
        <Image
          src={evento.flyer_url || '/images/flyers/placeholder.webp'}
          alt={evento.nome}
          fill
          priority={primeiro}
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Gradiente inferior para legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {/* Gradiente sutil no topo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Data sobreposição no flyer */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-sm border border-dourado/20 px-3 py-2">
          <span className="font-display text-2xl text-dourado leading-none">{dia}</span>
          <span className="font-accent text-[9px] tracking-[0.2em] uppercase text-dourado/70">{mes}</span>
        </div>

        {/* Info no rodapé do flyer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          {/* Dia da semana + hora */}
          <p className="font-accent text-[10px] tracking-[0.22em] uppercase text-dourado/70 mb-2 capitalize">
            {diaSemana} · {evento.hora_abertura}
          </p>

          {/* Nome do evento */}
          <h3 className={`font-display text-bege leading-tight mb-3 transition-colors duration-200 group-hover:text-dourado ${
            modo === 'destaque' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
          }`}>
            {evento.nome}
          </h3>

          {/* Descrição — só no destaque */}
          {modo === 'destaque' && evento.descricao && (
            <p className="font-body text-xs text-bege-escuro/55 mb-3 line-clamp-2 leading-relaxed">
              {evento.descricao}
            </p>
          )}

          {/* Preços */}
          {temPrecos && (
            <div className="flex items-center gap-3 mb-4">
              <span className="font-body text-xs text-bege-escuro/65">
                Masc <span className="text-bege font-semibold">R$ {lote.preco_masc}</span>
              </span>
              <span className="text-bege-escuro/25">·</span>
              <span className="font-body text-xs text-bege-escuro/65">
                Fem <span className="text-dourado font-semibold">R$ {lote.preco_fem}</span>
              </span>
            </div>
          )}
          {!temPrecos && (
            <p className="font-body text-xs text-bege-escuro/40 mb-4 italic">Em breve</p>
          )}

          {/* CTA */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center gap-2 bg-dourado/90 group-hover:bg-dourado text-preto-profundo font-accent text-xs tracking-[0.15em] uppercase px-5 py-2.5 transition-all duration-200 w-full sm:w-auto">
              <Ticket size={12} />
              Comprar Ingresso
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── SEÇÃO PRINCIPAL ────────────────────────────────────────────────────────

export const EventosSection: React.FC = () => {
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const res = await fetch('/api/admin/eventos?publico=true')
        const data = await res.json()
        setEventos(Array.isArray(data.eventos) ? data.eventos : [])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const [primeiro, segundo, ...resto] = eventos

  return (
    <section id="eventos" className="py-16 sm:py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-subtitle mb-3">Agenda</p>
          <h2 className="section-title mb-4">Próximos Eventos</h2>
          <div className="divider-gold w-24 mx-auto" />
        </div>

        {/* Skeleton de carregamento */}
        {carregando && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            <div className="h-[520px] rounded-sm bg-white/5 border border-white/8" />
            <div className="h-[520px] rounded-sm bg-white/5 border border-white/8" />
          </div>
        )}

        {/* Nenhum evento */}
        {!carregando && eventos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border border-dourado/10 rounded-sm bg-black/20">
            <Calendar size={32} className="text-dourado/20 mb-3" />
            <p className="font-body text-bege-escuro/40">Nenhum evento programado no momento.</p>
            <p className="font-body text-xs text-bege-escuro/25 mt-1">Volte em breve para conferir a agenda.</p>
          </div>
        )}

        {/* ── 1 EVENTO — Hero centralizado, largura máxima ── */}
        {!carregando && eventos.length === 1 && (
          <div className="max-w-lg mx-auto">
            <EventoCard evento={primeiro} modo="destaque" primeiro />
          </div>
        )}

        {/* ── 2 EVENTOS — Dois cards verticais equilibrados ── */}
        {!carregando && eventos.length === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            <EventoCard evento={primeiro} modo="par" primeiro />
            <EventoCard evento={segundo} modo="par" />
          </div>
        )}

        {/* ── 3+ EVENTOS — Hero grande + coluna de secundários ── */}
        {!carregando && eventos.length >= 3 && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
            {/* Coluna esquerda: hero */}
            <div className="w-full lg:w-[52%] flex-shrink-0">
              <EventoCard evento={primeiro} modo="destaque" primeiro />
            </div>

            {/* Coluna direita: próximos */}
            <div className="flex flex-col gap-4 flex-1">
              <p className="font-accent text-[9px] tracking-[0.28em] uppercase text-bege-escuro/25 -mb-1">
                Em breve
              </p>
              {[segundo, ...resto.slice(0, 2)].map(ev => ev && (
                <EventoCard key={ev.id} evento={ev} modo="lista" />
              ))}
            </div>
          </div>
        )}

        {/* Rodapé da seção */}
        {!carregando && eventos.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-bege-escuro/35 italic flex items-center gap-1.5">
              <Clock size={12} className="text-dourado/30 flex-shrink-0" />
              04 drinks a cada 02 mulheres até 23h59 em todos os eventos
            </p>
            <Link
              href="/eventos"
              className="font-accent text-[10px] tracking-[0.2em] uppercase text-bege-escuro/45 hover:text-dourado border-b border-bege-escuro/20 hover:border-dourado pb-px transition-all duration-200"
            >
              Ver agenda completa →
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}

export default EventosSection
