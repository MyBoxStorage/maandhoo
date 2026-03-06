'use client'

import React, { useState, useCallback } from 'react'
import { X, Users, DollarSign, ArrowRight } from 'lucide-react'

type ZonaStatus = 'disponivel' | 'reservado' | 'ocupado'

interface Zona {
  id: string
  tipo: 'camarote' | 'mesa'
  numero: number
  status: ZonaStatus
  capacidade: number
  consumacaoMin: number
}

function makeZona(tipo: 'camarote' | 'mesa', numero: number, status: ZonaStatus): Zona {
  return {
    id: `${tipo}-${numero}`,
    tipo,
    numero,
    status,
    capacidade: tipo === 'camarote' ? 10 : 5,
    consumacaoMin: tipo === 'camarote' ? 500 : 150,
  }
}

const camarotesMap: Record<number, Zona> = {}
;[4,5,6,7,8,9,10,11,12,13,14,15].forEach(n => {
  const status: ZonaStatus = [5,11].includes(n) ? 'ocupado' : [7,13].includes(n) ? 'reservado' : 'disponivel'
  camarotesMap[n] = makeZona('camarote', n, status)
})

const mesasMap: Record<number, Zona> = {}
const mesasOcupadas = [22, 33, 45, 51, 62]
const mesasReservadas = [2, 25, 42, 54, 64]
for (let n = 1; n <= 76; n++) {
  const status: ZonaStatus = mesasOcupadas.includes(n) ? 'ocupado' : mesasReservadas.includes(n) ? 'reservado' : 'disponivel'
  mesasMap[n] = makeZona('mesa', n, status)
}

const sc = {
  disponivel: { fill: 'rgba(201,168,76,0.10)', stroke: '#C9A84C', hover: 'rgba(201,168,76,0.32)' },
  reservado:  { fill: 'rgba(255,160,40,0.12)', stroke: '#FFA040', hover: 'rgba(255,160,40,0.32)' },
  ocupado:    { fill: 'rgba(180,40,40,0.16)',  stroke: '#c03030', hover: 'rgba(180,40,40,0.16)' },
}

const Sofa: React.FC<{ x: number; y: number; w: number; h: number; col: string }> = ({ x, y, w, h, col }) => (
  <g>
    <rect x={x+3} y={y+h*0.28} width={w-6} height={h*0.22} rx="2" fill={col} opacity="0.28" />
    <rect x={x+3} y={y+h*0.52} width={w-6} height={h*0.30} rx="2" fill={col} opacity="0.40" />
    <rect x={x+1} y={y+h*0.32} width={7} height={h*0.48} rx="2" fill={col} opacity="0.38" />
    <rect x={x+w-8} y={y+h*0.32} width={7} height={h*0.48} rx="2" fill={col} opacity="0.38" />
  </g>
)

