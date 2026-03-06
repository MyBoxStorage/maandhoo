'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import toast from 'react-hot-toast'

const CREDENCIAIS_DEMO = [
  { email: 'admin@maandhoo.com', senha: 'admin123', role: 'admin', nome: 'Administrador' },
  { email: 'operador@maandhoo.com', senha: 'operador123', role: 'operador', nome: 'Operador' },
  { email: 'porteiro@maandhoo.com', senha: 'porteiro123', role: 'porteiro', nome: 'Porteiro' },
]

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autenticado, setAutenticado] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Se rota de portaria, verificar role porteiro
  const isPortaria = pathname?.startsWith('/portaria')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const user = CREDENCIAIS_DEMO.find(u => u.email === email && u.senha === senha)
    if (user) {
      if (isPortaria && user.role === 'operador') {
        toast.error('Operadores não têm acesso à portaria')
        setLoading(false)
        return
      }
      setAutenticado(true)
      toast.success(`Bem-vindo, ${user.nome}!`)
    } else {
      toast.error('Credenciais inválidas')
    }
    setLoading(false)
  }

  if (autenticado) return <>{children}</>

  return (
    <div className="min-h-screen bg-preto-profundo flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoElefante width={60} height={66} color="#C9A84C" animated />
          </div>
          <h1 className="font-accent text-2xl tracking-widest text-bege">maandhoo</h1>
          <p className="font-body text-xs text-bege-escuro/50 mt-1">
            {isPortaria ? 'Acesso — Portaria' : 'Painel Administrativo'}
          </p>
        </div>

        <div className="bg-card border border-gold/20 rounded-sm p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="admin-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="admin-input"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="admin-label">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="admin-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <span className="w-4 h-4 border-2 border-preto-profundo/30 border-t-preto-profundo rounded-full animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-xs text-bege-escuro/30 text-center mb-2">Contas de demonstração:</p>
            <div className="space-y-1 text-xs text-bege-escuro/40 font-mono">
              <p>admin@maandhoo.com / admin123</p>
              <p>operador@maandhoo.com / operador123</p>
              <p>porteiro@maandhoo.com / porteiro123</p>
            </div>
            <p className="text-xs text-amber-500/60 text-center mt-2">
              ⚠️ Configure NextAuth + Supabase para produção
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAuthGuard
