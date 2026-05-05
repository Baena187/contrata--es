import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { CandidateProfileView } from './candidate-profile-view'
import { Role } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CandidatoPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headersList = await headers()
  const userRole = headersList.get('x-user-role') as Role
  const userId = headersList.get('x-user-id') as string

  const profile = await prisma.candidateProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      companyData: true,
      partners: true,
      bankData: true,
      commercialInfo: true,
      documents: {
        orderBy: { uploadedAt: 'desc' },
        include: { reviewedBy: { select: { name: true } } },
      },
      declarations: { orderBy: { acceptedAt: 'asc' } },
      internalAnalysis: true,
      statusHistories: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, role: true } } },
      },
      correctionRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { document: true } },
          createdBy: { select: { name: true } },
        },
      },
    },
  })

  if (!profile) notFound()

  return (
    <CandidateProfileView
      profile={JSON.parse(JSON.stringify(profile))}
      userRole={userRole}
      currentUserId={userId}
    />
  )
}
