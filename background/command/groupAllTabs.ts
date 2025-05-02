import { allTabsPrompt, updateGroupsPrompt } from "~background/prompts"
import { getProvider } from "~background/providers"
import { getSettings } from "~storage/setting"

export async function groupAllTabs(windowID?: number): Promise<boolean> {
  const setting = await getSettings()

  // The GPT response is take many time to response,
  // The last windows maybe change to another windows
  // So we need to get the current window id
  const windowId = windowID ?? (await chrome.windows.getCurrent()).id
  if (windowId === undefined) {
    return false
  }

  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ windowId })
  if (tabs.length === 0) {
    console.log("No tabs to group.")
    return true // Nothing to do
  }

  // Determine which prompt to use based on the setting
  let promptPromise: Promise<string>;
  if (setting.keepExistingGroups) {
    console.log("Keep existing groups mode enabled. Querying existing groups.")
    const existingGroups = await chrome.tabGroups.query({ windowId });
    promptPromise = updateGroupsPrompt(tabs, existingGroups, setting.specialRequirements);
  } else {
    console.log("Standard grouping mode enabled.")
    promptPromise = allTabsPrompt(tabs, setting.specialRequirements);
  }

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
    const prompt = await promptPromise;
    const response = await (await provider).generate(prompt)
    resp = await JSON.parse(response)
    console.log("AI Response:", resp)

    // --- Ungroup ALL tabs AFTER getting AI response --- 
    // This simplifies applying the potentially complex desired state from the AI.
    const tabIDs: number[] = []
    const currentTabs = await chrome.tabs.query({ windowId }) // Get fresh tab list
    for (const tab of currentTabs) {
      if (tab.id !== undefined) {
        tabIDs.push(tab.id)
      }
    }
    if (tabIDs.length > 0) {
        console.log("Ungrouping all tabs before applying new groups...")
        await chrome.tabs.ungroup(tabIDs)
        console.log("Finished ungrouping.")
    } else {
        console.log("No tabs found to ungroup.")
    }

    // Apply the grouping from the AI response
    await grounpTabs(resp, windowId, setting.showName, setting.keepMiscTab)

  } catch (error) {
    console.error("Error during grouping process:", error)
    clearInterval(timer)
    void chrome.action.setBadgeText({ text: "Err" })
    return false
  } finally {
    // Clear badge text regardless of success or failure
    clearInterval(timer)
    void chrome.action.setBadgeText({ text: "" })
  }

  return true
}

async function grounpTabs(
  data: Group[],
  windowId: number = chrome.windows.WINDOW_ID_CURRENT,
  showName: boolean = true,
  keepMiscTab: boolean = false
): Promise<void> {
  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ windowId })
  for (const group of data) {
    // At some time, they are return empty group name and like "other", "others", "miscellaneous".
    // So we need to filter out these group
    switch (group.group_name.toLowerCase()) {
      case "":
      case "other":
      case "others":
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
    if (ids.length <= 1) {
      continue
    }

    try {
      const createdGroup = await chrome.tabs.group({
        tabIds: ids,
        createProperties: {
          windowId
        }
      })
      // Only update title if showName is true
      if (showName) {
        await chrome.tabGroups.update(createdGroup, {
          title: group.group_name,
          collapsed: true
        })
        console.log("Grouped ", group.group_name)
      } else {
        // If not showing name, still collapse the group
         await chrome.tabGroups.update(createdGroup, {
          collapsed: true
        })
         console.log("Grouped tabs (name hidden)")
      }
    } catch (error) {
       console.error("Error grouping tabs:", error, "Group:", group)
    }
  }
  console.log("Finished initial grouping based on AI response")

  // Handle remaining ungrouped tabs
  const nonGroupTabs = await chrome.tabs.query({
    windowId,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
  })

  if (keepMiscTab && nonGroupTabs.length > 0) {
    const miscTabIDs = nonGroupTabs.map((tab) => tab.id).filter((id): id is number => id !== undefined);
    if (miscTabIDs.length > 0) {
        try {
          const miscGroup = await chrome.tabs.group({
            tabIds: miscTabIDs,
            createProperties: {
              windowId
            }
          })
          await chrome.tabGroups.update(miscGroup, {
            title: "Misc",
            collapsed: true
          })
          console.log("Grouped remaining tabs into 'Misc' group")
        } catch (error) {
           console.error("Error creating 'Misc' group:", error)
        }
    }
  } else if (nonGroupTabs.length > 0) {
    // If not keeping misc tab, move ungrouped tabs to the end
    console.log("Moving ungrouped tabs to the end")
    for (const tab of nonGroupTabs) {
      if (tab.id !== undefined) {
          try {
            await chrome.tabs.move(tab.id, { index: -1 })
          } catch (error) {
             console.error(`Error moving tab ${tab.id} to end:`, error)
          }
      }
    }
  }
  console.log("Finished handling ungrouped tabs.")
}

interface Group {
  group_name: string
  ids: number[]
}
