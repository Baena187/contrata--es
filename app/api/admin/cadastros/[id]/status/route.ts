import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { canTransition } from '@/lib/state-machine'
import { logger } from '@/lib/logger'
import { Role, CandidateStatus } from '@/types'

const VALID_STATUSES: CandidateStatus[] = [
  'RASCUNHO', 'ENVIADO_PARA_ANALISE', 'DOCUMENTACAO_PENDENTE',
  'EM_ANALISE_RH', 'EM_ANALISE_FINANCEIRA', 'EM_ANALISE_JURIDICA',
  'APROVADO', 'REPROVADO', 'CONTRATO_GERADO', 'CONTRATO_ASSINADO', 'FINALIZADO',
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!can(user.role as Role, 'canChangeStatus')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id } = await params
    const { status, observation, action } = body as { status: string; observation?: string; action?: string }

    if (!status || !VALID_STATUSES.includes(status as CandidateStatus)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const profile = await prisma.candidateProfile.findUnique({ where: { id } })
    if (!profile) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    if (!canTransition(profile.status as CandidateStatus, status as CandidateStatus, user.role as Role)) {
      return NextResponse.json(
        { error: `Transição de "${profile.status}" para "${status}" não é permitida para o seu perfil.` },
        { status: 422 }
      )
    }

    await prisma.candidateProfile.update({ where: { id }, data: { status } })

    await prisma.statusHistory.create({
      data: {
        candidateProfileId: id,
        oldStatus: profile.status,
        newStatus: status,
        action: action || `Status alterado para ${status}`,
        observation: observation || null,
        createdById: user.userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('ADMIN STATUS', 'Erro ao alterar status', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
