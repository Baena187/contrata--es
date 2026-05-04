import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { XCircle } from 'lucide-react'
import { formatDate, getHiringTypeLabel } from '@/lib/utils'

export default async function ReprovadosPage() {
  const candidates = await prisma.candidateProfile.findMany({
    where: { status: 'REPROVADO' },
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      companyData: { select: { corporateName: true, cnpj: true } },
      statusHistories: {
        where: { newStatus: 'REPROVADO' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reprovados</h1>
        <p className="text-sm text-gray-500 mt-1">{candidates.length} cadastro(s) reprovado(s)</p>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-400">Nenhum cadastro reprovado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <Card key={c.id} className="border-red-200">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{c.fullName || c.companyData?.corporateName || c.user.name}</p>
                  <p className="text-xs text-gray-500">{c.cpf || c.companyData?.cnpj || c.user.email}</p>
                  {c.statusHistories[0]?.observation && (
                    <p className="text-xs text-red-600 mt-1">Motivo: {c.statusHistories[0].observation}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Reprovado em: {formatDate(c.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <Link href={`/admin/cadastros/${c.id}`} className="text-sm text-blue-600 hover:underline">Abrir</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
