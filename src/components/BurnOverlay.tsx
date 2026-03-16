'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { BurnEvent } from '@/lib/supabase/types'

export function BurnOverlay() {
  const [event, setEvent] = useState<BurnEvent | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('burn-overlay')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'burn_events' },
        (payload) => {
          setEvent(payload.new as BurnEvent)
          setTimeout(() => setEvent(null), 4500)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (!event) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9990,
      background: 'rgba(8,8,8,0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font)',
      animation: 'burn-flash 4.5s ease forwards',
    }}>
      {/* horizontal rule top */}
      <div style={{ width: 1, height: 60, background: 'var(--accent)', marginBottom: '2.5rem', opacity: 0.6 }} />

      <div style={{
        color: 'var(--accent)',
        fontSize: '0.6rem',
        letterSpacing: '0.35em',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
      }}>
        burn event #{event.burn_number}
      </div>

      <div style={{
        color: 'var(--text)',
        fontSize: 'clamp(1.2rem, 4vw, 2rem)',
        fontWeight: 300,
        letterSpacing: '0.06em',
        textAlign: 'center',
      }}>
        {Number(event.amount_burned).toLocaleString()} MORTAL
        <span style={{ color: 'var(--text-dim)', fontWeight: 300 }}> destroyed</span>
      </div>

      <div style={{
        color: 'var(--text-dim)',
        fontSize: '0.75rem',
        marginTop: '0.75rem',
        letterSpacing: '0.1em',
      }}>
        {Number(event.amount_remaining).toLocaleString()} remaining
      </div>

      <div style={{ width: 1, height: 60, background: 'var(--accent)', marginTop: '2.5rem', opacity: 0.6 }} />
    </div>
  )
}
