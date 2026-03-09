'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Ticket, Users, ListChecks,
  BookMarked, UtensilsCrossed, Image, LogOut, Menu, X, QrCode, UserPlus, ShieldCheck
} from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'

const navAdmin = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} />, roles: ['admin'] },
  { href: '/admin/eventos', label: 'Eventos', icon: <CalendarDays size={17} />, roles: ['admin', 'operador'] },
  { href: '/admin/ingressos', label: 'Ingressos', icon: <Ticket size={17} />, roles: ['admin'] },
  { href: '/admin/camarotes', label: 'Camarotes', icon: <ShieldCheck size={17} />, roles: ['admin', 'operador'] },
  { href: '/admin/porteiros', label: 'Porteiros', icon: <Users size={17} />, roles: ['admin'] },
  { href: '/admin/listas', label: 'Listas Amigas', icon: <ListChecks size={17} />, roles: ['admin', 'operador'] },
  { href: '/admin/reservas', label: 'Reservas', icon: <BookMarked size={17} />, roles: ['admin'] },
  { href: '/admin/leads', label: 'Leads & Contatos', icon: <UserPlus size={17} />, roles: ['admin'] },
  { href: '/admin/usuarios', label: 'Usuários / CRM', icon: <Users size={17} />, roles: ['admin'] },
  { href: '/admin/cardapio', label: 'Cardápio', icon: <UtensilsCrossed size={17} />, roles: ['admin'] },
  { href: '/admin/galeria', label: 'Galeria', icon: <Image size={17} />, roles: ['admin'] },
  { href: '/portaria', label: 'Portaria (QR)', icon: <QrCode size={17} />, roles: ['admin', 'porteiro'] },
]

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // Simulação de role — em prod vem do NextAuth session
  const userRole = 'admin'
  const userName = 'Administrador'

  const linksVisiveis = navAdmin.filter(l => l.roles.includes(userRole))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gold/15">
        <LogoElefante width={30} height={34} color="#C9A84C" />
        <div>
          <span className="font-accent text-base tracking-wider text-bege">maandhoo</span>
          <p className="font-body text-xs text-bege-escuro/50 -mt-0.5">Painel Admin</p>
        </div>
      </div>

      {/* ROLE BADGE */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-dourado animate-pulse" />
          <span className="font-body text-xs text-bege-escuro/60 capitalize">{userRole} · {userName}</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {linksVisiveis.map(link => {
          const ativo = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`admin-nav-item rounded-sm ${ativo ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gold/10">
        <Link href="/" className="admin-nav-item text-xs rounded-sm">
          ← Ver Site Público
        </Link>
        <button className="admin-nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-sm mt-1">
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 admin-sidebar z-30">
        <SidebarContent />
      </aside>

      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-preto-profundo border border-gold/30 p-2 rounded-sm"
      >
        <Menu size={20} className="text-bege" />
      </button>

      {/* MOBILE OVERLAY */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 admin-sidebar flex flex-col animate-fade-in">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-bege-escuro hover:text-bege">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
