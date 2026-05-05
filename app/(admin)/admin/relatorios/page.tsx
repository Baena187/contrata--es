import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHiringTypeLabel, getStatusLabel } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RelatoriosPage() {
  const [byStatus, byType, byState, byMonth] = await Promise.all([
    prisma.candidateProfile.groupBy({ by: ['status'], _count: true }),
    prisma.candidateProfile.groupBy({ by: ['hiringType'], _count: true, where: { hiringType: { not: null } } }),
    prisma.candidateProfile.groupBy({ by: ['state'], _count: true, where: { state: { not: null } }, orderBy: { _count: { state: 'desc' } }, take: 10 }),
    prisma.candidateProfile.findMany({
      where: { submittedAt: { not: null } },
      select: { submittedAt: true },
      orderBy: { submittedAt: 'desc' },
    }),
  ])

  const monthCounts: Record<string, number> = {}
  byMonth.forEach((p) => {
    if (!p.submittedAt) return
    const key = new Date(p.submittedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    monthCounts[key] = (monthCounts[key] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Análise de dados do portal</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{getStatusLabel(s.status as any)}</span>
                  <span className="text-sm font-bold text-gray-900">{s._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Tipo de Contratação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byType.map((t) => (
                <div key={t.hiringType} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.hiringType ? getHiringTypeLabel(t.hiringType) : '-'}</span>
                  <span className="text-sm font-bold text-gray-900">{t._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Estado (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byState.map((s) => (
                <div key={s.state} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{s.state}</span>
                  <span className="text-sm font-bold text-gray-900">{s._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Mês de Envio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(monthCounts).slice(0, 12).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{month}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
              {Object.keys(monthCounts).length === 0 && (
                <p className="text-sm text-gray-400">Sem dados ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
