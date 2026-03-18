export const BIRTH_TIMESTAMP = process.env.NEXT_PUBLIC_BIRTH_TIMESTAMP ?? process.env.BIRTH_TIMESTAMP ?? '2026-03-16T00:00:00Z'
export const DEATH_TIMESTAMP = process.env.NEXT_PUBLIC_DEATH_TIMESTAMP ?? process.env.DEATH_TIMESTAMP ?? '2026-03-23T00:00:00Z'
export const DEATH_MS = new Date(DEATH_TIMESTAMP).getTime()
export const BIRTH_MS = new Date(BIRTH_TIMESTAMP).getTime()

export const LAUNCH_MODE = process.env.LAUNCH_MODE ?? 'prelive'
export const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET ?? ''
export const ANOMALY_DAY = parseInt(process.env.ANOMALY_DAY ?? '67', 10)

export type Phase = 'acceptance' | 'urgency' | 'frenzy' | 'death'

export function getMsRemaining(nowMs = Date.now(), deathMs = DEATH_MS): number {
  return Math.max(0, deathMs - nowMs)
}

export function getDaysRemaining(nowMs = Date.now(), deathMs = DEATH_MS): number {
  return Math.floor(getMsRemaining(nowMs, deathMs) / (1000 * 60 * 60 * 24))
}

export function getPhase(daysRemaining: number): Phase {
  if (daysRemaining === 0) return 'death'
  if (daysRemaining <= 1) return 'frenzy'
  if (daysRemaining <= 3) return 'urgency'
  return 'acceptance'
}

export function getTimeComponents(nowMs = Date.now(), deathMs = DEATH_MS) {
  const ms = getMsRemaining(nowMs, deathMs)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}
