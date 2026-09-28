// Bouquet-specific post-hoc transforms for extracted endpoints.
// These operate on the output of utils/openapi-extract.ts and are only
// applied when the dataservice title matches the Bouquet pattern.

import type { EndpointProperties } from './openapi-extract'

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// Bouquet responses wrap payloads in a top-level `data` key.
// Object endpoints: properties = { data: { type: object, properties: {...} } }
// Array endpoints:  properties = { data: { type: array, items: { properties: { data: { properties: {...} } } } } }
// (the double-data shape is real — confirmed against /v3/inpi/rne/.../beneficiaires_effectifs).
function unwrapOne(properties: Record<string, unknown>): Record<string, unknown> {
  const data = properties.data
  if (!isObject(data)) return properties

  if (isObject(data.properties)) {
    return data.properties as Record<string, unknown>
  }

  if (data.type === 'array' && isObject(data.items)) {
    const itemsProps = (data.items as Record<string, unknown>).properties
    if (isObject(itemsProps)) {
      const innerData = (itemsProps as Record<string, unknown>).data
      if (isObject(innerData) && isObject(innerData.properties)) {
        return innerData.properties as Record<string, unknown>
      }
    }
  }

  return properties
}

export function unwrapBouquetData(endpoints: EndpointProperties[]): EndpointProperties[] {
  return endpoints.map(ep => ({ ...ep, properties: unwrapOne(ep.properties) }))
}
