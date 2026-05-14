import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { logger } from '@/lib/logger'
import { Role } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!can(user.role as Role, 'canViewInternalAnalysis')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const profile = await prisma.candidateProfile.findUnique({ where: { id } })
    if (!profile) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    await prisma.internalAnalysis.upsert({
      where: { candidateProfileId: id },
      update: {
        rhOpinion: body.rhOpinion || null,
        financialOpinion: body.financialOpinion || null,
        legalOpinion: body.legalOpinion || null,
        commercialObservation: body.commercialObservation || null,
        riskNotes: body.riskNotes || null,
        finalRecommendation: body.finalRecommendation || null,
      },
      create: {
        candidateProfileId: id,
        rhOpinion: body.rhOpinion || null,
        financialOpinion: body.financialOpinion || null,
        legalOpinion: body.legalOpinion || null,
        commercialObservation: body.commercialObservation || null,
        riskNotes: body.riskNotes || null,
        finalRecommendation: body.finalRecommendation || null,
        createdById: user.userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('ADMIN ANALISE', 'Erro ao salvar análise', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
