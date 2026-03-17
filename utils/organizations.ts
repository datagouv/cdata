import type { MemberRole } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export function cleanSiret(siret: string | null | undefined): string | null {
  if (!siret) return null
  return siret.replace(/\s+/g, '')
}

export function getRoleBadgeType(role: MemberRole): AdminBadgeType {
  if (role === 'admin') return 'primary'
  if (role === 'partial_editor') return 'default'
  return 'secondary'
}
