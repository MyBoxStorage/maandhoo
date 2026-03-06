'use client'

import React from 'react'
import Link from 'next/link'
import { Wine, Beer, Coffee, Zap, ArrowRight, Package } from 'lucide-react'
import { ItemCardapio } from '@/types'

const cardapioDestaque: (ItemCardapio & { icone: React.ReactNode })[] = [
  {
    id: 'c1', categoria: 'drinks', nome: 'Gin Tropical', descricao: 'Gin & Red Bull Tropical — Orloff R$35 · Bombay R$45',
    preco: 35, disponivel: true, destaque: true, ordem: 1,
    icone: <Coffee size={18} />,
  },
  {
    id: 'c2', categoria: 'longneck', nome: 'Cerveja Budweiser', descricao: 'Long Neck',
    preco: 25, disponivel: true, destaque: true, ordem: 2,
    icone: <Beer size={18} />,
  },
  {
    id: 'c3', categoria: 'doses', nome: 'Vodka Absolut', descricao: 'Dose',
    preco: 30, disponivel: true, destaque: true, ordem: 3,
    icone: <Wine size={18} />,
  },
  {
    id: 'c4', categoria: 'soft', nome: 'Red Bull', descricao: 'Lata',
    preco: 28, disponivel: true, destaque: true, ordem: 4,
    icone: <Zap size={18} />,
  },
  {
    id: 'c5', categoria: 'combos', nome: 'Vodka Absolut 750ml', descricao: 'Combo Mais Pedido — +5 Softs R$419 · +5 Red Bulls R$499',
    preco: 359, disponivel: true, destaque: true, ordem: 5,
    icone: <Package size={18} />,
  },
  {
    id: 'c6', categoria: 'combos', nome: 'Gin Beefeater 750ml', descricao: 'Combo Mais Pedido — +5 Softs R$479 · +5 Red Bulls R$559',
    preco: 419, disponivel: true, destaque: true, ordem: 6,
    icone: <Package size={18} />,
  },
]

export const CardapioPreview: React.FC = () => {
  return (
    <section id="cardapio" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="section-subtitle mb-3">Bebidas & Combos</p>
          <h2 className="section-title mb-4">Cardápio</h2>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="font-body text-sm text-bege-escuro/60">
            Preços transparentes. Sem surpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cardapioDestaque.map(item => (
            <div
              key={item.id}
              className="bg-card border border-gold/15 hover:border-gold/40 p-5 rounded-sm transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-dourado/10 flex items-center justify-center text-dourado">
                    {item.icone}
                  </div>
                  <div>
                    <h4 className="font-body text-sm font-medium text-bege">{item.nome}</h4>
                    <p className="font-body text-xs text-bege-escuro/60">{item.descricao}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl text-gradient-gold">
                    R$ {item.preco.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
