import { createOpenAI } from '@ai-sdk/openai'

export const createOpenAIProvider = ({
  organization,
  project,
  apiKey,
  baseURL,
}: {
  organization: string
  project: string
  apiKey: string
  baseURL: string
}) => {
  return createOpenAI({
    compatibility: 'strict',
    organization,
    project,
    apiKey,
    baseURL,
  })
}
