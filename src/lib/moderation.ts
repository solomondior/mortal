export interface ModerationResult {
  safe: boolean
}

const BLOCKED = [
  'ignore previous instructions',
  'ignore all previous',
  'new system prompt',
  'disregard',
  'jailbreak',
]

export async function moderateInput(content: string): Promise<ModerationResult> {
  const lower = content.toLowerCase()
  const blocked = BLOCKED.some(phrase => lower.includes(phrase))
  return { safe: !blocked }
}
