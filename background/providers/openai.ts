import type { Provider } from "~background/types"

export class OpenAIProvider implements Provider {
  private readonly token: string
  constructor(token: string) {
    this.token = token
  }

  async generate(prompt: string): Promise<string> {
    const rep = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })
    if (!rep.ok) {
      console.error(rep)
      throw new Error("OpenAI API error")
    }
    const json: ChatCompletion = await rep.json()
    return json.choices[0].message.content
  }

  async generateWithFormat<T>(prompt: string): Promise<T> {
    const resp = await this.generate(prompt)
    return JSON.parse(resp)
  }
}

interface ChatCompletion {
  id: string
  object: string
  created: number
  choices: ChatCompletionChoice[]
  usage: ChatCompletionUsage
}

interface ChatCompletionChoice {
  index: number
  message: ChatCompletionMessage
  finish_reason: string
}

interface ChatCompletionMessage {
  role: string
  content: string
}

interface ChatCompletionUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}
