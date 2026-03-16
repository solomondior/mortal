import { getSupabaseServer } from '@/lib/supabase/server'
import type { Dispatch, CommunityInput } from '@/lib/supabase/types'

export interface AgentContext {
  recentDispatches: Pick<Dispatch, 'number' | 'content' | 'phase' | 'days_remaining' | 'created_at'>[]
  pendingInputs: Pick<CommunityInput, 'id' | 'content'>[]
  memoryCount: number
}

export async function buildAgentContext(): Promise<AgentContext> {
  const supabase = getSupabaseServer()

  const [dispatchesResult, inputsResult, configResult] = await Promise.all([
    supabase
      .from('dispatches')
      .select('number, content, phase, days_remaining, created_at')
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('community_inputs')
      .select('id, content')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50),

    supabase
      .from('site_config')
      .select('value')
      .eq('key', 'memory_count')
      .single(),
  ])

  return {
    recentDispatches: dispatchesResult.data ?? [],
    pendingInputs: inputsResult.data ?? [],
    memoryCount: parseInt(configResult.data?.value ?? '0', 10),
  }
}
