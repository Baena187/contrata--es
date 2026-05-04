'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Building2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CandidatoHeaderProps {
  userName: string
  pageTitle?: string
}

export function CandidatoHeader({ userName, pageTitle }: CandidatoHeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-blue-600" />
        <div>
          <span className="font-semibold text-gray-800">Portal de Cadastro</span>
          {pageTitle && (
            <span className="text-gray-400 mx-2">|</span>
          )}
          {pageTitle && (
            <span className="text-gray-600 text-sm">{pageTitle}</span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:block text-sm font-medium">{userName}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{userName}</DropdownMenuLabel>
          <DropdownMenuLabel className="font-normal text-xs text-gray-500">Candidato</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={loading}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loading ? 'Saindo...' : 'Sair'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
