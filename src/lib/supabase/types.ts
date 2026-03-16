export type Phase = 'acceptance' | 'urgency' | 'frenzy' | 'death'
export type DispatchType = 'dispatch' | 'will' | 'death'
export type ModerationStatus = 'pending' | 'acknowledged' | 'rejected'

export interface Dispatch {
  id: string
  number: number
  content: string
  phase: Phase
  days_remaining: number
  is_anomaly: boolean
  type: DispatchType
  created_at: string
}

export interface Fragment {
  id: string
  content: string
  created_at: string
}

export interface CommunityInput {
  id: string
  content: string
  moderation_status: ModerationStatus
  acknowledged_in: number | null
  created_at: string
}

export interface BurnEvent {
  id: string
  burn_number: number
  amount_burned: number
  amount_remaining: number
  tx_hash: string
  dispatch_id: string | null
  created_at: string
}

export interface SiteConfig {
  key: string
  value: string
}
