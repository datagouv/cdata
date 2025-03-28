import type { Organization } from './organizations'
import type { User } from './users'

/**
 * A resource, dataset, reuse or any other object owned by an organization or a user.
 */
export type Owned = { organization: Organization, owner: never | null } | { organization: never | null, owner: User }

export type OwnedWithId = { organization: string, owner: never | null } | { organization: never | null, owner: string }
