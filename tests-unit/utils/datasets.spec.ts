import type { DatasetV2WithFullObject, RegisteredSchema, Resource } from '@datagouv/components-next'
import { describe, expect, it } from 'vitest'
import type { CommunityResourceForm, DatasetForm, ResourceForm } from '~/types/types'
import { datasetToApi, datasetToForm, guessFormat, guessFormatFromRawFile, resourceToApi, resourceToForm } from '~/utils/datasets'

const baseDataset = {
  title: 'Recensement',
  description: 'Le recensement de la population',
  description_short: 'Recensement',
  acronym: 'RP',
  tags: ['population', 'insee'],
  license: { id: 'lov2', title: 'Licence Ouverte' },
  contact_points: [{ id: 'cp-1', name: 'INSEE', email: 'contact@insee.fr' }],
  frequency: { id: 'annual', label: 'Annuelle' },
  temporal_coverage: { start: '2020-01-01T00:00:00+00:00', end: '2024-12-31T00:00:00+00:00' },
  spatial: { zones: [{ id: 'country:fr', name: 'France' }], granularity: { id: 'country', name: 'Pays' } },
  private: false,
  featured: false,
  organization: { id: 'org-1', name: 'INSEE' },
  owner: null,
  access_type: 'open',
  access_audiences: [],
  access_type_reason_category: null,
  access_type_reason: null,
  authorization_request_url: null,
} as unknown as DatasetV2WithFullObject

describe('datasetToForm / datasetToApi', () => {
  it('survives a form round-trip for an organization-owned dataset', () => {
    const api = datasetToApi(datasetToForm(baseDataset))

    expect(api.organization).toEqual('org-1')
    expect(api.owner).toBeUndefined()
    expect(api.title).toEqual('Recensement')
    expect(api.tags).toEqual(['population', 'insee'])
    expect(api.license).toEqual('lov2')
    expect(api.frequency).toEqual('annual')
    expect(api.contact_points).toEqual(['cp-1'])
    expect(api.temporal_coverage).toEqual({
      start: new Date('2020-01-01T00:00:00+00:00').toISOString(),
      end: new Date('2024-12-31T00:00:00+00:00').toISOString(),
    })
    expect(api.spatial).toEqual({ zones: ['country:fr'], granularity: 'country' })
  })

  it('maps a user-owned dataset to `owner` and leaves `organization` empty', () => {
    const dataset = { ...baseDataset, organization: null, owner: { id: 'user-1' } } as unknown as DatasetV2WithFullObject
    const api = datasetToApi(datasetToForm(dataset))

    expect(api.owner).toEqual('user-1')
    expect(api.organization).toBeUndefined()
  })

  it('omits the temporal coverage when there is no start date', () => {
    const dataset = { ...baseDataset, temporal_coverage: null } as unknown as DatasetV2WithFullObject
    const form = datasetToForm(dataset)
    expect(form.temporal_coverage).toEqual({ start: null, end: null })
    expect(datasetToApi(form).temporal_coverage).toBeUndefined()
  })

  it('sends `null` to remove all contact points, not an empty array', () => {
    // The udata API ignores an empty array, `null` is required to remove the
    // last contact point (see :RemoveAllContactPoints in udata)
    const form = { ...datasetToForm(baseDataset), contact_points: [] } as DatasetForm
    expect(datasetToApi(form).contact_points).toBeNull()
  })

  it('keeps missing optional fields empty in the API payload', () => {
    const dataset = { ...baseDataset, license: null, frequency: null } as unknown as DatasetV2WithFullObject
    const api = datasetToApi(datasetToForm(dataset))
    expect(api.license).toEqual('')
    expect(api.frequency).toEqual('')
  })
})

const remoteResource = {
  id: 'res-1',
  title: 'Fichier distant',
  type: 'main',
  description: 'desc',
  filetype: 'remote',
  url: 'https://example.com/data.csv',
  format: 'csv',
  mime: 'text/csv',
  schema: null,
  checksum: { type: 'sha256', value: 'abc123' },
} as unknown as Resource

