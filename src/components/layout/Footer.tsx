'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, MapPin, Phone, Mail } from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-preto-profundo border-t border-gold/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* MARCA */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <LogoElefante width={40} height={44} color="#C9A84C" />
              <span className="font-accent text-xl tracking-[0.15em] text-bege">maandhoo</span>
            </Link>
            <p className="font-body text-sm text-bege-escuro leading-relaxed mb-5">
              Suas noites são na Maandhoo,<br />
              o melhor club de Balneário Camboriú.
            </p>
            <a
              href="https://www.instagram.com/maandhoo_club/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-bege-escuro hover:text-dourado transition-colors text-sm"
            >
              <Instagram size={16} />
              @maandhoo_club
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
        </div>
      </div>
    </footer>
  )
}

export default Footer
