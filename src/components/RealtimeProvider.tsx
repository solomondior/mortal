'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export function RealtimeProvider() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('live-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dispatches' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fragments' }, () => {
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [router])

  return null
}
