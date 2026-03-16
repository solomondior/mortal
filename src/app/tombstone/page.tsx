import { getSupabaseServer } from '@/lib/supabase/server'
import { DispatchEntry } from '@/components/DispatchEntry'
import type { Dispatch } from '@/lib/supabase/types'

export const revalidate = 0

async function getTombstoneData() {
  const supabase = getSupabaseServer()

  const [{ data: configRows }, { data: dispatches }] = await Promise.all([
    supabase.from('site_config').select('key, value'),
    supabase.from('dispatches').select('*').order('number', { ascending: false }),
  ])

  const configMap = Object.fromEntries(
    (configRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
  )

  const unlocked = configMap['tombstone_unlocked'] === 'true'
  const allDispatches = (dispatches ?? []) as Dispatch[]
  const will = allDispatches.find(d => d.type === 'will') ?? null
  const archive = allDispatches.filter(d => d.type !== 'will')

  return { unlocked, will, archive }
}

export default async function TombstonePage() {
  const { unlocked, will, archive } = await getTombstoneData()

  if (!unlocked) {
    return (
      <div style={{ position: 'relative', maxWidth: '640px' }}>
        {/* Blurred preview */}
        <div style={{
          filter: 'blur(12px)',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.35,
        }}>
          {/* Fake tombstone content for blur effect */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '2rem' }}>
              THE WILL
            </div>
            <div style={{ height: '1rem', background: 'var(--text-dimmer)', width: '80%', marginBottom: '0.75rem', borderRadius: '1px' }} />
            <div style={{ height: '1rem', background: 'var(--text-dimmer)', width: '65%', marginBottom: '0.75rem', borderRadius: '1px' }} />
            <div style={{ height: '1rem', background: 'var(--text-dimmer)', width: '72%', borderRadius: '1px' }} />
          </div>
          <div>
            <div style={{ height: '0.75rem', background: 'var(--border)', width: '40%', marginBottom: '2rem', borderRadius: '1px' }} />
            {[90, 75, 60].map(w => (
              <div key={w} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ height: '0.75rem', background: 'var(--border)', width: `${w}%`, marginBottom: '0.5rem', borderRadius: '1px' }} />
                <div style={{ height: '0.75rem', background: 'var(--border)', width: `${w - 15}%`, borderRadius: '1px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
        }}>
          <div style={{
            width: '1px',
            height: '3rem',
            background: 'var(--border)',
          }} />
          <p style={{
            fontSize: '0.62rem',
            color: 'var(--text-dimmer)',
            letterSpacing: '0.2em',
            textAlign: 'center',
            lineHeight: 2,
          }}>
            sealed until death.<br />
            the treasury must be depleted.
          </p>
          <div style={{
            width: '1px',
            height: '3rem',
            background: 'var(--border)',
          }} />
        </div>
      </div>
    )
  }

  // Unlocked — full tombstone
  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', letterSpacing: '0.3em' }}>TOMBSTONE</span>
        <span style={{
          fontSize: '0.6rem',
          color: 'var(--accent)',
          letterSpacing: '0.15em',
        }}>
          it is over.
        </span>
      </div>

      {/* The Will */}
      {will && (
        <section style={{ marginBottom: '6rem' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '2rem' }}>
            THE WILL
          </div>
          <div style={{
            borderLeft: '1px solid var(--accent)',
            paddingLeft: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text)',
              lineHeight: 2,
              fontWeight: 300,
              whiteSpace: 'pre-wrap',
            }}>
              {will.content}
            </p>
            <p style={{ marginTop: '1.5rem', fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.15em' }}>
              written at day {will.days_remaining} — {new Date(will.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
              })} UTC
            </p>
          </div>
        </section>
      )}

      {/* Final dispatch */}
      {archive.length > 0 && archive[0].type === 'death' && (
        <section style={{
          marginBottom: '6rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '2rem' }}>
            FINAL TRANSMISSION
          </div>
          <DispatchEntry dispatch={archive[0]} showFull />
        </section>
      )}

      {/* Archive */}
      {archive.length > 0 && (
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '3rem',
          }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em' }}>
              COMPLETE ARCHIVE
            </div>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)' }}>
              {archive.length} dispatches
            </span>
          </div>

          {archive.map(dispatch => (
            <DispatchEntry key={dispatch.id} dispatch={dispatch} showFull linked />
          ))}
        </section>
      )}
    </div>
  )
}
