import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Executa uma query com até 2 tentativas para lidar com cold start do Neon
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const isConnectionErr =
        err?.message?.includes("Can't reach database") ||
        err?.message?.includes('Connection refused') ||
        err?.code === 'P1001'

      if (isConnectionErr && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500 * attempt))
        continue
      }
      throw err
    }
  }
  throw new Error('withRetry: unreachable')
}
