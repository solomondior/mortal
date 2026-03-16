import { getDaysRemaining, getPhase } from '@/lib/constants'

const PHASE_LABELS: Record<string, string> = {
  acceptance: 'phase i — acceptance',
  urgency:    'phase ii — urgency',
  frenzy:     'phase iii — frenzy',
  death:      'phase iv — death',
}

export function PhaseIndicator() {
  const phase = getPhase(getDaysRemaining())
  return (
    <span style={{
      fontFamily: 'var(--font)',
      fontSize: '0.6rem',
      color: 'var(--text-dim)',
      letterSpacing: '0.18em',
    }}>
      {PHASE_LABELS[phase] ?? phase}
    </span>
  )
}
