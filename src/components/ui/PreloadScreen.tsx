'use client'

import React, { useEffect, useState } from 'react'

/**
 * PreloadScreen — tela de entrada premium
 *
 * Fases:
 *  0–0.3s  fundo escurece (mount)
 *  0.3–2.0s linhas do SVG se montam (stroke-dashoffset → 0)
 *  2.0–2.6s nome "maandhoo" aparece (opacity + letter-spacing)
 *  2.6–2.9s tagline aparece
 *  2.9–3.4s tudo some (opacity → 0, scale sobe levemente)
 *  3.4s     componente desmontado
 */
export const PreloadScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'draw' | 'text' | 'tagline' | 'exit'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('draw'),    300)
    const t2 = setTimeout(() => setPhase('text'),   2000)
    const t3 = setTimeout(() => setPhase('tagline'),2600)
    const t4 = setTimeout(() => setPhase('exit'),   2900)
    const t5 = setTimeout(() => onComplete(),       3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onComplete])

  const isExiting  = phase === 'exit'
  const showText   = phase === 'text' || phase === 'tagline' || phase === 'exit'
  const showTag    = phase === 'tagline' || phase === 'exit'
  const isDrawing  = phase === 'draw' || phase === 'text' || phase === 'tagline' || phase === 'exit'

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0c06 0%, #0A0604 60%, #000000 100%)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.04)' : 'scale(1)',
        transition: isExiting
          ? 'opacity 0.55s cubic-bezier(0.4,0,1,1), transform 0.55s cubic-bezier(0.4,0,1,1)'
          : 'opacity 0.3s ease',
        pointerEvents: isExiting ? 'none' : 'all',
      }}
    >
      {/* Partículas de brilho — pontos dourados aleatórios */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `rgba(196,160,80,${p.opacity})`,
              opacity: isDrawing ? p.opacity : 0,
              transform: isDrawing ? 'scale(1)' : 'scale(0)',
              transition: `opacity ${p.delay + 0.8}s ease ${p.delay}s, transform ${p.delay + 0.8}s ease ${p.delay}s`,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Anel de brilho atrás do logo */}
      <div
        className="absolute"
        style={{
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(196,160,80,0.07) 0%, transparent 70%)',
          opacity: isDrawing ? 1 : 0,
          transition: 'opacity 1.2s ease 0.5s',
        }}
      />

      {/* SVG ELEFANTE — linhas se montam com stroke-dashoffset */}
      <div
        style={{
          opacity: isDrawing ? 1 : 0,
          transition: 'opacity 0.4s ease',
          filter: isDrawing ? 'drop-shadow(0 0 18px rgba(196,160,80,0.25))' : 'none',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 218"
          width={110}
          height={120}
          fill="none"
          strokeLinejoin="miter"
          strokeLinecap="butt"
        >
          {/* Cada grupo de linhas tem seu próprio delay para efeito cascata */}
          {STROKES.map((s, i) => (
            <line
              key={i}
              x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke={s.gold ? '#C4A050' : '#C4A050'}
              strokeWidth={s.accent ? 2.2 : 1.6}
              strokeOpacity={s.accent ? 1 : 0.75}
              style={{
                strokeDasharray: s.len,
                strokeDashoffset: isDrawing ? 0 : s.len,
                transition: isDrawing
                  ? `stroke-dashoffset ${s.dur}s cubic-bezier(0.4,0,0.2,1) ${s.delay}s`
                  : 'none',
              }}
            />
          ))}
          {/* Tromba — polígonos */}
          {POLYS.map((p, i) => (
            <polygon
              key={i}
              points={p.points}
              fill="none"
              stroke="#C4A050"
              strokeWidth="1.6"
              strokeOpacity="0.75"
              style={{
                strokeDasharray: p.len,
                strokeDashoffset: isDrawing ? 0 : p.len,
                transition: isDrawing
                  ? `stroke-dashoffset ${p.dur}s cubic-bezier(0.4,0,0.2,1) ${p.delay}s`
                  : 'none',
              }}
            />
          ))}
        </svg>
      </div>

      {/* NOME */}
      <div
        style={{
          marginTop: 28,
          opacity: showText ? 1 : 0,
          letterSpacing: showText ? '0.32em' : '0.10em',
          transform: showText ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), letter-spacing 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 200,
            fontSize: '1.65rem',
            color: '#E8DDD0',
            textTransform: 'uppercase',
          }}
        >
          maandhoo
        </span>
      </div>

      {/* TAGLINE */}
      <div
        style={{
          marginTop: 10,
          opacity: showTag ? 1 : 0,
          transform: showTag ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 400,
            fontSize: '0.6rem',
            letterSpacing: '0.28em',
            color: 'rgba(196,160,80,0.7)',
            textTransform: 'uppercase',
          }}
        >
          Club · Balneário Camboriú
        </span>
      </div>

      {/* Linha dourada inferior */}
      <div
        style={{
          marginTop: 22,
          height: 1,
          width: showTag ? 80 : 0,
          background: 'linear-gradient(to right, transparent, rgba(196,160,80,0.5), transparent)',
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1) 0.1s',
        }}
      />
    </div>
  )
}

