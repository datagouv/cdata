// Generic OpenAPI 2.0 / 3.x extractor.
// Walks `spec.paths × HTTP methods`, extracts the 200 response schema,
// resolves internal $ref + allOf + first variant of oneOf/anyOf,
// and returns each endpoint's top-level properties ready to render.
//
// The resolver never produces user-facing French strings. When it hits
// a circular ref, external ref, or a oneOf/anyOf variant, it emits a
// `_placeholder` marker on the schema so the rendering component can
// translate the message via i18n.

import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types'

const METHODS = ['get'] as const

export type EndpointMethod = (typeof METHODS)[number]

export type EndpointProperties = {
  path: string
  method: EndpointMethod
  summary: string | undefined
  properties: Record<string, unknown>
}

export type SchemaPlaceholder = 'circular' | 'external' | 'variant'

type Operation = OpenAPIV2.OperationObject | OpenAPIV3.OperationObject

const CIRCULAR = Object.freeze({ type: 'object', _placeholder: 'circular' as const })
const EXTERNAL_REF = Object.freeze({ type: 'object', _placeholder: 'external' as const })

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function lookupRef(ref: string, root: OpenAPI.Document): Record<string, unknown> | undefined {
  // Only internal refs: #/components/schemas/X (v3) or #/definitions/X (v2)
  if (!ref.startsWith('#/')) return undefined
  const parts = ref.slice(2).split('/')
  let node: unknown = root
  for (const part of parts) {
    if (!isObject(node)) return undefined
    node = node[part]
  }
  return isObject(node) ? node : undefined
}

function resolveSchema(
  schema: unknown,
  root: OpenAPI.Document,
  seen: Set<string>,
): Record<string, unknown> {
  if (!isObject(schema)) return {}

  // $ref
  if (typeof schema.$ref === 'string') {
    const ref = schema.$ref
    if (!ref.startsWith('#/')) return EXTERNAL_REF
    if (seen.has(ref)) return CIRCULAR
    const target = lookupRef(ref, root)
    if (!target) return {}
    return resolveSchema(target, root, new Set(seen).add(ref))
  }

  // allOf: merge properties from all variants
  if (Array.isArray(schema.allOf)) {
    const merged: Record<string, unknown> = { type: 'object', properties: {} }
    const mergedProps = merged.properties as Record<string, unknown>
    for (const sub of schema.allOf) {
      const resolved = resolveSchema(sub, root, seen)
      if (isObject(resolved.properties)) {
        for (const [k, v] of Object.entries(resolved.properties)) {
          mergedProps[k] = v
        }
      }
    }
    // Preserve description/title from the outer schema if any
    if (typeof schema.description === 'string') merged.description = schema.description
    if (typeof schema.title === 'string') merged.title = schema.title
    return merged
  }

  // oneOf / anyOf: take the first variant, mark that it's one of N
  const variants = (Array.isArray(schema.oneOf) ? schema.oneOf : Array.isArray(schema.anyOf) ? schema.anyOf : null)
  if (variants && variants.length > 0) {
    const first = resolveSchema(variants[0], root, seen)
    return { ...first, _placeholder: 'variant', _variantCount: variants.length }
  }

  // Recursively resolve nested properties
  const out: Record<string, unknown> = { ...schema }
  if (isObject(schema.properties)) {
    const resolvedProps: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(schema.properties)) {
      resolvedProps[k] = resolveSchema(v, root, seen)
    }
    out.properties = resolvedProps
  }
  if (isObject(schema.items)) {
    out.items = resolveSchema(schema.items, root, seen)
  }
  return out
}

function extractResponseSchema(operation: Operation, isV2: boolean): unknown {
  const responses: unknown = operation.responses
  if (!isObject(responses)) return undefined
  const ok = responses['200']
  if (!isObject(ok)) return undefined

  if (isV2) {
    return isObject(ok.schema) ? ok.schema : undefined
  }

  const content = isObject(ok.content) ? ok.content : undefined
  const json = content && isObject(content['application/json']) ? content['application/json'] : undefined
  return json && isObject(json.schema) ? json.schema : undefined
}

function propertiesOf(resolved: Record<string, unknown>): Record<string, unknown> | undefined {
  if (isObject(resolved.properties)) {
    return resolved.properties as Record<string, unknown>
  }
  // Top-level array: descend into items
  if (resolved.type === 'array' && isObject(resolved.items)) {
    const items = resolved.items as Record<string, unknown>
    if (isObject(items.properties)) {
      return items.properties as Record<string, unknown>
    }
  }
  return undefined
}

function isV2Document(spec: OpenAPI.Document): spec is OpenAPIV2.Document {
  return 'swagger' in spec && spec.swagger === '2.0'
}

export function extractEndpoints(spec: OpenAPI.Document): EndpointProperties[] {
  if (!isObject(spec)) return []
  const paths = spec.paths
  if (!isObject(paths)) return []

  const isV2 = isV2Document(spec)
  const result: EndpointProperties[] = []

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!isObject(pathItem)) continue
    for (const method of METHODS) {
      const op = pathItem[method]
      if (!isObject(op)) continue

      const schema = extractResponseSchema(op as Operation, isV2)
      if (!schema) continue

      const resolved = resolveSchema(schema, spec, new Set())
      const properties = propertiesOf(resolved)
      if (!properties || Object.keys(properties).length === 0) continue

      result.push({
        path,
        method,
        summary: typeof op.summary === 'string' ? op.summary : undefined,
        properties,
      })
    }
  }

  return result
}
