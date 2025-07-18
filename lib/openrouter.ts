import { createOpenAI } from "@ai-sdk/openai"
import { prisma } from "@/lib/prisma"

export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

export const MODEL_PRIORITY = [
  "mistralai/mistral-7b-instruct:free",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "huggingface/zephyr-7b-beta:free",
  "openchat/openchat-7b:free",
  "gryphe/mythomist-7b:free",
  "undi95/toppy-m-7b:free",
]

// Add type for agent with optional model
interface AgentWithModel {
  id: string;
  model?: string;
}

export async function getAvailableModel(agentId?: string): Promise<string> {
  let preferredModel = MODEL_PRIORITY[0]
  if (agentId) {
    try {
      const agent = await prisma.agent.findUnique({ where: { id: agentId } }) as AgentWithModel | null
      if (agent && agent.model) {
        preferredModel = agent.model
      }
    } catch {
      // ignore and fallback
    }
  }

  // Get available models from OpenRouter
  let availableModels: string[] = []
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      availableModels = (data.data || []).map((m: { id: string }) => m.id)
    }
  } catch {
    // ignore and fallback to priority list
  }

  // Try preferred model first, then fall back to next available in priority list
  const tryModels = [preferredModel, ...MODEL_PRIORITY.filter(m => m !== preferredModel)]
  for (const model of tryModels) {
    if (availableModels.includes(model)) {
      return model
    }
  }
  throw new Error("No available models found.")
}
