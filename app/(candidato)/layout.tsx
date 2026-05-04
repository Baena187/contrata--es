import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { CandidatoHeader } from '@/components/candidato/header'
import { CandidatoNav } from '@/components/candidato/nav'

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userName = headersList.get('x-user-name')
  const userRole = headersList.get('x-user-role')

  if (!userName || userRole !== 'CANDIDATO') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatoHeader userName={userName} />
      <CandidatoNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
