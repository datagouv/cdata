export { isGeopfSynced } from '@datagouv/components-next'

export type GeopfPushStatus = 'pending' | 'done' | 'error' | 'timeout'
export type GeopfPullStatus = 'pending' | 'done' | 'error'

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
  offering: {
    id: string
    last_synced_at: string | null
  }
}

// Shape of `GET /api/1/geopf/status/<dataset_id>/`
export type GeopfDatasetStatus = {
  push: {
    datastore_id: string | null
    fiche_url: string | null
  }
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
