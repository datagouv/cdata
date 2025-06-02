import type { Dataservice, Dataset, DatasetV2 } from '@datagouv/components-next'
import type { HarvesterForm, HarvesterJob, HarvesterSource, HarvestSourceConfig, HarvestSourceFilter } from '~/types/harvesters'

export function getHarvesterAdminUrl(harvester: HarvesterSource) {
  return `/admin/harvesters/${harvester.id}`
}

export function getHarvesterJobAdminUrl(harvester: HarvesterSource, job: HarvesterJob) {
  return `${getHarvesterAdminUrl(harvester)}/jobs/${job.id}`
}

export function isHarvested(dataset: Dataservice | Dataset | DatasetV2) {
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
    configs: harvester.config.extra_configs as Array<HarvestSourceConfig> || [],
    schedule: harvester.schedule,
    autoarchive: harvester.autoarchive,
    active: harvester.active,
  }
}

export function toApi(form: HarvesterForm): HarvesterSource {
  return {
    organization: form.owned?.organization?.id,
    owner: form.owned?.owner?.id,
    name: form.name,
    description: form.description,
    url: form.url,
    backend: form.backend,
    autoarchive: form.autoarchive,
    active: form.active,
    config: {
      filters: form.filters,
      extra_configs: form.configs,
    },
  }
}
