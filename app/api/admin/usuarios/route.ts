import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

const INTERNAL_ROLES = ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO']

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthCookie()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (!INTERNAL_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('ADMIN USUARIOS', 'Erro ao criar usuário', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
