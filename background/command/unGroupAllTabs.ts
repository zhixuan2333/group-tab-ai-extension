export async function unGroupAllTabs() {
  const tabs = await chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT
  })
  tabs.forEach(async (tab) => {
    await chrome.tabs.ungroup(tab.id)
  })
}
