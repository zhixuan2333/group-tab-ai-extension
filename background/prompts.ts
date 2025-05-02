export async function allTabsPrompt(tabs: chrome.tabs.Tab[], specialRequirements: string | undefined): Promise<string> {
  if (tabs.length === 0) {
    throw new Error("tabs is empty")
  }

  const limtedTabs = tabs.slice(0, 100)
  const modifiedTabs: Array<{ id: number; title: string; url: string }> = []
  for (const tab of limtedTabs) {
    if (tab.title == null || tab.id == null || tab.url == null) {
      continue
    }
    modifiedTabs.push({
      id: tab.id,
      title: tab.title,
      url: tab.url
    })
  }
  return `I need you to organize ALL my browser tabs into logical groups. I'll provide a list of tab objects, each with an 'id' and 'title' and 'url.

Your task:
1. Group related tabs together based on their content and purpose
2. EVERY tab must be placed in exactly one group - no tabs should be left unassigned
3. VERY IMPORTANT : Each group must have at least 2 tabs and no more than 5 tabs.  THERE SHOULD BE NO GROUP WITH ONLY ONE TAB.
4. Create meaningful but concise group names. 1 WORD ONLY.
5. DO NOT LEAVE ANY TAB UNGROUPED - MOST IMPORTANT
6. DO not create any misc or others group.
7. Prioritize grouping by:
   - Same website/domain
   - Similar topics or purposes
   - Related work items (JIRA, GitHub, AWS, etc.)
   - Educational content
   - Entertainment content (ex : youtube, movie websites, spotify, etc.)

Format your response as a JSON array of objects with this exact structure:
[
  {
    "group_name": "short descriptive name",
    "ids": [tab_id1, tab_id2, ...]
  },
  ...
]
YOU CAN GIVE MAXIMUM 10 GROUPS. YOU HAVE TO GROUP ALL TABS IN 10 OR LESS GROUPS.

Special requirements: ${specialRequirements ?? "No special requirements"}

My tabs: ${JSON.stringify(modifiedTabs)}`
}

export async function autoGroupPrompt(
  tabs: chrome.tabs.Tab[],
  grounps: chrome.tabGroups.TabGroup[]
): Promise<string> {
  if (tabs.length === 0) {
    throw new Error("tabs is empty")
  }
  const limtedTabs = tabs.slice(0, 100)
  const modifiedTabs: Array<{
    id: number
    title: string
    groupId: number
  }> = []
  for (const tab of limtedTabs) {
    if (tab.title == null || tab.id == null) {
      continue
    }
    modifiedTabs.push({
      id: tab.id,
      title: tab.title,
      groupId: tab.groupId
    })
  }

  const limtedGroups = grounps.slice(0, 100)
  const modifiedGroups: Array<{ id: number; title: string }> = []
  for (const group of limtedGroups) {
    if (group.title == null || group.id == null) {
      continue
    }
    // remove "🤖 | "
    const groupTitle = group.title.startsWith("🤖 | ")
      ? group.title.slice(5)
      : group.title
    modifiedGroups.push({
      id: group.id,
      title: groupTitle
    })
  }

  return `I want you can help me to grounping my tabs. I will give you some titles and id of tabs.
I want you to group my tabs and the group cannot exceed 5.
And I want you to only reply the gourp id, gourp name and ids array with json format, and nothing else.
If gourp is not exist, you can make gourp id to -1 to create gourp.
The gourp name is as short as possible. Reuse the group is better. Don't make "Other" group.
Just return only what has changed.
The Format is [{group_id: number, group_name: string, ids: number[]}]
Do not write explanations. Do not type other word.
My url list is ${JSON.stringify(modifiedTabs)}
My group list is ${JSON.stringify(modifiedGroups)}`
}

export async function updateGroupsPrompt(
  tabs: chrome.tabs.Tab[],
  existingGroups: chrome.tabGroups.TabGroup[],
  specialRequirements: string | undefined
): Promise<string> {
  if (tabs.length === 0) {
    throw new Error("tabs is empty")
  }

  const limitedTabs = tabs.slice(0, 100)
  const modifiedTabs: Array<{ id: number; title: string; url: string, groupId: number }> = []
  for (const tab of limitedTabs) {
    if (tab.title == null || tab.id == null || tab.url == null || tab.groupId == null) {
      continue
    }
    modifiedTabs.push({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      groupId: tab.groupId // Include existing group ID
    })
  }

  const limitedGroups = existingGroups.slice(0, 100)
  const modifiedGroups: Array<{ id: number; title: string | undefined }> = []
  for (const group of limitedGroups) {
     modifiedGroups.push({
      id: group.id,
      title: group.title
    })
  }


  return `I need you to organize ALL my browser tabs into logical groups, **while respecting existing groups as much as possible**. I'll provide a list of tab objects (including their current 'groupId', where -1 means ungrouped) and a list of existing group objects.

Your task:
1. Analyze the tabs and existing groups.
2. Reorganize tabs into logical groups. You can:
   - **Keep existing groups:** Add tabs to them or leave them as is.
   - **Rename existing groups:** If a better name is suitable.
   - **Merge existing groups:** If appropriate.
   - **Create new groups:** For tabs that don't fit existing groups.
3. **Crucially: If multiple tabs are already together in an existing group, try to keep them together in the final arrangement**, even if they move to a new or renamed group.
4. VERY IMPORTANT : Each group must have at least 2 tabs and no more than 5 tabs. THERE SHOULD BE NO GROUP WITH ONLY ONE TAB.
5. Create meaningful but concise group names. 1 WORD ONLY.
6. EVERY tab must be placed in exactly one group - no tabs should be left unassigned. DO NOT LEAVE ANY TAB UNGROUPED.
7. DO not create any misc or others group.
8. Prioritize grouping by:
   - Existing group structure
   - Same website/domain
   - Similar topics or purposes
   - Related work items (JIRA, GitHub, AWS, etc.)
   - Educational content
   - Entertainment content

Format your response as a JSON array of objects representing the **FINAL desired state** with this exact structure:
[
  {
    "group_name": "short descriptive name",
    "ids": [tab_id1, tab_id2, ...]
  },
  ...
]
YOU CAN GIVE MAXIMUM 10 GROUPS. YOU HAVE TO GROUP ALL TABS IN 10 OR LESS GROUPS.

Special requirements: ${specialRequirements ?? "No special requirements"}

My tabs: ${JSON.stringify(modifiedTabs)}
My existing groups: ${JSON.stringify(modifiedGroups)}`

}
