import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { StatusTimeline } from '@/components/status-timeline'
import { FileText, Upload, AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react'

export default async function CandidatoDashboard() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      statusHistories: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { createdBy: { select: { name: true, role: true } } },
      },
      correctionRequests: {
        where: { status: 'PENDENTE' },
        include: { items: true },
      },
      documents: true,
    },
  })

  if (!profile) redirect('/login')

  const pendingCorrections = profile.correctionRequests.length
  const approvedDocs = profile.documents.filter((d) => d.status === 'APROVADO').length
  const totalDocs = profile.documents.length
  const isEditable = ['RASCUNHO', 'DOCUMENTACAO_PENDENTE'].includes(profile.status)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status do Cadastro</CardTitle>
            <StatusBadge status={profile.status} className="text-sm px-3 py-1" />
          </div>
        </CardHeader>
        <CardContent>
          {profile.status === 'RASCUNHO' && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-blue-800 text-sm">Seu cadastro está em rascunho. Preencha a ficha e envie para análise.</p>
              <Link href="/candidato/ficha">
                <Button className="mt-3" size="sm">Preencher Ficha <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          )}
          {profile.status === 'DOCUMENTACAO_PENDENTE' && pendingCorrections > 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-yellow-800 text-sm font-medium">Há pendências a resolver.</p>
              <Link href="/candidato/pendencias">
                <Button variant="warning" className="mt-3" size="sm">Ver Pendências <AlertCircle className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          )}
          {profile.status === 'APROVADO' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 text-sm font-medium">Parabéns! Seu cadastro foi aprovado.</p>
              </div>
            </div>
          )}
          {['EM_ANALISE_RH', 'EM_ANALISE_FINANCEIRA', 'EM_ANALISE_JURIDICA', 'ENVIADO_PARA_ANALISE'].includes(profile.status) && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-blue-800 text-sm">Seu cadastro está sendo analisado. Aguarde o contato.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Minha Ficha</p>
                <p className="text-xs text-gray-400 mt-0.5">{isEditable ? 'Editar dados' : 'Visualizar'}</p>
              </div>
            </div>
            <Link href="/candidato/ficha">
              <Button variant="outline" size="sm" className="w-full mt-4">{isEditable ? 'Editar Ficha' : 'Ver Ficha'}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Documentos</p>
                <p className="text-xs text-gray-400 mt-0.5">{approvedDocs}/{totalDocs} aprovados</p>
              </div>
            </div>
            <Link href="/candidato/documentos">
              <Button variant="outline" size="sm" className="w-full mt-4">Gerenciar Docs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-md transition-shadow ${pendingCorrections > 0 ? 'border-yellow-300' : ''}`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${pendingCorrections > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <AlertCircle className={`h-6 w-6 ${pendingCorrections > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pendências</p>
                <p className="text-xs text-gray-400 mt-0.5">{pendingCorrections > 0 ? `${pendingCorrections} pendência(s)` : 'Nenhuma'}</p>
              </div>
            </div>
            <Link href="/candidato/pendencias">
              <Button variant={pendingCorrections > 0 ? 'warning' : 'outline'} size="sm" className="w-full mt-4">
                {pendingCorrections > 0 ? 'Resolver Pendências' : 'Ver Pendências'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Histórico Recente</CardTitle></CardHeader>
        <CardContent><StatusTimeline items={profile.statusHistories} /></CardContent>
      </Card>
    </div>
  )
}
