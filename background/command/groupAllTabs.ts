import { allTabsPrompt } from "~background/prompts"
import { getProvider } from "~background/providers"

export async function groupAllTabs(windowID?: number) {
  // The GPT response is take many time to response,
  // The last windows maybe change to another windows
  // So we need to get the current window id
  let windowId: number = null
  if (windowID) {
    windowId = windowID
  } else {
    const window = await chrome.windows.getCurrent()
    windowId = window.id
  }
  const tabs = await chrome.tabs.query({
    windowId: windowId
  })

  let prompts: string = await allTabsPrompt(tabs)

  const provider = await getProvider()
  const response = await provider.generate(prompts)

  let resp: Group[] = null
  try {
    resp = await JSON.parse(response)
  } catch (error) {
    console.log(error)
    return
  }
  console.log(resp)

  await grounpTabs(resp, windowId)
}

async function grounpTabs(
  data: Group[],
  windowId: number = chrome.windows.WINDOW_ID_CURRENT
) {
  console.log("ungrouping all tabs")

  const unGroupTabs = await chrome.tabs.query({ windowId, groupId: -1 })
  unGroupTabs.forEach(async (tab) => {
    await chrome.tabs.ungroup(tab.id)
  })
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

interface Group {
  group_name: string
  ids: number[]
}
