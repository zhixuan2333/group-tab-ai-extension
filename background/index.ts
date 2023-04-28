import { getSettings } from "~storage/setting"

import { autoGroup } from "./command/autoGroup"
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
  tabHandler(tab)
})

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    tabHandler(tab)
  }
})

function tabHandler(tab: chrome.tabs.Tab): void {
  void (async (tab): Promise<void> => {
    const setting = await getSettings()
    if (setting.autoGroup) {
      autoGroup(tab)
    }
  })(tab)
}
