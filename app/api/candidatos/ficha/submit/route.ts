import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.userId } })
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

    const allowedStatuses = ['RASCUNHO', 'DOCUMENTACAO_PENDENTE']
    if (!allowedStatuses.includes(profile.status)) {
      return NextResponse.json({ error: 'Cadastro não pode ser enviado neste status' }, { status: 400 })
    }

    const oldStatus = profile.status

    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        status: 'ENVIADO_PARA_ANALISE',
        submittedAt: new Date(),
      },
    })

    await prisma.statusHistory.create({
      data: {
        candidateProfileId: profile.id,
        oldStatus,
        newStatus: 'ENVIADO_PARA_ANALISE',
        action: 'Candidato enviou o cadastro para análise',
        createdById: user.userId,
      },
    })

    // Registrar declarações
    const declarations = [
      { key: 'declaration1', text: 'Informações verdadeiras e atualizadas', version: '1.0' },
      { key: 'declaration2', text: 'Ciência de não implicar contratação automática', version: '1.0' },
      { key: 'declaration3', text: 'Autorização de consultas cadastrais', version: '1.0' },
      { key: 'declaration4', text: 'Ciência da LGPD', version: '1.0' },
    ]

    for (const decl of declarations) {
      await prisma.declarationAcceptance.create({
        data: {
          candidateProfileId: profile.id,
          declarationType: decl.key,
          textVersion: decl.version,
          acceptedAt: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      })
    }

    // Resolver correções pendentes
    await prisma.correctionRequest.updateMany({
      where: { candidateProfileId: profile.id, status: 'PENDENTE' },
      data: { status: 'RESOLVIDO', resolvedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('FICHA SUBMIT', 'Erro ao enviar cadastro', error)
    return NextResponse.json({ error: 'Erro ao enviar cadastro' }, { status: 500 })
  }
}
