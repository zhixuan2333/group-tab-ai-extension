import { ProviderConfigs, ProviderType, getProviderConfigs } from "~config"

import { allTabsPrompt } from "./prompts"
import { OpenAIProvider } from "./providers/openai"
import type { Provider } from "./types"

console.log("👋 Hi! Auto group tabs extension is running now!")

async function unGroupingTabs(
  windowId: number = chrome.windows.WINDOW_ID_CURRENT
) {
  const tabs = await chrome.tabs.query({ windowId })
  tabs.forEach(async (tab) => {
    await chrome.tabs.ungroup(tab.id)
  })
}

async function getProvider(): Promise<Provider> {
  let config: ProviderConfigs = await getProviderConfigs()
  switch (config.provider) {
    case ProviderType.Local:
    case ProviderType.OpenAI:
    default:
      return new OpenAIProvider(
        config.configs[ProviderType.OpenAI]?.token ?? ""
      )
  }
}

async function grounpTabs(
  data: Group[],
  windowId: number = chrome.windows.WINDOW_ID_CURRENT
) {
  console.log("ungrouping all tabs")
  await unGroupingTabs(windowId)
  const tabs = await chrome.tabs.query({ windowId })
  data.forEach(async (group) => {
    // At some time, they are return empty group name and like "other", "others", "miscellaneous".
    // So we need to filter out these group
    switch (group.group_name) {
      case "":
      case "Other":
      case "other":
      case "Others":
      case "others":
      case "Miscellaneous":
      case "miscellaneous":
        return
      default:
        break
    }

    // Because AI is take many time to response,
    // So we need to filter out the tabs that are not exist
    const ids = group.ids.filter((id) => {
      return tabs.find((tab) => tab.id === id)
    })

    // If there is only one tab in the group, we don't need to group it
    if (ids.length === 1 || ids.length === 0) {
      return
    }

    const g = chrome.tabs.group({
      tabIds: ids,
      createProperties: {
        windowId
      }
    })
    const a = await chrome.tabGroups.update(await g, {
      title: "🤖 | " + group.group_name,
      collapsed: true
    })
    console.log("Grouped " + a.title)
  })
  console.log("Grouped all tabs")

  // Move all non grouped tabs to the end
  const nonGroupTabs = await chrome.tabs.query({
    windowId: windowId,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
  })
  nonGroupTabs.forEach(async (tab) => {
    await chrome.tabs.move(tab.id, { index: -1 })
  })
  console.log("Moved all non grouped tabs to the end")
}

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "ungroup-all-tabs":
      await unGroupingTabs()
      break
    case "all-tabs":
      // The GPT response is take many time to response,
      // The last windows maybe change to another windows
      // So we need to get the current window id
      const window = await chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT)
      const windowId = window.id
      const tabs = await chrome.tabs.query({
        windowId: windowId
      })

      let prompts: string = await allTabsPrompt(tabs)

      const provider = await getProvider()
      const response = await provider.generate(prompts)

      let resp: Group[] = null
      // Parse response
      try {
        resp = await JSON.parse(response)
      } catch (error) {
        console.log(error)
        return
      }
      console.log(resp)

      await grounpTabs(resp, windowId)
      break
    case "one-tab":
      break
    default:
      break
  }
})

interface Group {
  group_name: string
  ids: number[]
}

// Add listener for install and update
// If is first install, show the setup tab
chrome.runtime.onInstalled.addListener(async (e) => {
  switch (e.reason) {
    case "install":
      console.log("👋 Hi! Auto group tabs extension is running now!")
      await chrome.tabs.create({
        url: chrome.runtime.getURL("tabs/index.html")
      })
      break
    case "update":
      console.log("👋 Hi! Auto group tabs extension is running now!")
      break
    default:
      break
  }
})
