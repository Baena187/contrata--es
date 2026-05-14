import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import { Role } from '@/types'

const REPRESENTADA = {
  razaoSocial:        process.env.REPRESENTADA_RAZAO_SOCIAL        ?? '',
  cnpj:               process.env.REPRESENTADA_CNPJ                ?? '',
  endereco:           process.env.REPRESENTADA_ENDERECO             ?? '',
  cidade:             process.env.REPRESENTADA_CIDADE               ?? '',
  uf:                 process.env.REPRESENTADA_UF                   ?? '',
  cep:                process.env.REPRESENTADA_CEP                  ?? '',
  representanteLegal: process.env.REPRESENTADA_REPRESENTANTE_LEGAL  ?? '',
  representanteCpf:   process.env.REPRESENTADA_REPRESENTANTE_CPF    ?? '',
  representanteRg:    process.env.REPRESENTADA_REPRESENTANTE_RG     ?? '',
  signatureCity:      process.env.REPRESENTADA_CIDADE               ?? '',
  signatureState:     process.env.REPRESENTADA_UF                   ?? '',
}

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

async function applyUpsert(contractId: string, body: any, userId: string, isNew: boolean) {
  const updated = await prisma.generatedContract.update({
    where: { id: contractId },
    data: {
      representadaRazaoSocial: body.representadaRazaoSocial ?? REPRESENTADA.razaoSocial,
      representadaCnpj: body.representadaCnpj ?? REPRESENTADA.cnpj,
      representadaEndereco: body.representadaEndereco ?? REPRESENTADA.endereco,
      representadaCidade: body.representadaCidade ?? REPRESENTADA.cidade,
      representadaUf: body.representadaUf ?? REPRESENTADA.uf,
      representadaCep: body.representadaCep ?? REPRESENTADA.cep,
      representadaRepresentanteLegal: body.representadaRepresentanteLegal ?? REPRESENTADA.representanteLegal,
      representadaRepresentanteCpf: body.representadaRepresentanteCpf ?? REPRESENTADA.representanteCpf,
      representadaRepresentanteRg: body.representadaRepresentanteRg ?? REPRESENTADA.representanteRg,
      operationZone: body.operationZone ?? null,
      signatureCity: body.signatureCity ?? REPRESENTADA.signatureCity,
      signatureState: body.signatureState ?? REPRESENTADA.signatureState,
      signatureDate: body.signatureDate ? new Date(body.signatureDate) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes ?? null,
      status: 'RASCUNHO',
    },
  })

  const commissions: any[] = body.commissions ?? DEFAULT_COMMISSIONS
  await prisma.contractCommission.deleteMany({ where: { generatedContractId: contractId } })
  if (commissions.length > 0) {
    await prisma.contractCommission.createMany({
      data: commissions.map((c: any) => ({
        generatedContractId: contractId,
        category: c.category,
        minPercent: Number(c.minPercent),
        maxPercent: Number(c.maxPercent),
        observation: c.observation ?? null,
      })),
    })
  }

  const witnesses: any[] = body.witnesses ?? DEFAULT_WITNESSES
  await prisma.contractWitness.deleteMany({ where: { generatedContractId: contractId } })
  if (witnesses.length > 0) {
    await prisma.contractWitness.createMany({
      data: witnesses.map((w: any) => ({
        generatedContractId: contractId,
        name: w.name,
        cpf: w.cpf,
        witnessOrder: Number(w.witnessOrder),
      })),
    })
  }

  await prisma.contractHistory.create({
    data: {
      generatedContractId: contractId,
      action: isNew ? 'RASCUNHO_CRIADO' : 'RASCUNHO_ATUALIZADO',
      observation: isNew ? 'Rascunho do contrato criado' : 'Rascunho atualizado',
      createdById: userId,
    },
  })

  return updated
}

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

// POST e PUT fazem upsert — o cliente pode chamar qualquer um
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return upsertHandler(request, params)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return upsertHandler(request, params)
}

async function upsertHandler(request: NextRequest, params: Promise<{ id: string }>) {
  const user = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!can(user.role as Role, 'canGenerateContract')) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params

  const profile = await prisma.candidateProfile.findUnique({ where: { id } })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    let existing = await prisma.generatedContract.findUnique({ where: { candidateProfileId: id } })
    let isNew = false

    if (!existing) {
      isNew = true
      existing = await prisma.generatedContract.create({
        data: {
          candidateProfileId: id,
          status: 'RASCUNHO',
          generatedById: user.userId,
        },
      })
    }

    const contract = await applyUpsert(existing.id, body, user.userId, isNew)

    const full = await prisma.generatedContract.findUnique({
      where: { id: contract.id },
      include: {
        commissions: { orderBy: { createdAt: 'asc' } },
        witnesses: { orderBy: { witnessOrder: 'asc' } },
        history: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { name: true, role: true } } },
        },
      },
    })

    return NextResponse.json({ contract: full })
  } catch (error: any) {
    logger.error('CONTRATO UPSERT', 'Erro ao salvar contrato', error)
    return NextResponse.json({ error: error.message ?? 'Erro interno' }, { status: 500 })
  }
}
