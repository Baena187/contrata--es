'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  data: any
  onChange: (updates: any) => void
}

export function Step6Comercial({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="operationArea">Área de atuação *</Label>
          <Input
            id="operationArea"
            value={data.operationArea}
            onChange={(e) => onChange({ operationArea: e.target.value })}
            placeholder="Ex: Materiais de construção, Alimentos, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operationRegion">Região de atuação *</Label>
          <Input
            id="operationRegion"
            value={data.operationRegion}
            onChange={(e) => onChange({ operationRegion: e.target.value })}
            placeholder="Ex: Grande São Paulo, Interior SP, etc."
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="marketExperienceTime">Tempo de atuação no mercado</Label>
          <Input
            id="marketExperienceTime"
            value={data.marketExperienceTime}
            onChange={(e) => onChange({ marketExperienceTime: e.target.value })}
            placeholder="Ex: 10 anos"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="representedCompanies">Principais empresas representadas</Label>
          <Textarea
            id="representedCompanies"
            value={data.representedCompanies}
            onChange={(e) => onChange({ representedCompanies: e.target.value })}
            placeholder="Liste as principais empresas que representa ou representou"
            rows={3}
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="previousExperience">Experiência anterior</Label>
          <Textarea
            id="previousExperience"
            value={data.previousExperience}
            onChange={(e) => onChange({ previousExperience: e.target.value })}
            placeholder="Descreva sua experiência anterior como representante comercial"
            rows={3}
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="observations">Observações comerciais</Label>
          <Textarea
            id="observations"
            value={data.observations}
            onChange={(e) => onChange({ observations: e.target.value })}
            placeholder="Informações adicionais relevantes"
            rows={2}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-800 mb-4">CORE / COREMAT</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="hasCore"
              checked={data.hasCore}
              onCheckedChange={(checked) => onChange({ hasCore: !!checked })}
            />
            <Label htmlFor="hasCore" className="cursor-pointer">
              Possui registro no CORE/COREMAT
            </Label>
          </div>

          {data.hasCore && (
            <div className="ml-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coreNumber">Número do CORE/COREMAT *</Label>
                <Input
                  id="coreNumber"
                  value={data.coreNumber}
                  onChange={(e) => onChange({ coreNumber: e.target.value })}
                  placeholder="Número do registro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coreExpirationDate">Validade do registro *</Label>
                <Input
                  id="coreExpirationDate"
                  type="date"
                  value={data.coreExpirationDate}
                  onChange={(e) => onChange({ coreExpirationDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
