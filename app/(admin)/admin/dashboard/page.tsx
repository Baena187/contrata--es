import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { getHiringTypeLabel, formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  FileText, Clock, AlertCircle, CheckCircle, XCircle,
  FileSignature, Users, TrendingUp
} from 'lucide-react'
import { CandidateStatus } from '@/types'

async function getStats() {
  const [total, inAnalysis, withPending, approved, rejected, contractGenerated] = await Promise.all([
    prisma.candidateProfile.count({ where: { status: { not: 'RASCUNHO' } } }),
    prisma.candidateProfile.count({
      where: { status: { in: ['EM_ANALISE_RH', 'EM_ANALISE_FINANCEIRA', 'EM_ANALISE_JURIDICA', 'ENVIADO_PARA_ANALISE'] } }
    }),
    prisma.candidateProfile.count({ where: { status: 'DOCUMENTACAO_PENDENTE' } }),
    prisma.candidateProfile.count({ where: { status: 'APROVADO' } }),
    prisma.candidateProfile.count({ where: { status: 'REPROVADO' } }),
    prisma.candidateProfile.count({ where: { status: { in: ['CONTRATO_GERADO', 'CONTRATO_ASSINADO', 'FINALIZADO'] } } }),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sentToday = await prisma.candidateProfile.count({
    where: { submittedAt: { gte: today } }
  })

  return { total, sentToday, inAnalysis, withPending, approved, rejected, contractGenerated }
}

async function getRecentCandidates() {
  return prisma.candidateProfile.findMany({
    where: { status: { not: 'RASCUNHO' } },
    orderBy: { updatedAt: 'desc' },
    take: 8,
    include: {
      user: { select: { name: true, email: true } },
      companyData: { select: { cnpj: true } },
    },
  })
}

const statCards = [
  { label: 'Total de Cadastros', key: 'total', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Enviados Hoje', key: 'sentToday', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Em Análise', key: 'inAnalysis', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Com Pendência', key: 'withPending', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Aprovados', key: 'approved', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Reprovados', key: 'rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Contratos', key: 'contractGenerated', icon: FileSignature, color: 'text-teal-600', bg: 'bg-teal-50' },
]

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentCandidates()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral dos cadastros de representantes</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key as keyof typeof stats]
          return (
            <Card key={card.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} mb-3`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cadastros recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Cadastros Recentes</CardTitle>
          <Link href="/admin/cadastros" className="text-sm text-blue-600 hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Nenhum cadastro enviado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviado em</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.fullName || c.user.name}</p>
                          <p className="text-xs text-gray-400">{c.cpf || c.companyData?.cnpj || c.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {c.hiringType ? getHiringTypeLabel(c.hiringType) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {c.city && c.state ? `${c.city}/${c.state}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(c.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/cadastros/${c.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
