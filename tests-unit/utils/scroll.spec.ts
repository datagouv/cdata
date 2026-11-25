import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { goToStep } from '~/utils/scroll'

describe('goToStep', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Loading a wizard past its first step with an empty form redirects to step 1
  // during the server render, where there is no window to scroll.
  it('redirects without crashing during the server render', async () => {
    const navigateTo = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigateTo', navigateTo)
    const route = { path: '/admin/datasets/structured' } as RouteLocationNormalizedLoaded

    await goToStep(route, { step: 1 })

    expect(navigateTo).toHaveBeenCalledWith({ path: '/admin/datasets/structured', query: { step: 1 } })
  })
})
