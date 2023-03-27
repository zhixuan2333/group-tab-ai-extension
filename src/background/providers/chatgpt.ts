import { ChatGPTUnofficialProxyAPI } from "chatgpt"

import type { Provider } from "~background/types"

export class ChatGPTProvider implements Provider {
  private api: ChatGPTUnofficialProxyAPI

  constructor(token: string, reverseProxyURL?: string) {
    this.api = new ChatGPTUnofficialProxyAPI({
      accessToken: token,
      apiReverseProxyUrl: reverseProxyURL
    })
  }
  async generate(message: string): Promise<string> {
    const response = await this.api.sendMessage(message)
    return response.text
  }
}
