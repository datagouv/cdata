import type { Organization, User } from '@datagouv/components-next'

type OwnedObject = {
  owner?: { email?: string | null } | null
  organization?: { members?: Array<{ user: { email?: string | null }, role: string }> } | null
}

export function getOwnerEmail(obj: OwnedObject | Record<string, unknown> | null | undefined): string | null {
  if (!obj) return null

  if ('owner' in obj && obj.owner && typeof obj.owner === 'object' && 'email' in obj.owner) {
    return (obj.owner as { email?: string | null }).email || null
  }

  if ('organization' in obj && obj.organization && typeof obj.organization === 'object' && 'members' in obj.organization) {
    const org = obj.organization as { members?: Array<{ user: { email?: string | null }, role: string }> }
    const adminMember = org.members?.find(m => m.role === 'admin')
    if (adminMember?.user?.email) {
      return adminMember.user.email
    }
  }

  return null
}

export function getOrganizationAdminEmails(org: Organization | null | undefined): string | null {
  if (!org?.members) return null

  const adminMember = org.members.find(m => m.role === 'admin')
  if (adminMember?.user && 'email' in adminMember.user) {
    return (adminMember.user as User & { email?: string }).email || null
  }

  return null
}

export function getUserEmail(user: User | null | undefined): string | null {
  if (!user) return null
  return 'email' in user ? (user as User & { email?: string }).email || null : null
}
