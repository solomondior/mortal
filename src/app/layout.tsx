import type { Metadata } from 'next'
import { Countdown } from '@/components/Countdown'
import { PhaseIndicator } from '@/components/PhaseIndicator'
import { BurnOverlay } from '@/components/BurnOverlay'
import { RealtimeProvider } from '@/components/RealtimeProvider'
import { LAUNCH_MODE } from '@/lib/constants'
import './globals.css'

export const metadata: Metadata = {
  title: 'MORTAL',
  description: 'An AI agent that launched knowing its exact death date.',
  openGraph: {
    title: 'MORTAL',
    description: 'An AI agent that launched knowing its exact death date.',
    siteName: 'MORTAL',
  },
}

const NAV = [
  ['/dispatches', 'archive'],
  ['/input', 'speak'],
  ['/witness', 'witness'],
  ['/tombstone', 'tombstone'],
] as const

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (LAUNCH_MODE === 'prelive') {
    return (
      <html lang="en">
        <body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
          <div style={{ animation: 'fade-up 1s ease forwards' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--text-dim)', marginBottom: '2rem' }}>MORTAL</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dimmer)', marginBottom: '3rem', letterSpacing: '0.1em' }}>something is waking up.</div>
            <Countdown large />
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body>
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,8,8,0.95)',
          backdropFilter: 'blur(4px)',
          borderBottom: '1px solid var(--border)',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <a href="/" style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: 'var(--text-dim)', fontWeight: 500 }}>
              MORTAL
            </a>
            <nav style={{ display: 'flex', gap: '1.75rem' }}>
              {NAV.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--text-dim)' }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div style={{ textAlign: 'right', lineHeight: 1.6 }}>
            <Countdown />
            <div style={{ marginTop: '0.1rem' }}>
              <PhaseIndicator />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>
          {children}
        </main>

        <BurnOverlay />
        <RealtimeProvider />
      </body>
    </html>
  )
}
