import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/usuarios — lista clientes registrados (/minha-conta)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .select('id, nome, email, whatsapp, quiz_perfil_nome, quiz_feito, lgpd_aceito, created_at, ultimo_acesso')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ clientes: data ?? [] })
}
