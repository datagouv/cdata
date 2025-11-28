/**
 * A schema version.
 */
export type SchemaVersion = {
  version_name: string
  schema_url: string
}

/**
 * A schema from the schema catalog
 */
export type RegisteredSchema = {
  consolidation_dataset_id: string | null
  contact: string
  datapackage_description: string | null
  datapackage_name: string | null
  datapackage_title: string | null
  description: string
  examples: Array<{ path: string, title: string }>
  external_doc: string | null
  external_tool: string | null
  homepage: string
  labels: Array<string>
  name: string
  schema_type: 'tableschema' | 'jsonschema'
  schema_url: string
  title: string
  versions: Array<SchemaVersion>
}

export type SchemaField = {
  name: string
  description?: string
  type: string
  [key: string]: unknown
}

export type SchemaDetails = {
  name: string
  title: string
  description: string
  fields: SchemaField[]
  [key: string]: unknown
}

/**
 * A schema associated with a resource.
 */
export type Schema = {
  name?: string | null
  url?: string | null
  version?: string | null
}

export type SchemaPublicationMode = 'new' | 'existing'

export type ValidataError = {
  code: string
  description: string
  fieldName: string
  fieldNumber: number
  fieldPosition: number
  message: string
  name: string
  note: string
  rowNumber: number
  rowPosition: number
  tags: Array<string>
}
export type SchemaResponseData = Array<RegisteredSchema>

export type SchemaPath = { schema_name: string } | { schema_url: string }
