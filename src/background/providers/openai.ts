import { ChatGPTAPI } from "chatgpt"

import type { Provider } from "~background/types"

export class OpenAIProvider implements Provider {
  private api: ChatGPTAPI

  constructor(apiKey: string) {
    this.api = new ChatGPTAPI({
      apiKey: apiKey
    })
  }
  async generate(message: string): Promise<string> {
    const response = await this.api.sendMessage(message)
    return response.text
  }
}
