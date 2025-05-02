import type { Provider } from "~background/types"

export class OpenAIProvider implements Provider {
  private readonly token: string
  constructor(token: string) {
    this.token = token
  }

  async generate(prompt: string): Promise<string> {
    // Define the schema for a single TabGroup object
    const tabGroupItemSchema = {
      type: "object",
      properties: {
        group_name: {
          type: "string",
          description: "Name of the tab group"
        },
        ids: {
          type: "array",
          items: {
            type: "number"
          },
          description: "List of tab IDs belonging to the group"
        }
      },
      required: ["group_name", "ids"],
      additionalProperties: false
    };

    // Define the schema for the array of TabGroup objects
    const tabGroupArraySchema = {
        type: "array",
        items: tabGroupItemSchema
    };

    // Define the root schema required by OpenAI (must be an object)
    const rootSchema = {
      type: "object",
      properties: {
        groups: tabGroupArraySchema // Embed the array schema here
      },
      required: ["groups"],
      additionalProperties: false
    };

    const rep = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an assistant that groups browser tabs based on their content. Respond ONLY with a valid JSON object matching the specified schema, containing a 'groups' property which is an array of tab groups."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "TabGroupResponse", // Updated name for the root schema
            schema: rootSchema, // Use the root object schema
            strict: true
          }
        }
      })
    })
    if (!rep.ok) {
      const errorBody = await rep.text();
      console.error("OpenAI API Error:", rep.status, rep.statusText, errorBody);
      throw new Error(`OpenAI API error: ${rep.status} ${rep.statusText}`);
    }
    const json: ChatCompletion = await rep.json()

    if (json.choices[0].message.content === null || json.choices[0].message.content === undefined) {
        console.error("OpenAI returned null or undefined content:", json);
        throw new Error("OpenAI returned empty content, potentially due to a refusal.");
    }

    // Parse the response string from OpenAI (which is structured as { groups: [...] })
    const structuredResponse = JSON.parse(json.choices[0].message.content);

    // Extract the actual array from the 'groups' property
    const tabGroupsArray = structuredResponse.groups;

    // Return the stringified version of *only* the array
    return JSON.stringify(tabGroupsArray);
  }

  async generateWithFormat<T>(prompt: string): Promise<T> {
    const resp = await this.generate(prompt)
    return JSON.parse(resp) as T
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
