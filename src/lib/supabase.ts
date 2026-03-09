import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization — evita erro no build quando variáveis ainda não estão definidas
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      _supabase = createClient(url, key)
    }
    const value = (_supabase as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(_supabase) : value
  },
})

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
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
    const value = (_supabaseAdmin as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(_supabaseAdmin) : value
  },
})
