import { ProviderConfigs, ProviderType, getProviderConfigs } from "~config"

import { allTabsPrompt } from "./prompts"
import { LocalProvider } from "./providers/local"
import type { Provider } from "./types"

console.log("👋 Hi! Auto group tabs extension is running now!")

async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let tabs = await chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT
  })
  return tabs
}

async function getProvider(): Promise<Provider> {
  let config: ProviderConfigs = await getProviderConfigs()
  switch (config.provider) {
    case ProviderType.Local:
      return new LocalProvider("http://localhost:8000/ask")
    default:
      return new LocalProvider("http://localhost:8000/ask")
  }
}

async function grounpTabs(data: Group[]) {
  const tabs = await getAllTabs()
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

    const g = await chrome.tabs.group({ tabIds: ids })
    chrome.tabGroups.update(g, {
      title: "🤖 | " + group.group_name,
      collapsed: true
    })
  })

  // Move all non grouped tabs to the end
  await chrome.tabs.query(
    {
      windowId: chrome.windows.WINDOW_ID_CURRENT,
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
    },
    (tabs) => {
      tabs.forEach(async (tab) => {
        await chrome.tabs.move(tab.id, { index: -1 })
      })
    }
  )
}

chrome.tabs.onCreated.addListener(async (tab) => {
  console.log("onCreated", tab)
})

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "all-tabs":
      const tabs = await getAllTabs()
      const provider = await getProvider()
      const prompts = allTabsPrompt(tabs)
      // const response = await provider.generate(prompts)
      // console.log("response", response)
      const resp: Group[] = JSON.parse(response)
      console.log("resp", resp)
      grounpTabs(resp)
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

const response = `[{"group_name":"Debugging","ids":[60156437,60156489,60156505,60156524,60156721,60156786,60156571,60156599,60156586,60156590,60156593,60156598,60156614,60156732,60156739]},
{"group_name":"Docker","ids":[60156707,60156712]},
{"group_name":"Port Checking","ids":[60156556,60156560,60156563]},
{"group_name":"CORS","ids":[60156568,60156786,60156575,60156578]},
{"group_name":"Tab Management","ids":[60156734,60156767,60156774,60156759,60156752]},
{"group_name":"Miscellaneous","ids":[60156508,60156803,60156581,60156670,60156693,60156724,60156729,60156742,60156756,60156773,60156589]}]`
