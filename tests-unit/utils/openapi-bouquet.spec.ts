import { describe, expect, it } from 'vitest'
import type { EndpointProperties } from '~/utils/openapi-extract'
import { unwrapBouquetData } from '~/utils/openapi-bouquet'

function endpoint(summary: string, path = '/v3/things'): EndpointProperties {
  return { path, method: 'get', summary, properties: {} }
}

describe('unwrapBouquetData', () => {
  it('unwraps a top-level `data` object', () => {
    const [unwrapped] = unwrapBouquetData([{
      ...endpoint('Things'),
      properties: { data: { type: 'object', properties: { id: { type: 'string' } } } },
    }])
    expect(unwrapped.properties).toEqual({ id: { type: 'string' } })
  })

  it('unwraps the double-data array shape', () => {
    const [unwrapped] = unwrapBouquetData([{
      ...endpoint('Things'),
      properties: {
        data: {
          type: 'array',
          items: { properties: { data: { properties: { id: { type: 'string' } } } } },
        },
      },
    }])
    expect(unwrapped.properties).toEqual({ id: { type: 'string' } })
  })

  it('leaves properties without a `data` wrapper untouched', () => {
    const properties = { id: { type: 'string' } }
    const [unwrapped] = unwrapBouquetData([{ ...endpoint('Things'), properties }])
    expect(unwrapped.properties).toEqual(properties)
  })
})
