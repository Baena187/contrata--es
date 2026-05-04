import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CandidateStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('pt-BR')
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getStatusLabel(status: CandidateStatus | string): string {
  const labels: Record<string, string> = {
    RASCUNHO: 'Rascunho',
    ENVIADO_PARA_ANALISE: 'Enviado para Análise',
    DOCUMENTACAO_PENDENTE: 'Documentação Pendente',
    EM_ANALISE_RH: 'Em Análise - RH',
    EM_ANALISE_FINANCEIRA: 'Em Análise - Financeiro',
    EM_ANALISE_JURIDICA: 'Em Análise - Jurídico',
    APROVADO: 'Aprovado',
    REPROVADO: 'Reprovado',
    CONTRATO_GERADO: 'Contrato Gerado',
    CONTRATO_ASSINADO: 'Contrato Assinado',
    FINALIZADO: 'Finalizado',
  }
  return labels[status] || status
}

export function getStatusColor(status: CandidateStatus | string): string {
  const colors: Record<string, string> = {
    RASCUNHO: 'bg-gray-100 text-gray-700',
    ENVIADO_PARA_ANALISE: 'bg-blue-100 text-blue-700',
    DOCUMENTACAO_PENDENTE: 'bg-yellow-100 text-yellow-700',
    EM_ANALISE_RH: 'bg-purple-100 text-purple-700',
    EM_ANALISE_FINANCEIRA: 'bg-orange-100 text-orange-700',
    EM_ANALISE_JURIDICA: 'bg-indigo-100 text-indigo-700',
    APROVADO: 'bg-green-100 text-green-700',
    REPROVADO: 'bg-red-100 text-red-700',
    CONTRATO_GERADO: 'bg-teal-100 text-teal-700',
    CONTRATO_ASSINADO: 'bg-emerald-100 text-emerald-700',
    FINALIZADO: 'bg-slate-100 text-slate-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getHiringTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    REPRESENTANTE_PF: 'Representante Comercial PF',
    REPRESENTANTE_PJ: 'Representante Comercial PJ',
    CLT: 'Funcionário CLT',
    PRESTADOR: 'Prestador de Serviço',
    TERCEIRIZADO: 'Terceirizado',
  }
  return labels[type] || type
}

export function getDocumentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: 'Pendente',
    ENVIADO: 'Enviado',
    EM_ANALISE: 'Em Análise',
    APROVADO: 'Aprovado',
    RECUSADO: 'Recusado',
  }
  return labels[status] || status
}

export function getDocumentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDENTE: 'bg-gray-100 text-gray-600',
    ENVIADO: 'bg-blue-100 text-blue-700',
    EM_ANALISE: 'bg-yellow-100 text-yellow-700',
    APROVADO: 'bg-green-100 text-green-700',
    RECUSADO: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}
