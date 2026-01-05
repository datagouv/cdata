import { throwOnNever, type Dataservice, type DatasetV2, type DatasetV2WithFullObject, type Organization, type Reuse, type User } from '@datagouv/components-next'
import type { $Fetch } from 'nitropack'
import type { Thread } from '~/types/discussions'

export type OwnedObject = DatasetV2 | DatasetV2WithFullObject | Reuse | Dataservice | Organization | User | Thread

type OrganizationWithMembers = Organization & {
  members: Array<{ user: User & { email?: string }, role: string }>
}

export async function getOwnerEmails($api: $Fetch, obj: OwnedObject): Promise<string[]> {
  // User (has email directly)
  if ('first_name' in obj && 'last_name' in obj) {
    return obj.email ? [obj.email] : []
  }

  // Organization (has members)
  if ('members' in obj) {
    return await getOrganizationAdminEmails($api, obj.id)
  }

  // Thread (no owner to notify)
  if ('discussion' in obj) {
    return []
  }

  // Owned objects (Dataset, Reuse, Dataservice)
  if ('owner' in obj && 'organization' in obj) {
    if (obj.owner) {
      const user = await $api<User & { email?: string }>(`/api/1/users/${obj.owner.id}/`)
      return user.email ? [user.email] : []
    }
    if (obj.organization) {
      return await getOrganizationAdminEmails($api, obj.organization.id)
    }
    return []
  }

  return throwOnNever(obj, `Unknown object type in getOwnerEmails`)
}

export async function getOrganizationAdminEmails($api: $Fetch, orgId: string): Promise<string[]> {
  const org = await $api<OrganizationWithMembers>(`/api/1/organizations/${orgId}/`)
  if (!org?.members) return []

  return org.members
    .filter((m): m is typeof m & { user: { email: string } } => m.role === 'admin' && !!m.user?.email)
    .map(m => m.user.email)
}

export function getUserEmail(user: User | null | undefined): string | null {
  if (!user) return null
  return 'email' in user ? (user as User & { email?: string }).email || null : null
}
