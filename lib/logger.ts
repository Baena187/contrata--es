type Level = 'info' | 'warn' | 'error'

function emit(level: Level, context: string, message: string, data?: unknown) {
  const entry: Record<string, unknown> = {
    level,
    context,
    message,
    ts: new Date().toISOString(),
  }

  if (data !== undefined) {
    entry.data = data instanceof Error
      ? { message: data.message, stack: data.stack }
      : data
  }

  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  info:  (context: string, message: string, data?: unknown) => emit('info',  context, message, data),
  warn:  (context: string, message: string, data?: unknown) => emit('warn',  context, message, data),
  error: (context: string, message: string, data?: unknown) => emit('error', context, message, data),
}
