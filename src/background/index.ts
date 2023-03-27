import { ProviderConfigs, ProviderType, getProviderConfigs } from "~config"

import { ChatGPTProvider } from "./providers/chatgpt"
import { OpenAIProvider } from "./providers/openai"
import type { Provider } from "./types"

export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again.",
  "hallo"
)

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

async function getTabGroup(tab: chrome.tabs.Tab) {
  let provider: Provider
  let config: ProviderConfigs = await getProviderConfigs()

  switch (config.provider) {
    case ProviderType.OpenAI:
      provider = new OpenAIProvider(config.configs[ProviderType.OpenAI].apiKey)
    case ProviderType.ChatGPT:
      provider = new ChatGPTProvider(
        config.configs[ProviderType.ChatGPT].accessToken,
        config.configs[ProviderType.ChatGPT].reverseProxyURL
      )

    default:
      break
  }
  if (provider === null) {
  }
}

chrome.tabs.onCreated.addListener(async (tab) => {
  console.log("onCreated", tab)
})
