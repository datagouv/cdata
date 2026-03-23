import type { Badge } from '@datagouv/components-next'

type EntityWithBadges = { id: string, badges: Array<Badge> }

export async function updateBadges<T extends EntityWithBadges>(
  entity: T,
  newBadges: Array<Badge>,
  endpointBase: string,
) {
  const api = useNuxtApp().$api

  const oldKinds = entity.badges.map(badge => badge.kind)
  const newKinds = newBadges.map(badge => badge.kind)

  for (const kind of newKinds) {
    if (oldKinds.includes(kind)) continue
    await api(`api/1/${endpointBase}/${entity.id}/badges/`, {
      method: 'POST',
      body: { kind },
    })
  }

  for (const kind of oldKinds) {
    if (newKinds.includes(kind)) continue
    await api(`api/1/${endpointBase}/${entity.id}/badges/${kind}`, { method: 'DELETE' })
  }
}
