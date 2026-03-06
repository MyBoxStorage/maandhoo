'use client'

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Ticket, Users, ChevronRight, ArrowLeft, Shield } from 'lucide-react'
import { EVENTOS_INICIAIS, getLoteAtivo } from '@/lib/eventos-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TipoIngresso, GeneroIngresso } from '@/types'
import { CompraIngressoModal } from '@/components/ui/CompraIngressoModal'

interface PageProps {
  params: { slug: string }
}

export default function EventoPage({ params }: PageProps) {
  const evento = EVENTOS_INICIAIS.find(e => e.slug === params.slug)
  if (!evento) notFound()

  const [modalAberto, setModalAberto] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoIngresso>('pista')
  const [generoSelecionado, setGeneroSelecionado] = useState<GeneroIngresso>('masculino')

  const loteAtivo = getLoteAtivo(evento)
  const dataFormatada = format(evento.data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const abrirCompra = (tipo: TipoIngresso, genero: GeneroIngresso) => {
    setTipoSelecionado(tipo)
    setGeneroSelecionado(genero)
    setModalAberto(true)
  }

  const precoBackstageMasc = 120
  const precoBackstageFem = 60

  return (
    <div className="min-h-screen pt-20">
      {/* HERO */}
      <div className="relative h-[60vh] min-h-[400px]">
        <Image
          src={evento.flyerUrl || '/images/flyers/placeholder.webp'}
          alt={evento.nome}
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-preto-profundo/40 via-preto-profundo/50 to-preto-profundo" />
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/#eventos" className="inline-flex items-center gap-2 text-bege-escuro hover:text-bege text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> Voltar aos eventos
            </Link>
            <p className="section-subtitle mb-2">{format(evento.data, 'dd MMM yyyy', { locale: ptBR }).toUpperCase()}</p>
            <h1 className="font-display text-5xl md:text-7xl text-bege capitalize">{evento.nome}</h1>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* INFO ESQUERDA */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detalhes */}
            <div className="bg-card border border-gold/20 rounded-sm p-6 space-y-4">
              <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Informações</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Calendar size={16} />, label: 'Data', value: dataFormatada },
                  { icon: <Clock size={16} />, label: 'Horário', value: `A partir das ${evento.hora}` },
                  { icon: <MapPin size={16} />, label: 'Local', value: 'Rua Brás Cubas, 35 — BC' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="text-dourado mt-0.5 flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="font-body text-xs text-bege-escuro/60 uppercase tracking-wider">{item.label}</p>
                      <p className="font-body text-sm text-bege capitalize">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <h3 className="font-display text-3xl text-bege mb-4">Sobre o Evento</h3>
              <p className="font-body text-bege-escuro/80 leading-relaxed">{evento.descricao}</p>
              <div className="mt-4 p-4 border border-dourado/20 rounded-sm bg-dourado/5">
                <p className="font-body text-sm text-dourado">
                  🥂 04 drinks a cada 02 mulheres até 23h59
                </p>
              </div>
            </div>

            {/* Lotes */}
            <div>
              <h3 className="font-display text-2xl text-bege mb-4">Lotes Disponíveis</h3>
              <div className="space-y-2">
                {evento.lotes.map(lote => (
                  <div key={lote.id}
                    className={`flex items-center justify-between p-4 rounded-sm border transition-all duration-200
                      ${lote.ativo ? 'border-dourado/50 bg-dourado/8' : 'border-white/5 bg-black/20 opacity-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${lote.ativo ? 'bg-dourado animate-pulse' : 'bg-bege-escuro/30'}`} />
                      <span className="font-body text-sm text-bege">{lote.nome}</span>
                      {lote.ativo && <span className="font-accent text-xs text-dourado border border-dourado/40 px-2 py-0.5">ATUAL</span>}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-xs text-bege-escuro/50">Masc</p>
                        <p className="text-bege">R$ {lote.precoMasculino},00</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-bege-escuro/50">Fem</p>
                        <p className="text-dourado">R$ {lote.precoFeminino},00</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COMPRA DIREITA */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-gold rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Ticket size={18} className="text-dourado" />
                <h3 className="font-accent text-xs tracking-widest uppercase text-dourado">Comprar Ingresso</h3>
              </div>
              <p className="font-body text-xs text-bege-escuro/60">Ingresso nominal com CPF. QR Code enviado por email.</p>
              <div className="divider-gold" />

              {/* PISTA */}
              <div>
                <p className="font-accent text-xs tracking-widest uppercase text-bege-escuro/60 mb-3">Pista</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => abrirCompra('pista', 'masculino')}
                    className="bg-black/30 border border-white/10 hover:border-dourado/60 rounded-sm p-3 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={12} className="text-bege-escuro/60" />
                      <span className="font-body text-xs text-bege-escuro/60">Masculino</span>
                    </div>
                    <div className="font-display text-xl text-bege group-hover:text-gradient-gold">
                      R$ {loteAtivo.precoMasculino},00
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-dourado opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={10} /> Comprar
                    </div>
                  </button>
                  <button
                    onClick={() => abrirCompra('pista', 'feminino')}
                    className="bg-black/30 border border-white/10 hover:border-dourado/60 rounded-sm p-3 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={12} className="text-bege-escuro/60" />
                      <span className="font-body text-xs text-bege-escuro/60">Feminino</span>
                    </div>
                    <div className="font-display text-xl text-dourado">
                      R$ {loteAtivo.precoFeminino},00
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-dourado opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={10} /> Comprar
                    </div>
                  </button>
                </div>
              </div>

              <div className="divider-gold opacity-30" />

              {/* BACKSTAGE */}
              <div>
                <p className="font-accent text-xs tracking-widest uppercase text-bege-escuro/60 mb-3">Backstage</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => abrirCompra('backstage', 'masculino')}
                    className="bg-black/30 border border-gold/20 hover:border-gold/60 rounded-sm p-3 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={12} className="text-bege-escuro/60" />
                      <span className="font-body text-xs text-bege-escuro/60">Masculino</span>
                    </div>
                    <div className="font-display text-xl text-bege">
                      R$ {precoBackstageMasc},00
                    </div>
                  </button>
                  <button
                    onClick={() => abrirCompra('backstage', 'feminino')}
                    className="bg-black/30 border border-gold/20 hover:border-gold/60 rounded-sm p-3 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={12} className="text-bege-escuro/60" />
                      <span className="font-body text-xs text-bege-escuro/60">Feminino</span>
                    </div>
                    <div className="font-display text-xl text-dourado">
                      R$ {precoBackstageFem},00
                    </div>
                  </button>
                </div>
              </div>

              {/* Lista amiga */}
              {evento.temLista && (
                <>
                  <div className="divider-gold opacity-30" />
                  <Link
                    href={`/lista/${evento.slug}`}
                    className="block text-center text-xs font-accent tracking-widest uppercase text-bege-escuro/60 hover:text-dourado border border-white/10 hover:border-dourado/40 py-3 rounded-sm transition-all duration-200"
                  >
                    Entrar na Lista Amiga →
                  </Link>
                </>
              )}

              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/5">
                <Shield size={13} className="text-dourado/60 mt-0.5 flex-shrink-0" />
                <p className="font-body text-xs text-bege-escuro/40 leading-relaxed">
                  Compra segura · Ingresso nominal com CPF · Enviado por email · Política de reembolso aplicável
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE COMPRA */}
      {modalAberto && (
        <CompraIngressoModal
          evento={evento}
          tipoInicial={tipoSelecionado}
          generoInicial={generoSelecionado}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  )
}
