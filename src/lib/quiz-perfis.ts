// ================================================================
// MAANDHOO QUIZ — 12 Perfis Psicológicos
// Baseado em: chegada, drink, musica, grupo, traje, frequencia, humor
// ================================================================

export interface PerfilQuiz {
  id: string
  nome: string
  subtitulo: string
  descricao: string
  tagline: string
  // Tema visual
  corPrimaria: string
  corSecundaria: string
  corGlow: string
  gradienteBadge: string
  // Badge SVG (gerado inline)
  iconeId: string
  // Playlist Spotify
  playlistUrl: string
  playlistNome: string
  // Pesos das respostas que levam a este perfil
  pesos: Record<string, number>
}

export const PERFIS_QUIZ: Record<string, PerfilQuiz> = {

  // ── 1. O MONARCA ────────────────────────────────────────────────
  monarca: {
    id: 'monarca',
    nome: 'O Monarca',
    subtitulo: 'Você não vai à festa. A festa vem até você.',
    descricao: 'Camarote, garrafas no gelo e a melhor visão da casa. Cada detalhe da sua noite é calculado com precisão. Você não compete por espaço — você define o espaço. Seu critério é alto porque seu padrão é mais alto ainda.',
    tagline: 'A Maandhoo reserva o melhor para quem já chegou no topo.',
    corPrimaria: '#C9A84C',
    corSecundaria: '#7A5C1E',
    corGlow: 'rgba(201,168,76,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #C9A84C 0%, #F0D080 45%, #9A7830 100%)',
    iconeId: 'coroa',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    playlistNome: 'Trap / Hip-Hop Premium',
    pesos: { vip: 4, cedo: 1, whisky: 3, camarote: 4, allblack: 2, toda_semana: 2 },
  },

  // ── 2. A CHAMA ───────────────────────────────────────────────────
  chama: {
    id: 'chama',
    nome: 'A Chama',
    subtitulo: 'Onde você chega, a temperatura sobe.',
    descricao: 'Energia que contagia, sorriso que ilumina e uma presença que ninguém ignora. Você não precisa se apresentar — o ambiente já percebeu que você chegou. Drinks na mão, música no sangue e a noite inteira pela frente.',
    tagline: 'Maandhoo arde mais quando você está aqui.',
    corPrimaria: '#FF6B35',
    corSecundaria: '#CC2200',
    corGlow: 'rgba(255,107,53,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #FF4500 0%, #FF8C42 50%, #FFD700 100%)',
    iconeId: 'chama',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6GwdWRQMQpq',
    playlistNome: 'Funk Hits Brasil',
    pesos: { festeiro: 4, tarde: 2, tropical: 3, pista: 4, brilho: 3, toda_semana: 3 },
  },

  // ── 3. O ARQUITETO ───────────────────────────────────────────────
  arquiteto: {
    id: 'arquiteto',
    nome: 'O Arquiteto',
    subtitulo: 'Você não segue tendências. Você as desenha.',
    descricao: 'Refinamento sem ostentação. Você escolhe seus ambientes com cuidado, seus drinks com intenção e suas companhias com critério. Cada saída sua é uma curadoria. Você aprecia o que é bom porque entende o que é melhor.',
    tagline: 'Noites construídas com precisão. Bem-vindo à Maandhoo.',
    corPrimaria: '#A8C5DA',
    corSecundaria: '#2A5F7A',
    corGlow: 'rgba(168,197,218,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #1A3A4A 0%, #4A90B0 50%, #A8D5F0 100%)',
    iconeId: 'compasso',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6J5NfMJS675',
    playlistNome: 'Deep House / Tech House',
    pesos: { sofisticado: 4, medio: 2, whisky: 4, bar: 3, allblack: 3, quinzenal: 2 },
  },

  // ── 4. O NÔMADE ─────────────────────────────────────────────────
  nomade: {
    id: 'nomade',
    nome: 'O Nômade',
    subtitulo: 'Uma noite, mil versões de você.',
    descricao: 'Pista, bar, camarote — você transita por todos os mundos com a mesma naturalidade. Nenhuma zona de conforto te prende. Você é movido pela curiosidade, pelo próximo som, pela próxima conversa que pode mudar tudo.',
    tagline: 'A Maandhoo tem um mundo novo para você explorar toda noite.',
    corPrimaria: '#B5A9FF',
    corSecundaria: '#5B3FCC',
    corGlow: 'rgba(181,169,255,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #3D1F8C 0%, #7B5EA7 50%, #C8B8FF 100%)',
    iconeId: 'bussola',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    playlistNome: 'Good Vibes Brasil',
    pesos: { ecletico: 4, flex: 4, de_tudo: 4, criativo: 3, madrugada: 2 },
  },

  // ── 5. O FANTASMA ────────────────────────────────────────────────
  fantasma: {
    id: 'fantasma',
    nome: 'O Fantasma',
    subtitulo: 'Presente em todo lugar. Identificado em nenhum.',
    descricao: 'Você chega quando ninguém espera, some quando todos estão procurando e deixa uma marca que dura dias. Misterioso por natureza, magnético por essência. As melhores histórias da noite sempre têm você como personagem — mesmo que ninguém saiba seu nome.',
    tagline: 'Alguns aparecem. Você surge. Bem-vindo à Maandhoo.',
    corPrimaria: '#8FFFDC',
    corSecundaria: '#00776A',
    corGlow: 'rgba(143,255,220,0.30)',
    gradienteBadge: 'linear-gradient(135deg, #003D35 0%, #00A896 50%, #8FFFDC 100%)',
    iconeId: 'lua',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6ujZpAN0v2l',
    playlistNome: 'Dark Techno / Industrial',
    pesos: { madrugada: 4, agua: 3, dark: 4, eletro: 3, raramente: 3 },
  },

  // ── 6. O MAESTRO ────────────────────────────────────────────────
  maestro: {
    id: 'maestro',
    nome: 'O Maestro',
    subtitulo: 'Você não ouve a música. Você a dirige.',
    descricao: 'A trilha sonora define tudo para você. Você sente cada batida no peito, cada transição na pele. Eletrônico, house, techno — não importa o gênero, importa a intensidade. Você e a pista têm um acordo tácito: ela nunca te decepciona.',
    tagline: 'A Maandhoo tem os sons que só você entende.',
    corPrimaria: '#FF3CAC',
    corSecundaria: '#7B2C8F',
    corGlow: 'rgba(255,60,172,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #4A0060 0%, #AA00FF 45%, #FF3CAC 100%)',
    iconeId: 'notas',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6ALfRKlHn1t',
    playlistNome: 'Electronic / House Progressivo',
    pesos: { eletro: 4, pista: 3, brilho: 2, cedo: 1, toda_semana: 2, madrugada: 3 },
  },

  // ── 7. O DIPLOMATA ───────────────────────────────────────────────
  diplomata: {
    id: 'diplomata',
    nome: 'O Diplomata',
    subtitulo: 'Você faz amigos onde vai. E os mantém.',
    descricao: 'Para você, a melhor parte da noite é a conversa que começa no bar e termina com um grupo novo de amigos. Você tem o dom de conectar pessoas, de criar memórias coletivas. Sua noite perfeita é aquela que todo mundo lembra juntos.',
    tagline: 'Na Maandhoo, as conexões que você faz duram além da madrugada.',
    corPrimaria: '#FFD166',
    corSecundaria: '#B07B00',
    corGlow: 'rgba(255,209,102,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #6B4A00 0%, #D4900A 50%, #FFE599 100%)',
    iconeId: 'estrelas',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4',
    playlistNome: 'Pop Hits Brasil',
    pesos: { bar: 4, pop: 3, medio: 2, casual: 3, quinzenal: 2, tropical: 2 },
  },

  // ── 8. O PREDADOR ────────────────────────────────────────────────
  predador: {
    id: 'predador',
    nome: 'O Predador',
    subtitulo: 'Você não procura a diversão. Ela te encontra.',
    descricao: 'Você entra na pista como quem entra em um campo que já domina. Confiante, presente, irresistível. Não existe barreira que você não quebre com um sorriso. A noite é sua e você sabe disso desde o primeiro segundo.',
    tagline: 'A Maandhoo é o palco perfeito para quem nasceu para brilhar.',
    corPrimaria: '#FF1744',
    corSecundaria: '#8B0000',
    corGlow: 'rgba(255,23,68,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #4A0010 0%, #CC0033 50%, #FF6680 100%)',
    iconeId: 'raio',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n',
    playlistNome: 'Funk Carioca',
    pesos: { tarde: 3, pista: 3, brilho: 4, funk: 3, toda_semana: 3, festeiro: 2 },
  },

  // ── 9. O CURADOR ────────────────────────────────────────────────
  curador: {
    id: 'curador',
    nome: 'O Curador',
    subtitulo: 'Você escolhe poucos momentos. E os torna inesquecíveis.',
    descricao: 'Você não está em toda festa — exatamente por isso, quando aparece, é um evento. Você pesquisa, seleciona e aparece apenas onde vale a pena. Sua presença é rara o suficiente para ser valiosa e intensa o suficiente para ser lembrada.',
    tagline: 'Você guardou a Maandhoo para uma noite especial. Ela vai retribuir.',
    corPrimaria: '#E8D5B0',
    corSecundaria: '#8A6A30',
    corGlow: 'rgba(232,213,176,0.30)',
    gradienteBadge: 'linear-gradient(135deg, #3A2A0A 0%, #8A6A30 50%, #E8D5B0 100%)',
    iconeId: 'diamante',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
    playlistNome: 'Mood Booster',
    pesos: { raramente: 4, whisky: 3, bar: 3, allblack: 2, casual: 2, sofisticado: 3 },
  },

  // ── 10. O ATIVADOR ──────────────────────────────────────────────
  ativador: {
    id: 'ativador',
    nome: 'O Ativador',
    subtitulo: 'A festa só começa quando você chega.',
    descricao: 'Você não espera o ambiente esquentar — você é o esquentamento. Chegou cedo, já conhece o staff, já está na pista quando os outros ainda estão no espelho. Você tem um talento raro: fazer qualquer pessoa se sentir bem-vinda.',
    tagline: 'A Maandhoo espera por quem chega antes de todos.',
    corPrimaria: '#00E5FF',
    corSecundaria: '#006B7A',
    corGlow: 'rgba(0,229,255,0.30)',
    gradienteBadge: 'linear-gradient(135deg, #003540 0%, #0090A8 50%, #00E5FF 100%)',
    iconeId: 'flash',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdxcBWuJkbcy',
    playlistNome: 'Dance / EDM',
    pesos: { cedo: 4, pista: 3, tropical: 2, criativo: 2, toda_semana: 4, ativador: 2 },
  },

  // ── 11. O LENDÁRIO ───────────────────────────────────────────────
  lendario: {
    id: 'lendario',
    nome: 'O Lendário',
    subtitulo: 'Histórias sobre você existem em cidades que você nem visitou.',
    descricao: 'Madrugada adentro, look temático, drink na mão e a energia de quem sabe que está vivendo uma história que vai contar por anos. Você não se preocupa com amanhã porque o agora é perfeito demais para desperdiçar. Cada noite sua é um capítulo.',
    tagline: 'A Maandhoo vai entrar nas suas histórias mais épicas.',
    corPrimaria: '#FFB830',
    corSecundaria: '#7A4800',
    corGlow: 'rgba(255,184,48,0.35)',
    gradienteBadge: 'linear-gradient(135deg, #3A1A00 0%, #C07000 45%, #FFD060 100%)',
    iconeId: 'trofeu',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2RxBh64BHjQ',
    playlistNome: 'Party Anthems',
    pesos: { madrugada: 3, criativo: 4, champagne: 2, pista: 2, toda_semana: 2, brilho: 2 },
  },

  // ── 12. O SEDUTOR ────────────────────────────────────────────────
  sedutor: {
    id: 'sedutor',
    nome: 'O Sedutor',
    subtitulo: 'Olhares que seguem. Presença que permanece.',
    descricao: 'Elegante, magnético e completamente à vontade. Você não precisa se esforçar para ser notado — a forma como você ocupa o espaço já diz tudo. Cada gesto é calculado sem parecer calculado. Você transforma qualquer ambiente em seu território.',
    tagline: 'Na Maandhoo, você não precisa se apresentar. Eles já sabem quem você é.',
    corPrimaria: '#E040FB',
    corSecundaria: '#6A0080',
    corGlow: 'rgba(224,64,251,0.30)',
    gradienteBadge: 'linear-gradient(135deg, #2A0035 0%, #8B00B5 50%, #E040FB 100%)',
    iconeId: 'diamante_oval',
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4SBhb3fqCJd',
    playlistNome: 'R&B / Neo Soul',
    pesos: { brilho: 3, champagne: 3, camarote: 2, medio: 3, sofisticado: 2, sedutor: 2 },
  },
}

