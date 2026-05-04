'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Partner {
  id?: string
  fullName: string
  cpf: string
  rg: string
  maritalStatus: string
  profession: string
  address: string
  phone: string
  email: string
}

interface Props {
  data: { partners: Partner[] }
  onChange: (updates: any) => void
}

const EMPTY_PARTNER: Partner = {
  fullName: '', cpf: '', rg: '',
  maritalStatus: '', profession: '',
  address: '', phone: '', email: '',
}

export function Step4Socios({ data, onChange }: Props) {
  const partners = data.partners || []

  function addPartner() {
    onChange({ partners: [...partners, { ...EMPTY_PARTNER }] })
  }

  function removePartner(idx: number) {
    onChange({ partners: partners.filter((_, i) => i !== idx) })
  }

  function updatePartner(idx: number, field: string, value: string) {
    const updated = partners.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    onChange({ partners: updated })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Informe os dados de todos os sócios ou titulares da empresa.
      </p>

      {partners.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">Nenhum sócio adicionado</p>
        </div>
      )}

      {partners.map((partner, idx) => (
        <Card key={idx} className="border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Sócio {idx + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePartner(idx)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label>Nome completo *</Label>
                <Input
                  value={partner.fullName}
                  onChange={(e) => updatePartner(idx, 'fullName', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={partner.cpf}
                  onChange={(e) => updatePartner(idx, 'cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label>RG *</Label>
                <Input
                  value={partner.rg}
                  onChange={(e) => updatePartner(idx, 'rg', e.target.value)}
                  placeholder="RG"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado civil</Label>
                <Select
                  value={partner.maritalStatus}
                  onValueChange={(v) => updatePartner(idx, 'maritalStatus', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                    <SelectItem value="CASADO">Casado(a)</SelectItem>
                    <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                    <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                    <SelectItem value="UNIAO_ESTAVEL">União estável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profissão</Label>
                <Input
                  value={partner.profession}
                  onChange={(e) => updatePartner(idx, 'profession', e.target.value)}
                  placeholder="Profissão"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Endereço completo</Label>
                <Input
                  value={partner.address}
                  onChange={(e) => updatePartner(idx, 'address', e.target.value)}
                  placeholder="Endereço, número, bairro, cidade - UF"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone / Celular</Label>
                <Input
                  value={partner.phone}
                  onChange={(e) => updatePartner(idx, 'phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={partner.email}
                  onChange={(e) => updatePartner(idx, 'email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addPartner} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Sócio
      </Button>
    </div>
  )
}
