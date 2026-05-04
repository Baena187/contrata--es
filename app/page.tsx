import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth'
import { isAdminRole } from '@/lib/permissions'
import { Role } from '@/types'

export default async function HomePage() {
  const user = await getAuthCookie()

  if (!user) {
    redirect('/login')
  }

  if (isAdminRole(user.role as Role)) {
    redirect('/admin/dashboard')
  }

  redirect('/candidato/dashboard')
}
