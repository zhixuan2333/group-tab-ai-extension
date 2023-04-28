export class Badge {
  private timer: number
  private startTime: number

  public start(): void {
    this.startTime = new Date().getTime()
    this.timer = Number(
      setInterval(() => {
        const now = new Date().getTime()
        const diff = Math.floor((now - this.startTime) / 1000).toString()
        void chrome.action.setBadgeText({ text: diff })
      }, 1000)
    )
  }

  public stop(): void {
    clearInterval(this.timer)
    this.startTime = 0
    void chrome.action.setBadgeText({ text: "" })
  }

  public error(): void {
    this.stop()
    void chrome.action.setBadgeText({ text: "Err" })
  }
}
