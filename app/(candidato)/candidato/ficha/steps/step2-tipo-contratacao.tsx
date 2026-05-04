'use client'

import { cn } from '@/lib/utils'
import { Building2, User, Briefcase, Users, Wrench } from 'lucide-react'

interface Props {
  data: any
  onChange: (updates: any) => void
}

const HIRING_TYPES = [
  { value: 'REPRESENTANTE_PJ', label: 'Representante Comercial Pessoa Jurídica', description: 'Empresa representante comercial com CNPJ', icon: Building2 },
  { value: 'REPRESENTANTE_PF', label: 'Representante Comercial Pessoa Física', description: 'Representante autônomo individual', icon: User },
  { value: 'CLT', label: 'Funcionário CLT', description: 'Contratação com registro em carteira', icon: Briefcase },
  { value: 'PRESTADOR', label: 'Prestador de Serviço', description: 'Contrato de prestação de serviços', icon: Wrench },
  { value: 'TERCEIRIZADO', label: 'Terceirizado', description: 'Prestação via empresa terceirizada', icon: Users },
]

export function Step2TipoContratacao({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Selecione o tipo de contratação para este cadastro.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {HIRING_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = data.hiringType === type.value
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ hiringType: type.value })}
              className={cn(
                'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0', isSelected ? 'bg-blue-100' : 'bg-gray-100')}>
                <Icon className={cn('h-5 w-5', isSelected ? 'text-blue-600' : 'text-gray-500')} />
              </div>
              <div>
                <p className={cn('font-medium text-sm', isSelected ? 'text-blue-700' : 'text-gray-800')}>{type.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
