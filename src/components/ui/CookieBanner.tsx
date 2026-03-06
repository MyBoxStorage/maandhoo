'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, ChevronDown, ChevronUp, Shield } from 'lucide-react'

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
      const t = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(t)
    }
  }, [])

  const salvar = (novoConsent: ConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...novoConsent,
      dataConsentimento: new Date().toISOString(),
    }))
    setVisible(false)
  }

  const aceitarTodos       = () => salvar({ essenciais: true, analytics: true, marketing: true })
  const recusarOpcionais   = () => salvar({ essenciais: true, analytics: false, marketing: false })
  const salvarPreferencias = () => salvar(consent)

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 sm:pb-6"
      role="dialog"
      aria-modal="true"
      aria-label="Aviso de cookies"
    >
      <div className="max-w-3xl mx-auto bg-card border border-dourado/30 rounded-sm shadow-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-dourado to-transparent" />
        <div className="p-5 sm:p-6">

          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-dourado/10 flex items-center justify-center flex-shrink-0">
                <Cookie size={18} className="text-dourado" />
              </div>
              <div>
                <h2 className="font-accent text-sm tracking-widest uppercase text-dourado">
                  Cookies & Privacidade
                </h2>
                <p className="font-body text-xs text-bege-escuro/50 mt-0.5 flex items-center gap-1">
                  <Shield size={10} />
                  Conforme a LGPD — Lei nº 13.709/2018
                </p>
              </div>
            </div>
            <button
              onClick={recusarOpcionais}
              className="text-bege-escuro/40 hover:text-bege-escuro transition-colors flex-shrink-0 mt-0.5"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <p className="font-body text-sm text-bege-escuro/70 leading-relaxed mb-4">
            Utilizamos cookies para garantir o funcionamento do site e, com seu consentimento,
            para analisar o uso e personalizar sua experiência.{' '}
            <Link href="/politicas#privacidade" className="text-dourado hover:underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 font-accent text-xs tracking-widest uppercase text-bege-escuro/50 hover:text-dourado transition-colors mb-4"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Personalizar preferências
          </button>

          {expanded && (
            <div className="space-y-3 mb-5 border border-dourado/10 rounded-sm p-4 bg-black/20">

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-accent text-xs tracking-wider uppercase text-bege mb-0.5">Cookies Essenciais</p>
                  <p className="font-body text-xs text-bege-escuro/50 leading-relaxed">
                    Necessários para o funcionamento do site. Não podem ser desativados.
                  </p>
                </div>
                <div className="flex-shrink-0 w-10 h-5 rounded-full bg-dourado/40 flex items-center justify-end px-0.5 cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-dourado" />
                </div>
              </div>

              <div className="h-px bg-dourado/10" />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-accent text-xs tracking-wider uppercase text-bege mb-0.5">Cookies Analíticos</p>
                  <p className="font-body text-xs text-bege-escuro/50 leading-relaxed">
                    Nos ajudam a entender como o site é utilizado (páginas visitadas, tempo de sessão).
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={consent.analytics}
                  onClick={() => setConsent(p => ({ ...p, analytics: !p.analytics }))}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${consent.analytics ? 'bg-dourado justify-end' : 'bg-bege-escuro/20 justify-start'}`}
                  aria-label="Ativar cookies analiticos"
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div className="h-px bg-dourado/10" />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-accent text-xs tracking-wider uppercase text-bege mb-0.5">Cookies de Marketing</p>
                  <p className="font-body text-xs text-bege-escuro/50 leading-relaxed">
                    Permitem conteudo personalizado nas redes sociais e parceiros.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={consent.marketing}
                  onClick={() => setConsent(p => ({ ...p, marketing: !p.marketing }))}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${consent.marketing ? 'bg-dourado justify-end' : 'bg-bege-escuro/20 justify-start'}`}
                  aria-label="Ativar cookies de marketing"
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={aceitarTodos} className="btn-primary flex-1 text-xs py-2.5 text-center">
              Aceitar Todos
            </button>
            {expanded ? (
              <button onClick={salvarPreferencias} className="btn-outline flex-1 text-xs py-2.5 text-center">
                Salvar Preferencias
              </button>
            ) : (
              <button onClick={recusarOpcionais} className="btn-outline flex-1 text-xs py-2.5 text-center">
                Apenas Essenciais
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default CookieBanner
