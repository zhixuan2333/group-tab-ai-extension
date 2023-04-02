import done from "data-base64:~assets/gif/done.gif"
import time from "data-base64:~assets/gif/time.gif"
import apikeyImage from "data-base64:~assets/images/api_key.png"
import { ReactElement, useEffect, useState } from "react"
import { Check, Folders, Loader, X } from "tabler-icons-react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { ProviderConfigs, ProviderType } from "~config"

import style from "./index.module.css"

type ImageProps = {
  src: string
  alt: string
  width?: string
}

const center: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%"
}

function Image({ src, alt, width = "100px" }: ImageProps): ReactElement {
  return (
    <div style={center}>
      <img src={src} width={width} alt={alt} />
    </div>
  )
}

function IndexPage() {
  const [data, setData] = useState("")
  const [isSaved, setIsSaved] = useState(0)
  const [config, setConfig] = useStorage<ProviderConfigs>("providerConfigs")

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
        margin: "0 15rem",
        padding: 16,
        fontSize: 16
      }}>
      <h2>👋 Hi there! Thank you for install this auto group tab extension.</h2>
      <p>
        Let's start <b>Grouping</b> our tabs!
      </p>
      <h3>🟢 | First we need to generate a OpenAI api Token.</h3>
      <p>
        <a
          href="https://platform.openai.com/overview"
          target="_blank"
          rel="noreferrer">
          Click here
        </a>{" "}
        to create a account and generate a token. And copy the token.
      </p>
      <Image src={apikeyImage} alt="apikey" width="100%" />
      <h3>🟢 | Then we need to save the token.</h3>
      <p>And type your OpenAI here and save!</p>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "5px",
          alignItems: "center"
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
      <h3>🟢 | Now we can start grouping our tabs.</h3>
      <p>
        Click on the extension icon and click this button.{" "}
        <button onClick={() => sendToBackground({ name: "groupAllTabs" })}>
          <Folders size={20} />
        </button>{" "}
        The extension will group your tabs based on the title. And <b>Wait</b>.
      </p>
      <Image src={time} alt="time" width="400px" />
      <h3>🟢 | At last let's set a shortcut for it.</h3>
      <p>
        <code style={{ color: "blue" }}>chrome://extensions/shortcuts</code> Go
        to here to setup a shortcut for <b>Grouping</b>. For example:{" "}
        <kbd>Alt</kbd> + <kbd>Q</kbd> and <kbd>Alt</kbd> + <kbd>A</kbd>
      </p>
      <h3>🟢 | Done.</h3>
      <p>Let go to open the many and many tabs. To try it again.</p>
      <Image src={done} alt="done" width="400px" />
    </div>
  )
}

export default IndexPage
