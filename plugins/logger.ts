import { defineNuxtPlugin } from '#imports'

// Module-level variable to ensure one-time initialization
let __logger_plugin_initialized = false

export default defineNuxtPlugin(() => {
  if (__logger_plugin_initialized) return
  if (process.env.NODE_ENV !== 'production') return
  __logger_plugin_initialized = true

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createLogger = (originalMethod: (...args: any[]) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (...args: any[]) {
      const timestamp = new Date().toISOString()
      originalMethod(`[${timestamp}]`, ...args)
    }
  }

  console.log = createLogger(console.log)
  console.error = createLogger(console.error)
  console.warn = createLogger(console.warn)
  console.info = createLogger(console.info)
  console.debug = createLogger(console.debug)
})
