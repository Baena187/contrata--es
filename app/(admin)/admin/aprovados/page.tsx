import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { CheckCircle } from 'lucide-react'
import { formatDate, getHiringTypeLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AprovadosPage() {
  const candidates = await prisma.candidateProfile.findMany({
    where: { status: { in: ['APROVADO', 'CONTRATO_GERADO', 'CONTRATO_ASSINADO', 'FINALIZADO'] } },
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      companyData: { select: { corporateName: true, cnpj: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aprovados</h1>
        <p className="text-sm text-gray-500 mt-1">{candidates.length} cadastro(s) aprovado(s)</p>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-400">Nenhum cadastro aprovado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{c.fullName || c.companyData?.corporateName || c.user.name}</p>
                    <p className="text-xs text-gray-400">{c.cpf || c.companyData?.cnpj || c.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.hiringType ? getHiringTypeLabel(c.hiringType) : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.city && c.state ? `${c.city}/${c.state}` : '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/cadastros/${c.id}`} className="text-sm text-blue-600 hover:underline">Abrir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
