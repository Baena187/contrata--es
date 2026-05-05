import { existsSync, readFileSync } from 'node:fs'

if (process.env.SKIP_ENV_CHECK === '1') {
  process.exit(0)
}

if (existsSync('.env')) {
  const lines = readFileSync('.env', 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const errors = []

function readEnv(name) {
  return process.env[name]?.trim()
}

function parseUrl(name) {
  const value = readEnv(name)
  if (!value) {
    errors.push(`${name} nao esta configurada.`)
    return null
  }

  if (!/^postgres(ql)?:\/\//.test(value)) {
    errors.push(`${name} precisa comecar com postgresql:// ou postgres://.`)
    return null
  }

  if (value.includes('user:password@') || value.includes('ep-example')) {
    errors.push(`${name} ainda parece ser o exemplo, nao a URL real do Neon.`)
    return null
  }

  try {
    return new URL(value)
  } catch {
    errors.push(`${name} nao e uma URL valida.`)
    return null
  }
}

const databaseUrl = parseUrl('DATABASE_URL')
const directUrl = parseUrl('DIRECT_URL')
const jwtSecret = readEnv('JWT_SECRET')

if (databaseUrl?.hostname.endsWith('.neon.tech') && !databaseUrl.hostname.includes('-pooler.')) {
  errors.push('DATABASE_URL do Neon deve usar a conexao pooled, com "-pooler" no host.')
}

if (directUrl?.hostname.endsWith('.neon.tech') && directUrl.hostname.includes('-pooler.')) {
  errors.push('DIRECT_URL do Neon deve ser a conexao direta, sem "-pooler" no host.')
}

if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
  errors.push('JWT_SECRET precisa ser uma chave forte real.')
}

if (errors.length > 0) {
  console.error('\nConfiguracao de ambiente invalida para deploy:\n')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  console.error('\nConfigure as variaveis no Netlify/Vercel e no .env local. Veja DEPLOY_NEON.md.\n')
  process.exit(1)
}
