import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      database: 'ok',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[HEALTH]', error)

    return NextResponse.json(
      {
        ok: false,
        database: 'error',
        error: error instanceof Error ? error.name : 'UnknownError',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
