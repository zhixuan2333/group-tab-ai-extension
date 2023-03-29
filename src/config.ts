import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export enum ProviderType {
  Local = "local"
}

export interface LocalProviderConfig {
  url: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.Local]: LocalProviderConfig | null
  }
}

export const defaultProviderConfigs: ProviderConfigs = {
  provider: ProviderType.Local,
  configs: {
    [ProviderType.Local]: {
      url: ""
    }
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const providerConfigs = await storage.get<ProviderConfigs>("providerConfigs")
  if (providerConfigs === undefined) {
    return defaultProviderConfigs
  }
  return providerConfigs
}

export async function setProviderConfigs(
  providerConfigs: ProviderConfigs
): Promise<void> {
  await storage.set("providerConfigs", providerConfigs)
}
