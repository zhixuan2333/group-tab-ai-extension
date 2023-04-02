import type { PlasmoMessaging } from "@plasmohq/messaging"

import { groupAllTabs } from "~background/command/groupAllTabs"

const handler: PlasmoMessaging.MessageHandler = async (_req, res) => {
  await groupAllTabs()
  res.send({
    success: true
  })
}

export default handler
