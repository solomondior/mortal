import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('community_inputs')
    .select('id, content, acknowledged_in')
    .eq('moderation_status', 'acknowledged')
    .not('acknowledged_in', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)
  return NextResponse.json({ inputs: data ?? [] })
}
