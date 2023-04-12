import type { CSSProperties, ReactElement } from "react"
import { Folders } from "tabler-icons-react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import done from "~assets/gif/done.gif"
import time from "~assets/gif/time.gif"
import apikeyImage from "~assets/images/api_key.png"
import AutoSaveInput from "~components/autoSaveInput"
import {
  type ProviderConfigs,
  ProviderType,
  defaultProviderConfigs
} from "~storage/config"

interface ImageProps {
  src: string
  alt: string
  width?: string
  isCenter?: boolean
}

const center: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%"
}

function Image({
  src,
  alt,
  width = "100px",
  isCenter = true
}: ImageProps): ReactElement {
  return (
    <div style={isCenter ? center : undefined}>
      <img src={src} width={width} alt={alt} />
    </div>
  )
}

function IndexPage(): ReactElement {
  const [config, setConfig] = useStorage<ProviderConfigs>(
    "providerConfigs",
    defaultProviderConfigs
  )

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
        Let{"`"}s start <b>Grouping</b> our tabs!
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
      <p>And type your OpenAI here and save! </p>
      <AutoSaveInput
        style={{
          justifyContent: "left"
        }}
        value={config?.configs[ProviderType.OpenAI]?.token ?? ""}
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

      <h3>🟢 | Now we can start grouping our tabs.</h3>
      <p>
        Click on the extension icon and click this button.{" "}
        <button
          onClick={() => {
            void sendToBackground({ name: "groupAllTabs" })
          }}>
          <Folders size={20} />
        </button>{" "}
        The extension will group your tabs based on the title. And <b>Wait</b>.
      </p>
      <Image src={time} alt="time" width="400px" />
      <h3>🟢 | At last let{"`"}s set a shortcut for it.</h3>
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
