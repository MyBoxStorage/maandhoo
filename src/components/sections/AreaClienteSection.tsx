'use client'

import React from 'react'
import Link from 'next/link'
import { Ticket, User, Star, ShieldCheck, ChevronRight } from 'lucide-react'

const beneficios = [
  {
    icon: Ticket,
    titulo: 'Seus Ingressos',
    descricao: 'Acesse e apresente todos os seus QR Codes em um único lugar, sem precisar procurar no e-mail.',
  },
  {
    icon: Star,
    titulo: 'Histórico de Eventos',
    descricao: 'Veja todos os eventos que você já curtiu na Maandhoo e reviva cada memória.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Acesso Garantido',
    descricao: 'Entre na portaria com agilidade. Seu ingresso digital sempre disponível, mesmo sem internet.',
  },
]

export const AreaClienteSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">

      {/* Fundo com gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-preto-profundo via-[#0d0a05] to-preto-profundo pointer-events-none" />

      {/* Linha decorativa esquerda */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-48 bg-gradient-to-b from-transparent via-dourado/20 to-transparent hidden lg:block" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-48 bg-gradient-to-b from-transparent via-dourado/20 to-transparent hidden lg:block" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-14 sm:mb-18">
          <p className="font-accent text-xs tracking-[0.4em] text-dourado/70 uppercase mb-4">
            Maandhoo Club
          </p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-bege mb-5"
            style={{ letterSpacing: '-0.01em' }}>
            Área do Cliente
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-dourado/50" />
            <div className="w-1 h-1 rounded-full bg-dourado/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-dourado/50" />
          </div>
          <p className="font-body text-base sm:text-lg text-bege-escuro/60 max-w-xl mx-auto leading-relaxed">
            Cadastre-se e tenha todos os seus ingressos e reservas centralizados.
            Acesso rápido na portaria, direto do celular.
          </p>
        </div>

        {/* CARDS DE BENEFÍCIOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {beneficios.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.titulo}
                className="group relative border border-dourado/10 hover:border-dourado/30 bg-black/20 hover:bg-dourado/[0.03] rounded-sm p-7 transition-all duration-300"
              >
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-6 h-px bg-dourado/40 group-hover:w-12 transition-all duration-500" />
                <div className="absolute top-0 left-0 h-6 w-px bg-dourado/40 group-hover:h-12 transition-all duration-500" />

                <div className="flex items-center justify-center w-11 h-11 border border-dourado/20 group-hover:border-dourado/40 rounded-sm mb-5 transition-colors duration-300">
                  <Icon size={20} className="text-dourado/70 group-hover:text-dourado transition-colors duration-300" />
                </div>

                <h3 className="font-accent text-xs tracking-[0.25em] uppercase text-bege mb-2">
                  {b.titulo}
                </h3>
                <p className="font-body text-sm text-bege-escuro/55 leading-relaxed">
                  {b.descricao}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA PRINCIPAL */}
        <div className="relative border border-dourado/20 bg-black/30 rounded-sm overflow-hidden">

          {/* Detalhe decorativo no fundo */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-dourado/[0.03] pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-dourado/[0.02] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-10 lg:p-12">

            {/* Texto */}
            <div className="text-center lg:text-left">
              <p className="font-accent text-[10px] tracking-[0.4em] text-dourado/60 uppercase mb-2">
                Acesso exclusivo
              </p>
              <h3 className="font-display text-2xl sm:text-3xl text-bege mb-3">
                Comprou ingresso?
              </h3>
              <p className="font-body text-sm text-bege-escuro/55 max-w-md leading-relaxed">
                Crie sua conta com o mesmo e-mail usado na compra e seus ingressos
                aparecerão automaticamente na área do cliente.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:w-56 flex-shrink-0">
              <Link
                href="/acesso"
                className="btn-primary flex items-center justify-center gap-2 text-center whitespace-nowrap"
              >
                <User size={14} />
                Criar Conta
              </Link>
              <Link
                href="/acesso"
                className="btn-outline flex items-center justify-center gap-2 text-center whitespace-nowrap"
              >
                Já tenho conta
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AreaClienteSection
