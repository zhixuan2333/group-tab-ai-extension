import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: "sync"
})

export enum ProviderType {
  Local = "local",
  OpenAI = "openai"
}

export interface LocalProviderConfig {
  url: string
}

export interface OpenAIProviderConfig {
  token: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.OpenAI]: OpenAIProviderConfig
  }
}

export const defaultProviderConfigs: ProviderConfigs = {
  provider: ProviderType.Local,
  configs: {
    openai: {
      token: ""
    }
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const providerConfigs = await storage.get<ProviderConfigs>("providerConfigs")
  if (providerConfigs === undefined) {
    console.log("config not found, use default config")
    return defaultProviderConfigs
  }
  return providerConfigs
}

export async function setProviderConfigs(
  providerConfigs: ProviderConfigs
): Promise<void> {
  await storage.set("providerConfigs", providerConfigs)
}
