export interface Provider {
  generate: (prompt: string) => Promise<string>
}
