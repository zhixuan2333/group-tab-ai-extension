import { groupAllTabs } from "./command/groupAllTabs"
import { unGroupAllTabs } from "./command/unGroupAllTabs"

console.log("👋 Hi! Auto group tabs extension is running now!")

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "ungroup-all-tabs":
      await unGroupAllTabs()
      break
    case "all-tabs":
      await groupAllTabs()
      break
    case "one-tab":
      break
    default:
      break
  }
})

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
