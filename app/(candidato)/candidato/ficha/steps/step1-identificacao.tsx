'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { BRAZILIAN_STATES } from '@/types'

interface Props {
  data: any
  onChange: (updates: any) => void
}

export function Step1Identificacao({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="fullName">Nome completo *</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Nome completo conforme documento"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            value={data.cpf}
            onChange={(e) => onChange({ cpf: e.target.value })}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento *</Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherName">Nome do pai</Label>
          <Input
            id="fatherName"
            value={data.fatherName}
            onChange={(e) => onChange({ fatherName: e.target.value })}
            placeholder="Nome do pai"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName">Nome da mãe *</Label>
          <Input
            id="motherName"
            value={data.motherName}
            onChange={(e) => onChange({ motherName: e.target.value })}
            placeholder="Nome da mãe"
          />
        </div>
        <div className="space-y-2">
          <Label>Sexo *</Label>
          <Select value={data.gender} onValueChange={(v) => onChange({ gender: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MASCULINO">Masculino</SelectItem>
              <SelectItem value="FEMININO">Feminino</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
              <SelectItem value="NAO_INFORMADO">Prefiro não informar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado civil *</Label>
          <Select value={data.maritalStatus} onValueChange={(v) => onChange({ maritalStatus: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
              <SelectItem value="CASADO">Casado(a)</SelectItem>
              <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
              <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
              <SelectItem value="UNIAO_ESTAVEL">União estável</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nacionalidade *</Label>
          <Input
            id="nationality"
            value={data.nationality}
            onChange={(e) => onChange({ nationality: e.target.value })}
            placeholder="Brasileiro(a)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthplace">Naturalidade (cidade - UF)</Label>
          <Input
            id="birthplace"
            value={data.birthplace}
            onChange={(e) => onChange({ birthplace: e.target.value })}
            placeholder="São Paulo - SP"
          />
        </div>
      </div>

      {/* Filhos */}
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="hasChildren"
            checked={data.hasChildren}
            onCheckedChange={(checked) => onChange({ hasChildren: !!checked, childrenCount: checked ? data.childrenCount : 0 })}
          />
          <Label htmlFor="hasChildren" className="cursor-pointer">Possui filhos</Label>
        </div>
        {data.hasChildren && (
          <div className="mt-3 ml-7 space-y-2">
            <Label htmlFor="childrenCount">Quantidade de filhos</Label>
            <Input
              id="childrenCount"
              type="number"
              min="1"
              max="20"
              value={data.childrenCount}
              onChange={(e) => onChange({ childrenCount: parseInt(e.target.value) || 0 })}
              className="w-32"
            />
          </div>
        )}
      </div>

      {/* Endereço */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-800 mb-4">Endereço Residencial</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP *</Label>
            <Input
              id="zipCode"
              value={data.zipCode}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Rua, Avenida, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              value={data.number}
              onChange={(e) => onChange({ number: e.target.value })}
              placeholder="123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={data.complement}
              onChange={(e) => onChange({ complement: e.target.value })}
              placeholder="Apto, Sala, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">Bairro *</Label>
            <Input
              id="district"
              value={data.district}
              onChange={(e) => onChange({ district: e.target.value })}
              placeholder="Bairro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Cidade"
            />
          </div>
          <div className="space-y-2">
            <Label>UF *</Label>
            <Select value={data.state} onValueChange={(v) => onChange({ state: v })}>
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

      {/* Contato */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-800 mb-4">Contato</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone fixo</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="(00) 0000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Celular *</Label>
            <Input
              id="mobile"
              value={data.mobile}
              onChange={(e) => onChange({ mobile: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="seu@email.com"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
