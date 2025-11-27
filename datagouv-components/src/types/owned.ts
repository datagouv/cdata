import type { OrganizationReference } from './organizations'
import type { UserReference } from './users'

/**
 * A resource, dataset, reuse or any other object owned by an organization or a user.
 */
export type Owned = { organization: OrganizationReference, owner: never | null } | { organization: never | null, owner: UserReference }

export type OwnedWithId = { organization: string, owner: never | null } | { organization: never | null, owner: string }
