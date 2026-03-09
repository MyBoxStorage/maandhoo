import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization via funções — evita crash no build quando env vars ausentes
// e garante que o cliente seja criado apenas no momento da primeira chamada real

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient(url, key)
  }
  return _supabase
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

// Re-exporta como constantes para compatibilidade com código existente
// Usamos getters de módulo — o acesso a .from(), .rpc() etc vai funcionar normalmente
export const supabase = {
  get auth() { return getSupabase().auth },
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
  rpc: (...args: Parameters<SupabaseClient['rpc']>) => getSupabase().rpc(...args),
} as unknown as SupabaseClient

export const supabaseAdmin = {
  get auth() { return getSupabaseAdmin().auth },
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseAdmin().from(...args),
  rpc: (...args: Parameters<SupabaseClient['rpc']>) => getSupabaseAdmin().rpc(...args),
} as unknown as SupabaseClient
