'use client'

import React, { useState } from 'react'
import { Wine, Beer, Zap, Coffee, Droplets, Package, Sparkles } from 'lucide-react'

const categorias = [
  { id: 'combos', label: 'Combos', icon: <Package size={14} /> },
  { id: 'espumantes', label: 'Espumantes', icon: <Sparkles size={14} /> },
  { id: 'drinks', label: 'Drinks', icon: <Coffee size={14} /> },
  { id: 'longneck', label: 'Long Neck', icon: <Beer size={14} /> },
  { id: 'doses', label: 'Doses', icon: <Wine size={14} /> },
  { id: 'soft', label: 'Soft Menu', icon: <Droplets size={14} /> },
  { id: 'outros', label: 'Bomboniere', icon: <Zap size={14} /> },
  { id: 'todos', label: 'Todos', icon: <Sparkles size={14} /> },
]

const cardapio = [
  // DRINKS — GIN (Orloff / Bombay)
  { id: 'dr1', cat: 'drinks', nome: 'GT Clássico', desc: 'Gin & Tônica — Orloff R$30 · Bombay R$40', preco: 30, precoAlt: 40, altLabel: 'Bombay', destaque: false },
  { id: 'dr2', cat: 'drinks', nome: 'Gin Citrus', desc: 'Gin e Schweppes Citrus — Orloff R$30 · Bombay R$40', preco: 30, precoAlt: 40, altLabel: 'Bombay', destaque: false },
  { id: 'dr3', cat: 'drinks', nome: 'Gin Tropical', desc: 'Gin & Red Bull Tropical — Orloff R$35 · Bombay R$45', preco: 35, precoAlt: 45, altLabel: 'Bombay', destaque: true },
  { id: 'dr4', cat: 'drinks', nome: 'Gin Melancita', desc: 'Gin & Red Bull Melancia — Orloff R$35 · Bombay R$45', preco: 35, precoAlt: 45, altLabel: 'Bombay', destaque: false },

  // LONG NECK
  { id: 'ln1', cat: 'longneck', nome: 'Cerveja Budweiser', desc: 'Long Neck', preco: 25, destaque: false },
  { id: 'ln2', cat: 'longneck', nome: 'Cerveja Corona', desc: 'Long Neck', preco: 25, destaque: false },

  // DOSES
  { id: 'do1', cat: 'doses', nome: 'Bananinha', desc: 'Dose', preco: 25, destaque: false },
  { id: 'do2', cat: 'doses', nome: 'Jägermeister', desc: 'Dose', preco: 35, destaque: false },
  { id: 'do3', cat: 'doses', nome: 'Ballena', desc: 'Dose', preco: 40, destaque: false },
  { id: 'do4', cat: 'doses', nome: 'Licor 43', desc: 'Dose', preco: 40, destaque: false },
  { id: 'do5', cat: 'doses', nome: 'Licor 43 Chocolate', desc: 'Dose', preco: 50, destaque: true },
  { id: 'do6', cat: 'doses', nome: 'Tequila', desc: 'Dose', preco: 30, destaque: false },
  { id: 'do7', cat: 'doses', nome: 'Gin Bombay', desc: 'Dose', preco: 30, destaque: false },
  { id: 'do8', cat: 'doses', nome: 'Vodka Absolut', desc: 'Dose', preco: 30, destaque: false },
  { id: 'do9', cat: 'doses', nome: 'Whisky Red Label', desc: 'Dose', preco: 30, destaque: false },
  { id: 'do10', cat: 'doses', nome: 'Whisky Black Label', desc: 'Dose', preco: 40, destaque: false },
  { id: 'do11', cat: 'doses', nome: "Jack Daniel's", desc: 'Dose', preco: 40, destaque: false },

  // SOFT MENU
  { id: 's1', cat: 'soft', nome: 'Água', desc: 'Mineral', preco: 10, destaque: false },
  { id: 's2', cat: 'soft', nome: 'Suco Del Valle Uva', desc: '', preco: 12, destaque: false },
  { id: 's3', cat: 'soft', nome: 'Água Tônica', desc: '', preco: 12, destaque: false },
  { id: 's4', cat: 'soft', nome: 'Refrigerante', desc: 'Coca-Cola · Guaraná · Citrus', preco: 12, destaque: false },
  { id: 's5', cat: 'soft', nome: 'Água de Coco', desc: '', preco: 20, destaque: false },
  { id: 's6', cat: 'soft', nome: 'Red Bull', desc: 'Lata', preco: 28, destaque: true },

  // OUTROS (avulsos)
  { id: 'ot1', cat: 'outros', nome: 'Halls', desc: '', preco: 6, destaque: false },
  { id: 'ot2', cat: 'outros', nome: 'Gelo (Água de Coco)', desc: '', preco: 10, destaque: false },
  { id: 'ot3', cat: 'outros', nome: 'Vinho Rosé Piscine', desc: '750ml', preco: 279, destaque: false },

  // ESPUMANTES & CHAMPAGNE
  { id: 'esp1', cat: 'espumantes', nome: 'Terra Nova Brut Rosé', desc: '', preco: 290, destaque: false },
  { id: 'esp2', cat: 'espumantes', nome: 'Terra Nova Moscatel', desc: '', preco: 290, destaque: false },
  { id: 'esp3', cat: 'espumantes', nome: 'Chandon Brut Rosé', desc: '', preco: 390, destaque: false },
  { id: 'esp4', cat: 'espumantes', nome: 'Chandon Riche Demi Sec', desc: '', preco: 390, destaque: false },
  { id: 'esp5', cat: 'espumantes', nome: 'Chandon Reserve Brut', desc: '', preco: 390, destaque: false },
  { id: 'esp6', cat: 'espumantes', nome: 'Chandon Passion Rosé Demi-Sec', desc: '', preco: 390, destaque: false },
  { id: 'esp7', cat: 'espumantes', nome: 'Champagne Veuve Clicquot Brut', desc: '', preco: 1450, destaque: true },
  { id: 'esp8', cat: 'espumantes', nome: 'Champagne Veuve Clicquot Rosé', desc: '', preco: 1690, destaque: false },
  { id: 'esp9', cat: 'espumantes', nome: 'Champagne Dom Pérignon Brut', desc: '', preco: 6500, destaque: false },

  // COMBOS — agrupados por tier
  { id: 'cb1', cat: 'combos', nome: 'Vodka Skyy 750ml', desc: 'Combo Entrada · +5 Softs R$319 · +5 Red Bulls R$399', preco: 259, destaque: false },
  { id: 'cb2', cat: 'combos', nome: 'Whisky Ballantines 750ml', desc: 'Combo Entrada · +5 Softs R$319 · +5 Red Bulls R$399', preco: 259, destaque: false },
  { id: 'cb3', cat: 'combos', nome: 'Vodka Absolut 750ml', desc: 'Mais Pedido · +5 Softs R$419 · +5 Red Bulls R$499', preco: 359, destaque: true },
  { id: 'cb4', cat: 'combos', nome: 'Whisky Red Label 750ml', desc: 'Mais Pedido · +5 Softs R$419 · +5 Red Bulls R$499', preco: 359, destaque: false },
  { id: 'cb5', cat: 'combos', nome: 'Gin Beefeater 750ml', desc: 'Mais Pedido · +5 Softs R$479 · +5 Red Bulls R$559', preco: 419, destaque: true },
  { id: 'cb6', cat: 'combos', nome: 'Whisky Black Label 750ml', desc: 'Deluxe · +5 Softs R$619 · +5 Red Bulls R$699', preco: 559, destaque: false },
  { id: 'cb7', cat: 'combos', nome: 'Vodka Grey Goose 750ml', desc: 'Deluxe · +5 Softs R$619 · +5 Red Bulls R$699', preco: 559, destaque: false },
  { id: 'cb8', cat: 'combos', nome: "Whisky Jack Daniel's 1L", desc: 'Deluxe · +5 Softs R$619 · +5 Red Bulls R$699', preco: 559, destaque: false },
  { id: 'cb9', cat: 'combos', nome: "Whisky Buchanan's 750ml", desc: 'Deluxe · +5 Softs R$719 · +5 Red Bulls R$799', preco: 659, destaque: false },
  { id: 'cb10', cat: 'combos', nome: 'Whisky Gold Label 750ml', desc: 'Deluxe · +5 Softs R$1.050 · +5 Red Bulls R$1.130', preco: 990, destaque: false },
  { id: 'cb11', cat: 'combos', nome: 'Whisky Blue Label 750ml', desc: 'Deluxe · +5 Softs R$3.420 · +5 Red Bulls R$3.500', preco: 3360, destaque: false },
  { id: 'cb12', cat: 'combos', nome: 'Whisky Royal Salute 700ml', desc: 'Deluxe · +5 Softs R$2.910 · +5 Red Bulls R$2.990', preco: 2850, destaque: false },
  { id: 'cb13', cat: 'combos', nome: 'Vodka Grey Goose 1,5L', desc: 'Extra · +5 Softs R$1.050 · +5 Red Bulls R$1.130', preco: 990, destaque: false },
  { id: 'cb14', cat: 'combos', nome: 'Gin Bombay 1,75L', desc: 'Extra · +5 Softs R$1.050 · +5 Red Bulls R$1.130', preco: 990, destaque: false },
  { id: 'cb15', cat: 'combos', nome: 'Vodka Absolut Elyx 1,75L', desc: 'Extra · +5 Softs R$1.050 · +5 Red Bulls R$1.130', preco: 990, destaque: false },
  { id: 'cb16', cat: 'combos', nome: 'Vodka Absolut Elyx 4,5L', desc: 'Extra · +5 Softs R$2.910 · +5 Red Bulls R$2.990', preco: 2850, destaque: true },

  // COMBOS OUTROS (garrafas avulsas pelo combo)
  { id: 'cbot1', cat: 'combos', nome: 'Bananinha 750ml', desc: 'Avulso', preco: 299, destaque: false },
  { id: 'cbot2', cat: 'combos', nome: 'Tequila José Cuervo 750ml', desc: 'Avulso', preco: 399, destaque: false },
  { id: 'cbot3', cat: 'combos', nome: 'Jägermeister 700ml', desc: 'Avulso', preco: 399, destaque: false },
  { id: 'cbot4', cat: 'combos', nome: 'Ballena 750ml', desc: 'Avulso', preco: 499, destaque: false },
  { id: 'cbot5', cat: 'combos', nome: 'Licor 43 700ml', desc: 'Avulso', preco: 499, destaque: false },
  { id: 'cbot6', cat: 'combos', nome: 'Licor 43 Chocolate 700ml', desc: 'Avulso', preco: 599, destaque: false },
]

