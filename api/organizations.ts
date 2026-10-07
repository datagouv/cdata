import type { Organization } from '@datagouv/components-next'

type UploadLogoResponse = {
  image: string
  success: boolean
}

export async function uploadLogo(oid: string, file: File) {
  const api = useNuxtApp().$fileApi
  const formData = new FormData()
  formData.append('file', file)
  const resp = await api<UploadLogoResponse>(`api/1/organizations/${oid}/logo/`, {
    method: 'POST',
    body: formData,
  })
  return resp
}

export async function updateOrganization(organization: MaybeRefOrGetter<Organization>) {
  const api = useNuxtApp().$api
  const organizationValue = toValue(organization)
  const resp = await api<Organization>(`api/1/organizations/${organizationValue.id}/`, {
    method: 'PUT',
    body: {
      ...organizationValue,
      business_number_id: cleanSiret(organizationValue.business_number_id),
    },
  })
  return resp
}

// PUT only the presentation blocs and their publication date. udata's PUT
// applies only the fields present in the body (patch_and_save), so this must
// NOT spread the organization: a stale copy would silently reset fields that
// changed since it was fetched (e.g. banner_color, banner_image_position).
export async function updateOrganizationPresentationBlocs(oid: string, blocs: unknown, publishedAt: string | null) {
  const api = useNuxtApp().$api
  const resp = await api<Organization>(`api/1/organizations/${oid}/`, {
    method: 'PUT',
    body: {
      presentation_blocs: blocs,
      presentation_blocs_published_at: publishedAt,
    },
  })
  return resp
}

export async function uploadOrganizationBanner(oid: string, file: File) {
  const api = useNuxtApp().$fileApi
  const formData = new FormData()
  formData.append('file', file)
  const resp = await api(`api/1/organizations/${oid}/banner/`, {
    method: 'POST',
    body: formData,
  })
  return resp
}

export async function updateOrganizationBannerColor(oid: string, color: string | null) {
  const api = useNuxtApp().$api
  const resp = await api<Organization>(`api/1/organizations/${oid}/`, {
    method: 'PUT',
    body: { banner_color: color },
  })
  return resp
}

export async function updateOrganizationBannerPosition(oid: string, position: number) {
  const api = useNuxtApp().$api
  const resp = await api<Organization>(`api/1/organizations/${oid}/`, {
    method: 'PUT',
    body: { banner_image_position: position },
  })
  return resp
}

export async function deleteOrganizationBanner(oid: string) {
  const api = useNuxtApp().$api
  const resp = await api(`api/1/organizations/${oid}/banner/`, {
    method: 'DELETE',
  })
  return resp
}
