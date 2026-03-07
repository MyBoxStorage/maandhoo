'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, MapPin, Phone, Mail } from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-preto-profundo border-t border-gold/20 pt-16 pb-8">
      {/* Linha decorativa dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dourado/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* MARCA */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <LogoElefante width={48} height={54} color="#C9A84C" className="group-hover:animate-pulse-gold transition-all duration-300" />
              <div>
                <span className="font-brand text-2xl tracking-[0.05em] text-bege block" style={{ fontWeight: 600 }}>maandhoo</span>
                <span className="font-accent text-[9px] tracking-[0.35em] uppercase text-dourado/60">Club · Balneário Camboriú</span>
              </div>
            </Link>
            <p className="font-body text-sm text-bege-escuro/70 leading-relaxed mb-6">
              Suas noites são na Maandhoo,<br />
              o melhor club de Balneário Camboriú.
            </p>
            {/* Instagram destacado */}
            <a
              href="https://www.instagram.com/maandhoo_club/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-dourado/30 hover:border-dourado text-bege-escuro hover:text-dourado transition-all duration-200 text-sm px-4 py-2 rounded-sm"
            >
              <Instagram size={15} />
              <span className="font-body">@maandhoo_club</span>
            </a>
          </div>

          {/* NAVEGAÇÃO */}
          <div>
            <h4 className="font-accent text-xs tracking-[0.25em] uppercase text-dourado mb-5">
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/#eventos', label: 'Próximos Eventos' },
                { href: '/#mapa', label: 'Mapa da Casa' },
                { href: '/cardapio', label: 'Cardápio' },
                { href: '/galeria', label: 'Galeria' },
                { href: '/faq', label: 'Perguntas Frequentes' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-bege-escuro hover:text-bege transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RESERVAS */}
          <div>
            <h4 className="font-accent text-xs tracking-[0.25em] uppercase text-dourado mb-5">
              Reservas
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/reservas?tipo=mesa', label: 'Reservar Mesa' },
                { href: '/reservas?tipo=camarote', label: 'Reservar Camarote' },
                { href: '/reservas?tipo=aniversario', label: 'Aniversário VIP' },
                { href: '/#eventos', label: 'Lista Amiga' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-bege-escuro hover:text-bege transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTATO */}
          <div>
            <h4 className="font-accent text-xs tracking-[0.25em] uppercase text-dourado mb-5">
              Contato
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/5547999300283"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-bege-escuro hover:text-bege transition-colors"
                >
                  <Phone size={15} className="mt-0.5 flex-shrink-0 text-dourado" />
                  <span>(47) 9716-1002 / 9930-0283</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@maandhoo.com"
                  className="flex items-start gap-2 text-sm text-bege-escuro hover:text-bege transition-colors"
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0 text-dourado" />
                  <span>contato@maandhoo.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=Rua+Brás+Cubas,35+Balneário+Camboriú"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-bege-escuro hover:text-bege transition-colors"
                >
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-dourado" />
                  <span>Rua Brás Cubas, 35<br />Nova Esperança — Balneário Camboriú</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="divider-gold mb-8" />

        {/* BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-bege-escuro/50 text-center sm:text-left">
            © {new Date().getFullYear()} Maandhoo Club. Todos os direitos reservados.
            Proibida a entrada de menores de 18 anos.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/politicas" className="font-body text-xs text-bege-escuro/50 hover:text-bege-escuro transition-colors">
              Privacidade
            </Link>
            <span className="text-bege-escuro/20">|</span>
            <Link href="/politicas#termos" className="font-body text-xs text-bege-escuro/50 hover:text-bege-escuro transition-colors">
              Termos de Uso
            </Link>
            <span className="text-bege-escuro/20">|</span>
            <Link href="/politicas#cancelamento" className="font-body text-xs text-bege-escuro/50 hover:text-bege-escuro transition-colors">
              Cancelamento
            </Link>
          </div>

          {/* CRÉDITOS */}
          <div className="mt-4 text-center">
            <p className="font-body text-xs text-bege-escuro/30">
              Desenvolvido por{' '}
              <a
                href="https://globallanding.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bege-escuro/50 hover:text-dourado transition-colors duration-200"
              >
                Global Landing
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
