'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LogoElefante } from '@/components/ui/LogoElefante'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Contexto de sessão admin ──────────────────────────────────

type AdminUser = { id: string; nome: string; role: 'admin' | 'operador' }

type AdminAuthContextType = {
  usuario: AdminUser | null
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  usuario: null,
  logout: async () => {},
})

export const useAdminAuth = () => useContext(AdminAuthContext)

// ── Componente principal ──────────────────────────────────────

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<AdminUser | null>(null)
  const [verificando, setVerificando] = useState(true)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Verificar se já existe sessão válida no cookie
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const res = await fetch('/api/auth/admin', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          if (data.autenticado) setUsuario(data.usuario)
        }
      } catch {
        // sem sessão — vai mostrar o formulário de login
      } finally {
        setVerificando(false)
      }
    }
    verificarSessao()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok || data.erro) {
        toast.error(data.erro ?? 'Credenciais inválidas')
        return
      }
      setUsuario(data.usuario)
      toast.success(`Bem-vindo, ${data.usuario.nome}!`)
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    setUsuario(null)
    router.push('/admin')
  }

  // Carregando verificação inicial
  if (verificando) {
    return (
      <div className="min-h-screen bg-preto-profundo flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-dourado/40" />
      </div>
    )
  }

  // Sessão válida — renderizar conteúdo protegido
  if (usuario) {
    return (
      <AdminAuthContext.Provider value={{ usuario, logout }}>
        {children}
      </AdminAuthContext.Provider>
    )
  }

  // Formulário de login
  return (
    <div className="min-h-screen bg-preto-profundo flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoElefante width={60} height={66} color="#C9A84C" animated />
          </div>
          <h1 className="font-accent text-2xl tracking-widest text-bege">maandhoo</h1>
          <p className="font-body text-xs text-bege-escuro/50 mt-1">Painel Administrativo</p>
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
                placeholder="admin@maandhoo.com"
                required
                autoComplete="email"
                disabled={loading}
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
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminAuthGuard
