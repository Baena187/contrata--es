// Como o schema usa String em vez de enums (SQLite), definimos os valores como constantes
export type Role = 'CANDIDATO' | 'RH' | 'FINANCEIRO' | 'JURIDICO' | 'ADMIN'
export type CandidateStatus =
  | 'RASCUNHO'
  | 'ENVIADO_PARA_ANALISE'
  | 'DOCUMENTACAO_PENDENTE'
  | 'EM_ANALISE_RH'
  | 'EM_ANALISE_FINANCEIRA'
  | 'EM_ANALISE_JURIDICA'
  | 'APROVADO'
  | 'REPROVADO'
  | 'CONTRATO_GERADO'
  | 'CONTRATO_ASSINADO'
  | 'FINALIZADO'
export type HiringType = 'REPRESENTANTE_PF' | 'REPRESENTANTE_PJ' | 'CLT' | 'PRESTADOR' | 'TERCEIRIZADO'
export type DocumentStatus = 'PENDENTE' | 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'RECUSADO'
export type Gender = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO'
export type MaritalStatus = 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'UNIAO_ESTAVEL' | 'OUTRO'
export type AccountType = 'CORRENTE' | 'POUPANCA' | 'PAGAMENTO'
export type CorrectionStatus = 'PENDENTE' | 'RESOLVIDO' | 'CANCELADO'
export type ContractStatus =
  | 'NAO_GERADO'
  | 'RASCUNHO'
  | 'GERADO'
  | 'ENVIADO_ASSINATURA'
  | 'ASSINADO'
  | 'CANCELADO'

export interface UserSession {
  userId: string
  email: string
  name: string
  role: Role
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DashboardStats {
  total: number
  sentToday: number
  inAnalysis: number
  withPending: number
  approved: number
  rejected: number
  contractGenerated: number
}

export interface DocumentType {
  key: string
  name: string
  required: boolean
  hiringTypes: HiringType[]
  description?: string
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'contrato_social',
    name: 'Contrato Social / Requerimento de Empresário',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ'],
    description: 'Contrato social e últimas alterações ou Requerimento de Empresário',
  },
  {
    key: 'cartao_cnpj',
    name: 'Cartão CNPJ',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ'],
    description: 'Cartão CNPJ atualizado',
  },
  {
    key: 'cpf_socios',
    name: 'CPF dos Sócios',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ'],
    description: 'Cópia do CPF de todos os sócios',
  },
  {
    key: 'rg_socios',
    name: 'RG dos Sócios',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ'],
    description: 'Cópia do RG de todos os sócios',
  },
  {
    key: 'alvara',
    name: 'Alvará de Funcionamento',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ'],
    description: 'Alvará de funcionamento atualizado',
  },
  {
    key: 'comp_endereco_empresa',
    name: 'Comprovante de Endereço da Empresa',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ'],
    description: 'Comprovante de endereço da empresa (últimos 3 meses)',
  },
  {
    key: 'registro_core',
    name: 'Registro no CORE/COREMAT',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ', 'REPRESENTANTE_PF'],
    description: 'Registro no CORE ou COREMAT válido',
  },
  {
    key: 'comp_endereco_pessoal',
    name: 'Comprovante de Endereço Residencial',
    required: true,
    hiringTypes: ['REPRESENTANTE_PJ', 'REPRESENTANTE_PF', 'CLT', 'PRESTADOR'],
    description: 'Comprovante de endereço residencial (últimos 3 meses)',
  },
  {
    key: 'cpf_pf',
    name: 'CPF',
    required: true,
    hiringTypes: ['REPRESENTANTE_PF', 'CLT', 'PRESTADOR'],
    description: 'Cópia do CPF',
  },
  {
    key: 'rg_pf',
    name: 'RG',
    required: true,
    hiringTypes: ['REPRESENTANTE_PF', 'CLT', 'PRESTADOR'],
    description: 'Cópia do RG',
  },
]

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const BANKS = [
  'Banco do Brasil',
  'Bradesco',
  'Caixa Econômica Federal',
  'Itaú',
  'Santander',
  'Nubank',
  'Inter',
  'C6 Bank',
  'Sicoob',
  'Sicredi',
  'BTG Pactual',
  'Original',
  'PicPay',
  'Mercado Pago',
  'Outro',
]
