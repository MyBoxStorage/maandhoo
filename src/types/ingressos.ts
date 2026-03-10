// ============================================================
// TIPOS DO SISTEMA DE INGRESSOS — espelha tabelas Supabase
// ============================================================

export type TipoIngresso =
  | 'pista_masc'
  | 'pista_fem'
  | 'lista_masc'
  | 'lista_fem'
  | 'camarote'
  | 'cortesia'

export type StatusIngresso =
  | 'aguardando_cadastro'
  | 'pendente_pagamento'
  | 'ativo'
  | 'utilizado'
  | 'expirado'
  | 'cancelado'

export type GeneroIngresso = 'masculino' | 'feminino' | 'outro'

export type NivelAcesso = 'porteiro' | 'supervisor' | 'admin_saida'

export type ResultadoValidacaoTipo =
  | 'aprovado'
  | 'ja_utilizado'
  | 'lista_expirada'
  | 'ingresso_expirado'
  | 'ingresso_cancelado'
  | 'ingresso_invalido'
  | 'evento_errado'

// ─── TABELAS ─────────────────────────────────────────────────

export interface EventoDB {
  id: string
  nome: string
  descricao?: string
  data_evento: string
  hora_abertura: string
  hora_fechamento: string
  flyer_url?: string
  ativo: boolean
  capacidade_total: number
  lista_encerra_as: string
  casa_nome: string
  casa_logo_url?: string
  created_at: string
  updated_at: string
}

export interface LoteDB {
  id: string
  evento_id: string
  numero: number
  nome?: string
  preco_masc: number
  preco_fem: number
  preco_backstage_masc?: number | null
  preco_backstage_fem?: number | null
  limite_masc?: number
  limite_fem?: number
  vendidos_masc: number
  vendidos_fem: number
  ativo: boolean
  data_inicio?: string
  data_fim?: string
  created_at: string
  updated_at: string
}

export interface CamaroteDB {
  id: string
  evento_id: string
  identificador?: string
  nome?: string
  descricao?: string
  capacidade: number
  preco_total?: number
  disponivel?: boolean
  ativo?: boolean
  reservado_por?: string
  reservado_em?: string
  created_at: string
  updated_at?: string
}

export interface IngressoDB {
  id: string
  evento_id: string
  lote_id?: string
  camarote_id?: string
  cadastro_id?: string
  tipo: TipoIngresso
  status: StatusIngresso
  qr_token: string
  serial?: string
  preco_pago?: number
  expira_em?: string
  link_token?: string
  link_usado?: boolean
  qr_enviado?: boolean
  gerado_por?: string
  created_at: string
  updated_at?: string
}

export interface CadastroDB {
  id: string
  ingresso_id: string
  nome_completo: string
  cpf: string
  cpf_hash: string
  email: string
  whatsapp: string
  genero: GeneroIngresso
  qr_enviado: boolean
  qr_enviado_em?: string
  email_enviado?: string
  created_at: string
  updated_at: string
}

export interface PorteiroDB {
  id: string
  nome: string
  email: string
  senha_hash: string
  nivel: NivelAcesso
  ativo: boolean
  eventos_permitidos?: string[]
  ultimo_acesso?: string
  created_at: string
  updated_at: string
}

export interface ValidacaoDB {
  id: string
  ingresso_id?: string
  porteiro_id?: string
  evento_id?: string
  qr_token_lido: string
  resultado: ResultadoValidacaoTipo
  mensagem?: string
  ip_origem?: string
  dispositivo?: string
  created_at: string
}

// ─── PAYLOADS DE API ──────────────────────────────────────────

export interface CadastroPayload {
  link_token: string
  nome_completo: string
  cpf: string
  email: string
  whatsapp: string
  genero: GeneroIngresso
}

export interface ValidarQRPayload {
  qr_token: string
  porteiro_id: string
  evento_id: string
}

export interface ValidarQRResponse {
  aprovado: boolean
  resultado: ResultadoValidacaoTipo
  mensagem: string
  nome?: string
  tipo_ingresso?: string
  evento_nome?: string
  ingresso_id?: string
}

export interface GerarCamarotePayload {
  camarote_id: string
  gerado_por: string
  reservado_por: string
}

export interface IngressoComCadastro extends IngressoDB {
  cadastro?: CadastroDB
  evento?: EventoDB
  lote?: LoteDB
}
