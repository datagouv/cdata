import type { Organization } from '@datagouv/components'
import type { $Fetch } from 'ofetch'
import type { ContactPoint, NewContactPoint } from '~/types/types'

export async function newContactPoint(api: $Fetch, organization: Organization, contactPoint: NewContactPoint): Promise<ContactPoint> {
  return await api<ContactPoint>('/api/1/contacts/', {
    method: 'POST',
    body: JSON.stringify({
      name: contactPoint.name,
      email: contactPoint.email,
      contact_form: contactPoint.contact_form,
      role: contactPoint.role,
      organization: organization.id,
    }),
  })
}

export async function updateContactPoint(api: $Fetch, organization: Organization, contactPoint: ContactPoint): Promise<ContactPoint> {
  return await api<ContactPoint>(`/api/1/contacts/${contactPoint.id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      name: contactPoint.name,
      email: contactPoint.email,
      contact_form: contactPoint.contact_form,
      role: contactPoint.role,
      organization: organization.id,
    }),
  })
}
