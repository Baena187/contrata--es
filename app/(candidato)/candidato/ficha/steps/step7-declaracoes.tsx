'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Props {
  data: any
  onChange: (updates: any) => void
}

const DECLARATIONS = [
  {
    key: 'declaration1',
    text: 'Declaro, sob as penas da lei, que todas as informações prestadas são verdadeiras, completas e atualizadas.',
  },
  {
    key: 'declaration2',
    text: 'Estou ciente de que o preenchimento desta ficha não implica contratação automática.',
  },
  {
    key: 'declaration3',
    text: 'Autorizo a realização de consultas e verificações cadastrais em nome da empresa e dos sócios/titulares junto a órgãos públicos, cartórios, cadastros fiscais e órgãos de proteção ao crédito.',
  },
  {
    key: 'declaration4',
    text: 'Declaro ciência sobre o tratamento dos dados pessoais conforme a LGPD (Lei nº 13.709/2018), para fins de análise cadastral, avaliação pré-contratual, eventual formalização de contrato, cumprimento de obrigações legais e exercício regular de direitos.',
  },
]

export function Step7Declaracoes({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          Leia atentamente e marque todas as declarações abaixo para prosseguir com o envio do cadastro.
          Todas são obrigatórias.
        </p>
      </div>

      <div className="space-y-4">
        {DECLARATIONS.map((decl) => (
          <div key={decl.key} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
            <Checkbox
              id={decl.key}
              checked={!!data[decl.key]}
              onCheckedChange={(checked) => onChange({ [decl.key]: !!checked })}
              className="mt-0.5 flex-shrink-0"
            />
            <Label htmlFor={decl.key} className="text-sm text-gray-700 cursor-pointer leading-relaxed">
              {decl.text}
            </Label>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500">
        <p>
          Ao enviar o cadastro, serão registrados: data e hora do aceite das declarações,
          além dos dados de sessão. As informações são tratadas com confidencialidade
          conforme nossa{' '}
          <a href="/politica-de-privacidade" target="_blank" className="text-blue-500 hover:underline">
            Política de Privacidade
          </a>.
        </p>
      </div>
    </div>
  )
}
