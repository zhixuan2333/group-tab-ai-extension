import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { ProviderConfigs, ProviderType, defaultProviderConfigs } from "~config"

function IndexPopup() {
  const [data, setData] = useState("")
  const [config, setConfig] = useStorage<ProviderConfigs>({
    key: "providerConfigs",
    instance: new Storage({
      area: "sync"
    })
  })

  useEffect(() => {
    if (config === null || config === undefined) {
      setConfig(defaultProviderConfigs)
    }
  }, [config, setConfig])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        paddingTop: 8,
        gap: 2
      }}>
      <h2>Type your open AI token here. And click save.</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem"
        }}>
        <input
          onChange={(e) => setData(e.target.value)}
          value={data}
          placeholder="sk-xxxxx"
          type="password"
        />
        <button
          onClick={() => {
            setConfig({
              ...config,
              provider: ProviderType.OpenAI,
              configs: {
                ...config.configs,
                [ProviderType.OpenAI]: {
                  token: data
                }
              }
            })
          }}>
          Save
        </button>
      </div>
      <a href={chrome.runtime.getURL("tabs/index.html")} target="_blank">
        Did you need halp?
      </a>
    </div>
  )
}

export default IndexPopup
