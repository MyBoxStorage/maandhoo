/**
 * Service Worker — Maandhoo Portaria PWA
 * Estratégia: Network-first para API, Cache-first para assets estáticos
 * Garante funcionamento com conexão instável na portaria
 */

const CACHE_NAME = 'maandhoo-portaria-v1'

// Assets estáticos que devem funcionar offline
const PRECACHE_URLS = [
  '/portaria',
  '/portaria-manifest.json',
  '/icons/portaria-192.png',
  '/icons/portaria-512.png',
]

// ── INSTALL: pré-cacheia assets essenciais ─────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear alguns assets:', err)
      })
    })
  )
  // Ativa imediatamente sem esperar o SW anterior terminar
  self.skipWaiting()
})

// ── ACTIVATE: limpa caches antigos ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── FETCH: estratégia por tipo de request ─────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora requests que não são do nosso domínio
  if (url.origin !== self.location.origin) return

  // ── API de validação: Network-first com fallback de erro legível
  if (url.pathname.startsWith('/api/validar') || url.pathname.startsWith('/api/ingressos/portaria-auth')) {
    event.respondWith(networkFirst(request))
    return
  }

  // ── Outras APIs: Network-only (nunca cache de dados sensíveis)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // ── Assets estáticos (_next/static): Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // ── Páginas da portaria: Network-first com fallback do cache
  if (url.pathname.startsWith('/portaria')) {
    event.respondWith(networkFirst(request))
    return
  }
})

// ── Helpers ───────────────────────────────────────────────────

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    // Só cacheia respostas bem-sucedidas de GET
    if (request.method === 'GET' && response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    // Fallback para página offline se for uma navegação
    if (request.mode === 'navigate') {
      return new Response(offlinePage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    return new Response(
      JSON.stringify({ aprovado: false, resultado: 'ingresso_invalido', mensagem: '❌ Sem conexão com a internet' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 404 })
  }
}

function offlinePage() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maandhoo Portaria — Offline</title>
  <style>
    body { background: #0A0604; color: #e8ddd0; font-family: 'DM Sans', sans-serif;
           display: flex; flex-direction: column; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    h1 { font-size: 1.5rem; color: #C9A84C; margin-bottom: 8px; letter-spacing: 0.2em; }
    p  { font-size: 0.875rem; opacity: 0.6; }
    button { margin-top: 24px; background: #C9A84C; color: #0A0604; border: none;
             padding: 12px 28px; font-size: 0.75rem; letter-spacing: 0.2em;
             text-transform: uppercase; cursor: pointer; }
  </style>
</head>
<body>
  <h1>SEM CONEXÃO</h1>
  <p>Verifique o Wi-Fi ou dados móveis e tente novamente.</p>
  <button onclick="location.reload()">TENTAR NOVAMENTE</button>
</body>
</html>`
}
