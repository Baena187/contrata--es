import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { isAdminRole } from '@/lib/permissions'
import { Role } from '@/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userName = headersList.get('x-user-name')
  const userRole = headersList.get('x-user-role') as Role

  if (!userName || !isAdminRole(userRole)) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader userName={userName} userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
