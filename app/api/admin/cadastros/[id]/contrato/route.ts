import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { Role } from '@/types'

const DEFAULT_COMMISSIONS = [
  { category: 'Massas e similares', minPercent: 1, maxPercent: 3 },
  { category: 'Farináceos e similares', minPercent: 1, maxPercent: 5 },
  { category: 'Cafés', minPercent: 1, maxPercent: 5 },
  { category: 'Biscoitos e similares', minPercent: 1, maxPercent: 4 },
  { category: 'Conservas e enlatados', minPercent: 1, maxPercent: 4 },
  { category: 'Condimentos e especiarias', minPercent: 1, maxPercent: 5 },
  { category: 'Guloseimas', minPercent: 1, maxPercent: 5 },
  { category: 'Balas e chicletes', minPercent: 1, maxPercent: 4 },
  { category: 'Doces e derivados do leite', minPercent: 1, maxPercent: 5 },
  { category: 'Ração animal', minPercent: 1, maxPercent: 4 },
]

const DEFAULT_WITNESSES = [
  { witnessOrder: 1, name: 'VALMIR JOSE DA SILVA', cpf: '395.847.041-68' },
  { witnessOrder: 2, name: 'MARIA APARECIDA BARBOSA', cpf: '672.862.671-91' },
]

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!can(user.role as Role, 'canViewContract')) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params

  const profile = await prisma.candidateProfile.findUnique({
    where: { id },
    include: {
      companyData: true,
      partners: true,
      commercialInfo: true,
      contract: {
        include: {
          commissions: { orderBy: { createdAt: 'asc' } },
          witnesses: { orderBy: { witnessOrder: 'asc' } },
          history: {
            orderBy: { createdAt: 'desc' },
            include: { createdBy: { select: { name: true, role: true } } },
          },
          generatedBy: { select: { name: true } },
        },
      },
    },
  })

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  return NextResponse.json({ profile, contract: profile.contract })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!can(user.role as Role, 'canGenerateContract')) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const profile = await prisma.candidateProfile.findUnique({ where: { id } })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const existing = await prisma.generatedContract.findUnique({ where: { candidateProfileId: id } })
  if (existing) return NextResponse.json({ error: 'Contrato já existe. Use PUT para atualizar.' }, { status: 409 })

  const contract = await prisma.generatedContract.create({
    data: {
      candidateProfileId: id,
      status: 'RASCUNHO',
      representadaRazaoSocial: body.representadaRazaoSocial ?? 'FÓRMULA DISTRIBUIDORA DE ALIMENTOS LTDA',
      representadaCnpj: body.representadaCnpj ?? '13.555.022/0001-60',
      representadaEndereco: body.representadaEndereco ?? 'Rua São José, 69, Jardim América',
      representadaCidade: body.representadaCidade ?? 'Várzea Grande',
      representadaUf: body.representadaUf ?? 'MT',
      representadaCep: body.representadaCep ?? '78110-800',
      representadaRepresentanteLegal: body.representadaRepresentanteLegal ?? 'HELBERTY KOWALSKI GONÇALVES',
      representadaRepresentanteCpf: body.representadaRepresentanteCpf ?? '013.808.871-35',
      representadaRepresentanteRg: body.representadaRepresentanteRg ?? '13665359/SSP-MT',
      operationZone: body.operationZone ?? null,
      signatureCity: body.signatureCity ?? 'Várzea Grande',
      signatureState: body.signatureState ?? 'MT',
      signatureDate: body.signatureDate ? new Date(body.signatureDate) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes ?? null,
      generatedById: user.userId,
      commissions: {
        create: (body.commissions ?? DEFAULT_COMMISSIONS).map((c: any) => ({
          category: c.category,
          minPercent: c.minPercent,
          maxPercent: c.maxPercent,
          observation: c.observation ?? null,
        })),
      },
      witnesses: {
        create: (body.witnesses ?? DEFAULT_WITNESSES).map((w: any) => ({
          name: w.name,
          cpf: w.cpf,
          witnessOrder: w.witnessOrder,
        })),
      },
      history: {
        create: {
          action: 'RASCUNHO_CRIADO',
          observation: 'Rascunho do contrato criado',
          createdById: user.userId,
        },
      },
    },
    include: { commissions: true, witnesses: true, history: true },
  })

  return NextResponse.json({ contract })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!can(user.role as Role, 'canGenerateContract')) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const contract = await prisma.generatedContract.findUnique({ where: { candidateProfileId: id } })
  if (!contract) return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })

  const updated = await prisma.generatedContract.update({
    where: { candidateProfileId: id },
    data: {
      representadaRazaoSocial: body.representadaRazaoSocial,
      representadaCnpj: body.representadaCnpj,
      representadaEndereco: body.representadaEndereco,
      representadaCidade: body.representadaCidade,
      representadaUf: body.representadaUf,
      representadaCep: body.representadaCep,
      representadaRepresentanteLegal: body.representadaRepresentanteLegal,
      representadaRepresentanteCpf: body.representadaRepresentanteCpf,
      representadaRepresentanteRg: body.representadaRepresentanteRg,
      operationZone: body.operationZone,
      signatureCity: body.signatureCity,
      signatureState: body.signatureState,
      signatureDate: body.signatureDate ? new Date(body.signatureDate) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes,
      status: contract.status === 'NAO_GERADO' ? 'RASCUNHO' : contract.status,
    },
  })

  // Atualizar comissões
  if (body.commissions) {
    await prisma.contractCommission.deleteMany({ where: { generatedContractId: contract.id } })
    await prisma.contractCommission.createMany({
      data: body.commissions.map((c: any) => ({
        generatedContractId: contract.id,
        category: c.category,
        minPercent: c.minPercent,
        maxPercent: c.maxPercent,
        observation: c.observation ?? null,
      })),
    })
  }

  // Atualizar testemunhas
  if (body.witnesses) {
    await prisma.contractWitness.deleteMany({ where: { generatedContractId: contract.id } })
    await prisma.contractWitness.createMany({
      data: body.witnesses.map((w: any) => ({
        generatedContractId: contract.id,
        name: w.name,
        cpf: w.cpf,
        witnessOrder: w.witnessOrder,
      })),
    })
  }

  // Histórico de rascunho atualizado
  await prisma.contractHistory.create({
    data: {
      generatedContractId: contract.id,
      action: 'RASCUNHO_ATUALIZADO',
      observation: 'Rascunho atualizado',
      createdById: user.userId,
    },
  })

  return NextResponse.json({ contract: updated })
}
