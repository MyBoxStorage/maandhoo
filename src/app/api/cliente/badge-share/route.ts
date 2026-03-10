import { NextRequest, NextResponse } from 'next/server'
import { PERFIS_QUIZ } from '@/lib/quiz-perfis'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const perfilId = searchParams.get('perfil') || 'nomade'
  const nome     = searchParams.get('nome')   || 'Membro'
  const p        = PERFIS_QUIZ[perfilId] || PERFIS_QUIZ['nomade']
  const primeiroNome = nome.split(' ')[0]

  // SVG card 1200x630 ultra-profissional
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg1" cx="35%" cy="50%" r="65%">
      <stop offset="0%" stop-color="${p.corSecundaria}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0A0604" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="bg2" cx="85%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p.corPrimaria}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0A0604" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="badgeBg" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${p.corSecundaria}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${p.corPrimaria}" stop-opacity="0.85"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="12" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
  </defs>

  <!-- Fundo -->
  <rect width="1200" height="630" fill="#0A0604"/>
  <rect width="1200" height="630" fill="url(#bg1)"/>
  <rect width="1200" height="630" fill="url(#bg2)"/>

  <!-- Grade sutil -->
  <line x1="0" y1="315" x2="1200" y2="315" stroke="${p.corPrimaria}" stroke-opacity="0.05" stroke-width="1"/>
  <line x1="420" y1="0" x2="420" y2="630" stroke="${p.corPrimaria}" stroke-opacity="0.05" stroke-width="1"/>

  <!-- Borda externa -->
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="${p.corPrimaria}" stroke-opacity="0.3" stroke-width="1.5"/>
  <rect x="38" y="38" width="1124" height="554" fill="none" stroke="${p.corPrimaria}" stroke-opacity="0.08" stroke-width="1"/>

  <!-- Corner accents TL -->
  <line x1="32" y1="32" x2="110" y2="32" stroke="${p.corPrimaria}" stroke-width="3"/>
  <line x1="32" y1="32" x2="32" y2="110" stroke="${p.corPrimaria}" stroke-width="3"/>
  <!-- TR -->
  <line x1="1168" y1="32" x2="1090" y2="32" stroke="${p.corPrimaria}" stroke-width="3"/>
  <line x1="1168" y1="32" x2="1168" y2="110" stroke="${p.corPrimaria}" stroke-width="3"/>
  <!-- BL -->
  <line x1="32" y1="598" x2="110" y2="598" stroke="${p.corPrimaria}" stroke-width="3"/>
  <line x1="32" y1="598" x2="32" y2="520" stroke="${p.corPrimaria}" stroke-width="3"/>
  <!-- BR -->
  <line x1="1168" y1="598" x2="1090" y2="598" stroke="${p.corPrimaria}" stroke-width="3"/>
  <line x1="1168" y1="598" x2="1168" y2="520" stroke="${p.corPrimaria}" stroke-width="3"/>

  <!-- Badge central esquerdo -->
  <g filter="url(#glow)">
    <circle cx="210" cy="315" r="152" fill="url(#badgeBg)"/>
    <circle cx="210" cy="315" r="152" fill="none" stroke="${p.corPrimaria}" stroke-width="3.5" stroke-opacity="0.8"/>
    <circle cx="210" cy="315" r="128" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>
    <circle cx="210" cy="315" r="100" fill="none" stroke="${p.corPrimaria}" stroke-opacity="0.18" stroke-width="1"/>
    <!-- Reflexo interno -->
    <ellipse cx="210" cy="240" rx="70" ry="45" fill="white" fill-opacity="0.06"/>
    <!-- Ícone: inicial do perfil grande -->
    <text x="210" y="350" font-family="Georgia, serif" font-size="110" text-anchor="middle"
      fill="rgba(255,255,255,0.88)" filter="url(#textGlow)">✦</text>
    <text x="210" y="395" font-family="sans-serif" font-size="14" text-anchor="middle"
      fill="rgba(255,255,255,0.45)" letter-spacing="5">${p.id.toUpperCase()}</text>
  </g>

  <!-- Linha divisória vertical sutil -->
  <line x1="400" y1="80" x2="400" y2="550" stroke="${p.corPrimaria}" stroke-opacity="0.12" stroke-width="1"/>

  <!-- Coluna de texto direita -->
  <!-- Label superior -->
  <text x="460" y="135" font-family="sans-serif" font-size="13" fill="${p.corPrimaria}"
    fill-opacity="0.65" letter-spacing="6">MAANDHOO CLUB · VIBE CHECK</text>

  <!-- Nome do cliente -->
  <text x="460" y="178" font-family="sans-serif" font-size="22" fill="${p.corPrimaria}"
    fill-opacity="0.75" letter-spacing="5">${primeiroNome.toUpperCase()}, VOCÊ É...</text>

  <!-- Divider 1 -->
  <line x1="460" y1="200" x2="1120" y2="200" stroke="${p.corPrimaria}" stroke-opacity="0.22" stroke-width="1"/>

  <!-- Nome do perfil — dominante -->
  <text x="460" y="306" font-family="Georgia, serif" font-size="90" fill="${p.corPrimaria}"
    filter="url(#textGlow)">${p.nome}</text>

  <!-- Subtítulo -->
  <text x="462" y="360" font-family="Georgia, serif" font-size="26"
    fill="rgba(232,221,208,0.6)" font-style="italic">${p.subtitulo}</text>

  <!-- Divider 2 -->
  <line x1="460" y1="388" x2="1050" y2="388" stroke="${p.corPrimaria}" stroke-opacity="0.15" stroke-width="1"/>

  <!-- Tagline -->
  <text x="462" y="428" font-family="Georgia, serif" font-size="19"
    fill="rgba(232,221,208,0.38)" font-style="italic">"${p.tagline}"</text>

  <!-- Rodapé centrado -->
  <line x1="490" y1="556" x2="600" y2="556" stroke="${p.corPrimaria}" stroke-opacity="0.25" stroke-width="1"/>
  <text x="710" y="561" font-family="sans-serif" font-size="13" text-anchor="middle"
    fill="${p.corPrimaria}" fill-opacity="0.45" letter-spacing="6">MAANDHOO.COM.BR</text>
  <line x1="820" y1="556" x2="930" y2="556" stroke="${p.corPrimaria}" stroke-opacity="0.25" stroke-width="1"/>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `inline; filename="maandhoo-${p.id}.svg"`,
    },
  })
}
