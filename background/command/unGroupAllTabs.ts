export async function unGroupAllTabs(windowID?: number): Promise<void> {
  const tabs = await chrome.tabs.query({
    windowId: windowID ?? chrome.windows.WINDOW_ID_CURRENT
  })
  for (const tab of tabs) {
    if (tab.id === undefined) {
      return
    }
    await chrome.tabs.ungroup(tab.id)
  }
}
