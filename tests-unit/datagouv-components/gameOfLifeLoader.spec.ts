// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameOfLifeLoader from '~/datagouv-components/src/components/Chart/GameOfLifeLoader.vue'

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
}

describe('GameOfLifeLoader', () => {
  let frames: Array<FrameRequestCallback>
  const requestFrame = vi.fn((callback: FrameRequestCallback) => frames.push(callback))
  const cancelFrame = vi.fn()

  beforeEach(() => {
    frames = []
    vi.stubGlobal('requestAnimationFrame', requestFrame)
    vi.stubGlobal('cancelAnimationFrame', cancelFrame)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('keeps requesting frames while mounted and cancels the pending one on unmount', () => {
    stubReducedMotion(false)
    const wrapper = mount(GameOfLifeLoader)
    expect(frames).toHaveLength(1)

    frames[0]!(16)
    expect(frames).toHaveLength(2)

    wrapper.unmount()
    expect(cancelFrame).toHaveBeenCalledWith(2)
  })

  it('draws a still frame without animating under reduced motion', () => {
    stubReducedMotion(true)
    mount(GameOfLifeLoader)

    expect(requestFrame).not.toHaveBeenCalled()
  })

  it('renders on the server as an empty, hidden canvas', async () => {
    const html = await renderToString(createSSRApp(GameOfLifeLoader))

    expect(html).toMatch(/^<canvas[^>]*aria-hidden="true"/)
  })
})
