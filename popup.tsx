import { useEffect, useState } from "react"
import { Check, Loader, X } from "tabler-icons-react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { ProviderConfigs, ProviderType } from "~config"
import style from "~popup.module.css"

function IndexPopup() {
  const [data, setData] = useState("")
  const [isSaved, setIsSaved] = useState(0)
  const [config, setConfig] = useStorage<ProviderConfigs>({
    key: "providerConfigs",
    instance: new Storage({
      area: "sync"
    })
  })

  useEffect(() => {
    console.log(config)
    if (config === undefined || config.configs === undefined) {
      return
    }
    if (
      config.configs[ProviderType.OpenAI] &&
      config.configs[ProviderType.OpenAI].token
    ) {
      setIsSaved(1)
    }
  }, [config])

  useEffect(() => {
    if (data === "") {
      setIsSaved(-1)
      return
    }
    setIsSaved(0)
    const timer = setTimeout(() => {
      setConfig({
        provider: ProviderType.OpenAI,
        configs: {
          ...config.configs,
          [ProviderType.OpenAI]: {
            token: data
          }
        }
      })
      setIsSaved(1)
    }, 2 * 1000)

    return () => clearTimeout(timer)
  }, [data])

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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
            justifyContent: "center"
          }}>
          <input
            onChange={(e) => setData(e.target.value)}
            value={data}
            placeholder="sk-xxxxx"
            type="password"
          />
          <div>
            {isSaved === -1 ? <X size={20} color="#ff2825" /> : null}
            {isSaved === 1 ? <Check size={20} color="#00d26a" /> : null}
            {isSaved === 0 ? (
              <Loader size={20} className={style.rotating} />
            ) : null}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 10
        }}>
        <button
          style={{
            width: "100%"
          }}>
          Group Tabs
        </button>
        <button
          style={{
            width: "100%"
          }}
          onClick={() => sendToBackground({ name: "unGroupAllTabs" })}>
          unGroup Tabs
        </button>
      </div>
      <a href={chrome.runtime.getURL("tabs/index.html")} target="_blank">
        Did you need halp?
      </a>
    </div>
  )
}

export default IndexPopup
