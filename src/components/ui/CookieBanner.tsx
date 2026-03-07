'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ChevronDown, ChevronUp, Shield, X } from 'lucide-react'

type ConsentState = {
  essenciais: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'maandhoo-cookie-consent'

export const CookieBanner: React.FC = () => {
  const [visible, setVisible]   = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [consent, setConsent]   = useState<ConsentState>({
    essenciais: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const salvar = (c: ConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...c, dataConsentimento: new Date().toISOString(),
    }))
    setVisible(false)
  }

  const aceitarTodos       = () => {
    setConsent({ essenciais: true, analytics: true, marketing: true })
    salvar({ essenciais: true, analytics: true, marketing: true })
  }
  const recusarOpcionais   = () => salvar({ essenciais: true, analytics: false, marketing: false })
  const salvarPreferencias = () => salvar(consent)

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label="Aviso de cookies"
    >
      {/* BARRA PRINCIPAL */}
      <div className="bg-[#0f0905] border-t border-dourado/25">

        {/* Linha dourada decorativa no topo */}
        <div className="h-px bg-gradient-to-r from-transparent via-dourado/50 to-transparent" />

        {/* PAINEL EXPANDÍVEL */}
        {expanded && (
          <div className="border-b border-dourado/10 px-4 py-5">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* ESSENCIAIS */}
              <div className="flex items-start justify-between gap-3 bg-black/20 rounded-sm p-4 border border-dourado/10">
                <div>
                  <p className="font-accent text-xs tracking-wider uppercase text-bege mb-1">Essenciais</p>
                  <p className="font-body text-xs text-bege-escuro/55 leading-relaxed">
                    Necessários para o funcionamento. Não podem ser desativados.
                  </p>
                </div>
                <div className="flex-shrink-0 w-10 h-5 rounded-full bg-dourado/40 flex items-center justify-end px-0.5 cursor-not-allowed mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-dourado" />
                </div>
              </div>

              {/* ANALYTICS */}
              <div className="flex items-start justify-between gap-3 bg-black/20 rounded-sm p-4 border border-dourado/10">
                <div>
                  <p className="font-accent text-xs tracking-wider uppercase text-bege mb-1">Analíticos</p>
                  <p className="font-body text-xs text-bege-escuro/55 leading-relaxed">
                    Páginas visitadas e tempo de sessão para melhorar o site.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={consent.analytics}
                  onClick={() => setConsent(p => ({ ...p, analytics: !p.analytics }))}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 mt-0.5
                    ${consent.analytics ? 'bg-dourado justify-end' : 'bg-bege-escuro/20 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* MARKETING */}
              <div className="flex items-start justify-between gap-3 bg-black/20 rounded-sm p-4 border border-dourado/10">
                <div>
                  <p className="font-accent text-xs tracking-wider uppercase text-bege mb-1">Marketing</p>
                  <p className="font-body text-xs text-bege-escuro/55 leading-relaxed">
                    Conteúdo personalizado em redes sociais e parceiros.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={consent.marketing}
                  onClick={() => setConsent(p => ({ ...p, marketing: !p.marketing }))}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 mt-0.5
                    ${consent.marketing ? 'bg-dourado justify-end' : 'bg-bege-escuro/20 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BARRA INFERIOR — sempre visível */}
        <div className="px-4 py-3 sm:py-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">

            {/* ÍCONE + TEXTO */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Cookie size={15} className="text-dourado flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs text-bege-escuro/65 leading-relaxed">
                Usamos cookies conforme a{' '}
                <span className="text-dourado font-medium">LGPD</span>.{' '}
                <Link href="/politicas#privacidade" className="underline underline-offset-2 hover:text-dourado transition-colors">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>

            {/* BOTÕES — mobile: 2 colunas; desktop: linha */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-shrink-0">

              {/* Linha 1 mobile: Personalizar + Só essenciais/Salvar */}
              <div className="flex gap-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center justify-center gap-1 font-accent text-[10px] tracking-widest uppercase text-bege-escuro/45 hover:text-dourado transition-colors px-3 py-2.5 border border-white/10 hover:border-dourado/30 rounded-sm flex-1 sm:flex-none"
                >
                  {expanded ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                  {expanded ? 'Fechar' : 'Personalizar'}
                </button>

                {expanded ? (
                  <button
                    onClick={salvarPreferencias}
                    className="btn-outline text-[10px] py-2.5 px-4 flex-1 sm:flex-none text-center"
                  >
                    Salvar preferências
                  </button>
                ) : (
                  <button
                    onClick={recusarOpcionais}
                    className="font-accent text-[10px] tracking-widest uppercase text-bege-escuro/45 hover:text-bege transition-colors px-3 py-2.5 border border-white/10 hover:border-white/20 rounded-sm flex-1 sm:flex-none text-center"
                  >
                    Só essenciais
                  </button>
                )}
              </div>

              {/* Linha 2 mobile: Aceitar todos (destaque) */}
              <div className="flex gap-2">
                <button
                  onClick={aceitarTodos}
                  className="btn-primary text-[10px] py-2.5 px-5 flex-1 sm:flex-none text-center"
                >
                  Aceitar todos
                </button>

                <button
                  onClick={recusarOpcionais}
                  className="text-bege-escuro/30 hover:text-bege-escuro/70 transition-colors p-2 flex-shrink-0 border border-white/5 rounded-sm sm:border-0"
                  aria-label="Fechar"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieBanner
