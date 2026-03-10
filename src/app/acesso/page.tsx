'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import { Loader2, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

type Modo = 'login' | 'cadastro'
type Fase = 'idle' | 'enviando'

export default function AcessoPage() {
  const router = useRouter()
  const params = useSearchParams()
  const linkToken = params.get('link') ?? ''

  const [modo, setModo] = useState<Modo>('login')
  const [fase, setFase] = useState<Fase>('idle')
  const [verSenha, setVerSenha] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', senha: '' })

  // Se já tiver sessão ativa, redireciona direto para minha conta
  useEffect(() => {
    fetch('/api/cliente/auth').then(r => {
      if (r.ok) router.replace('/minha-conta')
    })
  }, [router])

  const campo = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.email || !form.senha) { toast.error('Preencha email e senha'); return }
    if (modo === 'cadastro' && !form.nome) { toast.error('Informe seu nome'); return }
    if (form.senha.length < 6) { toast.error('Senha deve ter no mínimo 6 caracteres'); return }

    setFase('enviando')
    try {
      const res = await fetch('/api/cliente/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: modo, ...form, link_token: linkToken }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.erro ?? 'Erro ao autenticar'); setFase('idle'); return }
      toast.success(modo === 'cadastro' ? 'Conta criada! Bem-vindo!' : 'Bem-vindo de volta!')
      router.replace('/minha-conta')
    } catch {
      toast.error('Erro de conexão')
      setFase('idle')
    }
  }

  return (
    <div className="min-h-screen bg-preto-profundo flex flex-col items-center justify-center px-4 py-12">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      {/* LOGO */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <LogoElefante width={48} height={53} color="#C9A84C" />
        <div className="text-center">
          <p className="font-accent text-xs tracking-[0.4em] text-dourado/70 uppercase">Maandhoo Club</p>
          <p className="font-body text-[10px] text-bege-escuro/35 tracking-widest uppercase mt-1">Área do Cliente</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        {/* TABS */}
        <div className="flex border border-dourado/20 rounded-sm mb-6 overflow-hidden">
          {(['login', 'cadastro'] as Modo[]).map(m => (
            <button key={m} onClick={() => setModo(m)}
              className={`flex-1 py-3 font-accent text-xs tracking-[0.2em] uppercase transition-all
                ${modo === m ? 'bg-dourado/15 text-dourado border-b-2 border-dourado' : 'text-bege-escuro/40 hover:text-bege-escuro/70'}`}>
              {m === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          ))}
        </div>

        <div className="border border-dourado/20 bg-black/30 rounded-sm p-7 space-y-4">
          {modo === 'cadastro' && (
            <div>
              <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Nome completo</label>
              <div className="relative">
                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
                <input type="text" value={form.nome} onChange={e => campo('nome', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                  placeholder="Seu nome" disabled={fase === 'enviando'} />
              </div>
            </div>
          )}

          <div>
            <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Email</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
              <input type="email" value={form.email} onChange={e => campo('email', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                placeholder="seu@email.com" autoComplete="email" disabled={fase === 'enviando'} />
            </div>
          </div>

          {modo === 'cadastro' && (
            <div>
              <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">WhatsApp</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
                <input type="tel" value={form.whatsapp} onChange={e => campo('whatsapp', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                  placeholder="(47) 99999-9999" disabled={fase === 'enviando'} />
              </div>
            </div>
          )}

          <div>
            <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Senha</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30" />
              <input type={verSenha ? 'text' : 'password'} value={form.senha} onChange={e => campo('senha', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-10 py-3 font-body text-sm text-bege outline-none transition-colors"
                placeholder={modo === 'cadastro' ? 'Mínimo 6 caracteres' : '••••••••'}
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                disabled={fase === 'enviando'} />
              <button type="button" onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30 hover:text-bege-escuro/60">
                {verSenha ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={fase === 'enviando'}
            className="w-full bg-dourado hover:bg-dourado/90 disabled:bg-dourado/40 text-preto-profundo font-accent text-xs tracking-[0.25em] uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 mt-2">
            {fase === 'enviando'
              ? <><Loader2 size={14} className="animate-spin" /> Aguarde...</>
              : modo === 'login' ? 'Entrar' : 'Criar Conta e Acessar Ingresso'}
          </button>
        </div>

        <p className="font-body text-[10px] text-bege-escuro/25 text-center mt-5 leading-relaxed">
          {modo === 'login'
            ? 'Não tem conta? Clique em "Criar Conta" acima.'
            : 'Já tem conta? Clique em "Entrar" acima.'}
        </p>
      </div>
    </div>
  )
}
