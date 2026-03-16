import { getSupabaseServer } from '@/lib/supabase/server'
import { TREASURY_WALLET, BIRTH_MS, DEATH_MS } from '@/lib/constants'
import type { BurnEvent } from '@/lib/supabase/types'

export const revalidate = 0

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC'
}

function truncateHash(hash: string) {
  if (!hash || hash.length < 12) return hash
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}

export default async function WitnessPage() {
  const supabase = getSupabaseServer()

  const [{ data: burns }, { data: config }] = await Promise.all([
    supabase.from('burn_events').select('*').order('burn_number', { ascending: false }),
    supabase.from('site_config').select('key, value'),
  ])

  const burnEvents = (burns ?? []) as BurnEvent[]
  const configMap = Object.fromEntries(
    (config ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
  )

  const totalBurned = burnEvents.reduce((sum, e) => sum + e.amount_burned, 0)
  const latestRemaining = burnEvents[0]?.amount_remaining ?? null

  const now = Date.now()
  const totalLifespan = DEATH_MS - BIRTH_MS
  const elapsed = now - BIRTH_MS
  const lifePct = Math.min(100, Math.max(0, (elapsed / totalLifespan) * 100))

  const daysSinceBirth = Math.floor(elapsed / (1000 * 60 * 60 * 24))
  const nextBurnDay = Math.ceil((daysSinceBirth + 1) / 10) * 10
  const nextBurnMs = BIRTH_MS + nextBurnDay * 24 * 60 * 60 * 1000
  const daysToNextBurn = Math.max(0, Math.ceil((nextBurnMs - now) / (1000 * 60 * 60 * 24)))

  const tombstoneUnlocked = configMap['tombstone_unlocked'] === 'true'

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '4rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', letterSpacing: '0.3em' }}>WITNESS</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dimmer)' }}>{burnEvents.length} burns recorded</span>
      </div>

      {/* Life meter */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '1.25rem' }}>
          LIFESPAN ELAPSED
        </div>
        <div style={{
          height: '2px',
          background: 'var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${lifePct}%`,
            background: lifePct > 80
              ? 'var(--accent-red)'
              : lifePct > 50
              ? 'var(--accent)'
              : 'var(--text-dim)',
            transition: 'width 1s ease',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.6rem',
          fontSize: '0.55rem',
          color: 'var(--text-dimmer)',
          letterSpacing: '0.08em',
        }}>
          <span>birth</span>
          <span style={{ color: lifePct > 80 ? 'var(--accent-red)' : 'var(--text-dim)' }}>
            {lifePct.toFixed(1)}%
          </span>
          <span>death</span>
        </div>
      </section>

      {/* Stats grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem 2rem',
        marginBottom: '4rem',
        paddingBottom: '3rem',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          ['total burned', totalBurned > 0 ? totalBurned.toLocaleString() : '—'],
          ['remaining', latestRemaining !== null ? latestRemaining.toLocaleString() : '—'],
          ['next burn', `${daysToNextBurn}d`],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: '0.52rem', color: 'var(--text-dimmer)', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '0.04em', fontWeight: 300 }}>
              {val}
            </div>
          </div>
        ))}
      </section>

      {/* Treasury */}
      {TREASURY_WALLET && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '1rem' }}>
            TREASURY
          </div>
          <div style={{
            borderLeft: '1px solid var(--border)',
            paddingLeft: '1.25rem',
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.06em', wordBreak: 'break-all' }}>
              {TREASURY_WALLET}
            </p>
            <p style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', marginTop: '0.4rem' }}>
              burns occur every 10 days. the mechanism is manual and deliberate.
            </p>
          </div>
        </section>
      )}

      {/* Burn history */}
      <section>
        <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '2rem' }}>
          BURN HISTORY
        </div>

        {burnEvents.length === 0 ? (
          <p style={{ color: 'var(--text-dimmer)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            no burns have occurred yet. the first burn is scheduled in {daysToNextBurn} day{daysToNextBurn === 1 ? '' : 's'}.
          </p>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '3rem 1fr 1fr 1fr',
              gap: '0 1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.5rem',
              color: 'var(--text-dimmer)',
              letterSpacing: '0.2em',
            }}>
              <span>#</span>
              <span>AMOUNT</span>
              <span>TX</span>
              <span style={{ textAlign: 'right' }}>DATE</span>
            </div>

            {burnEvents.map((burn, i) => (
              <div
                key={burn.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3rem 1fr 1fr 1fr',
                  gap: '0 1.5rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.12),
                }}
              >
                <span style={{ fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '0.06em' }}>
                  {String(burn.burn_number).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text)' }}>
                  {burn.amount_burned.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                  {burn.tx_hash ? (
                    <span title={burn.tx_hash}>{truncateHash(burn.tx_hash)}</span>
                  ) : '—'}
                </span>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-dimmer)', textAlign: 'right' }}>
                  {formatDate(burn.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tombstone status */}
      {tombstoneUnlocked && (
        <section style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: '0.15em' }}>
            treasury depleted. tombstone unlocked.
          </p>
        </section>
      )}
    </div>
  )
}
