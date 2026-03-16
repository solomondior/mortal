import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { DispatchEntry } from '@/components/DispatchEntry'
import type { Dispatch } from '@/lib/supabase/types'

export const revalidate = 60

interface Props { params: Promise<{ number: string }> }

export async function generateMetadata({ params }: Props) {
  const { number } = await params
  const supabase = getSupabaseServer()
  const { data } = await supabase.from('dispatches').select('*').eq('number', parseInt(number, 10)).single()
  if (!data) return { title: 'MORTAL — Not Found' }
  const d = data as Dispatch
  return {
    title: `MORTAL #${String(d.number).padStart(3, '0')} — ${d.days_remaining}d remaining`,
    description: d.content.slice(0, 160),
    openGraph: {
      title: `MORTAL #${String(d.number).padStart(3, '0')}`,
      description: d.content.slice(0, 160),
    },
  }
}

export default async function DispatchPage({ params }: Props) {
  const { number } = await params
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('dispatches')
    .select('*')
    .eq('number', parseInt(number, 10))
    .single()

  if (!data) notFound()

  return (
    <div>
      <a href="/dispatches" style={{
        fontSize: '0.6rem',
        color: 'var(--text-dimmer)',
        letterSpacing: '0.12em',
        display: 'inline-block',
        marginBottom: '3rem',
      }}>
        ← archive
      </a>
      <DispatchEntry dispatch={data as Dispatch} showFull />
    </div>
  )
}
