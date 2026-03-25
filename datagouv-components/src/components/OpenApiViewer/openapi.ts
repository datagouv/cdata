import type { OpenAPIV3 } from 'openapi-types'

export interface Endpoint {
  method: string
  path: string
  summary: string
  tags: string[]
  parameters: OpenAPIV3.ParameterObject[]
  requestBody: OpenAPIV3.RequestBodyObject | null
  responses: Record<string, OpenAPIV3.ResponseObject>
  spec: OpenAPIV3.Document
}

export function resolveRef<T>(spec: OpenAPIV3.Document, obj: T | OpenAPIV3.ReferenceObject): T | null {
  if (!obj) return null
  if (!('$ref' in obj)) return obj as T
  const path = (obj as OpenAPIV3.ReferenceObject).$ref.replace('#/', '').split('/')
  let resolved: unknown = spec
  for (const segment of path) {
    if (resolved && typeof resolved === 'object') {
      resolved = (resolved as Record<string, unknown>)[segment]
    }
    else {
      return null
    }
  }
  return resolved as T
}

export function getSchemaType(spec: OpenAPIV3.Document, schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
  if (!schema) return ''
  const resolved = resolveRef<OpenAPIV3.SchemaObject>(spec, schema)
  if (!resolved) return ''
  if (resolved.type === 'array' && resolved.items) {
    const itemType = getSchemaType(spec, resolved.items)
    return `${itemType}[]`
  }
  if (resolved.format) return `${resolved.type} (${resolved.format})`
  return resolved.type || ''
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'application/json': 'JSON',
  'application/xml': 'XML',
  'application/x-www-form-urlencoded': 'Form',
  'multipart/form-data': 'Multipart',
  'text/plain': 'Text',
  'text/html': 'HTML',
  'text/csv': 'CSV',
  'application/octet-stream': 'Binary',
  'application/pdf': 'PDF',
}

export function contentTypeLabel(raw: string): string {
  const base = raw.split(';')[0]!.trim()
  return CONTENT_TYPE_LABELS[base] || base
}

export interface SchemaProperty {
  name: string
  type: string
  description: string
  required: boolean
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined
}

export function getSchemaProperties(spec: OpenAPIV3.Document, schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): SchemaProperty[] {
  if (!schema) return []
  const resolved = resolveRef<OpenAPIV3.SchemaObject>(spec, schema)
  if (!resolved?.properties) return []
  const requiredFields = resolved.required || []
  return Object.entries(resolved.properties).map(([name, propSchema]) => {
    const prop = resolveRef<OpenAPIV3.SchemaObject>(spec, propSchema)
    return {
      name,
      type: getSchemaType(spec, propSchema),
      description: prop?.description || '',
      required: requiredFields.includes(name),
      schema: propSchema,
    }
  })
}

export function hasNestedProperties(spec: OpenAPIV3.Document, schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): boolean {
  if (!schema) return false
  const resolved = resolveRef<OpenAPIV3.SchemaObject>(spec, schema)
  if (!resolved) return false
  if (resolved.properties) return true
  if (resolved.type === 'array' && resolved.items) {
    return hasNestedProperties(spec, resolved.items)
  }
  return false
}

export function getNestedSchema(spec: OpenAPIV3.Document, schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined {
  if (!schema) return undefined
  const resolved = resolveRef<OpenAPIV3.SchemaObject>(spec, schema)
  if (!resolved) return undefined
  if (resolved.properties) return schema
  if (resolved.type === 'array' && resolved.items) return resolved.items
  return undefined
}

const MAX_EXAMPLE_DEPTH = 4

function defaultForType(type?: string, format?: string): unknown {
  switch (type) {
    case 'string':
      if (format === 'date') return '2024-01-01'
      if (format === 'date-time') return '2024-01-01T00:00:00Z'
      if (format === 'email') return 'user@example.com'
      if (format === 'uri' || format === 'url') return 'https://example.com'
      return 'string'
    case 'integer': return 0
    case 'number': return 0.0
    case 'boolean': return true
    case 'null': return null
    default: return {}
  }
}

export function generateExample(spec: OpenAPIV3.Document, schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, depth = 0): unknown {
  if (!schema || depth > MAX_EXAMPLE_DEPTH) return undefined
  const resolved = resolveRef<OpenAPIV3.SchemaObject>(spec, schema)
  if (!resolved) return undefined

  if (resolved.example !== undefined) return resolved.example

  if (resolved.type === 'array' && resolved.items) {
    const item = generateExample(spec, resolved.items, depth + 1)
    return item !== undefined ? [item] : []
  }

  if (resolved.properties) {
    const obj: Record<string, unknown> = {}
    for (const [name, propSchema] of Object.entries(resolved.properties)) {
      const prop = resolveRef<OpenAPIV3.SchemaObject>(spec, propSchema)
      if (prop?.example !== undefined) {
        obj[name] = prop.example
      }
      else {
        const val = generateExample(spec, propSchema, depth + 1)
        if (val !== undefined) obj[name] = val
      }
    }
    return obj
  }

  return defaultForType(resolved.type as string, resolved.format)
}
