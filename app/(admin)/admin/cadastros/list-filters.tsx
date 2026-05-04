'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { getHiringTypeLabel, formatDate } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { BRAZILIAN_STATES } from '@/types'
import { CandidateStatus } from '@/types'

interface Props {
  candidates: any[]
  total: number
  page: number
  pageSize: number
  currentFilters: any
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'ENVIADO_PARA_ANALISE', label: 'Enviado para Análise' },
  { value: 'DOCUMENTACAO_PENDENTE', label: 'Documentação Pendente' },
  { value: 'EM_ANALISE_RH', label: 'Em Análise - RH' },
  { value: 'EM_ANALISE_FINANCEIRA', label: 'Em Análise - Financeiro' },
  { value: 'EM_ANALISE_JURIDICA', label: 'Em Análise - Jurídico' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'CONTRATO_GERADO', label: 'Contrato Gerado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
]

const HIRING_OPTIONS = [
  { value: 'ALL', label: 'Todos os tipos' },
  { value: 'REPRESENTANTE_PJ', label: 'Representante PJ' },
  { value: 'REPRESENTANTE_PF', label: 'Representante PF' },
  { value: 'CLT', label: 'CLT' },
  { value: 'PRESTADOR', label: 'Prestador' },
  { value: 'TERCEIRIZADO', label: 'Terceirizado' },
]

export function CandidateListFilters({ candidates, total, page, pageSize, currentFilters }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(currentFilters.q || '')

  function applyFilters(updates: Record<string, string>) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, page: '1', ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'ALL') params.set(k, v as string)
    })
    router.push(`/admin/cadastros?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters({ q })
  }

  const totalPages = Math.ceil(total / pageSize)

  function goToPage(p: number) {
    applyFilters({ page: p.toString() })
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Select
            value={currentFilters.status || 'ALL'}
            onValueChange={(v) => applyFilters({ status: v })}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentFilters.hiringType || 'ALL'}
            onValueChange={(v) => applyFilters({ hiringType: v })}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HIRING_OPTIONS.map((h) => (
                <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentFilters.state || 'ALL'}
            onValueChange={(v) => applyFilters({ state: v })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos UF</SelectItem>
              {BRAZILIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(currentFilters.q || currentFilters.status || currentFilters.hiringType || currentFilters.state) && (
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/cadastros')}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400">Nenhum cadastro encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF / CNPJ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviado em</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.fullName || c.companyData?.corporateName || c.user.name}
                        </p>
                        <p className="text-xs text-gray-400">{c.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {c.cpf || c.companyData?.cnpj || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {c.hiringType ? getHiringTypeLabel(c.hiringType) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {c.city && c.state ? `${c.city}/${c.state}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status as CandidateStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(c.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/cadastros/${c.id}`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
