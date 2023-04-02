import type { PlasmoMessaging } from "@plasmohq/messaging"

import { groupAllTabs } from "~background/command/groupAllTabs"

const handler: PlasmoMessaging.MessageHandler = async (_req, res) => {
  // When open popup, the window LastFocused and Current maybe different
  // So use getAll to get the First window
  const window = await chrome.windows.getAll()
  await groupAllTabs(window[0].id)
  res.send({
    success: true
  })
}

export default handler
