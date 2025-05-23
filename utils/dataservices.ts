import type { Dataservice, Dataset, DatasetV2 } from '@datagouv/components-next'
import type { ContactPoint, DataserviceForm, DatasetSuggest, NewDataserviceForApi } from '~/types/types'

export function getDataserviceAdminUrl(dataservice: Dataservice): string {
  return `/admin/dataservices/${dataservice.id}`
}

export function toForm(dataservice: Dataservice): DataserviceForm {
  return {
    owned: dataservice.organization ? { organization: dataservice.organization, owner: null } : { owner: dataservice.owner, organization: null },
    title: dataservice.title,
    description: dataservice.description,
    acronym: dataservice.acronym,
    contact_points: (dataservice.contact_points ?? []) as Array<ContactPoint>, // TODO the API returns a ContactPoint object.
    access_type: dataservice.access_type,
    base_api_url: dataservice.base_api_url || '',
    authorization_request_url: dataservice.authorization_request_url || '',
    machine_documentation_url: dataservice.machine_documentation_url || '',
    technical_documentation_url: dataservice.technical_documentation_url || '',
    business_documentation_url: dataservice.business_documentation_url || '',
    rate_limiting: dataservice.rate_limiting,
    availability: dataservice.availability?.toString() || '',
    private: dataservice.private,
  }
}

export function toApi(form: DataserviceForm, overrides: { archived_at?: string | null, datasets?: Array<Dataset | DatasetV2 | DatasetSuggest>, private?: boolean } = {}): NewDataserviceForApi {
  const contactPoints = form.contact_points?.filter(cp => cp !== null && 'id' in cp).map(cp => cp.id) ?? []
  return {
    organization: form.owned?.organization?.id,
    owner: form.owned?.owner?.id,
    title: form.title,
    description: form.description,
    acronym: form.acronym,
    private: overrides.private,
    archived_at: overrides.archived_at,
    datasets: overrides.datasets ? overrides.datasets.map(({ id }) => id) : undefined,
    contact_points: form.contact_points ? contactPoints : undefined,
    access_type: form.access_type,
    base_api_url: form.base_api_url || null,
    authorization_request_url: form.authorization_request_url || null,
    technical_documentation_url: form.technical_documentation_url || null,
    machine_documentation_url: form.machine_documentation_url || null,
    business_documentation_url: form.business_documentation_url || null,
    rate_limiting: form.rate_limiting,
    availability: form.availability ? parseFloat(form.availability) : null,
  }
}
