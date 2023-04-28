export interface Provider {
  generate: (prompt: string) => Promise<string>
  generateWithFormat: <T>(prompt: string) => Promise<T>
}
