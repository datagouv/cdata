import type { Dataset, DatasetV2, Frequency, License, RegisteredSchema, Resource, CommunityResource } from '@datagouv/components-next'
import type { FetchError } from 'ofetch'
import { v4 as uuidv4 } from 'uuid'

import type { DatasetForm, FileInfo, NewDatasetForApi, ResourceForm, SpatialGranularity, SpatialZone } from '~/types/types'

export function useResourceForm(file: MaybeRef<ResourceForm>) {
  const isRemote = computed(() => toValue(file).filetype === 'remote')
  const { t } = useI18n()

  return useForm(file, {
    title: [required()],
    type: [required()],

    url: [requiredIf(isRemote)],
    format: [requiredIf(isRemote)],
  }, {
    description: [minLength(200, t(`It's advised to have a {property} of at least {min} characters.`, { property: t('description'), min: 200 }))],
  })
}

export const CLOSED_FORMATS = readonly(['pdf', 'doc', 'docx', 'word', 'xls', 'excel', 'xlsx'] as const)

const includeInSubtype = <T, U extends T>(array: ReadonlyArray<U>, value: T): value is U => {
  return array.includes(value as U)
}

export function isClosedFormat(resource: ResourceForm, extensions: Array<string>): boolean {
  const format = guessFormat(resource, extensions)
  if (!format) return false // Unknown format shouldn't raise a closed format error

  return includeInSubtype(CLOSED_FORMATS, format)
}

export function getDatasetAdminUrl(dataset: Dataset | DatasetV2): string {
  return `/beta/admin/datasets/${dataset.id}`
}

export function toForm(dataset: Dataset | DatasetV2, licenses: Array<License>, frequencies: Array<Frequency>, zones: Array<SpatialZone>, granularities: Array<SpatialGranularity>): DatasetForm {
  return {
    owned: dataset.organization ? { organization: dataset.organization, owner: null } : { owner: dataset.owner, organization: null },
    title: dataset.title,
    description: dataset.description,
    acronym: dataset.acronym,
    tags: dataset.tags?.map(text => ({ text })) || [],
    license: licenses.find(l => l.id === dataset.license) || null,
    contact_points: dataset.contact_points ?? [],
    frequency: frequencies.find(f => f.id === dataset.frequency) || null,
    temporal_coverage: dataset.temporal_coverage ? { start: dataset.temporal_coverage.start, end: dataset.temporal_coverage.end } : { start: null, end: null }, // TODO fix this type, the API returns an object not a string
    spatial_zones: dataset.spatial?.zones?.map(id => zones.find(z => z.id === id)).filter(z => z !== undefined) || [],
    spatial_granularity: granularities.find(g => g.id === dataset.spatial?.granularity) || null,
    private: dataset.private,
  }
}

export function toApi(form: DatasetForm, overrides: { private?: boolean, archived?: string | null } = {}): NewDatasetForApi {
  const contactPoints = form.contact_points?.filter(cp => cp !== null && 'id' in cp).map(cp => cp.id) ?? []
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
    contact_points: form.contact_points && contactPoints.length ? contactPoints : undefined,
    frequency: form.frequency?.id || '',
    temporal_coverage: form.temporal_coverage.start
      ? {
          start: new Date(form.temporal_coverage.start).toISOString(),
          end: form.temporal_coverage.end ? new Date(form.temporal_coverage.end).toISOString() : null,
        }
      : undefined,
    spatial: (form.spatial_granularity || form.spatial_zones)
      ? {
          zones: form.spatial_zones.length ? form.spatial_zones.map(z => z.id) : undefined,
          granularity: form.spatial_granularity ? form.spatial_granularity.id : undefined,
        }
      : undefined,
  }
}

