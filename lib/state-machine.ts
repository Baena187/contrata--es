import { CandidateStatus, Role } from '@/types'

// Transições permitidas para cada status atual.
// ADMIN pode sobrescrever qualquer transição (veja canTransition).
const ALLOWED_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> = {
  RASCUNHO: ['ENVIADO_PARA_ANALISE'],
  ENVIADO_PARA_ANALISE: ['EM_ANALISE_RH', 'DOCUMENTACAO_PENDENTE', 'REPROVADO'],
  DOCUMENTACAO_PENDENTE: ['ENVIADO_PARA_ANALISE'],
  EM_ANALISE_RH: ['EM_ANALISE_FINANCEIRA', 'APROVADO', 'REPROVADO', 'DOCUMENTACAO_PENDENTE'],
  EM_ANALISE_FINANCEIRA: ['EM_ANALISE_JURIDICA', 'APROVADO', 'REPROVADO', 'DOCUMENTACAO_PENDENTE'],
  EM_ANALISE_JURIDICA: ['APROVADO', 'REPROVADO', 'DOCUMENTACAO_PENDENTE'],
  APROVADO: ['CONTRATO_GERADO', 'REPROVADO'],
  REPROVADO: [],
  CONTRATO_GERADO: ['CONTRATO_ASSINADO', 'APROVADO'],
  CONTRATO_ASSINADO: ['FINALIZADO'],
  FINALIZADO: [],
}

/**
 * Verifica se a transição de status é permitida.
 * ADMIN pode fazer qualquer transição sem restrição.
 */
export function canTransition(
  from: CandidateStatus,
  to: CandidateStatus,
  role: Role
): boolean {
  if (role === 'ADMIN') return true
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function getAllowedNextStatuses(from: CandidateStatus, role: Role): CandidateStatus[] {
  if (role === 'ADMIN') return Object.keys(ALLOWED_TRANSITIONS) as CandidateStatus[]
  return ALLOWED_TRANSITIONS[from] ?? []
}