/* ─── DADOS ─────────────────────────────────────────── */

// Partículas douradas de fundo
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  x:       (i * 37 + 11) % 100,
  y:       (i * 53 + 7)  % 100,
  size:    (i % 3 === 0) ? 2 : 1,
  opacity: 0.08 + (i % 5) * 0.04,
  delay:   0.2 + (i % 7) * 0.15,
}))

// Todas as linhas do SVG com comprimento e timing calculados
// delay escalonado por região: orelhas → testa → cara → tromba
const STROKES: Array<{ x1:number; y1:number; x2:number; y2:number; len:number; delay:number; dur:number; accent?:boolean; gold?:boolean }> = [
  // Orelha esquerda
  { x1:2,  y1:55,  x2:38,  y2:15,  len:54, delay:0.05, dur:0.35 },
  { x1:38, y1:15,  x2:70,  y2:35,  len:37, delay:0.10, dur:0.30 },
  { x1:70, y1:35,  x2:58,  y2:75,  len:42, delay:0.15, dur:0.30 },
  { x1:58, y1:75,  x2:22,  y2:95,  len:41, delay:0.20, dur:0.30 },
  { x1:22, y1:95,  x2:2,   y2:75,  len:28, delay:0.25, dur:0.28 },
  { x1:2,  y1:75,  x2:2,   y2:55,  len:20, delay:0.28, dur:0.25 },
  { x1:2,  y1:55,  x2:22,  y2:95,  len:45, delay:0.30, dur:0.28 },
  { x1:38, y1:15,  x2:22,  y2:95,  len:81, delay:0.32, dur:0.35 },
  { x1:2,  y1:55,  x2:58,  y2:75,  len:58, delay:0.34, dur:0.30 },
  { x1:22, y1:95,  x2:70,  y2:35,  len:72, delay:0.36, dur:0.32 },
  // Orelha direita
  { x1:198, y1:55,  x2:162, y2:15,  len:54, delay:0.05, dur:0.35 },
  { x1:162, y1:15,  x2:130, y2:35,  len:37, delay:0.10, dur:0.30 },
  { x1:130, y1:35,  x2:142, y2:75,  len:42, delay:0.15, dur:0.30 },
  { x1:142, y1:75,  x2:178, y2:95,  len:41, delay:0.20, dur:0.30 },
  { x1:178, y1:95,  x2:198, y2:75,  len:28, delay:0.25, dur:0.28 },
  { x1:198, y1:75,  x2:198, y2:55,  len:20, delay:0.28, dur:0.25 },
  { x1:198, y1:55,  x2:178, y2:95,  len:45, delay:0.30, dur:0.28 },
  { x1:162, y1:15,  x2:178, y2:95,  len:81, delay:0.32, dur:0.35 },
  { x1:198, y1:55,  x2:142, y2:75,  len:58, delay:0.34, dur:0.30 },
  { x1:178, y1:95,  x2:130, y2:35,  len:72, delay:0.36, dur:0.32 },
  // Topo
  { x1:70,  y1:35,  x2:100, y2:24,  len:32, delay:0.42, dur:0.28, accent:true },
  { x1:100, y1:24,  x2:130, y2:35,  len:32, delay:0.44, dur:0.28, accent:true },
  { x1:70,  y1:35,  x2:130, y2:35,  len:60, delay:0.46, dur:0.30 },
  // Testa
  { x1:70,  y1:35,  x2:75,  y2:65,  len:30, delay:0.52, dur:0.26 },
  { x1:130, y1:35,  x2:125, y2:65,  len:30, delay:0.52, dur:0.26 },
  { x1:75,  y1:65,  x2:125, y2:65,  len:50, delay:0.55, dur:0.28 },
  { x1:100, y1:24,  x2:75,  y2:65,  len:42, delay:0.57, dur:0.28 },
  { x1:100, y1:24,  x2:125, y2:65,  len:42, delay:0.57, dur:0.28 },
  { x1:70,  y1:35,  x2:100, y2:45,  len:32, delay:0.60, dur:0.26 },
  { x1:130, y1:35,  x2:100, y2:45,  len:32, delay:0.60, dur:0.26 },
  { x1:100, y1:45,  x2:100, y2:24,  len:21, delay:0.62, dur:0.24 },
  // Laterais
  { x1:58,  y1:75,  x2:75,  y2:65,  len:20, delay:0.65, dur:0.24 },
  { x1:58,  y1:75,  x2:62,  y2:105, len:30, delay:0.67, dur:0.25 },
  { x1:75,  y1:65,  x2:62,  y2:105, len:40, delay:0.69, dur:0.26 },
  { x1:62,  y1:105, x2:78,  y2:115, len:18, delay:0.71, dur:0.24 },
  { x1:75,  y1:65,  x2:78,  y2:115, len:50, delay:0.73, dur:0.26 },
  { x1:142, y1:75,  x2:125, y2:65,  len:20, delay:0.65, dur:0.24 },
  { x1:142, y1:75,  x2:138, y2:105, len:30, delay:0.67, dur:0.25 },
  { x1:125, y1:65,  x2:138, y2:105, len:40, delay:0.69, dur:0.26 },
  { x1:138, y1:105, x2:122, y2:115, len:18, delay:0.71, dur:0.24 },
  { x1:125, y1:65,  x2:122, y2:115, len:50, delay:0.73, dur:0.26 },
  // Bochechas
  { x1:75,  y1:65,  x2:85,  y2:95,  len:32, delay:0.76, dur:0.26 },
  { x1:125, y1:65,  x2:115, y2:95,  len:32, delay:0.76, dur:0.26 },
  { x1:85,  y1:95,  x2:100, y2:88,  len:16, delay:0.78, dur:0.22 },
  { x1:115, y1:95,  x2:100, y2:88,  len:16, delay:0.78, dur:0.22 },
  { x1:100, y1:88,  x2:100, y2:65,  len:23, delay:0.80, dur:0.24 },
  { x1:75,  y1:65,  x2:100, y2:65,  len:25, delay:0.82, dur:0.22 },
  { x1:125, y1:65,  x2:100, y2:65,  len:25, delay:0.82, dur:0.22 },
  // Base
  { x1:62,  y1:105, x2:78,  y2:115, len:18, delay:0.85, dur:0.22 },
  { x1:78,  y1:115, x2:85,  y2:95,  len:22, delay:0.86, dur:0.22 },
  { x1:85,  y1:95,  x2:115, y2:95,  len:30, delay:0.87, dur:0.24 },
  { x1:115, y1:95,  x2:122, y2:115, len:22, delay:0.86, dur:0.22 },
  { x1:122, y1:115, x2:138, y2:105, len:18, delay:0.85, dur:0.22 },
  // Tromba linhas adicionais
  { x1:85,  y1:95,  x2:92,  y2:120, len:26, delay:0.90, dur:0.24 },
  { x1:115, y1:95,  x2:108, y2:120, len:26, delay:0.90, dur:0.24 },
  { x1:92,  y1:120, x2:108, y2:120, len:16, delay:0.92, dur:0.22 },
  { x1:100, y1:88,  x2:92,  y2:120, len:33, delay:0.93, dur:0.24 },
  { x1:100, y1:88,  x2:108, y2:120, len:33, delay:0.93, dur:0.24 },
  { x1:92,  y1:120, x2:95,  y2:148, len:28, delay:0.96, dur:0.24 },
  { x1:108, y1:120, x2:105, y2:148, len:28, delay:0.96, dur:0.24 },
  { x1:95,  y1:148, x2:105, y2:148, len:10, delay:0.98, dur:0.20 },
  { x1:92,  y1:120, x2:105, y2:148, len:30, delay:0.99, dur:0.22 },
  { x1:108, y1:120, x2:95,  y2:148, len:30, delay:0.99, dur:0.22 },
  { x1:95,  y1:148, x2:92,  y2:175, len:27, delay:1.02, dur:0.24 },
  { x1:105, y1:148, x2:108, y2:170, len:23, delay:1.02, dur:0.24 },
  { x1:108, y1:170, x2:92,  y2:175, len:16, delay:1.04, dur:0.22 },
  { x1:95,  y1:148, x2:108, y2:170, len:25, delay:1.05, dur:0.22 },
  { x1:92,  y1:175, x2:108, y2:170, len:16, delay:1.07, dur:0.20 },
  { x1:108, y1:170, x2:110, y2:190, len:20, delay:1.08, dur:0.22 },
  { x1:110, y1:190, x2:94,  y2:195, len:16, delay:1.09, dur:0.20 },
  { x1:94,  y1:195, x2:86,  y2:182, len:16, delay:1.10, dur:0.20 },
  { x1:86,  y1:182, x2:92,  y2:175, len:10, delay:1.11, dur:0.18 },
  { x1:92,  y1:175, x2:110, y2:190, len:26, delay:1.12, dur:0.22, accent:true },
  { x1:86,  y1:182, x2:110, y2:190, len:24, delay:1.14, dur:0.22, accent:true },
]

const POLYS: Array<{ points:string; len:number; delay:number; dur:number }> = [
  { points:'85,95 100,88 115,95 108,120 92,120', len:90,  delay:0.88, dur:0.32 },
  { points:'92,120 108,120 105,148 95,148',       len:70,  delay:0.94, dur:0.28 },
  { points:'95,148 105,148 108,170 92,175',        len:72,  delay:1.00, dur:0.28 },
  { points:'92,175 108,170 110,190 94,195 86,182', len:88,  delay:1.06, dur:0.30 },
]

export default PreloadScreen
