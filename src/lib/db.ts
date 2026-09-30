import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function assertDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Add your Supabase Postgres connection string to .env.local or your deployment environment.',
    )
  }
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  })

export const db = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        assertDatabaseUrl()
        return query(args)
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
