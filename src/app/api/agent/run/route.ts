import { NextResponse } from 'next/server'
import { getDaysRemaining, getPhase, ANOMALY_DAY } from '@/lib/constants'
import { buildAgentContext } from '@/lib/agent/context'
import { buildSystemPrompt, buildFragmentPrompt, buildWillPrompt } from '@/lib/agent/prompt'
import { generateDispatch, generateFragment, generateWill } from '@/lib/agent/generate'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseServer()

  try {
    const daysRemaining = getDaysRemaining()
    const phase = getPhase(daysRemaining)

    // Guard: if death dispatch already exists, return early
    const { data: deathDispatch } = await supabase
      .from('dispatches')
      .select('id')
      .eq('type', 'death')
      .maybeSingle()
    if (deathDispatch) {
      return NextResponse.json({ success: true, skipped: true, reason: 'already dead' })
    }

    // Tombstone fallback on death day
    if (daysRemaining <= 0) {
      await supabase.from('site_config').update({ value: 'true' }).eq('key', 'tombstone_unlocked')
    }

    // Read agent state from site_config
    const { data: configRows } = await supabase.from('site_config').select('key, value')
    const config = Object.fromEntries(
      (configRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    )
    const anomalyTriggered = config['anomaly_triggered'] === 'true'
    const willGenerated = config['will_generated'] === 'true'
    const memoryCount = parseInt(config['memory_count'] ?? '0', 10)

    // Build context
    const context = await buildAgentContext()

    // Anomaly check
    const isAnomalyDay = !anomalyTriggered && daysRemaining === ANOMALY_DAY

    // Will check: generate on first tick with 1-5 days remaining
    if (!willGenerated && daysRemaining >= 1 && daysRemaining <= 5) {
      const willContent = await generateWill(buildWillPrompt(daysRemaining, context))
      const { data: lastForWill } = await supabase
        .from('dispatches')
        .select('number')
        .order('number', { ascending: false })
        .limit(1)
        .maybeSingle()
      const willNumber = (lastForWill?.number ?? 0) + 1
      await supabase.from('dispatches').insert({
        number: willNumber,
        content: willContent,
        phase,
        days_remaining: daysRemaining,
        is_anomaly: false,
        type: 'will',
      })
      await supabase.from('site_config').update({ value: 'true' }).eq('key', 'will_generated')
    }

    // Generate dispatch
    const systemPrompt = buildSystemPrompt({ daysRemaining, phase, isAnomalyDay, context })
    const dispatchContent = await generateDispatch(systemPrompt)

    // Determine dispatch number
    const { data: lastDispatch } = await supabase
      .from('dispatches')
      .select('number')
      .order('number', { ascending: false })
      .limit(1)
      .maybeSingle()
    const dispatchNumber = (lastDispatch?.number ?? 0) + 1

    const { data: insertedDispatch } = await supabase
      .from('dispatches')
      .insert({
        number: dispatchNumber,
        content: dispatchContent,
        phase,
        days_remaining: daysRemaining,
        is_anomaly: isAnomalyDay,
        type: daysRemaining === 0 ? 'death' : 'dispatch',
      })
      .select('number')
      .single()

    // Mark anomaly triggered
    if (isAnomalyDay) {
      await supabase.from('site_config').update({ value: 'true' }).eq('key', 'anomaly_triggered')
    }

    // Acknowledge pending inputs
    if (context.pendingInputs.length > 0) {
      await supabase
        .from('community_inputs')
        .update({ moderation_status: 'acknowledged', acknowledged_in: insertedDispatch?.number ?? dispatchNumber })
        .eq('moderation_status', 'pending')
    }

    // Update memory count
    const newMemoryCount = memoryCount + 1 + context.pendingInputs.length
    await supabase.from('site_config').update({ value: String(newMemoryCount) }).eq('key', 'memory_count')

    // Optional fragment
    const generateFrag = phase === 'frenzy' || Math.random() > 0.5
    if (generateFrag) {
      const fragmentContent = await generateFragment(buildFragmentPrompt(daysRemaining, phase))
      await supabase.from('fragments').insert({ content: fragmentContent })
    }

    return NextResponse.json({ success: true, dispatch: dispatchNumber })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
