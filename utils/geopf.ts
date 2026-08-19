import type { Resource } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export type GeopfPushStatus = 'pending' | 'done' | 'error' | 'timeout'
export type GeopfPullStatus = 'pending' | 'done' | 'error'

// Shape of `GET /api/1/geopf/status/<dataset_id>/` (see udata/docs/geopf.md).
// A null `status` means "never run".
export type GeopfPushableResource = {
  id: string
  title: string
  format: string | null
  url: string | null
  push: {
    status: GeopfPushStatus | null
    last_synced_at: string | null
    error: string | null
    task_id: string | null
    stored_data_id: string | null
  }
}

export type GeopfOfferingResource = {
  id: string
  title: string
  format: string | null
  url: string | null
  offering_id: string
  last_synced_at: string | null
}

export type GeopfDatasetStatus = {
  datastore_id: string | null
  fiche_url: string | null
  pull: {
    status: GeopfPullStatus | null
    last_synced_at: string | null
    error: string | null
    task_id: string | null
  }
  pushable: Array<GeopfPushableResource>
  offerings: Array<GeopfOfferingResource>
}

export function geopfDatasetStatusUrl(datasetId: string): string {
  return `/api/1/geopf/status/${datasetId}/`
}

// Shared by the admin dataset layout and the sync page, so both read one useAsyncData entry.
export function geopfDatasetStatusKey(datasetId: string): string {
  return `geopf-status-${datasetId}`
}

// Resources whose local edition would diverge from what cartes.gouv.fr publishes.
export function isGeopfSynced(resource: Resource): boolean {
  const status = resource.extras['geopf:push:status']
  return status === 'done' || status === 'pending' || typeof resource.extras['geopf:offering:id'] === 'string'
}

// Raw pass-through of geopf's own API shape (GET /datastores).
export type GeopfDatastore = {
  datastore_id: string
  name: string
}

// Push and pull answer 424 when not connected; the global $api handler swallows it.
export function isGeopfReauthRequired(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('response' in error)) return false
  const response = (error as { response?: { status?: number } }).response
  return response?.status === 424
}

export function getGeopfBadgeType(status: GeopfPushStatus | GeopfPullStatus | null): AdminBadgeType {
  switch (status) {
    case 'done':
      return 'success'
    case 'pending':
      return 'primary'
    case 'error':
    case 'timeout':
      return 'danger'
    default:
      return 'secondary'
  }
}
