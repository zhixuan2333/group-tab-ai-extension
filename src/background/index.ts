import { ProviderConfigs, ProviderType, getProviderConfigs } from "~config"

import { allTabsPrompt } from "./prompts"
import { LocalProvider } from "./providers/local"
import { OpenAIProvider } from "./providers/openai"
import type { Provider } from "./types"

console.log("👋 Hi! Auto group tabs extension is running now!")

async function unGroupingTabs(windowId: number = -2) {
  const tabs = await chrome.tabs.query({ windowId })
  tabs.forEach(async (tab) => {
    await chrome.tabs.ungroup(tab.id)
  })
}

async function getProvider(): Promise<Provider> {
  let config: ProviderConfigs = await getProviderConfigs()
  console.log(config)
  switch (config.provider) {
    case ProviderType.Local:
      return new LocalProvider("http://localhost:8000/ask")
    case ProviderType.OpenAI:
      return new OpenAIProvider(
        config.configs[ProviderType.OpenAI]?.token ?? ""
      )
    default:
      return new LocalProvider("http://localhost:8000/ask")
  }
}

async function grounpTabs(data: Group[], windowId: number = -2) {
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
        .catch((error: Error) => {
          console.error(error)
          return
        })
        // If there is an error, will return.
        // But eslint say the prompts type is string | void.
        // So we need to return an empty string.
        .then(() => "")

      const provider = await getProvider()
      const response = await provider.generate(prompts)

      // Parse response
      const resp: Group[] = await JSON.parse(response)
        .catch((error) => {
          console.error(error)
          return
        })
        .then(() => null)
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

const response = `[{\"group_name\":\"API Development\",\"ids\":[60156786,60156568,60156578,60156732,60156739,60157224,60157227,60157206]}, {\"group_name\":\"OpenAI\",\"ids\":[60157206,60157191,60156917,60156920,60156924,60157206,60157241]}, {\"group_name\":\"Docker\",\"ids\":[60156712,60156707]}, {\"group_name\":\"Chrome Extension\",\"ids\":[60156752,60156774,60156742,60156756,60157198]}, {\"group_name\":\"Utility\",\"ids\":[60156560,60156563,60156571,60156581,60156598,60156889,60157221,60157257,60157272,60156734]}, {\"group_name\":\"Miscellaneous\",\"ids\":[60157275,60157291,60157218,60157258,60157279,60156589,60157215,60156803,60156902,60156489,60156911,60156862,60156437,60156773,60156874,60156670,60157188,60157276]}]`
