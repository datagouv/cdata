import type { MemberRole } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export function cleanSiret(siret: string | null | undefined): string | null {
  if (!siret) return null
  return siret.replace(/\s+/g, '')
}

// The organization presentation is publicly visible once its publication date is
// set. Mirrors the back `public_presentation_blocs` logic, letting the layout and
// the org root decide tab visibility and redirects from the lightweight
// `presentation_blocs_published_at` field (present in the default mask) without
// fetching the heavy `presentation_blocs` array — that one stays lazy-loaded on the
// presentation page only.
export function isOrganizationPresentationPublished(publishedAt: string | null | undefined): boolean {
  return !!publishedAt
}

export function getRoleBadgeType(role: MemberRole): AdminBadgeType {
  if (role === 'admin') return 'primary'
  if (role === 'partial_editor') return 'default'
  return 'secondary'
}
