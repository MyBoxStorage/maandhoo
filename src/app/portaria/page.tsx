'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, QrCode, Search, RefreshCw } from 'lucide-react'
import { LogoElefante } from '@/components/ui/LogoElefante'
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard'
import toast from 'react-hot-toast'

type ResultadoValidacao = {
  status: 'valido' | 'invalido' | 'ja_usado' | 'idle'
  nome?: string
  ingresso?: string
  evento?: string
  horario?: string
  serial?: string
}

// Ingressos simulados (em prod: busca no Supabase)
const ingressosSimulados: Record<string, { nome: string; ingresso: string; evento: string; serial: string; usado: boolean }> = {
  'QR-MAANDHOO-001': { nome: 'João Silva Santos', ingresso: 'Pista Masculino', evento: 'Me Leva Pro Pagode — 07/03', serial: 'MAANDHOO-20250307-001', usado: false },
  'QR-MAANDHOO-002': { nome: 'Maria Oliveira', ingresso: 'Backstage Feminino', evento: 'Fluxou — 14/03', serial: 'MAANDHOO-20250314-002', usado: false },
  'QR-MAANDHOO-003': { nome: 'Carlos Costa', ingresso: 'Pista Masculino', evento: 'Fluxou — 14/03', serial: 'MAANDHOO-20250314-003', usado: true },
}

const usadosLocal = new Set<string>()