// ── LÓGICA DE CÁLCULO DO PERFIL ────────────────────────────────────
// Mapeia cada resposta do quiz para sinais de personalidade

export const MAPA_RESPOSTAS: Record<string, string[]> = {
  // Chegada
  cedo:      ['ativador', 'arquiteto'],
  medio:     ['diplomata', 'arquiteto', 'sedutor'],
  tarde:     ['chama', 'predador', 'nomade'],
  madrugada: ['fantasma', 'lendario', 'nomade'],

  // Drink
  champagne: ['monarca', 'lendario', 'sedutor'],
  tropical:  ['chama', 'diplomata', 'ativador'],
  whisky:    ['arquiteto', 'curador', 'monarca'],
  agua:      ['fantasma', 'curador'],

  // Música
  funk:      ['chama', 'predador', 'lendario'],
  eletro:    ['maestro', 'fantasma', 'ativador'],
  pop:       ['diplomata', 'nomade', 'predador'],
  ecletico:  ['nomade', 'curador', 'diplomata'],

  // Grupo
  camarote:  ['monarca', 'sedutor', 'lendario'],
  pista:     ['maestro', 'chama', 'predador', 'ativador'],
  bar:       ['arquiteto', 'diplomata', 'curador'],
  flex:      ['nomade', 'fantasma'],

  // Traje
  allblack:  ['arquiteto', 'fantasma', 'monarca'],
  brilho:    ['chama', 'predador', 'sedutor', 'lendario'],
  casual:    ['diplomata', 'curador', 'nomade'],
  criativo:  ['lendario', 'ativador', 'nomade'],

  // Frequência
  toda_semana: ['chama', 'maestro', 'ativador', 'predador'],
  quinzenal:   ['diplomata', 'arquiteto', 'nomade'],
  raramente:   ['curador', 'fantasma', 'monarca'],
  primeira_vez: ['nomade', 'lendario'],

  // Humor
  intenso:    ['maestro', 'predador', 'chama'],
  relaxado:   ['curador', 'diplomata', 'arquiteto'],
  aventureiro: ['nomade', 'lendario', 'ativador'],
  romantico:  ['sedutor', 'fantasma', 'diplomata'],
}

export function calcularPerfilQuiz(respostas: Record<string, string>): PerfilQuiz {
  const pontuacao: Record<string, number> = {}

  // Inicializa todos os perfis com 0
  Object.keys(PERFIS_QUIZ).forEach(id => { pontuacao[id] = 0 })

  // Soma pontos para cada resposta
  Object.values(respostas).forEach(valor => {
    const perfisAfetados = MAPA_RESPOSTAS[valor] || []
    perfisAfetados.forEach(perfilId => {
      pontuacao[perfilId] = (pontuacao[perfilId] || 0) + 1
    })
  })

  // Pega o perfil com maior pontuação
  const vencedor = Object.entries(pontuacao)
    .sort((a, b) => b[1] - a[1])[0][0]

  return PERFIS_QUIZ[vencedor] || PERFIS_QUIZ.nomade
}
