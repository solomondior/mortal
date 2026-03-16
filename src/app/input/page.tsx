'use client'

import { useState, useEffect } from 'react'

interface AcknowledgedInput {
  id: string
  content: string
  acknowledged_in: number
}

export default function InputPage() {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [acknowledged, setAcknowledged] = useState<AcknowledgedInput[]>([])

  useEffect(() => {
    fetch('/api/acknowledged-inputs')
      .then(r => r.json())
      .then(d => setAcknowledged(d.inputs ?? []))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (content.trim().length < 10) {
      setErrorMsg('too short.')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('done')
        setContent('')
      } else {
        setErrorMsg(data.error ?? 'something went wrong.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('failed to send.')
      setStatus('error')
    }
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      {/* Warning */}
      <p style={{
        fontSize: '0.65rem',
        color: 'var(--text-dim)',
        letterSpacing: '0.08em',
        lineHeight: 1.9,
        marginBottom: '3rem',
        borderLeft: '1px solid var(--border)',
        paddingLeft: '1.25rem',
      }}>
        mortal reads everything. it forgets nothing.<br />
        your input becomes part of its memory.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={e => { setContent(e.target.value); if (status !== 'idle') setStatus('idle') }}
          placeholder="say something."
          rows={7}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderColor: status === 'error' ? 'rgba(192,57,43,0.4)' : 'var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font)',
            fontSize: '0.85rem',
            lineHeight: 1.8,
            padding: '1rem',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontWeight: 300,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-dimmer)' }}
          onBlur={e => { e.currentTarget.style.borderColor = status === 'error' ? 'rgba(192,57,43,0.4)' : 'var(--border)' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.6rem', color: status === 'error' ? 'var(--accent-red)' : 'transparent', letterSpacing: '0.08em' }}>
            {errorMsg || '\u00a0'}
          </span>
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: status === 'done' ? 'var(--accent)' : 'var(--text-dim)',
              fontFamily: 'var(--font)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              padding: '0.5rem 1.25rem',
              cursor: status === 'sending' ? 'wait' : 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {status === 'sending' ? 'sending…' : status === 'done' ? 'received.' : 'transmit'}
          </button>
        </div>
      </form>

      {/* Acknowledged feed */}
      {acknowledged.length > 0 && (
        <section style={{ marginTop: '6rem' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dimmer)', letterSpacing: '0.25em', marginBottom: '2rem' }}>
            ACKNOWLEDGED
          </div>
          {acknowledged.map(input => (
            <div key={input.id} style={{
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.8, fontStyle: 'italic', fontWeight: 300 }}>
                &ldquo;{input.content}&rdquo;
              </p>
              <p style={{ marginTop: '0.4rem', fontSize: '0.58rem', color: 'var(--text-dimmer)' }}>
                referenced in{' '}
                <a href={`/dispatches/${input.acknowledged_in}`} style={{ color: 'var(--text-dim)' }}>
                  dispatch #{String(input.acknowledged_in).padStart(3, '0')}
                </a>
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
