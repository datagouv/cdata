import type { GeoJsonObject } from 'geojson'
import type { Badges } from './badges'
import type { Harvest } from './harvest'
import type { Owned, OwnedWithId } from './owned'
import type { Resource } from './resources'
import type { ContactPoint } from './contact_point'
import type { License } from './licenses'
import type { Frequency } from './frequency'
import type { Granularity, SpatialZone } from './granularity'

export type Quality = {
  all_resources_available: boolean
  dataset_description_quality: boolean
  has_open_format: boolean
  has_resources: boolean
  license: boolean
  resources_documentation: boolean
  score: number
  spatial: boolean
  temporal_coverage: boolean
  update_frequency: boolean
  update_fulfilled_in_time: boolean
}

export type BaseDataset = Owned & {
  title: string
  acronym: string
  archived: boolean
  description: string
  tags: Array<string> | null
  license: string
  frequency: string
  temporal_coverage: {
    start: string
    end: string
  } | null
  frequency_date: string | null
  page: string
  private: boolean
  quality?: Quality
  spatial: {
    zones?: Array<string>
    granularity?: string
  } | null
  contact_points: Array<ContactPoint>
  featured: boolean
}

export type NewDataset = Omit<BaseDataset, keyof OwnedWithId | 'featured'> & OwnedWithId

export type Rel = {
  rel: string
  href: string
  total: number
  type: string
}

export type Dataset = BaseDataset & {
  id: string
  badges: Badges
  deleted: string | null
  page: string
  resources: Array<Resource>
  community_resources: Array<Resource>
  created_at: string
  last_modified: string
  last_update: string
  uri: string
  slug: string
  quality: Quality
  metrics: {
    dataservices: number
    discussions: number
    discussions_open: number
    followers: number
    resources_downloads: number
    reuses: number
    views: number
  }
  harvest: Harvest
  extras: Record<string, unknown>
  permissions: { edit: boolean, edit_resources: boolean, delete: boolean }

}

export type DatasetV2 = Owned & Omit<Dataset, 'resources' | 'community_resources'> & {
  resources: Rel
  community_resources: Rel
}

export type DatasetV2WithFullObject = Owned & Omit<DatasetV2, 'license' | 'frequency' | 'spatial'> & {
  license: License
  frequency: Frequency
  spatial: {
    zones?: Array<SpatialZone>
    granularity?: Granularity
    geom?: GeoJsonObject
  } | null
}
