import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { UsuariosManager } from './usuarios-manager'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const headersList = await headers()
  const userRole = headersList.get('x-user-role')

  if (userRole !== 'ADMIN') redirect('/admin/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários Internos</h1>
        <p className="text-sm text-gray-500 mt-1">Gerenciar equipe de análise</p>
      </div>
      <UsuariosManager users={JSON.parse(JSON.stringify(users))} />
    </div>
  )
}
