import type { $Fetch } from 'ofetch'

export async function getZone(api: $Fetch, id: string) {
  try {
    const zone = await api<{
      id: string
      properties: {
        code: string
        level: string
        name: string
        slug: string
        uri: string
      }
      type: string
    }>(`/api/1/spatial/zone/${id}/`)
    return {
      id: zone.id,
      code: zone.properties.code,
      level: zone.properties.level,
      name: zone.properties.name,
      uri: zone.properties.uri,
    }
  }
  catch {
    return null
  }
}
