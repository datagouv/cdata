import type { Resource } from '../types/resources'

type PreviewedResource = Pick<Resource, 'extras' | 'last_modified'>

// When the Tabular API last analysed the file, which is the date of what its preview shows.
export function getTabularPreviewDate(resource: PreviewedResource): string | undefined {
  const analysedAt = resource.extras['analysis:parsing:finished_at']
  return typeof analysedAt === 'string' && analysedAt ? analysedAt : undefined
}

export function isTabularPreviewStale(resource: PreviewedResource): boolean {
  const analysedAt = getTabularPreviewDate(resource)
  if (!analysedAt || !resource.last_modified) return false
  return new Date(resource.last_modified).getTime() > new Date(analysedAt).getTime()
}
