import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...)' : 'MISSING',
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    resend_key: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
    node_env: process.env.NODE_ENV,
  })
}
