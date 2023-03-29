import type { Provider } from "~background/types"

export class LocalProvider implements Provider {
  private url: string
  constructor(url: string) {
    this.url = url
  }
  async generate(message: string): Promise<string> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: "",
        text: message
      })
    })
    return response.text()
  }
}
