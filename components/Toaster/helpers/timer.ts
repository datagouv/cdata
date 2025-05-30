// https://stackoverflow.com/a/3969760

export default class Timer {
  private startedAt: number
  private callback: CallableFunction
  private delay: number
  private timer: number

  constructor(callback: CallableFunction, delay: number) {
    this.startedAt = Date.now()
    this.callback = callback
    this.delay = delay
    this.timer = setTimeout(callback, delay)
  }

  pause() {
    this.stop()
    this.delay -= Date.now() - this.startedAt
  }

  resume() {
    this.stop()
    this.startedAt = Date.now()
    this.timer = setTimeout(this.callback, this.delay)
  }

  stop() {
    clearTimeout(this.timer)
  }
}
