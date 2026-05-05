import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { FichaWizard } from './ficha-wizard'

export const dynamic = 'force-dynamic'

export default async function FichaPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      companyData: true,
      partners: true,
      bankData: true,
      commercialInfo: true,
      declarations: true,
    },
  })

  if (!profile) redirect('/login')

  const isEditable = ['RASCUNHO', 'DOCUMENTACAO_PENDENTE'].includes(profile.status)

  return (
    <FichaWizard
      profile={JSON.parse(JSON.stringify(profile))}
      isEditable={isEditable}
    />
  )
}
