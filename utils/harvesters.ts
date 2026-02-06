import type { Dataservice, Dataset, DatasetV2, DatasetV2WithFullObject } from '@datagouv/components-next'
import type { HarvesterForm, HarvesterJob, HarvesterSource, HarvestSourceConfig, HarvestSourceFilter, NewHarvesterForApi } from '~/types/harvesters'

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
    filters: harvester.config.filters as Array<HarvestSourceFilter> || [],
    features: harvester.config.features as Record<string, boolean> || {},
    configs: harvester.config.extra_configs as Array<HarvestSourceConfig> || [],
    schedule: harvester.schedule,
    autoarchive: harvester.autoarchive,
    active: harvester.active,
  }
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
