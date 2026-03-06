// ============================================
// TIPOS CENTRAIS DO MAANDHOO CLUB
// ============================================

export type UserRole = 'admin' | 'operador' | 'porteiro'

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  criadoEm: Date
}

export interface Lote {
  id: string
  eventoId: string
  numero: number
  nome: string
  precoMasculino: number
  precoFeminino: number
  qtdMasculino: number
  qtdFeminino: number
  vendidoMasculino: number
  vendidoFeminino: number
  ativo: boolean
  ordem: number
}

export type StatusEvento = 'rascunho' | 'publicado' | 'encerrado' | 'cancelado'

export interface Evento {
  id: string
  slug: string
  nome: string
  data: Date
  hora: string
  descricao?: string
  flyerUrl?: string
  status: StatusEvento
  temLista: boolean
  limiteListaMasc?: number
  limiteListaFem?: number
  prazoLista?: Date
  lotes: Lote[]
  criadoEm: Date
  atualizadoEm: Date
}

export type TipoIngresso = 'pista' | 'backstage'
export type GeneroIngresso = 'masculino' | 'feminino'
export type StatusIngresso = 'pendente' | 'pago' | 'usado' | 'cancelado' | 'reembolsado'

export interface Ingresso {
  id: string
  eventoId: string
  evento?: Evento
  loteId: string
  compradorNome: string
  compradorCpf: string
  compradorEmail: string
  compradorWhatsapp?: string
  tipo: TipoIngresso
  genero: GeneroIngresso
  preco: number
  serial: string
  qrHash: string
  status: StatusIngresso
  pagamentoId?: string
  pagamentoMetodo?: 'pix' | 'cartao'
  usadoEm?: Date
  criadoEm: Date
}

export type GeneroLista = 'masculino' | 'feminino'
export type StatusListaAmiga = 'ativo' | 'usado' | 'expirado'

export interface ListaAmigaItem {
  id: string
  eventoId: string
  evento?: Evento
  nome: string
  email: string
  genero: GeneroLista
  qrCode: string
  status: StatusListaAmiga
  criadoEm: Date
}

export type TipoReserva = 'mesa' | 'camarote' | 'aniversario'
export type StatusReserva = 'pendente' | 'confirmada' | 'cancelada'

export interface Reserva {
  id: string
  tipo: TipoReserva
  eventoId?: string
  nome: string
  email: string
  whatsapp: string
  numeroPessoas: number
  areaDesejada?: string
  observacoes?: string
  dataAniversario?: Date
  status: StatusReserva
  criadoEm: Date
}

export type CategoriaCardapio =
  | 'drinks'
  | 'longneck'
  | 'doses'
  | 'soft'
  | 'combos'
  | 'espumantes'
  | 'outros'

export interface ItemCardapio {
  id: string
  categoria: CategoriaCardapio
  nome: string
  descricao?: string
  preco: number
  disponivel: boolean
  destaque: boolean
  ordem: number
}

export interface GaleriaFoto {
  id: string
  eventoId?: string
  url: string
  alt?: string
  ordem: number
  criadoEm: Date
}

export interface PagamentoMercadoPago {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  statusDetail: string
  transactionAmount: number
  pixQrCode?: string
  pixQrCodeBase64?: string
  pixCopiaECola?: string
  expiresAt?: Date
}
