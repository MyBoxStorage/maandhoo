'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import { Loader2, LogOut, Ticket, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast, { Toaster } from 'react-hot-toast'
import { labelTipoIngresso } from '@/lib/ingresso-utils'

interface Evento { id: string; nome: string; data_evento: string; hora_abertura: string; flyer_url?: string }
interface Ingresso {
  id: string; tipo: string; status: string; serial?: string
  expira_em?: string; created_at: string
  eventos: Evento
  cadastro?: { nome_completo: string; email: string }
}

const STATUS_COR: Record<string, string> = {
  ativo:     'text-green-400 border-green-400/30 bg-green-400/8',
  utilizado: 'text-blue-400 border-blue-400/30 bg-blue-400/8',
  expirado:  'text-bege-escuro/40 border-white/10 bg-white/3',
  cancelado: 'text-red-400 border-red-400/30 bg-red-400/8',
  pendente:  'text-amber-400 border-amber-400/30 bg-amber-400/8',
}
const STATUS_LABEL: Record<string, string> = {
  ativo: 'Ativo', utilizado: 'Utilizado', expirado: 'Expirado',
  cancelado: 'Cancelado', pendente: 'Aguardando',
}

export default function MinhaContaPage() {
  const router = useRouter()
  const [cliente, setCliente] = useState<{ id: string; nome: string; email: string } | null>(null)
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aberto, setAberto] = useState<string | null>(null)
  const [qrMap, setQrMap] = useState<Record<string, string>>({})
  const [qrLoading, setQrLoading] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const [resAuth, resIng] = await Promise.all([
      fetch('/api/cliente/auth'),
      fetch('/api/cliente/ingressos'),
    ])
    if (!resAuth.ok) { router.replace('/acesso'); return }
    const { cliente: c } = await resAuth.json()
    const { ingressos: ing } = await resIng.json()
    setCliente(c)
    setIngressos(ing ?? [])
    setCarregando(false)
  }, [router])

  useEffect(() => { carregar() }, [carregar])

  const carregarQR = async (ingressoId: string) => {
    if (qrMap[ingressoId]) { setAberto(ingressoId); return }
    setQrLoading(ingressoId)
    try {
      const res = await fetch(`/api/cliente/qr?ingresso_id=${ingressoId}`)
      const data = await res.json()
      if (data.qr) {
        setQrMap(prev => ({ ...prev, [ingressoId]: data.qr }))
        setAberto(ingressoId)
      } else {
        toast.error(data.erro ?? 'Erro ao carregar QR Code')
      }
    } catch { toast.error('Erro de conexão') }
    finally { setQrLoading(null) }
  }

  const toggleIngresso = (id: string, status: string) => {
    if (aberto === id) { setAberto(null); return }
    if (status === 'ativo') carregarQR(id)
    else setAberto(id)
  }

  const logout = async () => {
    await fetch('/api/cliente/auth', { method: 'DELETE' })
    router.replace('/acesso')
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-preto-profundo flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-dourado/40" />
      </div>
    )
  }

  return (
    <>
      {/* CSS anti-print injetado via style tag */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .no-print-overlay { display: flex !important; visibility: visible !important; }
        }
        .qr-wrapper {
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* Overlay que aparece ao tentar imprimir */}
      <div className="no-print-overlay" style={{
        display: 'none', position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0d0a07', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px'
      }}>
        <AlertTriangle size={48} color="#C9A84C" />
        <p style={{ color: '#e8ddd0', fontFamily: 'Georgia,serif', fontSize: '18px', letterSpacing: '2px', textAlign: 'center' }}>
          IMPRESSÃO NÃO PERMITIDA
        </p>
        <p style={{ color: 'rgba(232,221,208,0.4)', fontSize: '12px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
          O QR Code é de uso único e pessoal.<br />Apresente diretamente pelo celular na entrada.
        </p>
      </div>

      <div className="min-h-screen bg-preto-profundo pb-16">
        <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-preto-profundo/95 backdrop-blur-sm border-b border-dourado/10 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoElefante width={28} height={31} color="#C9A84C" />
              <div>
                <p className="font-accent text-xs tracking-widest text-bege leading-none">MINHA CONTA</p>
                <p className="font-body text-[10px] text-bege-escuro/40 mt-0.5">{cliente?.nome}</p>
              </div>
            </div>
            <button onClick={logout} className="text-bege-escuro/30 hover:text-bege-escuro/70 transition-colors flex items-center gap-1.5">
              <LogOut size={14} />
              <span className="font-body text-xs">Sair</span>
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={14} className="text-dourado/60" />
            <h2 className="font-accent text-xs tracking-[0.3em] uppercase text-bege-escuro/60">Meus Ingressos</h2>
            <span className="font-body text-xs text-bege-escuro/30">({ingressos.length})</span>
          </div>

          {ingressos.length === 0 && (
            <div className="border border-dourado/15 rounded-sm p-10 text-center">
              <Ticket size={32} className="text-bege-escuro/15 mx-auto mb-3" />
              <p className="font-body text-sm text-bege-escuro/40">Nenhum ingresso encontrado.</p>
              <p className="font-body text-xs text-bege-escuro/25 mt-1">Seus ingressos aparecerão aqui após o cadastro.</p>
            </div>
          )}

          {ingressos.map(ing => {
            const dataISO = ing.eventos?.data_evento?.length === 10
              ? `${ing.eventos.data_evento}T00:00:00` : ing.eventos?.data_evento
            const dataFormatada = dataISO ? format(new Date(dataISO), "dd/MM/yyyy", { locale: ptBR }) : '—'
            const cor = STATUS_COR[ing.status] ?? STATUS_COR['pendente']
            const isAberto = aberto === ing.id
            const qrAtivo = ing.status === 'ativo'

            return (
              <div key={ing.id} className={`border rounded-sm overflow-hidden transition-all ${isAberto ? 'border-dourado/30' : 'border-white/8'}`}>
                {/* CARD HEADER */}
                <button onClick={() => toggleIngresso(ing.id, ing.status)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
                  {ing.eventos?.flyer_url && (
                    <img src={ing.eventos.flyer_url} alt="" className="w-10 h-14 object-cover rounded-sm flex-shrink-0 opacity-75" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-bege truncate">{ing.eventos?.nome ?? '—'}</p>
                    <p className="font-body text-xs text-bege-escuro/45 mt-0.5">{dataFormatada} · {labelTipoIngresso(ing.tipo)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs border px-2 py-1 rounded-sm font-accent tracking-wider ${cor}`}>
                      {STATUS_LABEL[ing.status] ?? ing.status}
                    </span>
                    {isAberto ? <ChevronUp size={14} className="text-bege-escuro/40" /> : <ChevronDown size={14} className="text-bege-escuro/40" />}
                  </div>
                </button>

                {/* DETALHE + QR */}
                {isAberto && (
                  <div className="border-t border-dourado/10 bg-black/20 p-5">
                    {qrAtivo && (
                      <div className="qr-wrapper flex flex-col items-center mb-5">
                        {qrLoading === ing.id ? (
                          <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 size={28} className="animate-spin text-dourado/40" />
                            <p className="font-body text-xs text-bege-escuro/40">Carregando QR Code...</p>
                          </div>
                        ) : qrMap[ing.id] ? (
                          <>
                            <div className="bg-[#fefbf5] p-3 rounded-sm mb-3" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
                              <img src={qrMap[ing.id]} width={200} height={200} alt="QR Code" draggable={false}
                                onContextMenu={e => e.preventDefault()}
                                style={{ display: 'block', pointerEvents: 'none' }} />
                            </div>
                            <p className="font-accent text-[9px] tracking-[0.3em] text-dourado/40 uppercase">Apresente na entrada</p>
                            <p className="font-body text-[10px] text-bege-escuro/25 mt-1">Uso único · Não compartilhe</p>
                          </>
                        ) : null}
                      </div>
                    )}

                    {ing.status === 'utilizado' && (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <CheckCircle2 size={32} className="text-blue-400" />
                        <p className="font-accent text-xs tracking-widest text-blue-400 uppercase">Ingresso Utilizado</p>
                        <p className="font-body text-xs text-bege-escuro/40">Entrada registrada com sucesso.</p>
                      </div>
                    )}

                    {(ing.status === 'expirado' || ing.status === 'cancelado') && (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <AlertTriangle size={28} className="text-bege-escuro/30" />
                        <p className="font-body text-xs text-bege-escuro/40">
                          {ing.status === 'cancelado' ? 'Este ingresso foi cancelado.' : 'Este ingresso expirou.'}
                        </p>
                      </div>
                    )}

                    {ing.status === 'pendente' && (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <Clock size={28} className="text-amber-400/50" />
                        <p className="font-body text-xs text-bege-escuro/40">Aguardando confirmação do pagamento.</p>
                      </div>
                    )}

                    {/* DADOS */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {ing.cadastro?.nome_completo && (
                        <div>
                          <p className="font-accent text-[8px] tracking-[0.3em] uppercase text-bege-escuro/35 mb-1">Portador</p>
                          <p className="font-body text-xs text-bege-escuro/60">{ing.cadastro.nome_completo}</p>
                        </div>
                      )}
                      {ing.serial && (
                        <div>
                          <p className="font-accent text-[8px] tracking-[0.3em] uppercase text-bege-escuro/35 mb-1">Serial</p>
                          <p className="font-mono text-xs text-bege-escuro/40">{ing.serial}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
