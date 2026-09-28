import type { OpenAPI, OpenAPIV3 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { extractEndpoints } from '~/utils/openapi-extract'

function v3Document(schemas: Record<string, unknown>, responseSchema: unknown): OpenAPI.Document {
  return {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0' },
    components: { schemas },
    paths: {
      '/things': {
        get: {
          summary: 'List things',
          responses: {
            200: {
              description: 'OK',
              content: { 'application/json': { schema: responseSchema } },
            },
          },
        },
      },
    },
  } as unknown as OpenAPIV3.Document
}

describe('extractEndpoints', () => {
  it('extracts the 200 JSON schema properties of a GET endpoint', () => {
    const doc = v3Document({}, { type: 'object', properties: { id: { type: 'string' } } })
    expect(extractEndpoints(doc)).toEqual([
      {
        path: '/things',
        method: 'get',
        summary: 'List things',
        properties: { id: { type: 'string' } },
      },
    ])
  })

  it('descends into items for a top-level array response', () => {
    const doc = v3Document({}, { type: 'array', items: { type: 'object', properties: { id: { type: 'string' } } } })
    expect(extractEndpoints(doc)[0].properties).toEqual({ id: { type: 'string' } })
  })

  it('resolves internal $ref', () => {
    const doc = v3Document(
      { Thing: { type: 'object', properties: { name: { type: 'string' } } } },
      { $ref: '#/components/schemas/Thing' },
    )
    expect(extractEndpoints(doc)[0].properties).toEqual({ name: { type: 'string' } })
  })

  it('does not loop on circular $ref and marks them with a placeholder', () => {
    const doc = v3Document(
      { Thing: { type: 'object', properties: { name: { type: 'string' }, parent: { $ref: '#/components/schemas/Thing' } } } },
      { $ref: '#/components/schemas/Thing' },
    )
    const properties = extractEndpoints(doc)[0].properties
    expect(properties.name).toEqual({ type: 'string' })
    expect(properties.parent).toEqual({ type: 'object', _placeholder: 'circular' })
  })

  it('replaces external $ref with a placeholder', () => {
    const doc = v3Document(
      {},
      { type: 'object', properties: { external: { $ref: 'https://example.com/schema.json#/Thing' } } },
    )
    expect(extractEndpoints(doc)[0].properties.external).toEqual({ type: 'object', _placeholder: 'external' })
  })

  it('merges properties of all allOf variants', () => {
    const doc = v3Document(
      {
        Base: { type: 'object', properties: { id: { type: 'string' } } },
        Extra: { type: 'object', properties: { name: { type: 'string' } } },
      },
      { allOf: [{ $ref: '#/components/schemas/Base' }, { $ref: '#/components/schemas/Extra' }] },
    )
    expect(extractEndpoints(doc)[0].properties).toEqual({
      id: { type: 'string' },
      name: { type: 'string' },
    })
  })

  it('takes the first oneOf variant and marks the variant count', () => {
    const doc = v3Document(
      {},
      {
        type: 'object',
        properties: {
          value: {
            oneOf: [
              { type: 'object', properties: { a: { type: 'string' } } },
              { type: 'object', properties: { b: { type: 'string' } } },
              { type: 'object', properties: { c: { type: 'string' } } },
            ],
          },
        },
      },
    )
    const value = extractEndpoints(doc)[0].properties.value as Record<string, unknown>
    expect(value._placeholder).toEqual('variant')
    expect(value._variantCount).toEqual(3)
    expect(value.properties).toEqual({ a: { type: 'string' } })
  })

  it('skips endpoints without a 200 response or without properties', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/no-200': { get: { responses: { 404: { description: 'Not found' } } } },
        '/no-properties': {
          get: { responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'string' } } } } } },
        },
      },
    } as unknown as OpenAPIV3.Document
    expect(extractEndpoints(doc)).toEqual([])
  })

  it('reads the schema directly from the response for swagger 2.0', () => {
    const doc = {
      swagger: '2.0',
      info: { title: 'Test', version: '1.0' },
      definitions: { Thing: { type: 'object', properties: { id: { type: 'string' } } } },
      paths: {
        '/things': {
          get: {
            summary: 'List things',
            responses: { 200: { description: 'OK', schema: { $ref: '#/definitions/Thing' } } },
          },
        },
      },
    } as unknown as OpenAPI.Document
    expect(extractEndpoints(doc)[0].properties).toEqual({ id: { type: 'string' } })
  })
})
