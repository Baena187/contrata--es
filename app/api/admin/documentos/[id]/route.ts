import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { Role } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!can(user.role as Role, 'canApproveDocuments')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, observation } = body

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
    console.error('[ADMIN DOC PATCH]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
