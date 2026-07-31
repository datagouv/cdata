import type { DatasetV2, Resource } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

// Only gpkg is processed by the udata geopf plugin today (GEOPF_PUSHABLE_FORMATS),
// and it isn't exposed by any API endpoint, so this is a known, documented coupling
// with the backend config: see udata/docs/geopf.md.
export const GEOPF_PUSHABLE_FORMAT = 'gpkg'

export type GeopfPushStatus = 'pending' | 'done' | 'error' | 'timeout'
export type GeopfPullStatus = 'pending' | 'done' | 'error'

export function isGeopfPushable(resource: Resource): boolean {
  return resource.format?.toLowerCase() === GEOPF_PUSHABLE_FORMAT && !isGeopfOffering(resource)
}

export function isGeopfOffering(resource: Resource): boolean {
  return typeof resource.extras['geopf:offering:id'] === 'string'
}

export function getGeopfOfferingLastSyncedAt(resource: Resource): string | null {
  return (resource.extras['geopf:offering:last-synced-at'] as string | undefined) ?? null
}

// A resource tied into the Géoplateforme sync (successfully pushed, or pulled back
// as an offering) shouldn't be edited/replaced locally: doing so would silently
// diverge from what's published on cartes.gouv.fr.
export function isGeopfSynced(resource: Resource): boolean {
  return resource.extras['geopf:push:status'] === 'done' || isGeopfOffering(resource)
}

export type GeopfPushState
  = | { status: null }
    | { status: 'pending' }
    | { status: 'done', lastSyncedAt: string | null }
    | { status: 'error' | 'timeout', error: string | null }

export function getGeopfPushState(resource: Resource): GeopfPushState {
  const status = resource.extras['geopf:push:status'] as GeopfPushStatus | undefined

  if (status === 'done') {
    return { status: 'done', lastSyncedAt: (resource.extras['geopf:push:last-synced-at'] as string | undefined) ?? null }
  }
  if (status === 'error' || status === 'timeout') {
    return { status, error: (resource.extras['geopf:push:error'] as string | undefined) ?? null }
  }
  if (status === 'pending') {
    return { status: 'pending' }
  }
  return { status: null }
}

export type GeopfPullState
  = | { status: null }
    | { status: 'pending' }
    | { status: 'done', lastSyncedAt: string | null }
    | { status: 'error', error: string | null }

export function getGeopfPullState(dataset: DatasetV2): GeopfPullState {
  const status = dataset.extras['geopf:pull:status'] as GeopfPullStatus | undefined

  if (status === 'done') {
    return { status: 'done', lastSyncedAt: (dataset.extras['geopf:pull:last-synced-at'] as string | undefined) ?? null }
  }
  if (status === 'error') {
    return { status: 'error', error: (dataset.extras['geopf:pull:error'] as string | undefined) ?? null }
  }
  if (status === 'pending') {
    return { status: 'pending' }
  }
  return { status: null }
}

export function getGeopfFicheUrl(dataset: DatasetV2): string | null {
  return (dataset.extras['geopf:push:fiche-url'] as string | undefined) ?? null
}

// A dataset lives in exactly one entrepôt: this is pinned in dataset extras on
// the first *successful* push and reused as-is by every later push (see
// udata/docs/geopf.md). Not editable once set.
export function getGeopfDatastoreId(dataset: DatasetV2): string | null {
  return (dataset.extras['geopf:push:datastore-id'] as string | undefined) ?? null
}

// Raw pass-through of geopf's own API shape (GET /datastores).
export type GeopfDatastore = {
  datastore_id: string
  name: string
}

// 424 means "not connected to Géoplateforme" for both push and pull (see udata/docs/geopf.md);
// the global $api error handler swallows it silently, so callers check it themselves
// to prompt reconnection instead of failing silently.
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
