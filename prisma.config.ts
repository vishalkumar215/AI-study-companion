import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

const rawUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

const databaseUrl =
  rawUrl.startsWith('file:./') || rawUrl.startsWith('file:../')
    ? `file:${path
        .resolve(process.cwd(), rawUrl.slice('file:'.length))
        .replace(/\\/g, '/')}`
    : rawUrl

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
})