const Cam: React.FC<{
  zona: Zona; x: number; y: number; w: number; h: number;
  hov: boolean; onClick: () => void;
  onEnter: (e: React.MouseEvent<SVGGElement>) => void; onLeave: () => void;
}> = ({ zona, x, y, w, h, hov, onClick, onEnter, onLeave }) => {
  const s = sc[zona.status]
  return (
    <g
      style={{ cursor: zona.status === 'ocupado' ? 'not-allowed' : 'pointer' }}
      onClick={zona.status !== 'ocupado' ? onClick : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <rect x={x} y={y} width={w} height={h} rx="3"
        fill={hov ? s.hover : s.fill} stroke={s.stroke} strokeWidth="1.4"
        style={{ transition: 'fill 0.2s' }} />
      <Sofa x={x} y={y} w={w} h={h} col={s.stroke} />
      <circle cx={x+w/2} cy={y+12} r={9} fill={s.stroke} opacity="0.85" />
      <text x={x+w/2} y={y+16} textAnchor="middle" fill="#0a0604"
        fontSize="8" fontFamily="Cinzel" fontWeight="700">{zona.numero}</text>
    </g>
  )
}

const Mesa: React.FC<{
  zona: Zona; cx: number; cy: number; r: number;
  hov: boolean; onClick: () => void;
  onEnter: (e: React.MouseEvent<SVGGElement>) => void; onLeave: () => void;
}> = ({ zona, cx, cy, r, hov, onClick, onEnter, onLeave }) => {
  const s = sc[zona.status]
  return (
    <g
      style={{ cursor: zona.status === 'ocupado' ? 'not-allowed' : 'pointer' }}
      onClick={zona.status !== 'ocupado' ? onClick : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <circle cx={cx} cy={cy} r={r}
        fill={hov ? s.hover : s.fill} stroke={s.stroke} strokeWidth="1"
        style={{ transition: 'fill 0.2s' }} />
      <text x={cx} y={cy+3.5} textAnchor="middle" fill={s.stroke}
        fontSize="7.5" fontFamily="DM Sans" fontWeight="500">{zona.numero}</text>
    </g>
  )
}

export const MapaInterativo: React.FC = () => {
  const [hov, setHov] = useState<string | null>(null)
  const [sel, setSel] = useState<Zona | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number; zona: Zona } | null>(null)

  const handleEnter = useCallback((zona: Zona, e: React.MouseEvent<SVGGElement>) => {
    setHov(zona.id)
    const svg = (e.target as SVGElement).closest('svg')!.getBoundingClientRect()
    setTip({ x: e.clientX - svg.left, y: e.clientY - svg.top, zona })
  }, [])
  const handleLeave = useCallback(() => { setHov(null); setTip(null) }, [])
  const handleClick = useCallback((zona: Zona) => setSel(zona), [])

  const C = (n: number) => camarotesMap[n]
  const M = (n: number) => mesasMap[n]

  const m = (n: number, cx: number, cy: number) => (
    <Mesa key={`m${n}`} zona={M(n)} cx={cx} cy={cy} r={14}
      hov={hov === M(n).id}
      onClick={() => handleClick(M(n))}
      onEnter={(e) => handleEnter(M(n), e)}
      onLeave={handleLeave} />
  )
  const cam = (n: number, x: number, y: number, w: number, h: number) => (
    <Cam key={`c${n}`} zona={C(n)} x={x} y={y} w={w} h={h}
      hov={hov === C(n).id}
      onClick={() => handleClick(C(n))}
      onEnter={(e) => handleEnter(C(n), e)}
      onLeave={handleLeave} />
  )

  return (
    <section id="mapa" className="py-16 sm:py-24 px-4 bg-cinza-escuro/30 relative">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Planta</p>
          <h2 className="section-title mb-4">Mapa da Casa</h2>
          <div className="divider-gold w-24 mx-auto mb-6" />
          <p className="font-body text-sm text-bege-escuro/70">
            Clique em uma mesa ou camarote para solicitar reserva
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[
            { cor: '#C9A84C', label: 'Disponível' },
            { cor: '#FFA040', label: 'Reservado' },
            { cor: '#c03030', label: 'Ocupado' },
          ].map(it => (
            <div key={it.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: it.cor }} />
              <span className="font-body text-xs text-bege-escuro">{it.label}</span>
            </div>
          ))}
        </div>

        <div className="relative bg-card rounded-sm border border-gold/20 p-2 overflow-hidden">
          <svg
            viewBox="20 30 660 860"
            className="w-full mx-auto block"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '75vh', minHeight: '300px' }}
          >

            {/* FUNDO */}
            <rect width="700" height="900" fill="#0d0805" rx="4" />
            <rect x="10" y="10" width="680" height="880" fill="#130905" rx="3" stroke="#2a140a" strokeWidth="1" />

            {/* TÍTULO */}
            <text x="350" y="42" textAnchor="middle" fill="#C9A84C"
              fontSize="11" fontFamily="Cinzel" letterSpacing="5" opacity="0.7">MAANDHOO</text>

            {/* Parede superior */}
            <rect x="162" y="44" width="351" height="148" rx="2"
              fill="rgba(60,35,15,0.35)" stroke="#3a2010" strokeWidth="1.5" />

            {/* Parede palco direita */}
            <rect x="527" y="184" width="162" height="440" rx="2"
              fill="rgba(45,25,10,0.4)" stroke="#3a2010" strokeWidth="1.5" />

            {/* Divisória esquerda vertical */}
            <line x1="166" y1="392" x2="166" y2="735" stroke="#3a2010" strokeWidth="2" />
            <line x1="82"  y1="380"  x2="150"  y2="380"  stroke="#3a2010" strokeWidth="2" />

            {/* Divisória sofás */}
            <line x1="261" y1="493" x2="261" y2="733"
              stroke="#3a2010" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />

            {/* Parede fundo */}
            <line x1="69" y1="745" x2="667" y2="745" stroke="#3a2010" strokeWidth="1.5" />

            {/* Escadas → piso central */}
            <line x1="154" y1="201" x2="512" y2="201" stroke="#3a2010" strokeWidth="1.5" />
            <line x1="154" y1="210" x2="154" y2="334" stroke="#3a2010" strokeWidth="1.5" />
            <line x1="513" y1="208" x2="514" y2="337" stroke="#3a2010" strokeWidth="1.5" />
            <line x1="152" y1="341" x2="510" y2="341" stroke="#3a2010" strokeWidth="1.5" />

            {/* Bloco ESCADAS */}
            <rect x="-473" y="774" width="260" height="28" rx="2"
              fill="rgba(100,70,45,0.25)" stroke="#4a2e18" strokeWidth="1" />
            <text x="-343" y="793" textAnchor="middle" fill="#7a5535"
              fontSize="8" fontFamily="DM Sans" letterSpacing="2">ESCADAS</text>
            {/* CAMAROTES 4,5,6,7 — x:179,267,358,437  y:85  w:68 h:58 */}
            {cam(4,  179, 85, 68, 58)}
            {cam(5,  267, 85, 68, 58)}
            {cam(6,  358, 85, 68, 58)}
            {cam(7,  437, 85, 68, 58)}

            {/* CAMAROTES 8,9 — x:599  y:195,261  w:72 h:58 */}
            {cam(8,  599, 195, 72, 58)}
            {cam(9,  599, 261, 72, 58)}

            {/* CAMAROTE 10 — x:599 y:558 w:72 h:58 */}
            {cam(10, 599, 558, 72, 58)}

            {/* PALCO */}
            <ellipse cx={605} cy={442} rx={68} ry={80}
              fill="rgba(201,168,76,0.04)" stroke="#C9A84C" strokeWidth="1.8" strokeDasharray="6,3" />
            <text x={605} y={437} textAnchor="middle" fill="#C9A84C"
              fontSize="10" fontFamily="Cinzel" letterSpacing="2">PALCO</text>
            <text x={605} y={452} textAnchor="middle" fill="#C9A84C"
              fontSize="7.5" fontFamily="DM Sans" opacity="0.55">DJ BOOTH</text>

            {/* CAMAROTES 11–15 — x:76  y:392,462,532,602,672  w:80 h:62 */}
            {cam(11, 76, 392, 80, 62)}
            {cam(12, 76, 462, 80, 62)}
            {cam(13, 76, 532, 80, 62)}
            {cam(14, 76, 602, 80, 62)}
            {cam(15, 76, 672, 80, 62)}

            {/* SOFÁS 1,2,3 — x:179  y:684,618,548  w:72 h:55 */}
            <Cam key="s1" zona={M(1)} x={179} y={684} w={72} h={55}
              hov={hov === M(1).id} onClick={() => handleClick(M(1))}
              onEnter={(e) => handleEnter(M(1), e)} onLeave={handleLeave} />
            <Cam key="s2" zona={M(2)} x={179} y={618} w={72} h={55}
              hov={hov === M(2).id} onClick={() => handleClick(M(2))}
              onEnter={(e) => handleEnter(M(2), e)} onLeave={handleLeave} />
            <Cam key="s3" zona={M(3)} x={179} y={548} w={72} h={55}
              hov={hov === M(3).id} onClick={() => handleClick(M(3))}
              onEnter={(e) => handleEnter(M(3), e)} onLeave={handleLeave} />

            {/* MESAS 21–29 */}
            {m(21, 248, 224)}{m(22, 369, 224)}{m(23, 182, 266)}
            {m(24, 301, 266)}{m(25, 409, 266)}{m(26, 471, 240)}
            {m(27, 230, 307)}{m(28, 350, 307)}{m(29, 471, 307)}

            {/* MESAS 31–36 */}
            {m(31, 301, 413)}{m(32, 301, 463)}{m(33, 301, 513)}
            {m(34, 301, 563)}{m(35, 301, 613)}{m(36, 301, 663)}

            {/* MESAS 41–46 */}
            {m(41, 369, 413)}{m(42, 369, 463)}{m(43, 369, 513)}
            {m(44, 369, 563)}{m(45, 369, 613)}{m(46, 369, 663)}

            {/* MESAS 51–54 */}
            {m(51, 437, 413)}{m(52, 437, 463)}{m(53, 437, 513)}{m(54, 437, 563)}

            {/* MESAS 61–65 */}
            {m(61, 276, 776)}{m(62, 344, 776)}{m(63, 412, 776)}
            {m(64, 480, 776)}{m(65, 548, 776)}

            {/* MESAS 66–70 */}
            {m(66, 220, 819)}{m(67, 266, 861)}{m(68, 336, 861)}
            {m(69, 410, 861)}{m(70, 489, 861)}

            {/* MESAS 71–76 */}
            {m(71, 34, 360)}{m(72, 34, 423)}{m(73, 34, 493)}
            {m(74, 34, 563)}{m(75, 34, 644)}{m(76, 34, 725)}

            {/* TOOLTIP */}
            {tip && (
              <g>
                <rect x={Math.min(tip.x-65,590)} y={Math.max(tip.y-72,8)}
                  width={138} height={58} rx="3"
                  fill="#0a0604" stroke="#C9A84C" strokeWidth="0.8" opacity="0.96" />
                <text x={Math.min(tip.x-65,590)+69} y={Math.max(tip.y-72,8)+20}
                  textAnchor="middle" fill="#E8DDD0" fontSize="9.5" fontFamily="Cinzel">
                  {tip.zona.tipo === 'camarote' ? `Camarote ${tip.zona.numero}` : `Mesa ${tip.zona.numero}`}
                </text>
                <text x={Math.min(tip.x-65,590)+69} y={Math.max(tip.y-72,8)+36}
                  textAnchor="middle" fill="#C9A84C" fontSize="8.5" fontFamily="DM Sans">
                  {`Cap: ${tip.zona.capacidade} · Min: R$${tip.zona.consumacaoMin}`}
                </text>
                <text x={Math.min(tip.x-65,590)+69} y={Math.max(tip.y-72,8)+52}
                  textAnchor="middle" fontSize="8" fontFamily="DM Sans"
                  fill={sc[tip.zona.status].stroke}>
                  {tip.zona.status.toUpperCase()}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* MODAL */}
        {sel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setSel(null)}>
            <div className="bg-card border border-gold rounded-sm p-8 max-w-sm w-full mx-4 relative"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSel(null)}
                className="absolute top-4 right-4 text-bege-escuro hover:text-bege">
                <X size={20} />
              </button>
              <p className="section-subtitle mb-2">
                {sel.tipo === 'camarote' ? 'Camarote' : 'Mesa'}
              </p>
              <h3 className="font-display text-3xl text-bege mb-5">
                {sel.tipo === 'camarote' ? `Camarote ${sel.numero}` : `Mesa ${sel.numero}`}
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Users size={16} className="text-dourado" />
                  <span className="text-bege-escuro">Capacidade: até <strong className="text-bege">{sel.capacidade} pessoas</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign size={16} className="text-dourado" />
                  <span className="text-bege-escuro">
                    Consumação mínima: <strong className="text-bege">R$ {sel.consumacaoMin.toFixed(2).replace('.', ',')}</strong>
                  </span>
                </div>
              </div>
              <p className="text-xs text-bege-escuro/60 mb-5">
                Para confirmar disponibilidade e valores, fale com nossa equipe pelo WhatsApp.
              </p>
              <a href={`https://wa.me/5547999300283?text=Olá! Tenho interesse em reservar o ${sel.tipo === 'camarote' ? `Camarote ${sel.numero}` : `Mesa ${sel.numero}`} no Maandhoo Club.`}
                target="_blank" rel="noopener noreferrer"
                className="btn-primary w-full text-center flex items-center justify-center gap-2">
                Reservar via WhatsApp <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MapaInterativo
