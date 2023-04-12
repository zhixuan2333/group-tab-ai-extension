import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: "sync"
})

export interface Settings {
  showName: boolean
  autoGroup: boolean
}

export const defaultSettings: Settings = {
  showName: true,
  autoGroup: true
}

export async function getSettings(): Promise<Settings> {
  const settings = await storage.get<Settings>("settings")
  if (settings === undefined) {
    console.log("settings not found, use default settings")
    return defaultSettings
  }
  return settings
}

export async function setSettings(settings: Settings): Promise<void> {
  await storage.set("settings", settings)
}
