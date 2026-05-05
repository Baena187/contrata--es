import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { DocumentUploadArea } from './document-upload-area'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { documents: { orderBy: { uploadedAt: 'desc' } } },
  })

  if (!profile) redirect('/login')

  const isEditable = ['RASCUNHO', 'DOCUMENTACAO_PENDENTE', 'ENVIADO_PARA_ANALISE'].includes(profile.status)

  return <DocumentUploadArea profile={JSON.parse(JSON.stringify(profile))} isEditable={isEditable} />
}
