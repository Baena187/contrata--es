import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { Role } from '@/types'
import { generateContractDocx } from '@/lib/contracts/generate-contract'
import type { ContractData } from '@/lib/contracts/render-contract-html'

function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return '___/___/______'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!can(user.role as Role, 'canGenerateContract')) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

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
        },
      },
    },
  })

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  if (!profile.contract) return NextResponse.json({ error: 'Crie um rascunho antes de gerar o contrato' }, { status: 400 })

  const c = profile.contract
  const isPj = profile.hiringType === 'REPRESENTANTE_PJ'

  // Validações
  const errors: string[] = []
  const repName = isPj ? profile.companyData?.corporateName : profile.fullName
  if (!repName) errors.push('Nome/Razão social do representante ausente')
  if (isPj && !profile.companyData?.cnpj) errors.push('CNPJ ausente')
  if (!isPj && !profile.cpf) errors.push('CPF ausente')
  if (!c.operationZone) errors.push('Zona de atuação não informada')
  if (!c.signatureDate) errors.push('Data de assinatura não informada')
  if (!c.signatureCity) errors.push('Cidade de assinatura não informada')
  if (c.witnesses.length === 0) errors.push('Pelo menos uma testemunha é obrigatória')
  if (c.commissions.length === 0) errors.push('Comissões não preenchidas')

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Dados insuficientes para gerar o contrato', errors }, { status: 422 })
  }

  const firstPartner = profile.partners?.[0]

  const contractData: ContractData = {
    representadaRazaoSocial: c.representadaRazaoSocial ?? 'FÓRMULA DISTRIBUIDORA DE ALIMENTOS LTDA',
    representadaCnpj: c.representadaCnpj ?? '13.555.022/0001-60',
    representadaEndereco: c.representadaEndereco ?? 'Rua São José, 69, Jardim América',
    representadaCidade: c.representadaCidade ?? 'Várzea Grande',
    representadaUf: c.representadaUf ?? 'MT',
    representadaCep: c.representadaCep ?? '78110-800',
    representadaRepresentanteLegal: c.representadaRepresentanteLegal ?? 'HELBERTY KOWALSKI GONÇALVES',
    representadaRepresentanteCpf: c.representadaRepresentanteCpf ?? '013.808.871-35',
    representadaRepresentanteRg: c.representadaRepresentanteRg ?? '13665359/SSP-MT',

    representanteRazaoSocial: isPj
      ? (profile.companyData?.corporateName ?? '')
      : (profile.fullName ?? ''),
    representanteNomeFantasia: profile.companyData?.tradeName ?? undefined,
    representanteCnpj: isPj ? (profile.companyData?.cnpj ?? undefined) : undefined,
    representanteCpf: !isPj ? (profile.cpf ?? undefined) : undefined,
    representanteRg: undefined,
    representanteEndereco: isPj
      ? (profile.companyData?.address ?? '')
      : (profile.address ?? ''),
    representanteNumero: isPj ? (profile.companyData?.number ?? undefined) : (profile.number ?? undefined),
    representanteComplemento: isPj ? (profile.companyData?.complement ?? undefined) : (profile.complement ?? undefined),
    representanteBairro: isPj ? (profile.companyData?.district ?? undefined) : (profile.district ?? undefined),
    representanteCidade: isPj
      ? (profile.companyData?.city ?? '')
      : (profile.city ?? ''),
    representanteUf: isPj
      ? (profile.companyData?.state ?? '')
      : (profile.state ?? ''),
    representanteCep: isPj ? (profile.companyData?.zipCode ?? undefined) : (profile.zipCode ?? undefined),
    representanteTelefone: isPj ? (profile.companyData?.phone ?? undefined) : (profile.phone ?? undefined),
    representanteEmail: isPj ? (profile.companyData?.email ?? undefined) : (profile.email ?? undefined),
    representanteCore: profile.commercialInfo?.hasCore ? (profile.commercialInfo.coreNumber ?? undefined) : undefined,
    representanteCoreValidade: profile.commercialInfo?.coreExpirationDate
      ? formatDateBR(profile.commercialInfo.coreExpirationDate)
      : undefined,
    socioNome: firstPartner?.fullName ?? undefined,
    socioCpf: firstPartner?.cpf ?? undefined,
    socioRg: firstPartner?.rg ?? undefined,

    operationZone: c.operationZone ?? '',
    signatureCity: c.signatureCity ?? 'Várzea Grande',
    signatureState: c.signatureState ?? 'MT',
    signatureDate: formatDateBR(c.signatureDate),
    startDate: c.startDate ? formatDateBR(c.startDate) : undefined,
    endDate: c.endDate ? formatDateBR(c.endDate) : undefined,
    prazoIndeterminado: !c.endDate,
    notes: c.notes ?? undefined,

    commissions: c.commissions.map((cm) => ({
      category: cm.category,
      minPercent: cm.minPercent,
      maxPercent: cm.maxPercent,
      observation: cm.observation ?? undefined,
    })),

    witness1Name: c.witnesses[0]?.name ?? 'TESTEMUNHA 1',
    witness1Cpf: c.witnesses[0]?.cpf ?? '000.000.000-00',
    witness2Name: c.witnesses[1]?.name ?? 'TESTEMUNHA 2',
    witness2Cpf: c.witnesses[1]?.cpf ?? '000.000.000-00',
  }

  let docxBuffer: Buffer
  try {
    docxBuffer = await generateContractDocx(contractData)
  } catch (docxErr: any) {
    console.error('[GENERATE DOCX ERROR]', docxErr)
    return NextResponse.json(
      { error: 'Erro ao gerar o arquivo DOCX', detail: docxErr.message },
      { status: 500 }
    )
  }
  const docxBase64 = docxBuffer.toString('base64')

  // Atualizar status do contrato e do candidato
  await prisma.generatedContract.update({
    where: { id: c.id },
    data: {
      status: 'GERADO',
      generatedById: user.userId,
    },
  })

  // Histórico do contrato
  await prisma.contractHistory.create({
    data: {
      generatedContractId: c.id,
      action: 'CONTRATO_GERADO',
      observation: `Contrato gerado por ${user.name}`,
      createdById: user.userId,
    },
  })

  // Histórico do candidato
  await prisma.statusHistory.create({
    data: {
      candidateProfileId: id,
      oldStatus: profile.status,
      newStatus: 'CONTRATO_GERADO',
      action: 'Contrato gerado',
      observation: `Contrato de representação comercial gerado por ${user.name}`,
      createdById: user.userId,
    },
  })

  // Atualizar status do candidato se estava APROVADO
  if (['APROVADO', 'CONTRATO_GERADO'].includes(profile.status)) {
    await prisma.candidateProfile.update({
      where: { id },
      data: { status: 'CONTRATO_GERADO' },
    })
  }

  return new NextResponse(Buffer.from(docxBase64, 'base64'), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="contrato-${(repName ?? 'representante').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.docx"`,
    },
  })
}
