import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest, ADMIN_ROLES } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname === '/login' ||
    pathname === '/cadastro' ||
    pathname === '/politica-de-privacidade' ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const user = await getAuthFromRequest(request)

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Área admin — apenas usuários internos
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!ADMIN_ROLES.includes(user.role)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/candidato/dashboard', request.url))
    }
  }

  // Área candidato — apenas candidatos
  if (pathname.startsWith('/candidato')) {
    if (user.role !== 'CANDIDATO') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.userId)
  requestHeaders.set('x-user-email', user.email)
  requestHeaders.set('x-user-name', user.name)
  requestHeaders.set('x-user-role', user.role)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
