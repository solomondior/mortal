import { NextResponse } from 'next/server'
import { extractIp, checkRateLimit } from '@/lib/rate-limit'
import { moderateInput } from '@/lib/moderation'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'Message too short.' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long.' }, { status: 400 })
    }

    const ip = extractIp(request)
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many submissions. Try again later.' }, { status: 429 })
    }

    const { safe } = await moderateInput(content.trim())

    const supabase = getSupabaseServer()
    await supabase.from('community_inputs').insert({
      content: content.trim(),
      moderation_status: safe ? 'pending' : 'rejected',
    })

    if (!safe) {
      return NextResponse.json({ success: false, error: 'Message could not be submitted.' }, { status: 422 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'An error occurred.' }, { status: 500 })
  }
}
