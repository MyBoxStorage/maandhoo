'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Wine, Beer, Coffee, Zap, ArrowRight, Package, Sparkles, Loader2 } from 'lucide-react'

type CardapioItem = {
  id: string
  categoria: string
  nome: string
  descricao: string | null
  preco: number
  disponivel: boolean
  destaque: boolean
}

const categoriaIcone: Record<string, React.ReactNode> = {
  drinks:  <Coffee  size={16} />,
  longneck:<Beer    size={16} />,
  doses:   <Wine    size={16} />,
  soft:    <Zap     size={16} />,
  combos:  <Package size={16} />,
}

export const CardapioPreview: React.FC = () => {
  const [itens, setItens] = useState<CardapioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/cardapio')
        const data = await res.json()
        setItens(Array.isArray(data.itens) ? data.itens : [])
      } catch {
        setItens([])
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const itensDisponiveis = useMemo(
    () => itens.filter(item => item.disponivel),
    [itens],
  )

  const bebidas = useMemo(
    () => itensDisponiveis.filter(item => item.categoria !== 'combos').slice(0, 8),
    [itensDisponiveis],
  )

  // 3 combos em destaque, ordenados por destaque=true primeiro
  const combosDestaque = useMemo(
    () => itensDisponiveis
      .filter(item => item.categoria === 'combos' && item.destaque)
      .slice(0, 3),
    [itensDisponiveis],
  )

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

        {/* BEBIDAS */}
        <div className="mb-10">
          <p className="font-accent text-[10px] tracking-[0.30em] uppercase text-dourado/60 mb-5 text-center">
            Bebidas
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-dourado/50" />
            </div>
          ) : bebidas.length > 0 ? (
            <div className="divide-y divide-white/5">
              {bebidas.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 px-2 group hover:bg-white/[0.02] transition-colors rounded-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-dourado/10 flex items-center justify-center text-dourado/70 flex-shrink-0">
                      {categoriaIcone[item.categoria] ?? <Sparkles size={16} />}
                    </div>
                    <div>
                      <span className="font-body text-sm text-bege group-hover:text-bege/90">{item.nome}</span>
                      {item.descricao && (
                        <span className="font-body text-xs text-bege-escuro/50 ml-2">{item.descricao}</span>
                      )}
                    </div>
                  </div>
                  <div className="font-display text-lg text-gradient-gold flex-shrink-0 ml-4">
                    R$ {Number(item.preco).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-bege-escuro/45 py-6">Nenhum item disponível</p>
          )}
        </div>

        {/* COMBOS — 3 cards em grid responsivo */}
        <div className="mb-10">
          <p className="font-accent text-[10px] tracking-[0.30em] uppercase text-dourado/60 mb-5 text-center">
            Combos
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-dourado/50" />
            </div>
          ) : combosDestaque.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {combosDestaque.map((combo, idx) => (
                <div
                  key={combo.id}
                  className={`relative bg-card border rounded-sm p-5 transition-all duration-300 group overflow-hidden
                    ${idx === 1
                      ? 'border-dourado/50 sm:-mt-2 sm:mb-2'   // card central levemente elevado
                      : 'border-gold/20 hover:border-gold/50'
                    }`}
                >
                  {/* Linha dourada no topo do card central */}
                  {idx === 1 && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dourado to-transparent" />
                  )}

                  {/* Glow sutil no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-dourado/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative space-y-3">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-dourado/15 text-dourado px-2 py-0.5 text-[10px] font-accent tracking-widest uppercase rounded-sm">
                      <Package size={10} />
                      Destaque
                    </div>

                    {/* Nome */}
                    <h4 className="font-body text-sm font-medium text-bege leading-snug">
                      {combo.nome}
                    </h4>

                    {/* Descrição */}
                    {combo.descricao && (
                      <p className="font-body text-xs text-bege-escuro/50 leading-relaxed">
                        {combo.descricao}
                      </p>
                    )}

                    {/* Preço + label */}
                    <div className="pt-2 border-t border-white/5 flex items-end justify-between">
                      <span className="font-body text-[10px] text-bege-escuro/40 uppercase tracking-wider">
                        garrafa
                      </span>
                      <div className="font-display text-2xl text-gradient-gold">
                        R$ {Number(combo.preco).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-bege-escuro/45 py-6">Nenhum item disponível</p>
          )}
        </div>

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
