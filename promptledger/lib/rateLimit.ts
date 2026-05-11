const ipRequestMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 60 * 1000  // 1 hour
const MAX_REQUESTS = 5             // 5 audits per IP per hour

export function checkRateLimit(ip: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const record = ipRequestMap.get(ip)

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS }
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetAt: record.resetAt }
}