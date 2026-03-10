'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Instagram, Phone, User } from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'

const navLinks = [
  { href: '/#eventos', label: 'Eventos' },
  { href: '/#mapa', label: 'A Casa' },
  { href: '/cardapio', label: 'Cardápio' },
  { href: '/reservas', label: 'Reservas' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/faq', label: 'FAQ' },
]

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/portaria')
  if (isAdmin) return null

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-preto-profundo/95 backdrop-blur-md border-b border-gold py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3 group">
              <LogoElefante
                width={38}
                height={42}
                color="#E8DDD0"
                className="group-hover:animate-pulse-gold transition-all duration-300"
              />
              <span className="font-brand text-xl text-bege group-hover:text-gradient-gold transition-all duration-300" style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
                maandhoo
              </span>
            </Link>

            {/* LINKS — DESKTOP */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm tracking-wider text-bege-escuro hover:text-bege transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-dourado group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* AÇÕES DIREITA — DESKTOP */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://www.instagram.com/maandhoo_club/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bege-escuro hover:text-dourado transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/5547999300283"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bege-escuro hover:text-dourado transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <Phone size={18} />
              </a>
              <Link
                href="/minha-conta"
                className="text-bege-escuro hover:text-dourado transition-colors duration-200 flex items-center gap-1.5"
                title="Minha Conta"
              >
                <User size={16} />
                <span className="font-body text-sm">Minha Conta</span>
              </Link>
              <Link
                href="/#eventos"
                className={`text-xs px-5 py-2.5 font-accent tracking-widest uppercase transition-all duration-300 ${
                  scrolled
                    ? 'btn-primary'
                    : 'border border-dourado/70 text-dourado hover:bg-dourado hover:text-preto-profundo'
                }`}
              >
                Comprar Ingresso
              </Link>
            </div>

            {/* MENU MOBILE */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-bege p-2 hover:text-dourado transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-72 h-full bg-preto-profundo border-l border-gold flex flex-col pt-24 px-6 gap-2 animate-fade-in">
            <div className="divider-gold mb-4" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-body text-base text-bege-escuro hover:text-bege py-3 border-b border-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 space-y-3">
              <Link
                href="/minha-conta"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 w-full border border-dourado/30 text-dourado hover:bg-dourado/10 transition-all text-xs font-accent tracking-widest uppercase py-3 px-4 rounded-sm"
              >
                <User size={14} /> Minha Conta
              </Link>
              <Link
                href="/#eventos"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full text-center block text-xs"
              >
                Comprar Ingresso
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/maandhoo_club/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-bege-escuro hover:text-dourado text-sm transition-colors"
              >
                <Instagram size={16} />
                @maandhoo_club
              </a>
            </div>
            <a
              href="https://wa.me/5547999300283"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-bege-escuro hover:text-dourado text-sm transition-colors"
            >
              <Phone size={16} />
              (47) 9930-0283
            </a>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
