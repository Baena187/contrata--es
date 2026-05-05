import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { Role } from '@/types'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!can(user.role as Role, 'canGenerateContract')) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { status, observation } = body

  const VALID_STATUSES = ['RASCUNHO', 'GERADO', 'ENVIADO_ASSINATURA', 'ASSINADO', 'CANCELADO']
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const contract = await prisma.generatedContract.findUnique({ where: { candidateProfileId: id } })
  if (!contract) return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })

  await prisma.generatedContract.update({
    where: { id: contract.id },
    data: { status },
  })

  const actionMap: Record<string, string> = {
    ENVIADO_ASSINATURA: 'ENVIADO_PARA_ASSINATURA',
    ASSINADO: 'CONTRATO_ASSINADO',
    CANCELADO: 'CONTRATO_CANCELADO',
  }

  await prisma.contractHistory.create({
    data: {
      generatedContractId: contract.id,
      action: actionMap[status] ?? `STATUS_${status}`,
      observation: observation ?? null,
      createdById: user.userId,
    },
  })

  // Atualizar status do candidato quando assinado
  if (status === 'ASSINADO') {
    const profile = await prisma.candidateProfile.findUnique({ where: { id } })
    await prisma.statusHistory.create({
      data: {
        candidateProfileId: id,
        oldStatus: profile?.status ?? '',
        newStatus: 'CONTRATO_ASSINADO',
        action: 'Contrato assinado',
        observation: observation ?? `Contrato marcado como assinado por ${user.name}`,
        createdById: user.userId,
      },
    })
    await prisma.candidateProfile.update({
      where: { id },
      data: { status: 'CONTRATO_ASSINADO' },
    })
  }

  return NextResponse.json({ success: true })
}
