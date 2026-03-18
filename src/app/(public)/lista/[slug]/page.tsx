'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { UserPlus, CheckCircle, ArrowLeft, Mail, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface PageProps {
  params: { slug: string }
}

type EventoPublico = {
  id: string
  nome: string
  data_evento: string
  hora_abertura: string
  flyer_url: string | null
  lista_encerra_as: string | null
}

export default function ListaPage({ params }: PageProps) {
  const [carregando, setCarregando] = useState(true)
  const [eventos, setEventos] = useState<EventoPublico[]>([])

  const [genero, setGenero] = useState<'masculino' | 'feminino'>('feminino')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const carregarEventos = async () => {
      setCarregando(true)
      try {
        const res = await fetch('/api/admin/eventos?publico=true')
        const data = await res.json()
        setEventos(Array.isArray(data.eventos) ? data.eventos : [])
      } finally {
        setCarregando(false)
      }
    }
    carregarEventos()
  }, [])

  const gerarSlugLegado = (evento: EventoPublico) =>
    `${evento.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${evento.data_evento.slice(0, 10).replace(/-/g, '-')}`

  const evento = useMemo(
    () => eventos.find((ev) => ev.id === params.slug || gerarSlugLegado(ev) === params.slug) ?? null,
    [eventos, params.slug],
  )

  if (carregando) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
          <div className="h-5 w-40 bg-white/10 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-[9/16] bg-white/10 rounded-sm max-w-xs" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-white/10 rounded" />
              <div className="h-40 w-full bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!evento) notFound()

  const eventoSlug = gerarSlugLegado(evento)
  const dataEvento = new Date(`${evento.data_evento}T00:00:00`)
  const dataFormatada = format(dataEvento, "dd 'de' MMMM", { locale: ptBR })
  const diaHora = format(dataEvento, 'EEEE', { locale: ptBR })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || nome.trim().split(' ').length < 2) {
      toast.error('Informe seu nome completo')
      return
    }
    if (!email.includes('@')) {
      toast.error('Email inválido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/lista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId: evento.id, nome, email, genero, origem: 'pagina_lista' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? data.erro ?? 'Erro ao entrar na lista. Tente novamente.')
        return
      }
      setSucesso(true)
      toast.success('Nome adicionado à lista!')
    } catch {
      toast.error('Erro ao entrar na lista. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href={`/eventos/${eventoSlug}`} className="inline-flex items-center gap-2 text-bege-escuro hover:text-bege text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar ao evento
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* FLYER */}
          <div className="relative aspect-[9/16] rounded-sm overflow-hidden max-w-xs mx-auto md:mx-0">
            <Image
              src={evento.flyer_url || '/images/flyers/placeholder.webp'}
              alt={evento.nome}
              fill
              className="object-cover"
            />
          </div>

          {/* FORMULÁRIO */}
          <div className="space-y-6">
            <div>
              <p className="section-subtitle mb-2">Lista Amiga</p>
              <h1 className="font-display text-4xl text-bege mb-1">{evento.nome}</h1>
              <p className="font-body text-sm text-bege-escuro/60 capitalize">
                {diaHora} · {dataFormatada} · {evento.hora_abertura}
              </p>
            </div>

            {/* BENEFÍCIOS */}
            <div className="bg-card border border-gold/20 rounded-sm p-5 space-y-3">
              <h4 className="font-accent text-xs tracking-widest uppercase text-dourado">Benefícios da Lista</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">♀</span>
                  </div>
                  <div>
                    <p className="font-body text-sm text-bege">Feminino — Entrada Gratuita</p>
                    <p className="font-body text-xs text-bege-escuro/60">Válido até 00:00 com nome na lista</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">♂</span>
                  </div>
                  <div>
                    <p className="font-body text-sm text-bege">Masculino — R$ 50,00 fixo</p>
                    <p className="font-body text-xs text-bege-escuro/60">Válido até 00:00 com nome na lista</p>
                  </div>
                </div>
              </div>
            </div>

            {!sucesso ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Seletor gênero */}
                <div>
                  <label className="admin-label">Sua Lista</label>
                  <div className="flex gap-3">
                    {(['feminino', 'masculino'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGenero(g)}
                        className={`flex-1 py-3 text-sm font-accent tracking-wider uppercase rounded-sm border transition-all duration-200
                          ${genero === g ? 'border-dourado bg-dourado/15 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/40'}`}
                      >
                        {g === 'feminino' ? '♀ Feminino' : '♂ Masculino'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="admin-label">Nome Completo *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
                    <input
                      type="text"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      className="admin-input pl-9"
                      placeholder="Como aparecerá na lista"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="admin-input pl-9"
                      placeholder="Para confirmação de inscrição"
                      required
                    />
                  </div>
                  <p className="text-xs text-bege-escuro/40 mt-1">
                    Você receberá uma confirmação de inscrição por email
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-sm">
                  <AlertCircle size={14} className="text-amber-500/80 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-bege-escuro/60">
                    Lista válida até 00:00. Pode ocorrer alteração conforme horário e lotação.
                    Inscrição pessoal e intransferível.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-preto-profundo/30 border-t-preto-profundo rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {loading ? 'Entrando na lista...' : 'Entrar na Lista'}
                </button>
              </form>
            ) : (
              /* SUCESSO */
              <div className="bg-card border border-dourado/50 rounded-sm p-6 text-center space-y-4">
                <CheckCircle size={48} className="text-dourado mx-auto animate-pulse-gold" />
                <h3 className="font-display text-2xl text-bege">Você está na lista!</h3>
                <p className="font-body text-sm text-bege-escuro/70">
                  <strong className="text-bege">{nome}</strong>, sua inscrição na lista {genero} está confirmada.<br />
                  Enviamos uma confirmação para <strong className="text-bege">{email}</strong>.
                </p>
                <div className="bg-black/30 rounded-sm p-3">
                  <p className="text-xs text-bege-escuro/60">
                    Informe seu nome na portaria até 00:00 para garantir a entrada
                  </p>
                </div>
                <Link href={`/eventos/${eventoSlug}`} className="btn-outline block text-center text-xs">
                  Ver detalhes do evento
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
