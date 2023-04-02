import type { PlasmoMessaging } from "@plasmohq/messaging"

import { unGroupAllTabs } from "~background/command/unGroupAllTabs"

const handler: PlasmoMessaging.MessageHandler = async (_req, res) => {
  console.log("unGroupAllTabs")

  await unGroupAllTabs()
  res.send({
    success: true
  })
}

export default handler
