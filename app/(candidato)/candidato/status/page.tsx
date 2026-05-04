import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { StatusTimeline } from '@/components/status-timeline'
import { formatDate } from '@/lib/utils'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_FLOW = [
  { status: 'RASCUNHO', label: 'Rascunho' },
  { status: 'ENVIADO_PARA_ANALISE', label: 'Enviado para Análise' },
  { status: 'EM_ANALISE_RH', label: 'Análise RH' },
  { status: 'EM_ANALISE_FINANCEIRA', label: 'Análise Financeira' },
  { status: 'EM_ANALISE_JURIDICA', label: 'Análise Jurídica' },
  { status: 'APROVADO', label: 'Aprovado' },
]

export default async function StatusPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      statusHistories: {
        orderBy: { createdAt: 'asc' },
        include: { createdBy: { select: { name: true, role: true } } },
      },
    },
  })

  if (!profile) redirect('/login')

  const currentIndex = STATUS_FLOW.findIndex((s) => s.status === profile.status)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Status do Processo</h2>
        <p className="text-sm text-gray-500 mt-1">Acompanhe a evolução do seu cadastro</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Status atual</p>
              <StatusBadge status={profile.status} className="mt-1 text-sm" />
            </div>
            {profile.submittedAt && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Enviado em</p>
                <p className="text-sm font-medium">{formatDate(profile.submittedAt)}</p>
              </div>
            )}
          </div>

          {profile.status !== 'REPROVADO' && (
            <div className="mt-6 overflow-x-auto">
              <div className="flex items-start min-w-max gap-0">
                {STATUS_FLOW.map((step, idx) => {
                  const isDone = currentIndex > idx
                  const isCurrent = currentIndex === idx
                  return (
                    <div key={step.status} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                          isDone ? 'border-green-500 bg-green-500' : isCurrent ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                        )}>
                          {isDone ? <CheckCircle className="h-4 w-4 text-white" /> : isCurrent ? <Clock className="h-4 w-4 text-white" /> : <Circle className="h-4 w-4 text-gray-300" />}
                        </div>
                        <p className={cn('mt-2 text-xs text-center w-20', isCurrent ? 'font-medium text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400')}>
                          {step.label}
                        </p>
                      </div>
                      {idx < STATUS_FLOW.length - 1 && (
                        <div className={cn('h-0.5 w-12 mx-1 mb-6', isDone ? 'bg-green-500' : 'bg-gray-200')} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {profile.status === 'REPROVADO' && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-700 text-sm font-medium">Cadastro Reprovado</p>
              <p className="text-red-600 text-sm mt-1">Entre em contato com nossa equipe para mais informações.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Histórico Completo</CardTitle></CardHeader>
        <CardContent><StatusTimeline items={profile.statusHistories} /></CardContent>
      </Card>
    </div>
  )
}
