import type { OrganizationSuggest } from '@datagouv/components-next'
import type { DataserviceSuggest, DatasetSuggest, ReuseSuggest } from '~/types/types'

export type SuggestionKind = 'dataset' | 'dataservice' | 'reuse' | 'organization'

export type Suggestion = {
  kind: SuggestionKind
  id: string
  label: string
  // Internal path: never the absolute `page` URL returned by the API.
  to: string
}

export type SuggestResults = {
  datasets?: Array<DatasetSuggest>
  dataservices?: Array<DataserviceSuggest>
  reuses?: Array<ReuseSuggest>
  organizations?: Array<OrganizationSuggest>
}

function withAcronym(label: string, acronym?: string | null): string {
  return acronym ? `${label} (${acronym})` : label
}

export function toSuggestions({ datasets = [], dataservices = [], reuses = [], organizations = [] }: SuggestResults): Array<Suggestion> {
  return [
    ...datasets.map((dataset): Suggestion => ({
      kind: 'dataset',
      id: dataset.id,
      label: withAcronym(dataset.title, dataset.acronym),
      to: `/datasets/${dataset.slug}`,
    })),
    ...dataservices.map((dataservice): Suggestion => ({
      kind: 'dataservice',
      id: dataservice.id,
      label: withAcronym(dataservice.title, dataservice.acronym),
      to: `/dataservices/${dataservice.slug}`,
    })),
    ...reuses.map((reuse): Suggestion => ({
      kind: 'reuse',
      id: reuse.id,
      label: reuse.title,
      to: `/reuses/${reuse.slug}`,
    })),
    ...organizations.map((organization): Suggestion => ({
      kind: 'organization',
      id: organization.id,
      label: withAcronym(organization.name, organization.acronym),
      to: `/organizations/${organization.slug}`,
    })),
  ]
}
