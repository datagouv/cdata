import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteOrganizationBanner, updateOrganizationBannerColor, updateOrganizationBannerPosition, uploadOrganizationBanner } from '~/api/organizations'

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

  it('patches the banner color', async () => {
    const { $api } = stubNuxtApp()
    await updateOrganizationBannerColor('org-id', '#a558a0')
    expect($api).toHaveBeenCalledWith('api/1/organizations/org-id/', {
      method: 'PUT',
      body: { banner_color: '#a558a0' },
    })
  })

  it('patches a null color to clear it', async () => {
    const { $api } = stubNuxtApp()
    await updateOrganizationBannerColor('org-id', null)
    expect($api).toHaveBeenCalledWith('api/1/organizations/org-id/', {
      method: 'PUT',
      body: { banner_color: null },
    })
  })

  it('patches the banner image position', async () => {
    const { $api } = stubNuxtApp()
    await updateOrganizationBannerPosition('org-id', 25)
    expect($api).toHaveBeenCalledWith('api/1/organizations/org-id/', {
      method: 'PUT',
      body: { banner_image_position: 25 },
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
