// ================================================================
// MAANDHOO QUIZ — Perguntas com SVGs Premium
// 7 perguntas para 12 perfis psicológicos
// ================================================================

export interface OpcaoQuiz {
  valor: string
  label: string
  svg: string // SVG inline string
}

export interface PerguntaQuiz {
  id: string
  numero: number
  texto: string
  subtexto: string
  opcoes: OpcaoQuiz[]
}

// ── SVGs PREMIUM ─────────────────────────────────────────────────

const SVG = {
  lua: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 20c0 6.627-5.373 12-12 12a11.96 11.96 0 01-6-1.608C13.47 31.385 16.592 32 20 32c7.732 0 14-6.268 14-14 0-5.95-3.708-11.037-9-13.018A11.965 11.965 0 0128 20z" fill="currentColor" opacity="0.9"/>
    <path d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.3"/>
  </svg>`,

  estrela: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5l3.09 9.51H33l-8.09 5.88 3.09 9.52L20 24.93l-8 5.98 3.09-9.52L7 15.51h9.91L20 5z" fill="currentColor" opacity="0.9"/>
  </svg>`,

  coroa: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 30h28M6 30l4-14 7 7 3-9 3 9 7-7 4 14" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>
    <circle cx="6" cy="16" r="2.5" fill="currentColor"/>
    <circle cx="34" cy="16" r="2.5" fill="currentColor"/>
    <circle cx="20" cy="8" r="2.5" fill="currentColor"/>
  </svg>`,

  chama: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 35c-6 0-11-4.5-11-11 0-4 2-7 5-9-1 2-1 4 1 6 0-5 3-9 6-12-1 4 1 7 3 9 1-2 1-4 0-6 4 3 6 7 6 12 0 6.5-4.5 11-10 11z" fill="currentColor" opacity="0.9"/>
    <path d="M20 29c-2.5 0-4.5-2-4.5-4.5 0-1.5.8-3 2-4 0 .8.5 1.5 1.5 2 .5-2 1.5-3.5 2.5-4.5 0 1.5.5 2.8 1.5 3.5.3-.8.3-1.5 0-2.3 1.5 1.2 2.5 3 2.5 5.3 0 2.5-2.2 4.5-5.5 4.5z" fill="currentColor" opacity="0.5"/>
  </svg>`,

  compasso: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M20 7v2M20 31v2M7 20h2M31 20h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="2" fill="currentColor"/>
    <path d="M20 20l5-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M20 20l-3 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
  </svg>`,

  bussola: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M20 10v2M20 28v2M10 20h2M28 20h2" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
    <path d="M20 14l3 6-3 6-3-6 3-6z" fill="currentColor" opacity="0.9"/>
    <path d="M14 20l6-3 6 3-6 3-6-3z" fill="currentColor" opacity="0.35"/>
    <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.8"/>
  </svg>`,

  notas: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 10v13.5a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4c.74 0 1.44.2 2 .56V13l-8 2v10.5a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4c.74 0 1.44.2 2 .56V10l12-3v3z" fill="currentColor" opacity="0.9"/>
  </svg>`,

  raio: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6L10 22h11l-3 12 17-18H24l4-10z" fill="currentColor" opacity="0.9" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round"/>
  </svg>`,

  diamante: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8l12 8-12 16L8 16l12-8z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15" stroke-linejoin="round"/>
    <path d="M8 16h24M14 12l-6 4 12 16M26 12l6 4-12 16" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    <path d="M14 12l6-4 6 4" stroke="currentColor" stroke-width="1" opacity="0.6" fill="none"/>
  </svg>`,

  trofeu: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8h12v12a6 6 0 01-12 0V8z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
    <path d="M10 10h4M26 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 10c0 6 4 9 4 9M30 10c0 6-4 9-4 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M20 26v5M15 31h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18 14l1.5 3.5 3.5.5-2.5 2.5.5 3.5L18 22l-3 2 .5-3.5-2.5-2.5 3.5-.5L18 14z" fill="currentColor" opacity="0.7"/>
  </svg>`,

  // Opções das perguntas
  relogio: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M20 12v8l5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  champagne_svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8h8l-2 14h-4L16 8z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
    <path d="M18 22v10M15 32h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16 8c0 6 4 8 4 8s4-2 4-8" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/>
    <circle cx="26" cy="10" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="28" cy="14" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="25" cy="13" r="1" fill="currentColor" opacity="0.4"/>
  </svg>`,

  cocktail: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8h16l-8 12-8-12z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15" stroke-linejoin="round"/>
    <path d="M20 20v12M16 32h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 8l3 4h10l3-4" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M23 13l3-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="27" cy="10" r="1.5" fill="currentColor" opacity="0.7"/>
  </svg>`,

  whisky_svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="13" y="10" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
    <path d="M13 18h14" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <path d="M16 10V8h8v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M15 14h10M15 16h8" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>
  </svg>`,

  agua_svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8c0 0-9 8-9 15a9 9 0 0018 0c0-7-9-15-9-15z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
    <path d="M14 24c0 3 2.5 5 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  </svg>`,

  vinil: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
    <circle cx="20" cy="20" r="7" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/>
    <circle cx="20" cy="20" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="20" cy="20" r="1" fill="currentColor"/>
    <path d="M20 7v3M20 30v3M7 20h3M30 20h3" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.3"/>
  </svg>`,

  headphone: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 22v-4a10 10 0 0120 0v4" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <rect x="8" y="22" width="5" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
    <rect x="27" y="22" width="5" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
  </svg>`,

  micro: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="7" width="10" height="16" rx="5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/>
    <path d="M11 22a9 9 0 0018 0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M20 31v4M17 35h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  grupo_pessoas: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
    <circle cx="26" cy="14" r="5" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
    <path d="M6 33c0-5.523 3.582-10 8-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M26 23c4.418 0 8 4.477 8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M14 23c3.314 0 6 3.134 6 7" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.5"/>
    <path d="M26 23c-3.314 0-6 3.134-6 7" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.5"/>
  </svg>`,

  pista_icon: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 10c-1 2-2 4-1.5 6s2.5 3 2 5-3 4-2 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
    <path d="M14 14c1 1.5 0 3.5 1 5s3 2 3 4-2 3.5-1 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
    <path d="M26 12c-1 1.5 0 3.5-1 5s-3 2-3 4 2 3.5 1 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
  </svg>`,

  bar_icon: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12h20l-3 16H13L10 12z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1" stroke-linejoin="round"/>
    <path d="M10 12h20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16 12l1 6M24 12l-1 6M20 12v4" stroke="currentColor" stroke-width="1" opacity="0.4" stroke-linecap="round"/>
    <path d="M8 32h24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  roupas_dark: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8l-7 5 4 3v16h16V16l4-3-7-5a4 4 0 01-10 0z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1" stroke-linejoin="round"/>
  </svg>`,

  roupas_brilho: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8l-7 5 4 3v16h16V16l4-3-7-5a4 4 0 01-10 0z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1" stroke-linejoin="round"/>
    <circle cx="17" cy="20" r="1" fill="currentColor" opacity="0.7"/>
    <circle cx="22" cy="17" r="1" fill="currentColor" opacity="0.7"/>
    <circle cx="24" cy="24" r="1" fill="currentColor" opacity="0.7"/>
    <path d="M28 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" opacity="0.8"/>
  </svg>`,

  roupas_casual: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8h12M14 8l-6 5 4 2v17h16V15l4-2-6-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    <path d="M14 8c0 3.314 2.686 6 6 6s6-2.686 6-6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5"/>
  </svg>`,

  calendario: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="11" width="24" height="21" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M8 17h24" stroke="currentColor" stroke-width="1.5"/>
    <path d="M15 8v5M25 8v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="14" cy="24" r="1.5" fill="currentColor" opacity="0.7"/>
    <circle cx="20" cy="24" r="1.5" fill="currentColor" opacity="0.7"/>
    <circle cx="26" cy="24" r="1.5" fill="currentColor" opacity="0.7"/>
  </svg>`,

  humor_fogo: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8s-2 4 0 6c0 0-4-1-4 4 0 3 2 5 4 5s4-2 4-5c0-5-4-10-4-10z" fill="currentColor" opacity="0.9"/>
    <path d="M14 24c-3 0-5 2.5-5 5.5S11.5 35 14 35s5-2.5 5-5.5" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.4"/>
    <path d="M26 24c3 0 5 2.5 5 5.5S28.5 35 26 35s-5-2.5-5-5.5" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.4"/>
  </svg>`,
}

export const PERGUNTAS_QUIZ: PerguntaQuiz[] = [
  {
    id: 'chegada',
    numero: 1,
    texto: 'Que horas você aparece?',
    subtexto: 'Sua chegada diz tudo sobre você',
    opcoes: [
      { valor: 'cedo', label: 'Logo que abre', svg: SVG.relogio },
      { valor: 'medio', label: 'Na hora certa', svg: SVG.estrela },
      { valor: 'tarde', label: 'Quando tá bombando', svg: SVG.chama },
      { valor: 'madrugada', label: 'Quando todos vão embora', svg: SVG.lua },
    ],
  },
  {
    id: 'drink',
    numero: 2,
    texto: 'O que tem no seu copo?',
    subtexto: 'A escolha do drink revela o perfil',
    opcoes: [
      { valor: 'champagne', label: 'Champagne / Espumante', svg: SVG.champagne_svg },
      { valor: 'tropical', label: 'Drinks tropicais', svg: SVG.cocktail },
      { valor: 'whisky', label: 'Whisky puro', svg: SVG.whisky_svg },
      { valor: 'agua', label: 'Água — zero ressaca', svg: SVG.agua_svg },
    ],
  },
  {
    id: 'musica',
    numero: 3,
    texto: 'Qual som faz você pirar?',
    subtexto: 'A trilha sonora da sua alma',
    opcoes: [
      { valor: 'funk', label: 'Funk & Pagodão', svg: SVG.micro },
      { valor: 'eletro', label: 'Eletrônico / House', svg: SVG.headphone },
      { valor: 'pop', label: 'Pop & Hits nacionais', svg: SVG.notas },
      { valor: 'ecletico', label: 'De tudo — sem fronteiras', svg: SVG.vinil },
    ],
  },
  {
    id: 'grupo',
    numero: 4,
    texto: 'Como você curte mais?',
    subtexto: 'Seu território favorito na noite',
    opcoes: [
      { valor: 'camarote', label: 'Camarote com a galera', svg: SVG.coroa },
      { valor: 'pista', label: 'Na pista até o fim', svg: SVG.pista_icon },
      { valor: 'bar', label: 'No bar, boa conversa', svg: SVG.bar_icon },
      { valor: 'flex', label: 'Em todo lugar', svg: SVG.bussola },
    ],
  },
  {
    id: 'traje',
    numero: 5,
    texto: 'O que você veste pra sair?',
    subtexto: 'Primeira impressão é permanente',
    opcoes: [
      { valor: 'allblack', label: 'All black sempre', svg: SVG.roupas_dark },
      { valor: 'brilho', label: 'Algo que brilhe', svg: SVG.roupas_brilho },
      { valor: 'casual', label: 'Casual mas arrumado', svg: SVG.roupas_casual },
      { valor: 'criativo', label: 'Look único e diferente', svg: SVG.compasso },
    ],
  },
  {
    id: 'frequencia',
    numero: 6,
    texto: 'Com que frequência você sai?',
    subtexto: 'Quantidade ou qualidade?',
    opcoes: [
      { valor: 'toda_semana', label: 'Todo fim de semana', svg: SVG.raio },
      { valor: 'quinzenal', label: 'A cada 15 dias', svg: SVG.calendario },
      { valor: 'raramente', label: 'Só quando vale muito', svg: SVG.diamante },
      { valor: 'primeira_vez', label: 'Primeiras vezes ainda', svg: SVG.estrela },
    ],
  },
  {
    id: 'humor',
    numero: 7,
    texto: 'Qual é o seu estado de espírito na noite?',
    subtexto: 'O que você busca nessa noite',
    opcoes: [
      { valor: 'intenso', label: 'Intensidade total', svg: SVG.humor_fogo },
      { valor: 'relaxado', label: 'Leveza e conforto', svg: SVG.agua_svg },
      { valor: 'aventureiro', label: 'Descobrir algo novo', svg: SVG.bussola },
      { valor: 'romantico', label: 'Conexão e sedução', svg: SVG.lua },
    ],
  },
]
