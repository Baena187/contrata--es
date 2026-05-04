import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default async function PendenciasPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      correctionRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { document: true },
          },
          createdBy: { select: { name: true } },
        },
      },
    },
  })

  if (!profile) redirect('/login')

  const pendente = profile.correctionRequests.filter((r) => r.status === 'PENDENTE')
  const resolvido = profile.correctionRequests.filter((r) => r.status !== 'PENDENTE')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Pendências</h2>
        <p className="text-sm text-gray-500 mt-1">Solicitações de correção do RH</p>
      </div>

      {pendente.length === 0 && resolvido.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mb-3" />
            <p className="text-gray-500 text-center">Nenhuma pendência encontrada.</p>
          </CardContent>
        </Card>
      )}

      {pendente.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Pendências Abertas ({pendente.length})
          </h3>
          {pendente.map((req) => (
            <Card key={req.id} className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-yellow-800">Correção Solicitada</CardTitle>
                    <p className="text-xs text-yellow-600 mt-1">
                      por {req.createdBy?.name || 'RH'} em {formatDateTime(req.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-100 text-yellow-700 px-2.5 py-0.5 text-xs font-medium">
                    Pendente
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-yellow-800">{req.message}</p>
                {req.items.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-yellow-700 mb-2">Itens a corrigir:</p>
                    <ul className="space-y-2">
                      {req.items.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            {item.fieldName && (
                              <p className="font-medium text-yellow-800">{item.fieldName}</p>
                            )}
                            {item.description && (
                              <p className="text-yellow-700">{item.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Link href="/candidato/ficha">
                    <Button size="sm" variant="warning">Corrigir Ficha</Button>
                  </Link>
                  <Link href="/candidato/documentos">
                    <Button size="sm" variant="outline">Enviar Documentos</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resolvido.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-500 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Histórico de Correções
          </h3>
          {resolvido.map((req) => (
            <Card key={req.id} className="border-gray-200 opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm text-gray-600">Correção Resolvida</CardTitle>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(req.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                    Resolvida
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{req.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
