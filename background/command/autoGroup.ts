import { Badge } from "~background/badge"
import { autoGroupPrompt } from "~background/prompts"
import { getProvider } from "~background/providers"
import { getSettings } from "~storage/setting"

let isRunning: boolean = false

interface windowLastUpdate {
  windowId: number
  eventCount: number
}

const windowLastUpdates: windowLastUpdate[] = []

export function autoGroup(tab: chrome.tabs.Tab): void {
  if (tab.id === undefined) {
    return
  }

  // Get index of windowLastUpdates
  let index = windowLastUpdates.findIndex(
    (item) => item.windowId === tab.windowId
  )
  if (index === -1) {
    index =
      windowLastUpdates.push({
        windowId: tab.windowId,
        eventCount: 0
      }) - 1
  }

  // Update eventCount
  windowLastUpdates[index].eventCount++
  console.log(
    windowLastUpdates[index].windowId,
    ":",
    windowLastUpdates[index].eventCount
  )

  if (isRunning) {
    return
  }

  if (windowLastUpdates[index].eventCount >= 20) {
    isRunning = true
    windowLastUpdates[index].eventCount = 0
    void push(windowLastUpdates[index].windowId)
  }
}

async function push(windowId: number): Promise<void> {
  const tabs = chrome.tabs.query({ windowId })
  const groups = chrome.tabGroups.query({ windowId })
  const provider = getProvider()
  const prompt = autoGroupPrompt(await tabs, await groups)
  const setting = getSettings()
  const timer = new Badge()
  timer.start()

  try {
    const response: Group[] = await (
      await provider
    ).generateWithFormat(await prompt)
    await groupTabs(response, windowId, (await setting).showName)
    timer.stop()
  } catch (error: unknown) {
    console.log(error)
    timer.error()
  }
  isRunning = false
}

async function groupTabs(
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
      groupId: group.group_id === -1 ? undefined : group.group_id,
      createProperties:
        group.group_id === -1
          ? {
              windowId
            }
          : undefined
    })

    const a = await chrome.tabGroups.update(await g, {
      title: showName ? "🤖 | " + group.group_name : "🤖"
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
  group_id: number
  group_name: string
  ids: number[]
}
