import type { Provider } from "~background/types"
import { type ProviderConfigs, ProviderType, getProviderConfigs } from "~config"

import { OpenAIProvider } from "./openai"

export async function getProvider(): Promise<Provider> {
  const config: ProviderConfigs = await getProviderConfigs()
  switch (config.provider) {
    case ProviderType.Local:
    case ProviderType.OpenAI:
    default:
      return new OpenAIProvider(
        config.configs[ProviderType.OpenAI]?.token ?? ""
      )
  }
}
