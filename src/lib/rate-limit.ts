import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null

function getRatelimit() {
  if (ratelimit) return ratelimit
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'mortal:input',
  })
  return ratelimit
}

export function extractIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const rl = getRatelimit()
  const result = await rl.limit(ip)
  return { allowed: result.success, remaining: result.remaining }
}
