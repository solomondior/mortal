import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { getDaysRemaining } from '@/lib/constants'

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { burn_number, amount_burned, amount_remaining, tx_hash } = await request.json()

    if (!burn_number || amount_burned == null || amount_remaining == null || !tx_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    const { data: latestDispatch } = await supabase
      .from('dispatches')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    await supabase.from('burn_events').insert({
      burn_number,
      amount_burned,
      amount_remaining,
      tx_hash,
      dispatch_id: latestDispatch?.id ?? null,
    })

    const isFinalBurn = amount_remaining === 0
    const isDayOfDeath = getDaysRemaining() <= 0
    if (isFinalBurn || isDayOfDeath) {
      await supabase
        .from('site_config')
        .update({ value: 'true' })
        .eq('key', 'tombstone_unlocked')
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
