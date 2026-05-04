import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

export async function GET() {
  const user = await getAuthCookie()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  return NextResponse.json({ user })
}