export default function PortariaPage() {
  const [resultado, setResultado] = useState<ResultadoValidacao>({ status: 'idle' })
  const [inputManual, setInputManual] = useState('')
  const [historico, setHistorico] = useState<Array<ResultadoValidacao & { ts: string }>>([])
  const [loading, setLoading] = useState(false)
  const [scanAtivo, setScanAtivo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Foco automático no input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const validarQR = async (codigo: string) => {
    if (!codigo.trim()) return
    setLoading(true)

    await new Promise(r => setTimeout(r, 500))

    const ingresso = ingressosSimulados[codigo.trim()]
    let resultado: ResultadoValidacao

    if (!ingresso) {
      resultado = { status: 'invalido' }
      toast.error('QR Code inválido!')
    } else if (ingresso.usado || usadosLocal.has(codigo.trim())) {
      resultado = {
        status: 'ja_usado',
        nome: ingresso.nome,
        ingresso: ingresso.ingresso,
        evento: ingresso.evento,
        serial: ingresso.serial,
        horario: new Date().toLocaleTimeString('pt-BR'),
      }
      toast.error('Ingresso já utilizado!')
    } else {
      usadosLocal.add(codigo.trim())
      resultado = {
        status: 'valido',
        nome: ingresso.nome,
        ingresso: ingresso.ingresso,
        evento: ingresso.evento,
        serial: ingresso.serial,
        horario: new Date().toLocaleTimeString('pt-BR'),
      }
      toast.success('Entrada autorizada!')
    }

    setResultado(resultado)
    setHistorico(prev => [{ ...resultado, ts: new Date().toLocaleTimeString('pt-BR') }, ...prev.slice(0, 9)])
    setInputManual('')
    setLoading(false)

    // Reset após 5s
    setTimeout(() => setResultado({ status: 'idle' }), 5000)
    inputRef.current?.focus()
  }

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault()
    validarQR(inputManual)
  }

  const cores = {
    idle: 'border-white/10 bg-black/20',
    valido: 'border-green-500 bg-green-500/10',
    invalido: 'border-red-500 bg-red-500/10',
    ja_usado: 'border-amber-500 bg-amber-500/10',
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-preto-profundo p-4 pb-10">
        <div className="max-w-lg mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8 pt-4">
            <div className="flex items-center gap-3">
              <LogoElefante width={32} height={36} color="#C9A84C" />
              <div>
                <h1 className="font-accent text-base tracking-widest text-bege">PORTARIA</h1>
                <p className="font-body text-xs text-bege-escuro/50">Validação de ingressos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-body">Online</span>
            </div>
          </div>

          {/* RESULTADO PRINCIPAL */}
          <div className={`rounded-sm border-2 p-8 text-center mb-6 transition-all duration-500 ${cores[resultado.status]}`}>
            {resultado.status === 'idle' && (
              <div>
                <QrCode size={64} className="text-bege-escuro/20 mx-auto mb-4" />
                <p className="font-body text-bege-escuro/50 text-sm">Aguardando leitura do QR Code...</p>
                <p className="font-body text-xs text-bege-escuro/30 mt-1">Aponte a câmera ou insira o código manualmente</p>
              </div>
            )}
            {resultado.status === 'valido' && (
              <div>
                <CheckCircle2 size={72} className="text-green-400 mx-auto mb-4 animate-bounce" />
                <p className="font-accent text-xl tracking-widest text-green-400 mb-3">ENTRADA AUTORIZADA</p>
                <div className="space-y-1">
                  <p className="font-display text-2xl text-bege">{resultado.nome}</p>
                  <p className="font-body text-sm text-bege-escuro/70">{resultado.ingresso}</p>
                  <p className="font-body text-xs text-bege-escuro/50">{resultado.evento}</p>
                  <p className="font-body text-xs text-green-400/60 mt-2 font-mono">{resultado.serial}</p>
                </div>
              </div>
            )}
            {resultado.status === 'invalido' && (
              <div>
                <XCircle size={72} className="text-red-400 mx-auto mb-4" />
                <p className="font-accent text-xl tracking-widest text-red-400">QR CODE INVÁLIDO</p>
                <p className="font-body text-sm text-bege-escuro/60 mt-2">Este código não corresponde a nenhum ingresso</p>
              </div>
            )}
            {resultado.status === 'ja_usado' && (
              <div>
                <XCircle size={72} className="text-amber-400 mx-auto mb-4" />
                <p className="font-accent text-xl tracking-widest text-amber-400">JÁ UTILIZADO</p>
                <p className="font-display text-xl text-bege mt-2">{resultado.nome}</p>
                <p className="font-body text-sm text-bege-escuro/60">{resultado.ingresso}</p>
                <p className="font-body text-xs text-amber-400/60 mt-2">Entrada já registrada anteriormente</p>
              </div>
            )}
          </div>

          {/* SCANNER MANUAL */}
          <div className="admin-card mb-6">
            <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-4">Código Manual / QR Scanner</h3>

            {/* Scan frame visual */}
            <div className="scanner-frame mb-4 flex items-center justify-center bg-black/40">
              {scanAtivo ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-xs text-bege-escuro/50">câmera ativa (configure html5-qrcode)</p>
                  </div>
                  <div className="absolute w-full h-0.5 bg-dourado/60 animate-scan" />
                </div>
              ) : (
                <button
                  onClick={() => { setScanAtivo(true); toast('Configure html5-qrcode para câmera real', { icon: 'ℹ️' }) }}
                  className="flex flex-col items-center gap-2 text-bege-escuro/40 hover:text-bege-escuro transition-colors"
                >
                  <QrCode size={40} />
                  <span className="text-xs">Ativar Câmera</span>
                </button>
              )}
              <div className="scanner-corner-tr" />
              <div className="scanner-corner-bl" />
            </div>

            <form onSubmit={handleSubmitManual} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bege-escuro/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputManual}
                  onChange={e => setInputManual(e.target.value)}
                  className="admin-input pl-9 font-mono text-sm"
                  placeholder="QR-MAANDHOO-001"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-4 py-3 flex items-center gap-2 text-xs disabled:opacity-60"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Validar
              </button>
            </form>
            <p className="text-xs text-bege-escuro/30 mt-2">
              Teste: QR-MAANDHOO-001 (válido) · QR-MAANDHOO-003 (já usado) · XXXXX (inválido)
            </p>
          </div>

          {/* HISTÓRICO */}
          {historico.length > 0 && (
            <div className="admin-card">
              <h3 className="font-accent text-xs tracking-widest uppercase text-dourado mb-4">
                Histórico — {historico.length} validações
              </h3>
              <div className="space-y-2">
                {historico.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-sm bg-black/20 border border-white/5">
                    {h.status === 'valido'
                      ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                      : <XCircle size={14} className={`flex-shrink-0 ${h.status === 'ja_usado' ? 'text-amber-400' : 'text-red-400'}`} />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-bege truncate">{h.nome || 'Código inválido'}</p>
                      <p className="font-body text-xs text-bege-escuro/40 truncate">{h.ingresso || h.status}</p>
                    </div>
                    <span className="text-xs text-bege-escuro/40 flex-shrink-0">{h.ts}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminAuthGuard>
  )
}
