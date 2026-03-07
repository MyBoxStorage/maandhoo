'use client'

import React from 'react'
import Link from 'next/link'
import { Wine, Beer, Coffee, Zap, ArrowRight, Package } from 'lucide-react'

const cardapioItens = [
  {
    id: 'c1', categoria: 'drinks', nome: 'Gin Tropical', descricao: 'Gin & Red Bull Tropical',
    detalhe: 'Orloff R$35 · Bombay R$45', preco: 35,
    icone: <Coffee size={16} />,
  },
  {
    id: 'c2', categoria: 'drinks', nome: 'Cerveja Budweiser', descricao: 'Long Neck',
    detalhe: null, preco: 25,
    icone: <Beer size={16} />,
  },
  {
    id: 'c3', categoria: 'drinks', nome: 'Vodka Absolut', descricao: 'Dose',
    detalhe: null, preco: 30,
    icone: <Wine size={16} />,
  },
  {
    id: 'c4', categoria: 'drinks', nome: 'Red Bull', descricao: 'Lata',
    detalhe: null, preco: 28,
    icone: <Zap size={16} />,
  },
]

const combosDestaque = [
  {
    id: 'cb1', nome: 'Vodka Absolut 750ml', tag: 'Mais Pedido',
    descricao: '+5 Softs R$419 · +5 Red Bulls R$499',
    preco: 359, icone: <Package size={16} />,
  },
  {
    id: 'cb2', nome: 'Gin Beefeater 750ml', tag: 'Mais Pedido',
    descricao: '+5 Softs R$479 · +5 Red Bulls R$559',
    preco: 419, icone: <Package size={16} />,
  },
]

export const CardapioPreview: React.FC = () => {
  return (
    <section id="cardapio" className="py-16 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <p className="section-subtitle mb-3">Bebidas & Combos</p>
          <h2 className="section-title mb-4">Cardápio</h2>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60">
            Preços transparentes. Sem surpresas.
          </p>
        </div>

        {/* DRINKS — lista limpa estilo premium */}
        <div className="mb-10">
          <p className="font-accent text-[10px] tracking-[0.30em] uppercase text-dourado/60 mb-5 text-center">
            Bebidas
          </p>
          <div className="divide-y divide-white/5">
            {cardapioItens.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 px-2 group hover:bg-white/[0.02] transition-colors rounded-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-dourado/10 flex items-center justify-center text-dourado/70 flex-shrink-0">
                    {item.icone}
                  </div>
                  <div>
                    <span className="font-body text-sm text-bege group-hover:text-bege/90">{item.nome}</span>
                    <span className="font-body text-xs text-bege-escuro/50 ml-2">{item.descricao}</span>
                    {item.detalhe && (
                      <p className="font-body text-[11px] text-bege-escuro/40 mt-0.5">{item.detalhe}</p>
                    )}
                  </div>
                </div>
                <div className="font-display text-lg text-gradient-gold flex-shrink-0 ml-4">
                  R$ {item.preco}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMBOS — cards destacados */}
        <div className="mb-10">
          <p className="font-accent text-[10px] tracking-[0.30em] uppercase text-dourado/60 mb-5 text-center">
            Combos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {combosDestaque.map(combo => (
              <div
                key={combo.id}
                className="relative bg-card border border-gold/20 hover:border-gold/50 p-5 rounded-sm transition-all duration-300 group overflow-hidden"
              >
                {/* Glow de fundo sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-dourado/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-start justify-between gap-4 relative">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-dourado/15 text-dourado px-2 py-0.5 text-[10px] font-accent tracking-widest uppercase rounded-sm mb-2">
                      <Package size={10} />
                      {combo.tag}
                    </div>
                    <h4 className="font-body text-sm font-medium text-bege mb-1">{combo.nome}</h4>
                    <p className="font-body text-xs text-bege-escuro/50">{combo.descricao}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display text-2xl text-gradient-gold">
                      R$ {combo.preco.toLocaleString('pt-BR')}
                    </div>
                    <div className="font-body text-[10px] text-bege-escuro/40">garrafa</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOTA SEM TAXA */}
        <p className="text-center text-xs text-bege-escuro/40 mb-8 italic">
          Não cobramos 10% de taxa de serviço
        </p>

        <div className="text-center">
          <Link href="/cardapio" className="btn-outline inline-flex items-center gap-2">
            Ver Cardápio Completo
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CardapioPreview
