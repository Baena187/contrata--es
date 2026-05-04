import { formatDateTime } from '@/lib/utils'
import { CheckCircle, Clock, AlertCircle, XCircle, FileText } from 'lucide-react'

interface TimelineItem {
  id: string
  action: string
  newStatus: string
  oldStatus?: string | null
  observation?: string | null
  createdAt: Date | string
  createdBy?: {
    name: string
    role: string
  } | null
}

interface StatusTimelineProps {
  items: TimelineItem[]
}

const statusIcons: Record<string, React.ReactNode> = {
  APROVADO: <CheckCircle className="h-5 w-5 text-green-600" />,
  REPROVADO: <XCircle className="h-5 w-5 text-red-600" />,
  DOCUMENTACAO_PENDENTE: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  FINALIZADO: <CheckCircle className="h-5 w-5 text-slate-600" />,
  CONTRATO_GERADO: <FileText className="h-5 w-5 text-teal-600" />,
}

export function StatusTimeline({ items }: StatusTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nenhum histórico encontrado.
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx < items.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                  {statusIcons[item.newStatus] || <Clock className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    {item.observation && (
                      <p className="mt-0.5 text-sm text-gray-500">{item.observation}</p>
                    )}
                    {item.createdBy && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        por {item.createdBy.name}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