export function resourceToForm(resource: Resource, schemas: Array<RegisteredSchema>): ResourceForm {
  const form = {
    title: resource.title,
    type: resource.type,
    description: resource.description || '',
    schema: schemas.find(schema => schema.name === resource.schema?.name) || null,

    resource,
  }

  if (resource.filetype === 'remote') {
    return {
      ...form,
      filetype: 'remote',
      url: resource.url,
      format: resource.format,
      mime: resource.mime ? { text: resource.mime } : null,
    }
  }
  else if (resource.filetype === 'file') {
    return {
      ...form,
      filetype: 'file',
      file: null,
    }
  }
  else {
    throwOnNever(resource.filetype, `Unknown resource.filetype ${resource.filetype}`)
  }
}

export function resourceToApi(form: ResourceForm): Resource {
  let resource = {
    filetype: form.filetype,
    title: form.title,
    type: form.type,
    description: form.description,
    schema: form.schema,
  } as Resource

  if (form.filetype === 'remote') {
    resource = { ...resource, ...{
      url: form.url,
      format: form.format,
      mime: form.mime?.text || '',
    } }
  }
  else if (form.filetype === 'file') {
    // Do nothing
  }
  else {
    throwOnNever(form, 'Unknown file type')
  }

  return resource
}

export async function sendFile(url: string, resourceForm: ResourceForm, fileInfo: FileInfo): Promise<Resource> {
  const { $fileApi, $i18n } = useNuxtApp()
  const config = useRuntimeConfig()

  if (resourceForm.filetype !== 'file') {
    throw new Error('`sendFile` needs to be called only with local files')
  }

  // We force the caller to check the existance of `resourceForm.file` before calling us (and let TypeScript ensure this)
  // but we can still check if the two objects are equals.
  if (resourceForm.file !== fileInfo) {
    throw new Error('`sendFile` was called with a `fileInfo` not belonging to this `resourceForm`')
  }

  // If this file was already sent, do not send again.
  if (fileInfo.state?.status === 'uploaded') {
    return fileInfo.state.resource
  }

  // We do not check currently if the file is already loading if the user
  // called the function multiple times. But it shouldn't happen?
  fileInfo.state = { status: 'loading' }

  // If it's a local file, first we need to send the file data as multipart/form-data
  const uuid = uuidv4()
  const formData = new FormData()
  formData.set('uuid', uuid)
  formData.set('filename', fileInfo.raw.name)
  formData.set('file', fileInfo.raw)

  const chunkSize = config.public.resourceFileUploadChunk
  try {
    if (fileInfo.raw.size && fileInfo.raw.size > chunkSize) {
      const nbChunks = Math.ceil(fileInfo.raw.size / chunkSize)
      let chunkStart = 0
      const promises = []

      for (let i = 0; i < nbChunks; i++) {
        const chunk = fileInfo.raw.slice(chunkStart, chunkStart + chunkSize, fileInfo.raw.type)
        const chunkData = new FormData()
        chunkData.set('uuid', uuid)
        chunkData.set('filename', fileInfo.raw.name)
        chunkData.set('file', chunk)
        chunkData.set('partindex', i.toString())
        chunkData.set('partbyteoffset', chunkStart.toString())
        chunkData.set('totalparts', nbChunks.toString())
        chunkData.set('chunksize', chunk.size.toString())

        promises.push(retry(() => {
          return $fileApi<{
            error: string | null
            message: string
            success:
            boolean
          }>(url, {
            method: 'POST',
            body: chunkData,
          })
        }, 3))
        chunkStart += chunkSize
      }

      await Promise.all(promises)
      formData.delete('file') // Remove the file, it has already be sent in chunks
      formData.set('totalparts', nbChunks.toString())
    }

    const resource = await $fileApi<Resource>(url, {
      method: 'POST',
      body: formData,
    })

    fileInfo.state = { status: 'uploaded', resource }
    return resource
  }
  catch (e) {
    const notificationMessage = $i18n.t('Failed to upload file {title}', { title: resourceForm.title })
    let formError = notificationMessage
    const fetchError = e as unknown as FetchError
    if ('data' in fetchError && 'message' in fetchError.data) {
      formError = fetchError.data.message
    }
    fileInfo.state = { status: 'failed', message: formError }
    throw new Error(notificationMessage)
  }
}

