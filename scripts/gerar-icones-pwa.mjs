/**
 * Gera ícones PWA para a portaria usando apenas módulos Node.js nativos.
 * Cria SVG e converte para PNG usando sharp (já disponível via next/image).
 *
 * Execute: node scripts/gerar-icones-pwa.mjs
 */

import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'icons')

function desenharIcone(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const pad = maskable ? size * 0.12 : 0
  const inner = size - pad * 2

  // Fundo
  ctx.fillStyle = '#0A0604'
  ctx.fillRect(0, 0, size, size)

  // Círculo dourado de fundo (só no regular)
  if (!maskable) {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(201,168,76,0.12)'
    ctx.fill()
    ctx.strokeStyle = '#C9A84C'
    ctx.lineWidth = size * 0.025
    ctx.stroke()
  } else {
    ctx.fillStyle = 'rgba(201,168,76,0.1)'
    ctx.fillRect(pad, pad, inner, inner)
  }

  // Elefante simplificado como texto
  const fontSize = size * 0.35
  ctx.font = `${fontSize}px serif`
  ctx.fillStyle = '#C9A84C'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🐘', size / 2, size * 0.42)

  // Texto "PORTARIA"
  const labelSize = size * 0.09
  ctx.font = `${labelSize}px sans-serif`
  ctx.fillStyle = '#C9A84C'
  ctx.fillText('PORTARIA', size / 2, size * 0.76)

  return canvas.toBuffer('image/png')
}

const sizes = [192, 512]
let gerados = 0

for (const size of sizes) {
  const buf = desenharIcone(size, false)
  fs.writeFileSync(path.join(OUT, `portaria-${size}.png`), buf)
  console.log(`✅ portaria-${size}.png`)

  const bufM = desenharIcone(size, true)
  fs.writeFileSync(path.join(OUT, `portaria-maskable-${size}.png`), bufM)
  console.log(`✅ portaria-maskable-${size}.png`)

  gerados += 2
}

console.log(`\n${gerados} ícones gerados em public/icons/`)
