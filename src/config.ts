import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export enum ProviderType {
  OpenAI = "openai",
  ChatGPT = "chatgpt"
}

export interface OpenAIProviderConfig {
  apiKey: string
}

export interface ChatGPTProviderConfig {
  accessToken: string
  reverseProxyURL?: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.OpenAI]: OpenAIProviderConfig | null
    [ProviderType.ChatGPT]: ChatGPTProviderConfig | null
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const providerConfigs = await storage.get<ProviderConfigs>("providerConfigs")
  return providerConfigs
}

export async function setProviderConfigs(
  providerConfigs: ProviderConfigs
): Promise<void> {
  await storage.set("providerConfigs", providerConfigs)
}