describe('resourceToForm / resourceToApi', () => {
  it('survives a round-trip for a remote resource', () => {
    const api = resourceToApi(resourceToForm(remoteResource, []))

    expect(api).toMatchObject({
      filetype: 'remote',
      title: 'Fichier distant',
      url: 'https://example.com/data.csv',
      format: 'csv',
      mime: 'text/csv',
      checksum: { type: 'sha256', value: 'abc123' },
    })
  })

  it('drops the checksum unless both type and value are present', () => {
    const form = resourceToForm({ ...remoteResource, checksum: { type: 'sha256', value: '' } } as unknown as Resource, [])
    expect(resourceToApi(form).checksum).toBeNull()
  })

  it('resolves a registered schema to its latest version', () => {
    const registered = {
      name: 'etalab/schema-irve',
      versions: [
        { version_name: '1.0.0', schema_url: 'https://schema.data.gouv.fr/1.0.0.json' },
        { version_name: '2.0.0', schema_url: 'https://schema.data.gouv.fr/2.0.0.json' },
      ],
    } as unknown as RegisteredSchema

    const form = resourceToForm({ ...remoteResource, schema: { name: 'etalab/schema-irve', url: null, version: null } } as unknown as Resource, [registered])
    expect(form.schema).toEqual(registered)

    expect(resourceToApi(form).schema).toEqual({
      name: 'etalab/schema-irve',
      url: 'https://schema.data.gouv.fr/2.0.0.json',
      version: '2.0.0',
    })
  })

  it('keeps a non-registered schema URL', () => {
    const resource = { ...remoteResource, schema: { name: null, url: 'https://example.com/schema.json', version: null } } as unknown as Resource
    const form = resourceToForm(resource, [])
    expect(form.schema).toBeNull()
    expect(form.schema_url).toEqual('https://example.com/schema.json')
    expect(resourceToApi(form).schema).toEqual({ name: null, url: 'https://example.com/schema.json', version: null })
  })

  it('maps community resource ownership to the API payload', () => {
    const communityResource = {
      ...remoteResource,
      dataset: { id: 'dataset-1' },
      organization: { id: 'org-1' },
      owner: null,
    } as unknown as Resource
    const form = resourceToForm(communityResource, []) as CommunityResourceForm
    expect(resourceToApi(form)).toMatchObject({
      dataset: { id: 'dataset-1' },
      organization: { id: 'org-1' },
      owner: null,
    })
  })

  it('refuses a remote resource without format', () => {
    const form = { ...resourceToForm(remoteResource, []), format: null } as unknown as ResourceForm
    expect(() => resourceToApi(form)).toThrowError('`format` is required for remote Resource')
  })
})

describe('guessFormat', () => {
  const extensions = ['csv', 'json', 'gz']

  it('normalizes the format of a remote resource', () => {
    const form = { filetype: 'remote', format: ' CSV ' } as ResourceForm
    expect(guessFormat(form, extensions)).toEqual('csv')
    expect(guessFormat({ filetype: 'remote', format: '' } as ResourceForm, extensions)).toBeNull()
  })

  it('uses the existing resource format when available', () => {
    const form = { filetype: 'file', file: null, resource: { format: 'JSON' } } as unknown as ResourceForm
    expect(guessFormat(form, extensions)).toEqual('json')
  })

  it('guesses from the MIME type first, then from the file name', () => {
    expect(guessFormatFromRawFile(new File([''], 'data.txt', { type: 'text/csv' }), extensions)).toEqual('csv')
    expect(guessFormatFromRawFile(new File([''], 'data.csv', { type: 'application/octet-stream' }), extensions)).toEqual('csv')
  })

  it('uses the last extension of a composed file name', () => {
    expect(guessFormatFromRawFile(new File([''], 'archive.csv.gz', { type: '' }), extensions)).toEqual('gz')
  })

  it('returns null when nothing matches', () => {
    expect(guessFormatFromRawFile(new File([''], 'mystery', { type: '' }), extensions)).toBeNull()
  })
})
