'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, CheckCircle, XCircle,
  AlertCircle, Settings, BarChart3, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Role } from '@/types'

interface SidebarProps {
  userRole: Role
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'] },
  { href: '/admin/cadastros', label: 'Cadastros', icon: FileText, roles: ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'] },
  { href: '/admin/pendencias', label: 'Pendências', icon: AlertCircle, roles: ['ADMIN', 'RH'] },
  { href: '/admin/aprovados', label: 'Aprovados', icon: CheckCircle, roles: ['ADMIN', 'RH', 'FINANCEIRO', 'JURIDICO'] },
  { href: '/admin/reprovados', label: 'Reprovados', icon: XCircle, roles: ['ADMIN', 'RH'] },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['ADMIN'] },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users, roles: ['ADMIN'] },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings, roles: ['ADMIN'] },
]

export function AdminSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Building2 className="h-6 w-6 text-blue-400 mr-2" />
        <span className="font-semibold text-sm">Portal Representantes</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
