import type { Dataservice, Dataset, Owned, User } from '@datagouv/components'

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
