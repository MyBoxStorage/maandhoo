'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Ticket, Users, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type LotePublico = {
  numero: number
  preco_masc: number
  preco_fem: number
}

type EventoPublico = {
  id: string
  nome: string
  descricao?: string | null
  data_evento: string
  hora_abertura: string
  flyer_url?: string | null
  lotes: LotePublico[]
}

const EventoCard: React.FC<{ evento: EventoPublico; index: number }> = ({ evento, index }) => {
  const loteAtivo = evento.lotes?.[0]
  const data = new Date(`${evento.data_evento}T00:00:00`)
  const dataFormatada = format(data, "dd 'de' MMMM", { locale: ptBR })
  const diaSemana = format(data, 'EEEE', { locale: ptBR })

  return (
    <div
      className="group relative overflow-hidden rounded-sm border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        <Image
          src={evento.flyer_url || '/images/flyers/placeholder.webp'}
          alt={`Flyer ${evento.nome}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-preto-profundo via-preto-profundo/30 to-transparent" />
        {loteAtivo && (
          <div className="absolute top-4 right-4 bg-dourado text-preto-profundo px-3 py-1 text-xs font-accent tracking-wider">
            {loteAtivo.numero}º LOTE
          </div>
        )}
      </div>

      <div className="p-6 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-dourado" />
          <span className="font-body text-xs text-bege-escuro capitalize">
            {diaSemana} · {dataFormatada}
          </span>
          <Clock size={14} className="text-dourado ml-2" />
          <span className="font-body text-xs text-bege-escuro">{evento.hora_abertura}</span>
        </div>

        <h3 className="font-display text-2xl text-bege mb-2 leading-tight">{evento.nome}</h3>
        <p className="font-body text-sm text-bege-escuro/70 mb-5 leading-relaxed line-clamp-2">
          {evento.descricao}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-black/30 rounded-sm p-3 border border-white/5">
            <div className="font-body text-xs text-bege-escuro/60 mb-1 flex items-center gap-1">
              <Users size={11} /> Masculino
            </div>
            <div className="font-display text-lg text-bege">
              {loteAtivo ? `R$ ${Number(loteAtivo.preco_masc).toFixed(2).replace('.', ',')}` : '—'}
            </div>
          </div>
          <div className="bg-black/30 rounded-sm p-3 border border-white/5">
            <div className="font-body text-xs text-bege-escuro/60 mb-1 flex items-center gap-1">
              <Users size={11} /> Feminino
            </div>
            <div className="font-display text-lg text-dourado">
              {loteAtivo ? `R$ ${Number(loteAtivo.preco_fem).toFixed(2).replace('.', ',')}` : '—'}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/eventos"
            className="btn-primary flex-1 text-center text-xs py-2.5 flex items-center justify-center gap-2"
          >
            <Ticket size={14} />
            Comprar Ingresso
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function EventosPage() {
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

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="section-subtitle mb-3">Agenda</p>
          <h1 className="section-title mb-4">Próximos Eventos</h1>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60">
            Confira a programação e garanta seu lugar — as listas fecham na meia-noite do dia do evento
          </p>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-dourado/50" />
          </div>
        ) : eventos.length === 0 ? (
          <p className="text-center text-sm text-bege-escuro/45 py-20">Nenhum evento programado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento, i) => (
              <EventoCard key={evento.id} evento={evento} index={i} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="font-body text-sm text-bege-escuro/60 italic">
            🥂 04 drinks a cada 02 mulheres até 23h59 em todos os eventos
          </p>
        </div>
      </div>
    </div>
  )
}
