import type { PlasmoMessaging } from "@plasmohq/messaging"

import { unGroupAllTabs } from "~background/command/unGroupAllTabs"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  await unGroupAllTabs(req.body.windowId)
  res.send({
    success: true
  })
}

export default handler
