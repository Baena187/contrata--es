import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { setAuthCookie } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Muitas tentativas de cadastro. Tente novamente em 1 hora.' },
      { status: 429 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }
    if (!PASSWORD_RULES.test(password)) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um número.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'CANDIDATO',
      },
    })

    // Criar perfil de candidato inicial
    await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        status: 'RASCUNHO',
        email: user.email,
      },
    })

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as import('@/types').Role,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('AUTH REGISTER', 'Erro ao criar conta', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
