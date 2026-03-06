import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

// Permite chamadas do editor HTML local (file://)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  if (!isDev()) {
    return NextResponse.json(
      { error: 'Disponível apenas em desenvolvimento' },
      { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }

  try {
    const data = await req.json()
    const { camarotes, sofas, mesas, estrutura } = data

    // Helpers para encontrar elemento por id
    const camMap: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {}
    camarotes.forEach((c: { id: string; x: number; y: number; w: number; h: number; label: string }) => {
      camMap[c.id] = c
    })

    const mesaMap: Record<string, { cx: number; cy: number; label: string }> = {}
    mesas.forEach((m: { id: string; cx: number; cy: number; label: string }) => {
      mesaMap[m.id] = m
    })

    const sofaMap: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {}
    sofas.forEach((s: { id: string; x: number; y: number; w: number; h: number; label: string }) => {
      sofaMap[s.id] = s
    })

    function cam(id: string, dx: number, dy: number, dw: number, dh: number) {
      const c = camMap[id]
      if (!c) return { x: dx, y: dy, w: dw, h: dh }
      return c
    }

    function mesa(id: string, dcx: number, dcy: number) {
      const m = mesaMap[id]
      if (!m) return { cx: dcx, cy: dcy }
      return m
    }

    function sofa(id: string, dx: number, dy: number, dw: number, dh: number) {
      const s = sofaMap[id]
      if (!s) return { x: dx, y: dy, w: dw, h: dh }
      return s
    }

    // Palco
    const palco = estrutura.find((e: { id: string }) => e.id === 'palco') as
      { cx: number; cy: number; rx: number; ry: number } | undefined
    const p = palco ?? { cx: 570, cy: 360, rx: 68, ry: 80 }

    // Paredes
    const wallSup = estrutura.find((e: { id: string }) => e.id === 'wall-sup') as
      { x: number; y: number; w: number; h: number } | undefined
    const ws = wallSup ?? { x: 150, y: 48, w: 310, h: 148 }

    const wallPalco = estrutura.find((e: { id: string }) => e.id === 'wall-palco') as
      { x: number; y: number; w: number; h: number } | undefined
    const wp = wallPalco ?? { x: 508, y: 48, w: 162, h: 510 }

    const escadasBlk = estrutura.find((e: { id: string }) => e.id === 'escadas-blk') as
      { x: number; y: number; w: number; h: number } | undefined
    const eb = escadasBlk ?? { x: 200, y: 128, w: 260, h: 28 }

    // Linhas
    function line(id: string, dx1: number, dy1: number, dx2: number, dy2: number) {
      const l = estrutura.find((e: { id: string }) => e.id === id) as
        { x1: number; y1: number; x2: number; y2: number } | undefined
      return l ?? { x1: dx1, y1: dy1, x2: dx2, y2: dy2 }
    }

    const divEsq   = line('div-esq',    108, 340, 108, 700)
    const divEsqH  = line('div-esq-h',  22,  340, 108, 340)
    const divSofas = line('div-sofas',  190, 340, 190, 580)
    const wallFundo= line('wall-fundo', 22,  660, 620, 660)
    const escTop   = line('esc-top',    150, 200, 508, 200)
    const escEsq   = line('esc-esq',    150, 200, 150, 340)
    const escDir   = line('esc-dir',    508, 200, 508, 340)
    const escBot   = line('esc-bot',    150, 340, 508, 340)

    // Camarotes
    const c4  = cam('c4',  168, 58,  68, 58)
    const c5  = cam('c5',  242, 58,  68, 58)
    const c6  = cam('c6',  316, 58,  68, 58)
    const c7  = cam('c7',  390, 58,  68, 58)
    const c8  = cam('c8',  530, 165, 72, 58)
    const c9  = cam('c9',  530, 232, 72, 58)
    const c10 = cam('c10', 530, 420, 72, 58)
    const c11 = cam('c11', 22,  348, 80, 62)
    const c12 = cam('c12', 22,  418, 80, 62)
    const c13 = cam('c13', 22,  488, 80, 62)
    const c14 = cam('c14', 22,  558, 80, 62)
    const c15 = cam('c15', 22,  628, 80, 62)

    // Sofás
    const s1 = sofa('s1', 112, 500, 72, 55)
    const s2 = sofa('s2', 112, 430, 72, 55)
    const s3 = sofa('s3', 112, 360, 72, 55)

    // Mesas — helper para gerar linha JSX
    function m(id: string, label: string, dcx: number, dcy: number) {
      const mm = mesa(id, dcx, dcy)
      return `{m(${label}, ${mm.cx}, ${mm.cy})}`
    }

    const componentPath = path.join(process.cwd(), 'src', 'components', 'sections', 'MapaInterativo.tsx')
    const currentContent = fs.readFileSync(componentPath, 'utf-8')

    // ── Bloco estrutural (paredes, linhas) ──────────────────────────
    const newEstruturaBlock = `
            {/* Parede superior */}
            <rect x="${ws.x}" y="${ws.y}" width="${ws.w}" height="${ws.h}" rx="2"
              fill="rgba(60,35,15,0.35)" stroke="#3a2010" strokeWidth="1.5" />

            {/* Parede palco direita */}
            <rect x="${wp.x}" y="${wp.y}" width="${wp.w}" height="${wp.h}" rx="2"
              fill="rgba(45,25,10,0.4)" stroke="#3a2010" strokeWidth="1.5" />

            {/* Divisória esquerda vertical */}
            <line x1="${divEsq.x1}" y1="${divEsq.y1}" x2="${divEsq.x2}" y2="${divEsq.y2}" stroke="#3a2010" strokeWidth="2" />
            <line x1="${divEsqH.x1}"  y1="${divEsqH.y1}"  x2="${divEsqH.x2}"  y2="${divEsqH.y2}"  stroke="#3a2010" strokeWidth="2" />

            {/* Divisória sofás */}
            <line x1="${divSofas.x1}" y1="${divSofas.y1}" x2="${divSofas.x2}" y2="${divSofas.y2}"
              stroke="#3a2010" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />

            {/* Parede fundo */}
            <line x1="${wallFundo.x1}" y1="${wallFundo.y1}" x2="${wallFundo.x2}" y2="${wallFundo.y2}" stroke="#3a2010" strokeWidth="1.5" />

            {/* Escadas → piso central */}
            <line x1="${escTop.x1}" y1="${escTop.y1}" x2="${escTop.x2}" y2="${escTop.y2}" stroke="#3a2010" strokeWidth="1.5" />
            <line x1="${escEsq.x1}" y1="${escEsq.y1}" x2="${escEsq.x2}" y2="${escEsq.y2}" stroke="#3a2010" strokeWidth="1.5" />
            <line x1="${escDir.x1}" y1="${escDir.y1}" x2="${escDir.x2}" y2="${escDir.y2}" stroke="#3a2010" strokeWidth="1.5" />
            <line x1="${escBot.x1}" y1="${escBot.y1}" x2="${escBot.x2}" y2="${escBot.y2}" stroke="#3a2010" strokeWidth="1.5" />

            {/* Bloco ESCADAS */}
            <rect x="${eb.x}" y="${eb.y}" width="${eb.w}" height="${eb.h}" rx="2"
              fill="rgba(100,70,45,0.25)" stroke="#4a2e18" strokeWidth="1" />
            <text x="${eb.x + Math.round(eb.w/2)}" y="${eb.y + 19}" textAnchor="middle" fill="#7a5535"
              fontSize="8" fontFamily="DM Sans" letterSpacing="2">ESCADAS</text>`

    // ── Bloco camarotes ─────────────────────────────────────────────
    const newCamarotesBlock = `
            {/* CAMAROTES 4,5,6,7 — x:${c4.x},${c5.x},${c6.x},${c7.x}  y:${c4.y}  w:${c4.w} h:${c4.h} */}
            {cam(4,  ${c4.x}, ${c4.y}, ${c4.w}, ${c4.h})}
            {cam(5,  ${c5.x}, ${c5.y}, ${c5.w}, ${c5.h})}
            {cam(6,  ${c6.x}, ${c6.y}, ${c6.w}, ${c6.h})}
            {cam(7,  ${c7.x}, ${c7.y}, ${c7.w}, ${c7.h})}

            {/* CAMAROTES 8,9 — x:${c8.x}  y:${c8.y},${c9.y}  w:${c8.w} h:${c8.h} */}
            {cam(8,  ${c8.x}, ${c8.y}, ${c8.w}, ${c8.h})}
            {cam(9,  ${c9.x}, ${c9.y}, ${c9.w}, ${c9.h})}

            {/* CAMAROTE 10 — x:${c10.x} y:${c10.y} w:${c10.w} h:${c10.h} */}
            {cam(10, ${c10.x}, ${c10.y}, ${c10.w}, ${c10.h})}

            {/* PALCO */}
            <ellipse cx={${p.cx}} cy={${p.cy}} rx={${p.rx}} ry={${p.ry}}
              fill="rgba(201,168,76,0.04)" stroke="#C9A84C" strokeWidth="1.8" strokeDasharray="6,3" />
            <text x={${p.cx}} y={${p.cy - 5}} textAnchor="middle" fill="#C9A84C"
              fontSize="10" fontFamily="Cinzel" letterSpacing="2">PALCO</text>
            <text x={${p.cx}} y={${p.cy + 10}} textAnchor="middle" fill="#C9A84C"
              fontSize="7.5" fontFamily="DM Sans" opacity="0.55">DJ BOOTH</text>

            {/* CAMAROTES 11–15 — x:${c11.x}  y:${c11.y},${c12.y},${c13.y},${c14.y},${c15.y}  w:${c11.w} h:${c11.h} */}
            {cam(11, ${c11.x}, ${c11.y}, ${c11.w}, ${c11.h})}
            {cam(12, ${c12.x}, ${c12.y}, ${c12.w}, ${c12.h})}
            {cam(13, ${c13.x}, ${c13.y}, ${c13.w}, ${c13.h})}
            {cam(14, ${c14.x}, ${c14.y}, ${c14.w}, ${c14.h})}
            {cam(15, ${c15.x}, ${c15.y}, ${c15.w}, ${c15.h})}

            {/* SOFÁS 1,2,3 — x:${s1.x}  y:${s1.y},${s2.y},${s3.y}  w:${s1.w} h:${s1.h} */}
            <Cam key="s1" zona={M(1)} x={${s1.x}} y={${s1.y}} w={${s1.w}} h={${s1.h}}
              hov={hov === M(1).id} onClick={() => handleClick(M(1))}
              onEnter={(e) => handleEnter(M(1), e)} onLeave={handleLeave} />
            <Cam key="s2" zona={M(2)} x={${s2.x}} y={${s2.y}} w={${s2.w}} h={${s2.h}}
              hov={hov === M(2).id} onClick={() => handleClick(M(2))}
              onEnter={(e) => handleEnter(M(2), e)} onLeave={handleLeave} />
            <Cam key="s3" zona={M(3)} x={${s3.x}} y={${s3.y}} w={${s3.w}} h={${s3.h}}
              hov={hov === M(3).id} onClick={() => handleClick(M(3))}
              onEnter={(e) => handleEnter(M(3), e)} onLeave={handleLeave} />

            {/* MESAS 21–29 */}
            ${m('m21','21',200,184)}${m('m22','22',248,184)}${m('m23','23',296,184)}
            ${m('m24','24',344,184)}${m('m25','25',392,184)}${m('m26','26',440,184)}
            ${m('m27','27',200,224)}${m('m28','28',296,224)}${m('m29','29',440,224)}

            {/* MESAS 31–36 */}
            ${m('m31','31',200,290)}${m('m32','32',200,340)}${m('m33','33',200,390)}
            ${m('m34','34',200,440)}${m('m35','35',200,490)}${m('m36','36',200,540)}

            {/* MESAS 41–46 */}
            ${m('m41','41',268,290)}${m('m42','42',268,340)}${m('m43','43',268,390)}
            ${m('m44','44',268,440)}${m('m45','45',268,490)}${m('m46','46',268,540)}

            {/* MESAS 51–54 */}
            ${m('m51','51',336,290)}${m('m52','52',336,340)}${m('m53','53',336,390)}${m('m54','54',336,440)}

            {/* MESAS 61–65 */}
            ${m('m61','61',150,620)}${m('m62','62',218,620)}${m('m63','63',286,620)}
            ${m('m64','64',354,620)}${m('m65','65',422,620)}

            {/* MESAS 66–70 */}
            ${m('m66','66',120,690)}${m('m67','67',200,690)}${m('m68','68',280,690)}
            ${m('m69','69',360,690)}${m('m70','70',440,690)}

            {/* MESAS 71–76 */}
            ${m('m71','71',110,290)}${m('m72','72',110,340)}${m('m73','73',110,390)}
            ${m('m74','74',110,440)}${m('m75','75',110,490)}${m('m76','76',110,540)}`

    // ── Substituição no arquivo ──────────────────────────────────────
    // Estratégia: substituir o bloco entre marcadores conhecidos
    // Marcador início: "{/* Parede superior */"
    // Marcador fim: última chamada {m(76, ...)}

    const startTag = '{/* Parede superior */}'
    const endPattern = /{m\(76[^)]*\)}/

    const startIdx = currentContent.indexOf(startTag)
    const endMatch = currentContent.match(endPattern)

    if (startIdx === -1 || !endMatch || endMatch.index === undefined) {
      return NextResponse.json({
        error: 'Não foi possível localizar os marcadores no arquivo MapaInterativo.tsx.',
        hint: 'Verifique se o arquivo contém "{/* Parede superior */}" e "{m(76, ...)}"'
      }, { status: 422 })
    }

    const endIdx = endMatch.index + endMatch[0].length

    const before = currentContent.slice(0, startIdx)
    const after = currentContent.slice(endIdx)

    const newContent = before + newEstruturaBlock.trimStart() + newCamarotesBlock + after

    fs.writeFileSync(componentPath, newContent, 'utf-8')

    return NextResponse.json(
      { ok: true, message: '✅ MapaInterativo.tsx atualizado com sucesso!' },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    )

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/mapa/save] Erro:', message)
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
