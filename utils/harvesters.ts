import type { Dataservice, Dataset, DatasetV2, DatasetV2WithFullObject } from '@datagouv/components-next'
import cloneDeep from 'lodash-es/cloneDeep'
import type { HarvestBackend, HarvesterForm, HarvesterJob, HarvesterSource, HarvestSourceConfig, HarvestSourceFilter, NewHarvesterForApi } from '~/types/harvesters'

export function getHarvesterAdminUrl(harvester: HarvesterSource) {
  return `/admin/harvesters/${harvester.id}`
}

export function getHarvesterJobAdminUrl(harvester: HarvesterSource, job: HarvesterJob) {
  return `${getHarvesterAdminUrl(harvester)}/jobs/${job.id}`
}

export function isHarvested(dataset: Dataservice | Dataset | DatasetV2 | DatasetV2WithFullObject) {
  return !!dataset.harvest?.source_id || false
}

export function harvesterToForm(harvester: HarvesterSource): HarvesterForm {
  return {
    owned: harvester.organization ? { organization: harvester.organization, owner: null } : { owner: harvester.owner, organization: null },
    name: harvester.name,
    description: harvester.description || '',
    url: harvester.url,
    backend: harvester.backend,
    // The form is edited in place, it must not share its objects with the API response.
    filters: cloneDeep(harvester.config.filters as Array<HarvestSourceFilter> || []),
    features: cloneDeep(harvester.config.features as Record<string, boolean> || {}),
    configs: cloneDeep(harvester.config.extra_configs as Array<HarvestSourceConfig> || []),
    // The API answers `null` for a source that isn't scheduled, while the input writes ''.
    schedule: harvester.schedule || '',
    autoarchive: harvester.autoarchive,
    active: harvester.active,
  }
}

/**
 * Align the form with the selected backend: the API fails if we send filters or configs
 * it doesn't know about, and it expects an explicit value for every feature, while the
 * form only holds the ones already stored on the source or toggled by the user.
 */
export function syncFormWithBackend(form: HarvesterForm, backend: HarvestBackend) {
  form.filters = form.filters.filter(({ key }) => backend.filters.some(filter => filter.key === key))
  form.configs = form.configs.filter(({ key }) => backend.extra_configs.some(config => config.key === key))
  form.features = Object.fromEntries(
    backend.features.map(feature => [feature.key, form.features[feature.key] ?? feature.default]),
  )
}

export function harvesterToApi(form: HarvesterForm): NewHarvesterForApi {
  return {
    organization: form.owned?.organization?.id ?? null,
    owner: form.owned?.owner?.id ?? null,
    name: form.name,
    description: form.description,
    url: form.url,
    backend: form.backend,
    autoarchive: form.autoarchive,
    active: form.active,
    config: {
      filters: form.filters,
      features: form.features,
      extra_configs: form.configs,
    },
  }
}
