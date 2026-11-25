import { createApp } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ofetch } from 'ofetch'
import { configKey, type PluginConfig } from '~/datagouv-components/src/config'
import { useFetch } from '~/datagouv-components/src/functions/api'

vi.mock('ofetch', () => ({ ofetch: vi.fn() }))

// Answers each call with the next pending promise, settled by the test
const calls: Array<{ signal: AbortSignal, resolve: (value: unknown) => void, reject: (error: unknown) => void }> = []
vi.mocked(ofetch).mockImplementation(((_url: string, options: { signal: AbortSignal }) => new Promise((resolve, reject) => {
  options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
  calls.push({ signal: options.signal, resolve, reject })
})) as unknown as typeof ofetch)

// The fallback, used by hosts that don't pass a customUseFetch
function fallbackUseFetch() {
  const app = createApp({})
  app.provide(configKey, {} as PluginConfig)
  return app.runWithContext(() => useFetch<string, Error>('https://tabular.example/data/', { raw: true, immediate: false }))
}

describe('fallback useFetch', () => {
  beforeEach(() => {
    calls.length = 0
  })

  it('aborts the call in flight when a new one starts, so its late answer is dropped', async () => {
    const { data, status, execute } = await fallbackUseFetch()

    const first = execute()
    const second = execute()
    expect(calls[0].signal.aborted).toBe(true)

    calls[1].resolve('second')
    await Promise.all([first, second])

    expect(data.value).toBe('second')
    expect(status.value).toBe('success')
  })

  it('clears the error of a failed call once a new call succeeds', async () => {
    const { data, error, status, execute } = await fallbackUseFetch()

    const failed = execute()
    calls[0].reject(new Error('400'))
    await failed
    expect(error.value).toBeInstanceOf(Error)

    const succeeded = execute()
    calls[1].resolve('rows')
    await succeeded

    expect(error.value).toBeNull()
    expect(data.value).toBe('rows')
    expect(status.value).toBe('success')
  })
})
