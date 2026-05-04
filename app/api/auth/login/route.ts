import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { setAuthCookie } from '@/lib/auth'
import { isAdminRole } from '@/lib/permissions'
import { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    })

    const redirectTo = isAdminRole(user.role) ? '/admin/dashboard' : '/candidato/dashboard'
    return NextResponse.json({ success: true, redirectTo, role: user.role })
  } catch (error) {
    console.error('[AUTH LOGIN]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
