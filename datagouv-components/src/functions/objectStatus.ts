import type { Dataset, DatasetV2, DatasetV2WithFullObject } from '../types/datasets'
import type { Dataservice } from '../types/dataservices'
import type { Reuse, ReuseV2 } from '../types/reuses'
import type { Chart } from '../types/visualizations'

// Publication status shared by every published object, from the most to the least prominent
export type ObjectStatus = 'deleted' | 'archived' | 'private' | 'public'

export function getDatasetStatus(dataset: Dataset | DatasetV2 | DatasetV2WithFullObject): ObjectStatus {
  if (dataset.deleted) return 'deleted'
  if (dataset.archived) return 'archived'
  if (dataset.private) return 'private'
  return 'public'
}

export function getDataserviceStatus(dataservice: Dataservice): ObjectStatus {
  if (dataservice.deleted_at) return 'deleted'
  if (dataservice.archived_at) return 'archived'
  if (dataservice.private) return 'private'
  return 'public'
}

export function getReuseStatus(reuse: Reuse | ReuseV2): ObjectStatus {
  if (reuse.deleted) return 'deleted'
  if (reuse.archived) return 'archived'
  if (reuse.private) return 'private'
  return 'public'
}

export function getChartStatus(chart: Chart): ObjectStatus {
  if (chart.deleted_at) return 'deleted'
  if (chart.private) return 'private'
  return 'public'
}
