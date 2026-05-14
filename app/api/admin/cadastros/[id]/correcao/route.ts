import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import { Role } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!can(user.role as Role, 'canRequestCorrection')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { message, items } = body

    const profile = await prisma.candidateProfile.findUnique({ where: { id } })
    if (!profile) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    await prisma.correctionRequest.create({
      data: {
        candidateProfileId: id,
        message,
        status: 'PENDENTE',
        createdById: user.userId,
        items: {
          create: (items || []).map((item: any) => ({
            fieldName: item.field || null,
            description: item.desc || null,
          })),
        },
      },
    })

    await prisma.candidateProfile.update({ where: { id }, data: { status: 'DOCUMENTACAO_PENDENTE' } })

    await prisma.statusHistory.create({
      data: {
        candidateProfileId: id,
        oldStatus: profile.status,
        newStatus: 'DOCUMENTACAO_PENDENTE',
        action: 'Correção solicitada ao candidato',
        observation: message,
        createdById: user.userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('ADMIN CORRECAO', 'Erro ao solicitar correção', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
