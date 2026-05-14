type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

// Limpa entradas expiradas periodicamente para evitar vazamento de memória
function cleanup() {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}

setInterval(cleanup, 60_000)

/**
 * Retorna true se a requisição está dentro do limite.
 * @param key    Identificador único (ex: "login:1.2.3.4")
 * @param limit  Número máximo de requisições permitidas
 * @param windowMs Janela de tempo em milissegundos
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
