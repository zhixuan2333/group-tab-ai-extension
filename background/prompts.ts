export const oneTabPrompt: string = `
I want you can help me to grounping my tabs.
I will type one url and some grounp I have.
I want you to only reply the gourp name that I have or you want with one unique code block, and nothing else.
Do not write explanations.
Do not type other word.
My first URL is
`
export async function allTabsPrompt(tabs: chrome.tabs.Tab[]): Promise<string> {
  if (tabs.length === 0) {
    throw new Error("tabs is empty")
  }

  const limtedTabs = tabs.slice(0, 100)
  const modifiedTabs: Array<{ id: number | undefined; title: string }> = []
  for (const tab of limtedTabs) {
    if (tab.title == null || tab.id == null) {
      continue
    }
    modifiedTabs.push({
      id: tab.id,
      title: tab.title
    })
  }
  return `I want you can help me to grounping my tabs. I will give you some titles and id of tabs.
I want you to group my tabs and the group cannot exceed 5.
And I want you to only reply the gourp name and ids array with json format, and nothing else.
The Format is [{group_name: string, ids: number[]}]
Do not write explanations. Do not type other word.
My url list is ${JSON.stringify(modifiedTabs)}`
}
