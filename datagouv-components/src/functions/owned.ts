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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function getMapAttribution(owned: Owned): string {
  const name = getOwnerName(owned)
  const page = getOwnerPage(owned)
  if (!name && !page)
    return ''
  // The owner name is free text any user controls (organization name, or a
  // profile's first/last name). maplibre-gl injects this attribution string
  // into the DOM as HTML, and its own attribution sanitizer is bypassable via
  // mutation XSS, so every interpolated value has to be escaped here.
  return `© <a href="${escapeHtml(page ?? '')}" target="_blank">${escapeHtml(name)}</a>`
}
