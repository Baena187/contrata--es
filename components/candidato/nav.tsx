'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Upload, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/candidato/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/candidato/ficha', label: 'Minha Ficha', icon: FileText },
  { href: '/candidato/documentos', label: 'Documentos', icon: Upload },
  { href: '/candidato/status', label: 'Status', icon: Clock },
  { href: '/candidato/pendencias', label: 'Pendências', icon: AlertCircle },
]

export function CandidatoNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b bg-white px-4 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
