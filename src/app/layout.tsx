import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Maandhoo Club — Suas noites são na Maandhoo, o melhor club de Balneário Camboriú',
  description: 'Balada premium em Balneário Camboriú. Compre ingressos, reserve mesas e camarotes. Rua Brás Cubas, 35 — Nova Esperança, BC.',
  keywords: 'maandhoo, club, balada, balneário camboriú, ingressos, eventos, camarote, reserva',
  metadataBase: new URL('https://maandhoo.com'),
  openGraph: {
    title: 'Maandhoo Club',
    description: 'Suas noites são na Maandhoo — o melhor club de Balneário Camboriú',
    url: 'https://maandhoo.com',
    siteName: 'Maandhoo Club',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Cinzel:wght@400;500;600;700&family=Nunito:wght@200;300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-preto-profundo text-bege antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a0e08',
              color: '#E8DDD0',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '2px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#C9A84C', secondary: '#0A0604' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0A0604' },
            },
          }}
        />
      </body>
    </html>
  )
}
