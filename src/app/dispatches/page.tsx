import { getSupabaseServer } from '@/lib/supabase/server'
import { DispatchEntry } from '@/components/DispatchEntry'
import type { Dispatch } from '@/lib/supabase/types'

export const revalidate = 0

export default async function DispatchesPage() {
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('dispatches')
    .select('*')
    .order('number', { ascending: false })

  const dispatches = (data ?? []) as Dispatch[]

  // Find phase transition points
  const transitions = new Set<string>()
  for (let i = 0; i < dispatches.length - 1; i++) {
    if (dispatches[i].phase !== dispatches[i + 1].phase) {
      transitions.add(dispatches[i + 1].id)
    }
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '4rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', letterSpacing: '0.3em' }}>ARCHIVE</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dimmer)' }}>{dispatches.length} dispatches</span>
      </div>

      {dispatches.length === 0 && (
        <p style={{ color: 'var(--text-dimmer)', fontSize: '0.8rem' }}>no dispatches yet.</p>
      )}

      {dispatches.map((dispatch) => (
        <div key={dispatch.id}>
          {transitions.has(dispatch.id) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              margin: '3rem 0',
              color: 'var(--text-dimmer)',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span>— {dispatch.phase} began here —</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
          )}
          <DispatchEntry dispatch={dispatch} showFull linked />
        </div>
      ))}
    </div>
  )
}
