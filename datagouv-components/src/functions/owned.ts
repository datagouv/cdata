import type { Owned } from '../types/owned'

export function getOwnerName(owned: Owned): string {
  if (owned.organization) {
    return owned.organization.name
  }
  else if (owned.owner) {
    return `${owned.owner.first_name} ${owned.owner.last_name}`
  }
  return '' // Not supposed to exist but it does...
}

export function getOwnerPage(owned: Owned): string | null {
  if (owned.organization) {
    return owned.organization.page
  }
  else if (owned.owner) {
    return owned.owner.page
  }
  return null // Not supposed to exist but it does...
}
