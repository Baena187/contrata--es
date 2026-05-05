import { prisma, withRetry } from '@/lib/db'
import { CandidateListFilters } from './list-filters'

export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  status?: string
  hiringType?: string
  state?: string
  page?: string
}

export default async function CadastrosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 20

  const where: any = {}

  if (params.q) {
    where.OR = [
      { fullName: { contains: params.q } },
      { cpf: { contains: params.q } },
      { email: { contains: params.q } },
      { user: { email: { contains: params.q } } },
      { companyData: { cnpj: { contains: params.q } } },
      { companyData: { corporateName: { contains: params.q } } },
    ]
  }

  if (params.status && params.status !== 'ALL') {
    where.status = params.status
  }

  if (params.hiringType && params.hiringType !== 'ALL') {
    where.hiringType = params.hiringType
  }

  if (params.state && params.state !== 'ALL') {
    where.state = params.state
  }

  const [candidates, total] = await withRetry(() => Promise.all([
    prisma.candidateProfile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        companyData: { select: { cnpj: true, corporateName: true } },
        commercialInfo: { select: { operationArea: true } },
      },
    }),
    prisma.candidateProfile.count({ where }),
  ]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cadastros</h1>
        <p className="text-sm text-gray-500 mt-1">{total} cadastro(s) encontrado(s)</p>
      </div>
      <CandidateListFilters
        candidates={JSON.parse(JSON.stringify(candidates))}
        total={total}
        page={page}
        pageSize={pageSize}
        currentFilters={params}
      />
    </div>
  )
}
