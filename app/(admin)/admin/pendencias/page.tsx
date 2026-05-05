import { prisma, withRetry } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { AlertCircle } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PendenciasPage() {
  const candidates = await withRetry(() => prisma.candidateProfile.findMany({
    where: { status: 'DOCUMENTACAO_PENDENTE' },
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      correctionRequests: {
        where: { status: 'PENDENTE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { createdBy: { select: { name: true } } },
      },
    },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pendências</h1>
        <p className="text-sm text-gray-500 mt-1">{candidates.length} cadastro(s) aguardando correção</p>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-400">Nenhuma pendência no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <Card key={c.id} className="border-yellow-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {c.fullName || c.user.name}
                      </p>
                      <p className="text-xs text-gray-500">{c.user.email}</p>
                      {c.correctionRequests[0] && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Solicitado por {c.correctionRequests[0].createdBy?.name || 'RH'} em {formatDateTime(c.correctionRequests[0].createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    <Link
                      href={`/admin/cadastros/${c.id}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
