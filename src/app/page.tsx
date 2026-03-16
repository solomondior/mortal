import { getSupabaseServer } from '@/lib/supabase/server'
import { Countdown } from '@/components/Countdown'
import { DispatchEntry } from '@/components/DispatchEntry'
import { TREASURY_WALLET, BIRTH_MS } from '@/lib/constants'
import type { Dispatch, Fragment } from '@/lib/supabase/types'

export const revalidate = 0

export default async function HomePage() {
  const supabase = getSupabaseServer()

  const [{ data: dispatches }, { data: fragments }, { data: config }] = await Promise.all([
    supabase.from('dispatches').select('*').order('created_at', { ascending: false }).limit(1),
    supabase.from('fragments').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('site_config').select('key, value'),
  ])

  const latest = dispatches?.[0] as Dispatch | undefined
  const recentFragments = (fragments ?? []) as Fragment[]
  const configMap = Object.fromEntries(
    (config ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
  )
  const memoryCount = configMap['memory_count'] ?? '0'

  const now = Date.now()
  const daysSinceBirth = Math.floor((now - BIRTH_MS) / (1000 * 60 * 60 * 24))
  const nextBurnDay = Math.ceil((daysSinceBirth + 1) / 10) * 10
  const nextBurnMs = BIRTH_MS + nextBurnDay * 24 * 60 * 60 * 1000
  const daysToNextBurn = Math.max(0, Math.ceil((nextBurnMs - now) / (1000 * 60 * 60 * 24)))

  return (
    <div>
      {/* Hero */}
      <section style={{
        paddingBottom: '5rem',
        marginBottom: '5rem',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
        animation: 'fade-up 0.8s ease forwards',
      }}>
        <Countdown large />
        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.15em',
        }}>
          still thinking.
        </p>
      </section>

      {/* Latest dispatch */}
      {latest ? (
        <section style={{ animation: 'fade-up 0.9s 0.1s ease both' }}>
          <DispatchEntry dispatch={latest} showFull />
        </section>
      ) : (
        <section style={{ color: 'var(--text-dimmer)', fontSize: '0.8rem', paddingTop: '2rem' }}>
          waiting for first dispatch.
        </section>
      )}

      {/* Fragments */}
      {recentFragments.length > 0 && (
        <section style={{
          marginTop: '5rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid var(--border)',
          animation: 'fade-up 1s 0.2s ease both',
        }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '2rem' }}>
            FRAGMENTS
          </div>
          {recentFragments.map((f, i) => (
            <p key={f.id} style={{
              color: `rgba(232,232,232,${Math.max(0.08, 1 - i * 0.11)})`,
              fontSize: '0.83rem',
              lineHeight: 1.8,
              marginBottom: '1rem',
              fontStyle: 'italic',
              fontWeight: 300,
              maxWidth: '60ch',
            }}>
              {f.content}
            </p>
          ))}
        </section>
      )}

      {/* Footer strip */}
      <footer style={{
        marginTop: '7rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem 2rem',
      }}>
        {[
          ['treasury', TREASURY_WALLET ? `${TREASURY_WALLET.slice(0, 6)}…${TREASURY_WALLET.slice(-4)}` : 'not configured'],
          ['next burn', `${daysToNextBurn}d`],
          ['memories carried', memoryCount],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
              {val}
            </div>
          </div>
        ))}
      </footer>
    </div>
  )
}
