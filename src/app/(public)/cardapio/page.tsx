'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Wine, Beer, Zap, Coffee, Droplets, Package, Sparkles, Loader2 } from 'lucide-react'

type ItemCardapioDB = {
  id: string
  nome: string
  descricao: string | null
  preco: number | string
  categoria: string
  disponivel: boolean
  destaque: boolean
}

const CATEGORIAS_ORDEM = ['combos', 'espumantes', 'drinks', 'longneck', 'doses', 'soft', 'outros']
const CATEGORIAS_LABEL: Record<string, string> = {
  combos: 'Combos',
  espumantes: 'Espumantes',
  drinks: 'Drinks',
  longneck: 'Long Neck',
  doses: 'Doses',
  soft: 'Soft Menu',
  outros: 'Bomboniere',
}
const CATEGORIAS_ICONE: Record<string, React.ReactNode> = {
  combos: <Package size={14} />,
  espumantes: <Sparkles size={14} />,
  drinks: <Coffee size={14} />,
  longneck: <Beer size={14} />,
  doses: <Wine size={14} />,
  soft: <Droplets size={14} />,
  outros: <Zap size={14} />,
}

export default function CardapioPage() {
  const [cat, setCat] = useState('todos')
  const [itensBanco, setItensBanco] = useState<ItemCardapioDB[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const res = await fetch('/api/admin/cardapio')
        const data = await res.json()
        setItensBanco(Array.isArray(data.itens) ? data.itens : [])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const itensDisponiveis = useMemo(
    () => itensBanco.filter((item) => item.disponivel === true),
    [itensBanco],
  )

  const categorias = useMemo(() => {
    const categoriasEncontradas = Array.from(new Set(itensDisponiveis.map((item) => item.categoria)))
    const ordenadas = [
      ...CATEGORIAS_ORDEM.filter((c) => categoriasEncontradas.includes(c)),
      ...categoriasEncontradas.filter((c) => !CATEGORIAS_ORDEM.includes(c)).sort(),
    ]
    return [
      ...ordenadas.map((id) => ({
        id,
        label: CATEGORIAS_LABEL[id] ?? id,
        icon: CATEGORIAS_ICONE[id] ?? <Sparkles size={14} />,
      })),
      { id: 'todos', label: 'Todos', icon: <Sparkles size={14} /> },
    ]
  }, [itensDisponiveis])

  const itens = cat === 'todos'
    ? itensDisponiveis
    : itensDisponiveis.filter((item) => item.categoria === cat)

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

        {carregando && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={26} className="animate-spin text-dourado/50" />
          </div>
        )}

        {/* COMBOS INFO BANNER */}
        {!carregando && (cat === 'combos' || cat === 'todos') && (
          <div className="bg-dourado/8 border border-dourado/25 rounded-sm p-4 mb-6 text-center">
            <p className="font-accent text-xs text-dourado tracking-wider uppercase mb-1">Softs incluídos nos combos</p>
            <p className="font-body text-xs text-bege-escuro/60">Água Tônica · Coca-Cola · Guaraná · Citrus · Suco de Uva Del Valle</p>
          </div>
        )}

        {/* GRID */}
        {!carregando && (
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
                  {item.descricao && <p className="font-body text-xs text-bege-escuro/55">{item.descricao}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display text-xl text-gradient-gold">
                    R$ {Number(item.preco).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!carregando && itens.length === 0 && (
          <p className="text-center text-sm text-bege-escuro/45 py-12">
            Nenhum item disponível nesta categoria.
          </p>
        )}

        <p className="text-center text-xs text-bege-escuro/35 mt-10 italic">
          Não cobramos 10% de taxa de serviço · Cardápio sujeito a alterações sem aviso prévio
        </p>
      </div>
    </div>
  )
}
