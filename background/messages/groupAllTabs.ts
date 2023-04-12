import type { PlasmoMessaging } from "@plasmohq/messaging"

import { groupAllTabs } from "~background/command/groupAllTabs"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // 4/12/2023
  // Chrome version 111.0.5563.147
  // Edge version 111.0.1661.62
  // If popup menu is open, service worker can't get the current window id
  // So we need to pass the window id from popup menu
  await groupAllTabs(req.body.windowId)
  res.send({
    success: true
  })
}

export default handler
