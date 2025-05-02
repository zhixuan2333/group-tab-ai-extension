import { groupAllTabs } from "./groupAllTabs"

let isRunning: boolean = false

interface windowLastUpdate {
  windowId: number
  eventCount: number
}

const windowLastUpdates: windowLastUpdate[] = []

export function autoGroup(tab: chrome.tabs.Tab): void {
  console.log(`[AutoGroup] autoGroup function entered for tab ID: ${tab.id ?? 'N/A'}`);
  if (tab.id === undefined) {
    console.log(`[AutoGroup] Tab ID is undefined. Returning.`);
    return
  }

  let index = windowLastUpdates.findIndex(
    (item) => item.windowId === tab.windowId
  )
  if (index === -1) {
    console.log(`[AutoGroup] First event for window ID: ${tab.windowId}. Initializing count.`);
    index =
      windowLastUpdates.push({
        windowId: tab.windowId,
        eventCount: 0
      }) - 1
  }

  windowLastUpdates[index].eventCount++
  console.log(
    `[AutoGroup] Window ID: ${windowLastUpdates[index].windowId}, New Event Count: ${windowLastUpdates[index].eventCount}`
  )

  if (isRunning) {
    console.log(`[AutoGroup] A group process is already running. Returning.`);
    return
  }

  if (windowLastUpdates[index].eventCount >= 20) {
    console.log(`[AutoGroup] Event count threshold (>=20) reached for window ID: ${windowLastUpdates[index].windowId}. Triggering full regroup via groupAllTabs.`);
    isRunning = true
    console.log(`[AutoGroup] Reset event count for window ID: ${windowLastUpdates[index].windowId} to 0.`);
    void push(windowLastUpdates[index].windowId)
    windowLastUpdates[index].eventCount = 0
  } else {
    console.log(`[AutoGroup] Event count ${windowLastUpdates[index].eventCount} is less than 20 for window ID: ${windowLastUpdates[index].windowId}. Not triggering.`);
  }
}

async function push(windowId: number): Promise<void> {
  console.log(`[AutoGroup] push: Triggering groupAllTabs for window ID: ${windowId}.`);
  try {
    await groupAllTabs(windowId);
    console.log(`[AutoGroup] push: groupAllTabs completed successfully for window ID: ${windowId}.`);
  } catch (error: unknown) {
    console.error(`[AutoGroup] push: Error calling groupAllTabs for window ID ${windowId}: `, error)
  } finally {
    console.log(`[AutoGroup] push: Setting isRunning to false for window ID: ${windowId}.`);
    isRunning = false
  }
}