export default function CardapioPage() {
  const [cat, setCat] = useState('combos')

  const itens = cat === 'todos' ? cardapio : cardapio.filter(i => i.cat === cat)

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">Bebidas & Combos</p>
          <h1 className="section-title mb-4">Cardápio</h1>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60">
            Preços transparentes. Sem surpresas ao chegar. 🥂
          </p>
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categorias.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm border text-xs font-accent tracking-wider uppercase transition-all duration-200
                ${cat === c.id ? 'border-dourado bg-dourado/10 text-dourado' : 'border-white/10 text-bege-escuro hover:border-dourado/30'}`}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        {/* COMBOS INFO BANNER */}
        {(cat === 'combos' || cat === 'todos') && (
          <div className="bg-dourado/8 border border-dourado/25 rounded-sm p-4 mb-6 text-center">
            <p className="font-accent text-xs text-dourado tracking-wider uppercase mb-1">Softs incluídos nos combos</p>
            <p className="font-body text-xs text-bege-escuro/60">Água Tônica · Coca-Cola · Guaraná · Citrus · Suco de Uva Del Valle</p>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {itens.map(item => (
            <div
              key={item.id}
              className={`bg-card rounded-sm p-5 border transition-all duration-200 hover:border-dourado/40 group
                ${item.destaque ? 'border-dourado/50' : 'border-white/8'}`}
            >
              {item.destaque && (
                <span className="inline-block font-accent text-xs tracking-wider text-dourado border border-dourado/40 px-2 py-0.5 mb-3">
                  DESTAQUE
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-body text-sm font-medium text-bege mb-0.5">{item.nome}</h4>
                  {item.desc && <p className="font-body text-xs text-bege-escuro/55">{item.desc}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display text-xl text-gradient-gold">
                    R$ {item.preco.toLocaleString('pt-BR')}
                  </div>
                  {item.precoAlt && (
                    <div className="font-body text-xs text-bege-escuro/50 mt-0.5">
                      {item.altLabel}: R$ {item.precoAlt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-bege-escuro/35 mt-10 italic">
          Não cobramos 10% de taxa de serviço · Cardápio sujeito a alterações sem aviso prévio
        </p>
      </div>
    </div>
  )
}
