import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Organization } from '@datagouv/components-next'
import { deleteOrganizationBanner, updateOrganization, uploadOrganizationBanner } from '~/api/organizations'

function stubNuxtApp() {
  const $api = vi.fn()
  const $fileApi = vi.fn()
  vi.stubGlobal('useNuxtApp', () => ({ $api, $fileApi }))
  return { $api, $fileApi }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('banner API helpers', () => {
  it('uploads the banner image as multipart via $fileApi', async () => {
    const { $fileApi, $api } = stubNuxtApp()
    const file = new File(['png'], 'banner.png', { type: 'image/png' })
    await uploadOrganizationBanner('org-id', file)
    expect($fileApi).toHaveBeenCalledTimes(1)
    const [url, options] = $fileApi.mock.calls[0]
    expect(url).toBe('api/1/organizations/org-id/banner/')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect((options.body as FormData).get('file')).toBe(file)
    expect($api).not.toHaveBeenCalled()
  })

  it('puts the full organization with banner field overrides', async () => {
    const { $api } = stubNuxtApp()
    vi.stubGlobal('toValue', (value: unknown) => value)
    vi.stubGlobal('cleanSiret', (value: string) => value)
    const org = { id: 'org-id', banner_color: null, banner_image_position: 50 } as Organization
    await updateOrganization({ ...org, banner_color: '#a558a0' })
    expect($api).toHaveBeenCalledWith('api/1/organizations/org-id/', {
      method: 'PUT',
      body: expect.objectContaining({ id: 'org-id', banner_color: '#a558a0', banner_image_position: 50 }),
    })
    await updateOrganization({ ...org, banner_image_position: 25 })
    expect($api).toHaveBeenLastCalledWith('api/1/organizations/org-id/', {
      method: 'PUT',
      body: expect.objectContaining({ banner_image_position: 25 }),
    })
  })

  it('deletes the banner image', async () => {
    const { $api } = stubNuxtApp()
    await deleteOrganizationBanner('org-id')
    expect($api).toHaveBeenCalledWith('api/1/organizations/org-id/banner/', {
      method: 'DELETE',
    })
  })
})