export function getResourcesUrls(dataset: Dataset | DatasetV2 | Omit<Dataset, 'resources' | 'community_resources'>, resource: Resource | CommunityResource | null): { metadataUrl: string, metadataMethod: 'POST' | 'PUT', uploadUrl: string } {
  if (resource) {
    if ('organization' in resource) {
      // Existing community resource
      return {
        metadataUrl: `/api/1/datasets/community_resources/${resource.id}/`,
        metadataMethod: 'PUT',
        uploadUrl: `/api/1/datasets/community_resources/${resource.id}/upload/`,
      }
    }
    else {
      // Existing classic resource
      return {
        metadataUrl: `/api/1/datasets/${dataset.id}/resources/${resource.id}/`,
        metadataMethod: 'PUT',
        uploadUrl: `/api/1/datasets/${dataset.id}/resources/${resource.id}/upload/`,
      }
    }
  }
  else {
    // New resource
    return {
      metadataUrl: `/api/1/datasets/${dataset.id}/resources/`,
      metadataMethod: 'POST',
      uploadUrl: `/api/1/datasets/${dataset.id}/upload/`,
    }
  }
}

export async function saveResourceForm(dataset: Dataset | DatasetV2 | Omit<Dataset, 'resources' | 'community_resources'>, resourceForm: ResourceForm) {
  const { $api } = useNuxtApp()

  const { metadataUrl, metadataMethod, uploadUrl } = getResourcesUrls(dataset, resourceForm.resource)

  // If this is a remote file, it's easy just send all the information to the server.
  if (resourceForm.filetype === 'remote') {
    return await $api<Resource>(metadataUrl, {
      method: metadataMethod,
      body: JSON.stringify(resourceToApi(resourceForm)),
    })
  }

  // There is 4 possibilities:
  // - Create a new resource with a file
  // - Create a new resource without a file          <- Not allowed
  // - Update an existing resource with a file
  // - Update an existing resource without a file
  let resource

  if (resourceForm.file) {
    resource = await sendFile(uploadUrl, resourceForm, resourceForm.file)
  }
  else {
    if (resourceForm.resource) {
      resource = resourceForm.resource
    }
    else {
      throw new Error('Cannot create a new local resource without file.')
    }
  }

  const { metadataUrl: newMetadataUrl, metadataMethod: alwaysPut } = getResourcesUrls(dataset, resource)

  // Then we need to update the resource's metadata
  const updatedResource = await $api<Resource>(newMetadataUrl, {
    method: alwaysPut,
    body: JSON.stringify(resourceToApi(resourceForm)),
  })
  return updatedResource
}

export async function retry<T>(promise: () => Promise<T>, count: number): Promise<T> {
  try {
    return await promise()
  }
  catch (e) {
    if (count > 0) {
      return await retry(promise, count - 1)
    }
    else {
      throw e
    }
  }
}

export function guessFormat(resourceForm: ResourceForm, extensions: Array<string>): string | null {
  if (resourceForm.filetype === 'remote') return resourceForm.format.trim().toLowerCase()

  if (resourceForm.resource && resourceForm.resource.format) {
    return resourceForm.resource.format.trim().toLowerCase()
  }

  if (!resourceForm.file) return null
  return guessFormatFromRawFile(resourceForm.file.raw, extensions)
}

export function guessFormatFromRawFile(file: File, extensions: Array<string>): string | null {
  const formatFromMime = file.type.includes('/') ? file.type.split('/').pop() || '' : file.type
  if (extensions.includes(formatFromMime)) return formatFromMime

  const formatFromName = file.name.includes('.') ? file.name.split('.').pop() || '' : file.name
  if (extensions.includes(formatFromName)) return formatFromName

  return null
}

export function getFilesize(resourceForm: ResourceForm): number | null {
  if (resourceForm.filetype === 'file' && resourceForm.file) {
    return resourceForm.file.raw.size
  }

  if (resourceForm.resource) {
    return resourceForm.resource.filesize
  }

  return null
}
