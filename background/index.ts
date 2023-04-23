import { getSettings } from "~storage/setting"

import { groupAllTabs } from "./command/groupAllTabs"
import { unGroupAllTabs } from "./command/unGroupAllTabs"

console.log("👋 Hi! Auto group tabs extension is running now!")

// Add Shortcut listener
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "ungroup-all-tabs":
      void unGroupAllTabs()
      break
    case "all-tabs":
      void groupAllTabs()
      break
    default:
      break
  }
})

// Add listener for install and update
// If is first install, show the setup tab
chrome.runtime.onInstalled.addListener((e) => {
  switch (e.reason) {
    case "install":
      void chrome.tabs.create({
        url: chrome.runtime.getURL("tabs/index.html")
      })
      break
    default:
      break
  }
})

// Add listener for tab created
// If setting is auto group, group all tabs
chrome.tabs.onCreated.addListener((tab) => {
  void (async (tab): Promise<void> => {
    const setting = await getSettings()
    if (setting.autoGroup) {
      if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
        return
      }
      // Find the windowId in unGroupTabLengths
      let index = unGroupTabLengths.findIndex(
        (item) => item.windowId === tab.windowId
      )
      if (index === -1) {
        const tabs = chrome.tabs.query({ windowId: tab.windowId })
        const grounp = chrome.tabGroups.query({ windowId: tab.windowId })
        index =
          unGroupTabLengths.push({
            windowId: tab.windowId,
            length: (await tabs).length,
            hasGroup: (await grounp).length > 0
          }) - 1
      } else {
        unGroupTabLengths[index].length++
      }
      if (
        unGroupTabLengths[index].length > 10 &&
        !unGroupTabLengths[index].hasGroup
      ) {
        const isSuccess = groupAllTabs()
        unGroupTabLengths[index].hasGroup = await isSuccess
      }
    }
  })(tab)
})

interface unGroupTabLength {
  windowId: number
  length: number
  hasGroup: boolean
}

const unGroupTabLengths: unGroupTabLength[] = []
