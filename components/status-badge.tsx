import { CandidateStatus } from '@/types'
import { getStatusLabel, getStatusColor, cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: CandidateStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}

interface DocumentStatusBadgeProps {
  status: string
  className?: string
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const colors: Record<string, string> = {
    PENDENTE: 'bg-gray-100 text-gray-600',
    ENVIADO: 'bg-blue-100 text-blue-700',
    EM_ANALISE: 'bg-yellow-100 text-yellow-700',
    APROVADO: 'bg-green-100 text-green-700',
    RECUSADO: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = {
    PENDENTE: 'Pendente',
    ENVIADO: 'Enviado',
    EM_ANALISE: 'Em Análise',
    APROVADO: 'Aprovado',
    RECUSADO: 'Recusado',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colors[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {labels[status] || status}
    </span>
  )
}
