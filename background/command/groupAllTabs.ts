import { allTabsPrompt } from "~background/prompts"
import { getProvider } from "~background/providers"
import { getSettings } from "~storage/setting"

export async function groupAllTabs(windowID?: number): Promise<void> {
  const setting = getSettings()

  // The GPT response is take many time to response,
  // The last windows maybe change to another windows
  // So we need to get the current window id
  let windowId: number = 0
  if (windowID !== undefined) {
    // On popup menu, It will pass the in correct window id
    windowId = windowID
  } else {
    const window = await chrome.windows.getCurrent()
    if (window.id === undefined) {
      return
    }
    windowId = window.id
  }

  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ windowId })
  const tabIDs: number[] = []
  for (const tab of tabs) {
    if (tab.id === undefined) {
      continue
    }
    tabIDs.push(tab.id)
  }
  void chrome.tabs.ungroup(tabIDs)
  console.log("ungrouping all tabs")

  const prompts = allTabsPrompt(tabs)
  const provider = getProvider()

  // Set badge text to show the time
  const startTime = new Date().getTime()
  const timer = setInterval(() => {
    const now = new Date().getTime()
    const diff = Math.floor((now - startTime) / 1000).toString()
    void chrome.action.setBadgeText({ text: diff })
  }, 1000)

  let resp: Group[] = []
  try {
    const response = await (await provider).generate(await prompts)
    resp = await JSON.parse(response)
  } catch (error) {
    console.log(error)
    clearInterval(timer)
    void chrome.action.setBadgeText({ text: "Err" })
    return
  }
  console.log(resp)

  await grounpTabs(resp, windowId, (await setting).showName)

  // Clear badge text
  clearInterval(timer)
  void chrome.action.setBadgeText({ text: "" })
}

async function grounpTabs(
  data: Group[],
  windowId: number = chrome.windows.WINDOW_ID_CURRENT,
  showName: boolean = true
): Promise<void> {
  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ windowId })
  for (const group of data) {
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
        continue
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
      continue
    }

    const g = chrome.tabs.group({
      tabIds: ids,
      createProperties: {
        windowId
      }
    })
    const a = await chrome.tabGroups.update(await g, {
      title: showName ? "🤖 | " + group.group_name : "🤖",
      collapsed: true
    })
    console.log("Grouped ", a.title)
  }
  console.log("Grouped all tabs")

  // Move all non grouped tabs to the end
  const nonGroupTabs = await chrome.tabs.query({
    windowId,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
  })

  for (const tab of nonGroupTabs) {
    if (tab.id === undefined) {
      continue
    }
    await chrome.tabs.move(tab.id, { index: -1 })
  }
  console.log("Moved all non grouped tabs to the end")
}

interface Group {
  group_name: string
  ids: number[]
}
