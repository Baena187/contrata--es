import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { can } from '@/lib/permissions'
import { Role } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!can(user.role as Role, 'canChangeStatus')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, observation, action } = body

    const profile = await prisma.candidateProfile.findUnique({ where: { id } })
    if (!profile) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

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
    console.error('[ADMIN STATUS]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
