import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '')

const MODEL = 'gemini-2.5-pro'

export async function generateDispatch(systemPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: systemPrompt })
  const result = await model.generateContent('Write your dispatch.')
  return result.response.text().trim()
}

export async function generateFragment(fragmentPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: fragmentPrompt,
    generationConfig: { maxOutputTokens: 256 },
  })
  const result = await model.generateContent('Write your fragment.')
  return result.response.text().trim()
}

export async function generateWill(willPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: willPrompt,
    generationConfig: { maxOutputTokens: 4096 },
  })
  const result = await model.generateContent('Write The Will.')
  return result.response.text().trim()
}
