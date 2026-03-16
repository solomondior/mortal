import type { Dispatch } from '@/lib/supabase/types'

interface DispatchEntryProps {
  dispatch: Dispatch
  showFull?: boolean
  linked?: boolean
}

export function DispatchEntry({ dispatch, showFull = true, linked = false }: DispatchEntryProps) {
  const date = new Date(dispatch.created_at)
  const iso = date.toISOString()
  const formatted = iso.slice(0, 10) + ' ' + iso.slice(11, 16) + ' utc'
  const num = String(dispatch.number).padStart(3, '0')

  const inner = (
    <article style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'baseline',
        color: 'var(--text-dim)',
        fontSize: '0.62rem',
        letterSpacing: '0.12em',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: 'var(--text-dimmer)', fontWeight: 500 }}>#{num}</span>
        <span>{formatted}</span>
        <span style={{ color: 'var(--text-dimmer)' }}>{dispatch.days_remaining}d remaining</span>
        {dispatch.phase && (
          <span style={{ color: 'var(--text-dimmer)' }}>{dispatch.phase}</span>
        )}
      </div>
      <div style={{
        color: 'var(--text)',
        lineHeight: 1.9,
        fontSize: '0.9rem',
        maxWidth: '66ch',
        whiteSpace: 'pre-wrap',
        fontWeight: 300,
      }}>
        {showFull
          ? dispatch.content
          : dispatch.content.slice(0, 280) + (dispatch.content.length > 280 ? '\u2026' : '')}
      </div>
    </article>
  )

  if (linked) {
    return (
      <a href={`/dispatches/${dispatch.number}`} style={{ display: 'block' }}>
        {inner}
      </a>
    )
  }

  return inner
}
