import { Role } from '@/types'

export const PERMISSIONS = {
  canViewAllCandidates: ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'] as Role[],
  canApproveCandidates: ['ADMIN', 'RH'] as Role[],
  canRejectCandidates: ['ADMIN', 'RH'] as Role[],
  canRequestCorrection: ['ADMIN', 'RH'] as Role[],
  canViewBankData: ['ADMIN', 'RH', 'FINANCEIRO'] as Role[],
  canAddFinancialOpinion: ['ADMIN', 'FINANCEIRO'] as Role[],
  canAddLegalOpinion: ['ADMIN', 'JURIDICO'] as Role[],
  canAddRHOpinion: ['ADMIN', 'RH'] as Role[],
  canManageUsers: ['ADMIN'] as Role[],
  canChangeStatus: ['ADMIN', 'RH'] as Role[],
  canApproveDocuments: ['ADMIN', 'RH'] as Role[],
  canGeneratePDF: ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'] as Role[],
  canViewInternalAnalysis: ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'] as Role[],
} as const

export function can(userRole: Role, permission: keyof typeof PERMISSIONS): boolean {
  if (userRole === 'ADMIN') return true
  return (PERMISSIONS[permission] as Role[]).includes(userRole)
}

export function isAdminRole(role: Role | string): boolean {
  return ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'].includes(role)
}
