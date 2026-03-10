import type { Metadata, Viewport } from 'next'

/**
 * Layout isolado para o PWA da portaria.
 * Não herda header/footer do site público nem sidebar do admin.
 * Injeta o manifest e meta tags necessárias para instalação como PWA.
 */

export const metadata: Metadata = {
  title: 'Maandhoo Portaria',
  description: 'Sistema de validação de ingressos — Maandhoo Club',
  manifest: '/portaria-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Portaria',
  },
  icons: {
    icon: '/icons/portaria-192.png',
    apple: '/icons/portaria-512.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0604',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function PortariaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/*
        Registra o Service Worker apenas na portaria.
        Usa suppressHydrationWarning porque o script só roda no cliente.
      */}
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/portaria-sw.js', { scope: '/portaria' })
                  .then(function(reg) {
                    console.log('[PWA] SW registrado:', reg.scope);
                    // Verifica atualização imediata
                    reg.update();
                  })
                  .catch(function(err) {
                    console.warn('[PWA] Falha ao registrar SW:', err);
                  });
              });
            }
          `,
        }}
      />
      {children}
    </>
  )
}
