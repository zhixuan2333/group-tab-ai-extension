import type { ReactElement } from "react"
import { FolderX, Folders } from "tabler-icons-react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import AutoSaveInput from "~components/autoSaveInput"
import { type ProviderConfigs, defaultProviderConfigs } from "~config"
import { type Settings, defaultSettings } from "~setting"

function IndexPopup(): ReactElement {
  const [config, setConfig] = useStorage<ProviderConfigs>(
    "providerConfigs",
    defaultProviderConfigs
  )
  const [settings, setSettings] = useStorage<Settings>(
    "settings",
    defaultSettings
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        paddingTop: 8,
        gap: 2
      }}>
      <h2>Type your openAI token here.</h2>
      <AutoSaveInput
        value={config?.configs?.openai?.token ?? ""}
        onChange={(token) => {
          void setConfig({
            ...config,
            configs: {
              ...config.configs,
              openai: {
                ...config.configs.openai,
                token
              }
            }
          })
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}>
        <input
          type="checkbox"
          checked={settings?.showName}
          onChange={() => {
            void setSettings({
              ...settings,
              showName: !settings.showName
            })
          }}
        />
        <label>Show name</label>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}>
        <input
          type="checkbox"
          checked={settings?.autoGroup}
          onChange={() => {
            void setSettings({
              ...settings,
              autoGroup: !settings.autoGroup
            })
          }}
        />
        <label>Auto Group</label>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 10
        }}>
        <button
          onClick={() => {
            void sendToBackground({ name: "groupAllTabs" })
          }}>
          <Folders size={20} />
        </button>
        <button
          onClick={() => {
            void sendToBackground({ name: "unGroupAllTabs" })
          }}>
          <FolderX size={20} />
        </button>
      </div>
      <a
        href={chrome.runtime.getURL("tabs/index.html")}
        target="_blank"
        rel="noreferrer">
        Did you need halp?
      </a>
    </div>
  )
}

export default IndexPopup
