'use client'

import React from 'react'

interface LogoElefanteProps {
  className?: string
  width?: number
  height?: number
  color?: string
  animated?: boolean
}

export const LogoElefante: React.FC<LogoElefanteProps> = ({
  className = '',
  width = 120,
  height = 130,
  color = '#E8DDD0',
  animated = false,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 218"
      width={width}
      height={height}
      className={`${className} ${animated ? 'animate-pulse-gold' : ''}`}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="miter"
      strokeLinecap="butt"
    >
      {/* ── ORELHA ESQUERDA ── */}
      {/* Contorno externo expandido + ponto extra para arredondar */}
      <line x1="2" y1="55" x2="38" y2="15" />
      <line x1="38" y1="15" x2="70" y2="35" />
      <line x1="70" y1="35" x2="58" y2="75" />
      <line x1="58" y1="75" x2="22" y2="95" />
      <line x1="22" y1="95" x2="2" y2="75" />
      <line x1="2" y1="75" x2="2" y2="55" />
      <line x1="2" y1="55" x2="22" y2="95" />
      <line x1="38" y1="15" x2="22" y2="95" />
      <line x1="2" y1="55" x2="58" y2="75" />
      <line x1="22" y1="95" x2="70" y2="35" />

      {/* ── ORELHA DIREITA ── */}
      <line x1="198" y1="55" x2="162" y2="15" />
      <line x1="162" y1="15" x2="130" y2="35" />
      <line x1="130" y1="35" x2="142" y2="75" />
      <line x1="142" y1="75" x2="178" y2="95" />
      <line x1="178" y1="95" x2="198" y2="75" />
      <line x1="198" y1="75" x2="198" y2="55" />
      <line x1="198" y1="55" x2="178" y2="95" />
      <line x1="162" y1="15" x2="178" y2="95" />
      <line x1="198" y1="55" x2="142" y2="75" />
      <line x1="178" y1="95" x2="130" y2="35" />

      {/* ── TOPO DA CABEÇA — menos pontiagudo ── */}
      <line x1="70" y1="35" x2="100" y2="24" />
      <line x1="100" y1="24" x2="130" y2="35" />
      <line x1="70" y1="35" x2="130" y2="35" />

      {/* ── FRONTE / TESTA ── */}
      <line x1="70" y1="35" x2="75" y2="65" />
      <line x1="130" y1="35" x2="125" y2="65" />
      <line x1="75" y1="65" x2="125" y2="65" />
      <line x1="100" y1="24" x2="75" y2="65" />
      <line x1="100" y1="24" x2="125" y2="65" />
      <line x1="70" y1="35" x2="100" y2="45" />
      <line x1="130" y1="35" x2="100" y2="45" />
      <line x1="100" y1="45" x2="100" y2="24" />

      {/* ── LATERAIS DA CABEÇA ── */}
      <line x1="58" y1="75" x2="75" y2="65" />
      <line x1="58" y1="75" x2="62" y2="105" />
      <line x1="75" y1="65" x2="62" y2="105" />
      <line x1="62" y1="105" x2="78" y2="115" />
      <line x1="75" y1="65" x2="78" y2="115" />

      <line x1="142" y1="75" x2="125" y2="65" />
      <line x1="142" y1="75" x2="138" y2="105" />
      <line x1="125" y1="65" x2="138" y2="105" />
      <line x1="138" y1="105" x2="122" y2="115" />
      <line x1="125" y1="65" x2="122" y2="115" />

      {/* ── BOCHECHAS / MEIO DA CARA ── */}
      <line x1="75" y1="65" x2="85" y2="95" />
      <line x1="125" y1="65" x2="115" y2="95" />
      <line x1="85" y1="95" x2="100" y2="88" />
      <line x1="115" y1="95" x2="100" y2="88" />
      <line x1="100" y1="88" x2="100" y2="65" />
      <line x1="75" y1="65" x2="100" y2="65" />
      <line x1="125" y1="65" x2="100" y2="65" />

      {/* ── BASE DA CABEÇA ── */}
      <line x1="62" y1="105" x2="78" y2="115" />
      <line x1="78" y1="115" x2="85" y2="95" />
      <line x1="85" y1="95" x2="115" y2="95" />
      <line x1="115" y1="95" x2="122" y2="115" />
      <line x1="122" y1="115" x2="138" y2="105" />

      {/* ── TROMBA — segmento 1 ── */}
      <polygon points="85,95 100,88 115,95 108,120 92,120" fill="none" />
      <line x1="85" y1="95" x2="92" y2="120" />
      <line x1="115" y1="95" x2="108" y2="120" />
      <line x1="92" y1="120" x2="108" y2="120" />
      <line x1="100" y1="88" x2="92" y2="120" />
      <line x1="100" y1="88" x2="108" y2="120" />

      {/* ── TROMBA — segmento 2 ── */}
      <polygon points="92,120 108,120 105,148 95,148" fill="none" />
      <line x1="92" y1="120" x2="95" y2="148" />
      <line x1="108" y1="120" x2="105" y2="148" />
      <line x1="95" y1="148" x2="105" y2="148" />
      <line x1="92" y1="120" x2="105" y2="148" />
      <line x1="108" y1="120" x2="95" y2="148" />

      {/* ── TROMBA — segmento 3 (curvatura) ── */}
      <polygon points="95,148 105,148 108,170 92,175" fill="none" />
      <line x1="95" y1="148" x2="92" y2="175" />
      <line x1="105" y1="148" x2="108" y2="170" />
      <line x1="108" y1="170" x2="92" y2="175" />
      <line x1="95" y1="148" x2="108" y2="170" />

      {/* ── PONTA DA TROMBA ── */}
      <polygon points="92,175 108,170 110,190 94,195 86,182" fill="none" />
      <line x1="92" y1="175" x2="108" y2="170" />
      <line x1="108" y1="170" x2="110" y2="190" />
      <line x1="110" y1="190" x2="94" y2="195" />
      <line x1="94" y1="195" x2="86" y2="182" />
      <line x1="86" y1="182" x2="92" y2="175" />
      <line x1="92" y1="175" x2="110" y2="190" />
      <line x1="86" y1="182" x2="110" y2="190" />
    </svg>
  )
}

export default LogoElefante
