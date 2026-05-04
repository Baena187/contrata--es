import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Configurações do sistema</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-3">
              <span>Versão do sistema</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span>Banco de dados</span>
              <span className="font-medium text-green-600">SQLite (conectado)</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span>Tamanho máximo de arquivo</span>
              <span className="font-medium">10 MB</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span>Formatos aceitos</span>
              <span className="font-medium">PDF, JPG, PNG, DOC, DOCX</span>
            </div>
            <div className="flex justify-between">
              <span>Ambientes</span>
              <span className="font-medium">{process.env.NODE_ENV}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
