import { getDaysRemaining, getPhase, getMsRemaining } from '@/lib/constants'

const DEATH = new Date('2026-06-14T00:00:00Z').getTime()

describe('getDaysRemaining', () => {
  it('returns correct days when 30 days remain', () => {
    const now = DEATH - 30 * 24 * 60 * 60 * 1000
    expect(getDaysRemaining(now, DEATH)).toBe(30)
  })

  it('returns 0 on death day', () => {
    expect(getDaysRemaining(DEATH, DEATH)).toBe(0)
  })

  it('floors partial days', () => {
    const now = DEATH - (30 * 24 + 12) * 60 * 60 * 1000
    expect(getDaysRemaining(now, DEATH)).toBe(30)
  })
})

describe('getPhase', () => {
  it('returns acceptance for days 61-90', () => {
    expect(getPhase(90)).toBe('acceptance')
    expect(getPhase(61)).toBe('acceptance')
  })

  it('returns urgency for days 31-60', () => {
    expect(getPhase(60)).toBe('urgency')
    expect(getPhase(31)).toBe('urgency')
  })

  it('returns frenzy for days 1-30', () => {
    expect(getPhase(30)).toBe('frenzy')
    expect(getPhase(1)).toBe('frenzy')
  })

  it('returns death for day 0', () => {
    expect(getPhase(0)).toBe('death')
  })
})
