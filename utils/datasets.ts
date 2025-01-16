import type { Dataset, DatasetV2, Frequency, License, RegisteredSchema, Resource } from '@datagouv/components'
import type { FetchError } from 'ofetch'
import type { Component } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import Archive from '~/components/Icons/Archive.vue'
import Code from '~/components/Icons/Code.vue'
import Documentation from '~/components/Icons/Documentation.vue'
import Image from '~/components/Icons/Image.vue'
import Link from '~/components/Icons/Link.vue'
import Table from '~/components/Icons/Table.vue'
import type { DatasetForm, NewDatasetFile, NewDatasetForApi, SpatialGranularity, SpatialZone } from '~/types/types'

export function getResourceFormatIcon(format: string): Component | null {
  switch (format?.trim()?.toLowerCase()) {
    case 'txt':
    case 'pdf':
    case 'rtf':
    case 'odt':
    case 'doc':
    case 'docx':
    case 'epub':
      return Documentation
    case 'json':
    case 'sql':
    case 'xml':
    case 'xsd':
    case 'shp':
    case 'kml':
    case 'kmz':
    case 'gpx':
    case 'shx':
    case 'ovr':
    case 'geojson':
    case 'gpkg':
    case 'grib2':
    case 'dbf':
    case 'prj':
    case 'sqlite':
    case 'db':
    case 'sbn':
    case 'sbx':
    case 'cpg':
    case 'lyr':
    case 'owl':
    case 'dxf':
    case 'ics':
    case 'rdf':
    case 'ttl':
    case 'n3':
      return Code
    case 'tar':
    case 'gz':
    case 'tgz':
    case 'rar':
    case 'zip':
    case '7z':
    case 'xz':
    case 'bz2':
      return Archive
    case 'url':
      return Link
    case 'csv':
    case 'ods':
    case 'xls':
    case 'xlsx':
    case 'parquet':
      return Table
    case 'png':
    case 'jpg':
    case 'jpeg':
      return Image
    default:
      return null
  }
}

export function useNewDatasetFileForm(file: MaybeRef<NewDatasetFile>) {
  const isRemote = computed(() => toValue(file).filetype === 'remote')
  const { t } = useI18n()

  return useForm(file, {
    url: [requiredIf(isRemote)],
    title: [required()],
    type: [required()],
    format: [required()],
  }, {
    description: [minLength(200, t(`It's advised to have a {property} of at least {min} characters.`, { property: t('description'), min: 200 }))],
  })
}

export const CLOSED_FORMATS = readonly(['pdf', 'doc', 'docx', 'word', 'xls', 'excel', 'xlsx'] as const)

const includeInSubtype = <T, U extends T>(array: ReadonlyArray<U>, value: T): value is U => {
  return array.includes(value as U)
}

export const isClosedFormat = (format: string) => includeInSubtype(CLOSED_FORMATS, format)

export function getDatasetAdminUrl(dataset: Dataset | DatasetV2): string {
  return `/beta/admin/datasets/${dataset.id}`
}

export function toForm(dataset: Dataset, licenses: Array<License>, frequencies: Array<Frequency>, zones: Array<SpatialZone>, granularities: Array<SpatialGranularity>): DatasetForm {
  return {
    owned: dataset.organization ? { organization: dataset.organization, owner: null } : { owner: dataset.owner, organization: null },
    title: dataset.title,
    description: dataset.description,
    acronym: dataset.acronym,
    tags: dataset.tags?.map(text => ({ text })) || [],
    license: licenses.find(l => l.id === dataset.license) || null,
    contact_point: dataset.contact_point,
    frequency: frequencies.find(f => f.id === dataset.frequency) || null,
    temporal_coverage: dataset.temporal_coverage ? { start: dataset.temporal_coverage.start, end: dataset.temporal_coverage.end } : { start: null, end: null }, // TODO fix this type, the API returns an object not a string
    spatial_zones: dataset.spatial?.zones?.map(id => zones.find(z => z.id === id)).filter(z => z !== undefined) || [],
    spatial_granularity: granularities.find(g => g.id === dataset.spatial?.granularity) || null,
    private: dataset.private,
  }
}

