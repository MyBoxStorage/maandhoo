'use client'
// Esta página é um alias de /admin/usuarios (aba Leads)
// A gestão unificada de Leads e Clientes está em /admin/usuarios
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LeadsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/usuarios') }, [router])
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 size={28} className="animate-spin text-dourado/50 mx-auto" />
        <p className="font-body text-sm text-bege-escuro/50">Redirecionando para Usuários & Leads...</p>
      </div>
    </div>
  )
}
