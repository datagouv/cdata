import type { Dataservice, Dataset, Owned, User } from '@datagouv/components-next'

export type HarvesterValidation = {
  state: 'accepted' | 'refused' | 'pending'
  by: User
  on: string
  comment: string
}

export type HarvestError = {
  created_at: string
  message: string
  details: string | null
}

export type HarvestLog = {
  level: string
  message: string
}

export type HarvestItem = {
  remote_id: string
  remote_url: string | null
  dataset: Dataset | null
  dataservice: Dataservice | null
  status: 'pending' | 'started' | 'done' | 'failed' | 'skipped' | 'archived'
  created: string
  started: string | null
  ended: string | null
  errors: Array<HarvestError>
  logs: Array<HarvestLog>
  args: string
  kwargs: Record<string, unknown>
}

export type HarvesterJobStatus = 'pending' | 'initializing' | 'initialized' | 'processing' | 'done' | 'done-errors' | 'failed'

export type HarvesterJob = {
  id: string
  created: string
  started: string | null
  ended: string | null
  status: HarvesterJobStatus
  errors: Array<HarvestError>
  items: Array<HarvestItem>
  source: string
}

export type HarvesterSource = Owned & {
  id: string
  name: string
  description: string | null
  url: string
  backend: string
  config: Record<string, unknown>
  created_at: string
  active: boolean
  autoarchive: boolean
  validation: HarvesterValidation
  last_job: HarvesterJob | null
  deleted: string | null
  schedule: string
}

export type HarvesterForm = {
  owned: Owned | null
  name: string
  description: string
  url: string
  backend: string
  filters: Array<HarvestSourceFilter>
  configs: Array<HarvestSourceConfig>
  schedule: string
  autoarchive: boolean
  active: boolean
}

export type HarvestSourceFilter = {
  key: string
  type: 'include' | 'exclude'
  value: string
}
export type HarvestSourceConfig = {
  key: string
  value: string
}

export type HarvestBackend = {
  id: string
  label: string
  filters: Array<{ label: string, key: string, type: string, description: string }>
  features: Array<{ label: string, key: string, default: string, description: string }>
  extra_configs: Array<{ label: string, key: string, default: string, description: string }>
}

export type NewHarvesterForApi = {
  organization: string | null
  owner: string | null
  name: string
  description: string
  url: string
  backend: string
  autoarchive: boolean
  active: boolean
  config: {
    filters: Array<HarvestSourceFilter>
    extra_configs: Array<HarvestSourceConfig>
  }
}
