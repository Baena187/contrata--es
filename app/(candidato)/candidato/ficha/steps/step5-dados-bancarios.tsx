'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BANKS } from '@/types'

interface Props {
  data: any
  onChange: (updates: any) => void
}

export function Step5DadosBancarios({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Banco *</Label>
          <Select value={data.bank} onValueChange={(v) => onChange({ bank: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o banco" />
            </SelectTrigger>
            <SelectContent>
              {BANKS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de conta *</Label>
          <Select value={data.accountType} onValueChange={(v) => onChange({ accountType: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
              <SelectItem value="POUPANCA">Conta Poupança</SelectItem>
              <SelectItem value="PAGAMENTO">Conta Pagamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agency">Agência *</Label>
          <Input
            id="agency"
            value={data.agency}
            onChange={(e) => onChange({ agency: e.target.value })}
            placeholder="0000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Conta (com dígito) *</Label>
          <Input
            id="account"
            value={data.account}
            onChange={(e) => onChange({ account: e.target.value })}
            placeholder="00000-0"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="accountHolder">Titular da conta *</Label>
          <Input
            id="accountHolder"
            value={data.accountHolder}
            onChange={(e) => onChange({ accountHolder: e.target.value })}
            placeholder="Nome completo ou razão social do titular"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="holderCpfCnpj">CPF ou CNPJ do titular *</Label>
          <Input
            id="holderCpfCnpj"
            value={data.holderCpfCnpj}
            onChange={(e) => onChange({ holderCpfCnpj: e.target.value })}
            placeholder="000.000.000-00 ou 00.000.000/0001-00"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="pixKey">Chave Pix (opcional)</Label>
          <Input
            id="pixKey"
            value={data.pixKey}
            onChange={(e) => onChange({ pixKey: e.target.value })}
            placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
          />
        </div>
      </div>
    </div>
  )
}
