import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { loadMe } from '~/utils/auth'
import type { Me } from '~/utils/auth'

const ME = { id: 'me-id', organizations: [] } as unknown as Me

const fetchMe = vi.fn()

/**
 * Stub the Nuxt globals `loadMe` relies on, for a request carrying `cookies`.
 */
const stubRequest = (cookies: Record<string, string>, { devApiKey }: { devApiKey?: string } = {}) => {
  vi.stubGlobal('useRuntimeConfig', () => ({
    sessionCookieName: 'session',
    rememberCookieName: 'remember_token',
    public: { apiBase: 'http://api.example.com', devApiKey },
  }))
  vi.stubGlobal('useRequestHeader', () => Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join('; ') || undefined)
  vi.stubGlobal('useCookie', (name: string) => ref(cookies[name] ?? null))
  vi.stubGlobal('useCurrentOwnedSetters', () => ({ setCurrentOrganization: vi.fn(), setCurrentUser: vi.fn() }))
  vi.stubGlobal('$fetch', fetchMe)
}

describe('loadMe', () => {
  beforeEach(() => {
    fetchMe.mockReset()
    fetchMe.mockResolvedValue(ME)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not call the API when the request carries no cookie at all', async () => {
    stubRequest({})
    const me = ref(undefined)

    await loadMe(me)

    expect(fetchMe).not.toHaveBeenCalled()
    expect(me.value).toBe(null)
  })

  it('does not call the API when the request only carries unrelated cookies', async () => {
    stubRequest({ '_pk_id.1.1fff': 'abc', 'not_session': '1' })
    const me = ref(undefined)

    await loadMe(me)

    expect(fetchMe).not.toHaveBeenCalled()
    expect(me.value).toBe(null)
  })

  it('calls the API when the session cookie is set', async () => {
    stubRequest({ session: 'eyJfaWQ' })
    const me = ref(undefined)

    await loadMe(me)

    expect(fetchMe).toHaveBeenCalledOnce()
    expect(me.value).toStrictEqual(ME)
  })

  it('calls the API when only the remember cookie is set, as after a browser restart', async () => {
    stubRequest({ remember_token: '1|abc' })
    const me = ref(undefined)

    await loadMe(me)

    expect(fetchMe).toHaveBeenCalledOnce()
    expect(me.value).toStrictEqual(ME)
  })

  it('calls the API when the request carries an authentication token instead of a session', async () => {
    stubRequest({ token: 'a-token' })
    const me = ref(undefined)

    await loadMe(me)

    expect(fetchMe).toHaveBeenCalledOnce()
    expect(fetchMe.mock.calls[0][1].headers['Authentication-Token']).toBe('a-token')
    expect(me.value).toStrictEqual(ME)
  })

  it('calls the API when a dev API key authenticates the request without any cookie', async () => {
    stubRequest({}, { devApiKey: 'a-dev-key' })
    const me = ref(undefined)

    await loadMe(me)

    expect(fetchMe).toHaveBeenCalledOnce()
    expect(fetchMe.mock.calls[0][1].headers['X-API-KEY']).toBe('a-dev-key')
    expect(me.value).toStrictEqual(ME)
  })

  it('sets `me` to null when the API answers with an error', async () => {
    stubRequest({ session: 'stale-session' })
    fetchMe.mockRejectedValue(new Error('401 Unauthorized'))
    const me = ref(undefined)

    await loadMe(me)

    expect(me.value).toBe(null)
  })
})
