/**
 * GET /api/pwa-icon?size=192&maskable=false
 * Gera ícones PWA dinamicamente via Next.js ImageResponse (edge runtime).
 * Use para pre-gerar os PNGs ou sirva diretamente no manifest.
 *
 * Para gerar os arquivos estáticos em public/icons/, acesse:
 *   /api/pwa-icon?size=192
 *   /api/pwa-icon?size=512
 *   /api/pwa-icon?size=192&maskable=true
 *   /api/pwa-icon?size=512&maskable=true
 * e salve cada resposta como portaria-{size}.png / portaria-maskable-{size}.png
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const size = Math.min(512, Math.max(16, Number(searchParams.get('size') ?? '192')))
  const maskable = searchParams.get('maskable') === 'true'

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#0A0604',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {!maskable && (
          <div
            style={{
              position: 'absolute',
              width: Math.round(size * 0.84),
              height: Math.round(size * 0.84),
              borderRadius: '50%',
              border: `${Math.round(size * 0.025)}px solid #C9A84C`,
              opacity: 0.85,
              display: 'flex',
            }}
          />
        )}

        <svg
          width={Math.round(size * 0.50)}
          height={Math.round(size * 0.50)}
          viewBox="0 0 100 100"
          style={{ marginBottom: Math.round(size * 0.02) }}
        >
          <ellipse cx="52" cy="52" rx="28" ry="22" fill="none" stroke="#C9A84C" strokeWidth="3.5" />
          <ellipse cx="30" cy="40" rx="16" ry="14" fill="none" stroke="#C9A84C" strokeWidth="3.5" />
          <path d="M18 48 Q10 58 14 68 Q18 76 24 72" fill="none" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M20 30 Q8 28 10 42 Q12 50 20 48" fill="none" stroke="#C9A84C" strokeWidth="3" />
          <line x1="38" y1="70" x2="36" y2="84" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="50" y1="72" x2="50" y2="86" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="62" y1="70" x2="64" y2="84" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="72" y1="66" x2="76" y2="80" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="24" cy="36" r="2.5" fill="#C9A84C" />
          <path d="M22 50 Q16 54 20 60" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        <div
          style={{
            color: '#C9A84C',
            fontSize: Math.round(size * 0.09),
            letterSpacing: Math.round(size * 0.01),
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          PORTARIA
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
