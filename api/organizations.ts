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
