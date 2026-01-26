import type { Organization, OrganizationReference } from './organizations'
import type { User, UserReference } from './users'

/**
 * A resource, dataset, reuse or any other object owned by an organization or a user.
 */
export type Owned = { organization: OrganizationReference, owner: never | null } | { organization: never | null, owner: UserReference }

export type OwnedWithId = { organization: string, owner: never | null } | { organization: never | null, owner: string }

export type OwnedWithFullObject = { organization: Organization, owner: never | null } | { organization: never | null, owner: User }
