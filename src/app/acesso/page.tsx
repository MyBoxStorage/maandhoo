'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import {
  Loader2, Mail, Lock, User, Phone, Eye, EyeOff,
  CreditCard, MapPin, Calendar, CheckCheck, ChevronDown,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

type Modo = 'login' | 'cadastro'
type Fase = 'idle' | 'enviando'

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

function Campo({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">{label}</label>
      <div className="relative">
        <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30 pointer-events-none z-10" />
        {children}
      </div>
    </div>
  )
}

function AcessoForm() {
  const router = useRouter()
  const params = useSearchParams()
  const linkToken = params.get('link') ?? ''
  // Quando vem de /cadastro-ingresso, o email é passado via ?email=
  // para pré-preencher o formulário e facilitar o login/cadastro.
  const emailParam = params.get('email') ?? ''

  const [modo, setModo] = useState<Modo>('login')
  const [fase, setFase] = useState<Fase>('idle')
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [lgpdAceito, setLgpdAceito] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: emailParam, whatsapp: '', cpf: '',
    data_nascimento: '', estado: '', cidade: '', senha: '',
  })

  const handleCpf = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    campo('cpf', d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'))
  }

  useEffect(() => {
    fetch('/api/cliente/auth').then(r => { if (r.ok) router.replace('/minha-conta') })
  }, [router])

  // Garante que o email do param seja aplicado mesmo após hidratação
  useEffect(() => {
    if (emailParam) {
      setForm(prev => ({ ...prev, email: emailParam }))
    }
  }, [emailParam])

  const campo = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const handleSubmit = async () => {
    if (!form.email || !form.senha) { toast.error('Preencha email e senha'); return }
    if (form.senha.length < 6) { toast.error('Senha deve ter no mínimo 6 caracteres'); return }
    if (modo === 'cadastro') {
      if (!form.nome) { toast.error('Informe seu nome'); return }
      if (form.cpf.replace(/\D/g, '').length !== 11) { toast.error('CPF inválido'); return }
      if (form.senha !== confirmarSenha) { toast.error('As senhas não coincidem'); return }
      if (!termosAceitos) { toast.error('Você precisa aceitar os Termos de Uso para continuar'); return }
    }
    setFase('enviando')
    try {
      const res = await fetch('/api/cliente/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: modo, ...form,
          termos_aceitos: termosAceitos,
          lgpd_aceito: lgpdAceito,
          lgpd_versao: '1.0',
          link_token: linkToken,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.erro ?? 'Erro ao autenticar'); setFase('idle'); return }
      toast.success(modo === 'cadastro' ? 'Conta criada! Bem-vindo!' : 'Bem-vindo de volta!')
      router.replace('/minha-conta')
    } catch { toast.error('Erro de conexão'); setFase('idle') }
  }

  return (
    <div className="min-h-screen bg-preto-profundo flex flex-col items-center justify-center px-4 py-12">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1208', color: '#e8ddd0', border: '1px solid rgba(201,168,76,0.3)' } }} />

      {/* Logo */}
      <Link href="/" className="flex flex-col items-center gap-3 mb-10 group">
        <LogoElefante width={48} height={53} color="#C9A84C" />
        <div className="text-center">
          <p className="font-accent text-xs tracking-[0.4em] text-dourado/70 uppercase group-hover:text-dourado transition-colors">Maandhoo Club</p>
          <p className="font-body text-[10px] text-bege-escuro/35 tracking-widest uppercase mt-1">Área do Cliente</p>
        </div>
      </Link>

      {/* Banner informativo quando vem de cadastro via link */}
      {emailParam && (
        <div className="w-full max-w-sm mb-4 border border-dourado/25 bg-dourado/8 rounded-sm px-4 py-3 flex items-start gap-3">
          <span className="text-dourado mt-0.5 flex-shrink-0">✓</span>
          <p className="font-body text-xs text-bege-escuro/70 leading-relaxed">
            Cadastro confirmado! <span className="text-bege">Entre na sua conta ou crie uma</span> com o email <span className="text-dourado">{emailParam}</span> para acessar seu ingresso.
          </p>
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* Tabs */}
        <div className="flex border border-dourado/20 rounded-sm mb-6 overflow-hidden">
          {(['login', 'cadastro'] as Modo[]).map(m => (
            <button key={m} onClick={() => { setModo(m); setConfirmarSenha(''); setTermosAceitos(false); setLgpdAceito(false) }}
              className={`flex-1 py-3 font-accent text-xs tracking-[0.2em] uppercase transition-all ${modo === m ? 'bg-dourado/15 text-dourado border-b-2 border-dourado' : 'text-bege-escuro/40 hover:text-bege-escuro/70'}`}>
              {m === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          ))}
        </div>

        <div className="border border-dourado/20 bg-black/30 rounded-sm p-7 space-y-4">

          {modo === 'cadastro' && (
            <Campo label="Nome completo" icon={User}>
              <input type="text" value={form.nome} onChange={e => campo('nome', e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                placeholder="Seu nome completo" disabled={fase === 'enviando'} />
            </Campo>
          )}

          <Campo label="Email" icon={Mail}>
            <input type="email" value={form.email} onChange={e => campo('email', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
              placeholder="seu@email.com" autoComplete="email" disabled={fase === 'enviando'} />
          </Campo>

          {modo === 'cadastro' && <>
            <Campo label="WhatsApp" icon={Phone}>
              <input type="tel" value={form.whatsapp} onChange={e => campo('whatsapp', e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                placeholder="(47) 99999-9999" disabled={fase === 'enviando'} />
            </Campo>

            <Campo label="CPF" icon={CreditCard}>
              <input type="text" inputMode="numeric" value={form.cpf} onChange={e => handleCpf(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                placeholder="000.000.000-00" autoComplete="off" disabled={fase === 'enviando'} />
            </Campo>

            <Campo label="Data de nascimento" icon={Calendar}>
              <input type="date" value={form.data_nascimento} onChange={e => campo('data_nascimento', e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                disabled={fase === 'enviando'} />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Estado</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30 pointer-events-none z-10" />
                  <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-bege-escuro/30 pointer-events-none" />
                  <select value={form.estado} onChange={e => campo('estado', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-8 py-3 font-body text-sm text-bege outline-none transition-colors appearance-none"
                    disabled={fase === 'enviando'}>
                    <option value="">UF</option>
                    {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-accent text-[9px] tracking-[0.3em] uppercase text-bege-escuro/50 mb-2">Cidade</label>
                <input type="text" value={form.cidade} onChange={e => campo('cidade', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm px-4 py-3 font-body text-sm text-bege outline-none transition-colors"
                  placeholder="Sua cidade" disabled={fase === 'enviando'} />
              </div>
            </div>
          </>}

          <Campo label="Senha" icon={Lock}>
            <input type={verSenha ? 'text' : 'password'} value={form.senha} onChange={e => campo('senha', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-black/40 border border-white/10 focus:border-dourado/40 rounded-sm pl-9 pr-10 py-3 font-body text-sm text-bege outline-none transition-colors"
              placeholder={modo === 'cadastro' ? 'Mínimo 6 caracteres' : '••••••••'}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'} disabled={fase === 'enviando'} />
            <button type="button" onClick={() => setVerSenha(!verSenha)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30 hover:text-bege-escuro/60">
              {verSenha ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </Campo>

          {modo === 'cadastro' && (
            <Campo label="Confirmar senha" icon={Lock}>
              <input type={verConfirmar ? 'text' : 'password'} value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className={`w-full bg-black/40 border rounded-sm pl-9 pr-10 py-3 font-body text-sm text-bege outline-none transition-colors ${
                  confirmarSenha && form.senha !== confirmarSenha ? 'border-red-500/50' :
                  confirmarSenha && form.senha === confirmarSenha ? 'border-green-500/50' : 'border-white/10 focus:border-dourado/40'}`}
                placeholder="Repita a senha" autoComplete="new-password" disabled={fase === 'enviando'} />
              <button type="button" onClick={() => setVerConfirmar(!verConfirmar)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bege-escuro/30 hover:text-bege-escuro/60">
                {verConfirmar ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              {confirmarSenha && form.senha !== confirmarSenha && (
                <p className="font-body text-[10px] text-red-400/80 mt-1.5 pl-0.5">As senhas não coincidem</p>
              )}
            </Campo>
          )}

          {modo === 'cadastro' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <div
                  className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200 ${termosAceitos ? 'bg-dourado border-dourado' : 'border-bege-escuro/30 group-hover:border-dourado/60'}`}
                  onClick={() => setTermosAceitos(!termosAceitos)}
                >
                  {termosAceitos && <CheckCheck size={11} className="text-preto-profundo" strokeWidth={3}/>}
                </div>
                <div onClick={() => setTermosAceitos(!termosAceitos)} className="flex-1">
                  <p className="font-body text-xs text-bege-escuro/80 leading-relaxed">
                    Li e aceito os{' '}
                    <Link href="/politicas#termos" target="_blank" className="text-dourado underline underline-offset-2 hover:text-dourado/80">
                      Termos de Uso
                    </Link>{' '}e a{' '}
                    <Link href="/politicas" target="_blank" className="text-dourado underline underline-offset-2 hover:text-dourado/80">
                      Política de Privacidade
                    </Link>.{' '}
                    <span className="text-red-400/80 font-medium">*</span>
                  </p>
                  <p className="font-body text-[10px] text-bege-escuro/30 mt-1">Obrigatório para criar a conta.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group select-none p-3 border border-dourado/10 hover:border-dourado/25 rounded-sm bg-dourado/[0.02] hover:bg-dourado/[0.04] transition-all duration-200">
                <div
                  className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200 ${lgpdAceito ? 'bg-dourado border-dourado' : 'border-bege-escuro/30 group-hover:border-dourado/50'}`}
                  onClick={() => setLgpdAceito(!lgpdAceito)}
                >
                  {lgpdAceito && <CheckCheck size={11} className="text-preto-profundo" strokeWidth={3}/>}
                </div>
                <div onClick={() => setLgpdAceito(!lgpdAceito)} className="flex-1">
                  <p className="font-body text-xs leading-relaxed">
                    <span className="text-dourado font-medium">🎁 Quero participar dos sorteios semanais</span>
                    {' '}e receber ofertas exclusivas dos parceiros da Maandhoo em Balneário Camboriú.
                  </p>
                  <p className="font-body text-[10px] text-bege-escuro/35 mt-1 leading-relaxed">
                    Opcional. Autorizo o compartilhamento do meu perfil com parceiros para promoções personalizadas.
                    Revogável a qualquer momento. LGPD — Lei 13.709/2018.
                  </p>
                </div>
              </label>
            </div>
          )}

          <button onClick={handleSubmit} disabled={fase === 'enviando' || (modo === 'cadastro' && !termosAceitos)}
            className="w-full bg-dourado hover:bg-dourado/90 disabled:bg-dourado/30 disabled:cursor-not-allowed text-preto-profundo font-accent text-xs tracking-[0.25em] uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 mt-1">
            {fase === 'enviando'
              ? <><Loader2 size={14} className="animate-spin" /> Aguarde...</>
              : modo === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>

          {modo === 'cadastro' && !termosAceitos && (
            <p className="font-body text-[10px] text-bege-escuro/25 text-center">
              Aceite os Termos de Uso para continuar.
            </p>
          )}
        </div>

        <p className="font-body text-[10px] text-bege-escuro/25 text-center mt-5 leading-relaxed">
          {modo === 'login' ? 'Não tem conta? Clique em "Criar Conta" acima.' : 'Já tem conta? Clique em "Entrar" acima.'}
        </p>
      </div>
    </div>
  )
}

export default function AcessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-preto-profundo flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-dourado/40" />
      </div>
    }>
      <AcessoForm />
    </Suspense>
  )
}
