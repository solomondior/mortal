'use client'

import { useEffect, useState, useRef } from 'react'
import { getTimeComponents, getMsRemaining } from '@/lib/constants'

interface CountdownProps {
  large?: boolean
}

export function Countdown({ large = false }: CountdownProps) {
  const [time, setTime] = useState(getTimeComponents())
  const [ticking, setTicking] = useState(false)
  const tickRef = useRef<ReturnType<typeof setTimeout>>(null)

  const isCritical = getMsRemaining() < 24 * 60 * 60 * 1000
  const isUrgent = time.days < 7

  const color = isUrgent ? 'var(--accent-red)' : 'var(--accent)'

  useEffect(() => {
    const iv = setInterval(() => {
      setTime(getTimeComponents())
      setTicking(true)
      if (tickRef.current) clearTimeout(tickRef.current)
      tickRef.current = setTimeout(() => setTicking(false), 120)
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  if (large) {
    return (
      <div style={{
        fontFamily: 'var(--font)',
        letterSpacing: '0.04em',
        lineHeight: 1,
        animation: ticking ? 'tick 0.12s ease-out forwards' : 'none',
        color,
        transition: 'color 1s ease',
      }}>
        <span style={{
          fontSize: 'clamp(2.5rem, 10vw, 6.5rem)',
          fontWeight: 300,
          display: 'inline-flex',
          gap: '0.3em',
          alignItems: 'baseline',
          animation: isCritical ? 'pulse-critical 1s ease-in-out infinite' : 'none',
        }}>
          <Digit value={pad(time.days)} label="days" large />
          <Sep />
          <Digit value={pad(time.hours)} label="hrs" large />
          <Sep />
          <Digit value={pad(time.minutes)} label="min" large />
          <Sep />
          <Digit value={pad(time.seconds)} label="sec" large />
        </span>
      </div>
    )
  }

  return (
    <span style={{
      fontFamily: 'var(--font)',
      fontSize: '0.8rem',
      fontWeight: 400,
      letterSpacing: '0.08em',
      color,
      transition: 'color 1s ease',
      animation: ticking
        ? 'tick 0.12s ease-out forwards'
        : isCritical
        ? 'pulse-critical 1s ease-in-out infinite'
        : 'none',
      display: 'inline-block',
    }}>
      {pad(time.days)}:{pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
    </span>
  )
}

function Digit({ value, label, large }: { value: string; label: string; large?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.3em' }}>
      <span>{value}</span>
      {large && (
        <span style={{
          fontSize: 'clamp(0.5rem, 1.2vw, 0.6rem)',
          color: 'var(--text-dim)',
          letterSpacing: '0.2em',
          fontWeight: 400,
        }}>
          {label}
        </span>
      )}
    </span>
  )
}

function Sep() {
  return <span style={{ opacity: 0.3, fontWeight: 300 }}>:</span>
}