export function toApi(form: DatasetForm, overrides: { private?: boolean, archived?: string | null } = {}): NewDatasetForApi {
  return {
    organization: form.owned?.organization?.id,
    owner: form.owned?.owner?.id,
    title: form.title,
    private: overrides.private,
    archived: overrides.archived,
    description: form.description,
    acronym: form.acronym,
    tags: form.tags.map(t => t.text),
    license: form.license?.id || '',
    contact_point: form.contact_point && 'id' in form.contact_point ? form.contact_point.id : undefined,
    frequency: form.frequency?.id || '',
    temporal_coverage: (form.temporal_coverage.start && form.temporal_coverage.end) ? form.temporal_coverage as { start: string, end: string } : undefined,
    spatial: (form.spatial_granularity || form.spatial_zones)
      ? {
          zones: form.spatial_zones.length ? form.spatial_zones.map(z => z.id) : undefined,
          granularity: form.spatial_granularity ? form.spatial_granularity.id : undefined,
        }
      : undefined,
  }
}

export function resourceToForm(resource: Resource, schemas: Array<RegisteredSchema>): NewDatasetFile {
  return {
    description: resource.description || '',
    format: resource.format,
    filesize: resource.filesize,
    filetype: resource.filetype,
    mime: { text: resource.mime },
    title: resource.title,
    type: resource.type,
    state: 'none',
    schema: schemas.find(schema => schema.name === resource.schema?.name),
  }
}
export function resourceToApi(form: NewDatasetFile): Resource {
  return {
    ...form,
    mime: form.mime?.text || null,
  }
}

export async function uploadFile(newDataset: Dataset | DatasetV2, file: NewDatasetFile, retry: number) {
  const { $api, $fileApi, $i18n } = useNuxtApp()
  const config = useRuntimeConfig()

  try {
    // If this is a remote file, it's easy just send all the information to the server.
    if (file.filetype === 'remote') {
      return await $api<Resource>(`/api/1/datasets/${newDataset.id}/resources/`, {
        method: 'POST',
        body: JSON.stringify(resourceToApi(file)),
      })
    }

    // If it's a local file, first we need to send the file data as multipart/form-data
    const uuid = uuidv4()
    const formData = new FormData()
    formData.set('uuid', uuid)
    formData.set('filename', file.file.name)
    formData.set('file', file.file)

    const chunkSize = config.public.resourceFileUploadChunk
    if (file.filesize && file.filesize > chunkSize) {
      const nbChunks = Math.ceil(file.filesize / chunkSize)
      let chunkStart = 0
      const promises = []

      for (let i = 0; i < nbChunks; i++) {
        const chunk = file.file.slice(chunkStart, chunkStart + chunkSize, file.file.type)
        const chunkData = new FormData()
        chunkData.set('uuid', uuid)
        chunkData.set('filename', file.file.name)
        chunkData.set('file', chunk)
        chunkData.set('partindex', i.toString())
        chunkData.set('partbyteoffset', chunkStart.toString())
        chunkData.set('totalparts', nbChunks.toString())
        chunkData.set('chunksize', chunk.size.toString())

        const promise = $fileApi<{
          error: string | null
          message: string
          success:
          boolean
        }>(`/api/1/datasets/${newDataset.id}/upload/`, {
          method: 'POST',
          body: chunkData,
        })
        promises.push(promise)
        chunkStart += chunkSize
      }

      await Promise.all(promises)
      formData.delete('file') // Remove the file, it has already be sent in chunks
      formData.set('totalparts', nbChunks.toString())
    }

    const newResource = await $fileApi<Resource>(`/api/1/datasets/${newDataset.id}/upload/`, {
      method: 'POST',
      body: formData,
    })

    // Then we need to update the new resource with all the metadata
    const updatedNewResource = await $api<Resource>(`/api/1/datasets/${newDataset.id}/resources/${newResource.id}/`, {
      method: 'PUT',
      body: JSON.stringify(resourceToApi(file)),
    })

    file.state = 'loaded'
    return updatedNewResource
  }
  catch (e) {
    if (retry === 0) {
      const fetchError = e as unknown as FetchError
      if ('data' in fetchError && 'message' in fetchError.data) {
        file.errorMessage = fetchError.data.message
      }
      file.state = 'failed'
      throw new Error($i18n.t('Failed to upload file {title}', { title: file.title }))
    }
    await uploadFile(newDataset, file, retry - 1)
  }
}
