import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import { Role, DocumentStatus } from '@/types'

const VALID_DOC_STATUSES: DocumentStatus[] = ['PENDENTE', 'ENVIADO', 'EM_ANALISE', 'APROVADO', 'RECUSADO']

export async function PATCH(
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
    if (!can(user.role as Role, 'canApproveDocuments')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id } = await params
    const { status, observation } = body as { status: string; observation?: string }

    if (!status || !VALID_DOC_STATUSES.includes(status as DocumentStatus)) {
      return NextResponse.json({ error: 'Status de documento inválido' }, { status: 400 })
    }

    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    await prisma.document.update({
      where: { id },
      data: {
        status,
        adminObservation: observation || null,
        reviewedAt: new Date(),
        reviewedById: user.userId,
      },
    })

    await prisma.statusHistory.create({
      data: {
        candidateProfileId: doc.candidateProfileId,
        oldStatus: doc.status,
        newStatus: doc.status,
        action: `Documento ${status === 'APROVADO' ? 'aprovado' : 'recusado'}: ${doc.documentType}`,
        observation: observation || null,
        createdById: user.userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('ADMIN DOCUMENTO', 'Erro ao atualizar status do documento', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
