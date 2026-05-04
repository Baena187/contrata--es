'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BRAZILIAN_STATES } from '@/types'

interface Props {
  data: any
  onChange: (updates: any) => void
}

export function Step3Empresa({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="corporateName">Razão Social *</Label>
          <Input
            id="corporateName"
            value={data.corporateName}
            onChange={(e) => onChange({ corporateName: e.target.value })}
            placeholder="Razão social completa"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="tradeName">Nome Fantasia</Label>
          <Input
            id="tradeName"
            value={data.tradeName}
            onChange={(e) => onChange({ tradeName: e.target.value })}
            placeholder="Nome fantasia"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={data.cnpj}
            onChange={(e) => onChange({ cnpj: e.target.value })}
            placeholder="00.000.000/0001-00"
            maxLength={18}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
          <Input
            id="stateRegistration"
            value={data.stateRegistration}
            onChange={(e) => onChange({ stateRegistration: e.target.value })}
            placeholder="Inscrição estadual"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyPhone">Telefone</Label>
          <Input
            id="companyPhone"
            value={data.companyPhone}
            onChange={(e) => onChange({ companyPhone: e.target.value })}
            placeholder="(00) 0000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyEmail">E-mail empresarial</Label>
          <Input
            id="companyEmail"
            type="email"
            value={data.companyEmail}
            onChange={(e) => onChange({ companyEmail: e.target.value })}
            placeholder="contato@empresa.com"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-800 mb-4">Endereço da Empresa</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyZipCode">CEP *</Label>
            <Input
              id="companyZipCode"
              value={data.companyZipCode}
              onChange={(e) => onChange({ companyZipCode: e.target.value })}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="companyAddress">Endereço *</Label>
            <Input
              id="companyAddress"
              value={data.companyAddress}
              onChange={(e) => onChange({ companyAddress: e.target.value })}
              placeholder="Rua, Avenida, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyNumber">Número *</Label>
            <Input
              id="companyNumber"
              value={data.companyNumber}
              onChange={(e) => onChange({ companyNumber: e.target.value })}
              placeholder="123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyComplement">Complemento</Label>
            <Input
              id="companyComplement"
              value={data.companyComplement}
              onChange={(e) => onChange({ companyComplement: e.target.value })}
              placeholder="Sala, Andar, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyDistrict">Bairro *</Label>
            <Input
              id="companyDistrict"
              value={data.companyDistrict}
              onChange={(e) => onChange({ companyDistrict: e.target.value })}
              placeholder="Bairro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyCity">Cidade *</Label>
            <Input
              id="companyCity"
              value={data.companyCity}
              onChange={(e) => onChange({ companyCity: e.target.value })}
              placeholder="Cidade"
            />
          </div>
          <div className="space-y-2">
            <Label>UF *</Label>
            <Select value={data.companyState} onValueChange={(v) => onChange({ companyState: v })}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
