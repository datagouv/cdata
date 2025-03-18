import type { Badge, Organization } from '@datagouv/components-next'

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
    },
  })
  return resp
}

export async function updateOrganizationBadges(organization: Organization, newBadges: Array<Badge>) {
  const api = useNuxtApp().$api

  const oldKinds = organization.badges.map(badge => badge.kind)
  const newKinds = newBadges.map(badge => badge.kind)
  for (const kind of newKinds) {
    if (oldKinds.includes(kind)) continue

    await api(`api/1/organizations/${organization.id}/badges/`, {
      method: 'POST',
      body: { kind },
    })
  }

  for (const kind of oldKinds) {
    if (newKinds.includes(kind)) continue

    await api(`api/1/organizations/${organization.id}/badges/${kind}`, { method: 'DELETE' })
  }
}
