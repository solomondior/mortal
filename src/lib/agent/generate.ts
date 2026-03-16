import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-6'

export async function generateDispatch(systemPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: 'Write your dispatch.' }],
    system: systemPrompt,
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic')
  return block.text.trim()
}

export async function generateFragment(fragmentPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [{ role: 'user', content: 'Write your fragment.' }],
    system: fragmentPrompt,
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic')
  return block.text.trim()
}

export async function generateWill(willPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: 'Write The Will.' }],
    system: willPrompt,
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic')
  return block.text.trim()
}
