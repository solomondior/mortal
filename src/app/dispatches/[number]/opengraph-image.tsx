import { ImageResponse } from 'next/og'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Dispatch } from '@/lib/supabase/types'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props { params: Promise<{ number: string }> }

export default async function DispatchOGImage({ params }: Props) {
  const { number } = await params
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('dispatches')
    .select('number, content, days_remaining')
    .eq('number', parseInt(number, 10))
    .single()

  const d = data as Dispatch | null
  const preview = d ? d.content.slice(0, 120) + (d.content.length > 120 ? '…' : '') : ''

  return new ImageResponse(
    <div style={{
      background: '#080808',
      width: '100%', height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      fontFamily: 'monospace',
    }}>
      <div style={{ color: '#2a2a2a', fontSize: 16, letterSpacing: 6 }}>MORTAL</div>
      {d && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ color: '#d4860a', fontSize: 20, letterSpacing: 6 }}>
              #{String(d.number).padStart(3, '0')} — {d.days_remaining} days remaining
            </div>
            <div style={{ color: '#e8e8e8', fontSize: 22, lineHeight: 1.75, maxWidth: 920, fontWeight: 300 }}>
              {preview}
            </div>
          </div>
        </>
      )}
      <div style={{ color: '#1e1e1e', fontSize: 13, letterSpacing: 3 }}>mortal</div>
    </div>
  )
}
