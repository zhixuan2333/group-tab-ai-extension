import { FolderX, Folders } from "tabler-icons-react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import AutoSaveInput from "~components/autoSaveInput"
import { ProviderConfigs, ProviderType } from "~config"

function IndexPopup() {
  const [config, setConfig] = useStorage<ProviderConfigs | undefined>(
    "providerConfigs"
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
        value={config?.configs?.openai?.token || ""}
        onChange={(value) => {
          setConfig((state) => ({
            ...state,
            configs: {
              ...state?.configs,
              [ProviderType.OpenAI]: { token: value }
            }
          }))
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 10
        }}>
        <button onClick={() => sendToBackground({ name: "groupAllTabs" })}>
          <Folders size={20} />
        </button>
        <button onClick={() => sendToBackground({ name: "unGroupAllTabs" })}>
          <FolderX size={20} />
        </button>
      </div>
      <a href={chrome.runtime.getURL("tabs/index.html")} target="_blank">
        Did you need halp?
      </a>
    </div>
  )
}

export default IndexPopup
