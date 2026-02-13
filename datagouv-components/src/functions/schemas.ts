import { ofetch } from 'ofetch'
import type { Resource } from '../types/resources'
import { useComponentsConfig } from '../config'
import type { RegisteredSchema, Schema, SchemaPath, SchemaResponseData } from '../types/schemas'

let catalogRequest: Promise<Array<RegisteredSchema>> | null = null
export function useGetCatalog() {
  const config = useComponentsConfig()

  return async (): Promise<SchemaResponseData> => {
    if (catalogRequest) {
      return catalogRequest
    }

    return await (catalogRequest = ofetch('api/1/datasets/schemas/', {
      baseURL: config.apiBase,
    }))
  }
}

export function getSchemaVersion(schema: RegisteredSchema | null) {
  if (!schema) {
    return null
  }
  if (schema.versions && schema.versions.length > 0) {
    return schema.versions[schema.versions.length - 1]?.version_name
  }
  else {
    const versionMatch = schema.schema_url.match(/\/(\d+\.\d+\.\d+)\//)
    return versionMatch ? versionMatch[1] : ''
  }
}

export function findSchemaInCatalog(catalog: Array<RegisteredSchema>, schema: Schema | null): RegisteredSchema | null {
  if (!schema) return null
  return catalog.find(registeredSchema => schema.name === registeredSchema.name) || null
}

export function useGetSchemaDocumentation() {
  const config = useComponentsConfig()
  return (name: string) => `${config.schemaDocumentationUrl}${name}/`
}

export function useGetSchemaValidationUrl() {
  const config = useComponentsConfig()
  return (resource: Resource, registeredSchema: RegisteredSchema) => {
    if (!resource.schema || !resource.schema.name) {
      return null
    }

    let schemaPath: SchemaPath = { schema_name: `schema-datagouvfr.${resource.schema.name}` }
    if (resource.schema && resource.schema.version) {
      const schemaVersion = resource.schema.version
      const versionUrl = registeredSchema.versions.find(version => version.version_name === schemaVersion)?.schema_url
      if (versionUrl) {
        schemaPath = { schema_url: versionUrl }
      }
    }
    const query = new URLSearchParams({
      'input': 'url',
      'url': resource.url,
      'header-case': 'on',
      ...schemaPath,
    }).toString()
    return `${config.schemaValidataUrl}/table-schema?${query}`
  }
}
