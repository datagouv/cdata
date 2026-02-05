import type { RESOURCE_TYPE } from '../functions/resources'
import type { Schema } from '../types/schemas'
import type { Dataset } from './datasets'
import type { Harvest } from './harvest'
import type { Owned } from './owned'

export type ResourceType = typeof RESOURCE_TYPE[number]

export type RemoteResourceFileType = 'remote'

export type FileResourceFileType = 'file'

export type ResourceFileType = RemoteResourceFileType | FileResourceFileType

export type Resource = {
  id: string
  title: string
  type: ResourceType
  checksum: { type: string, value: string } | null
  created_at: string
  description: string | null
  extras: Record<string, unknown>
  metrics: { views: number }
  harvest: Harvest
  filesize: number | null
  filetype: ResourceFileType
  format: string
  mime: string
  internal: Record<string, unknown>
  last_modified: string
  latest: string // permalien stable
  preview_url: string
  schema: Schema | null
  url: string
}

export type CommunityResource = Owned & Resource & { dataset: Omit<Dataset, 'resources' | 'community_resources'>, permissions: { edit: boolean, delete: boolean } }

export interface ResourceGroup {
  type: ResourceType
  total: number
  items: Resource[]
}
