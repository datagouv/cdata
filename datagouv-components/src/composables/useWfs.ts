import { computed, getCurrentInstance, inject, onMounted, onUnmounted, provide, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { useComponentsConfig } from '../config'
import { getResourceCorsStatus } from '../functions/resources'
import type { WfsFeaturePage, WfsPreviewLayer, WfsSchema } from '../functions/wfs'
import { diagnoseWfsError, isAbortError, loadWfsFeatures, loadWfsSchema, type WfsLoadError } from '../functions/wfsFetch'
import type { PreviewErrorType } from '../functions/previewErrors'
import type { Resource } from '../types/resources'

// The WFS layer of a resource, read by the data tab (rows) and the structure
// tab (schema). Both need the schema, fetched once and shared through
// `provideWfsSchema`, like the tabular profile.
//
// The layer comes from `useResourceCapabilities` (`wfsPreviewLayer`), which
// already decided the resource has one.
//
// Everything runs in the browser only, on mount: the server-side render would
// reach servers the browser cannot (CORS), and wait on slow third parties.

export type WfsStatus = 'idle' | 'pending' | 'success' | 'error'

type SchemaLoader = (layer: WfsPreviewLayer) => Promise<WfsSchema>

const WFS_SCHEMA_KEY = Symbol('wfs-schema')

const layerKey = (layer: WfsPreviewLayer) => `${layer.url}|${layer.typeName}`

function createSchemaLoader(): SchemaLoader {
  let cached: { key: string, promise: Promise<WfsSchema> } | null = null
  return (layer) => {
    const key = layerKey(layer)
    // Not aborted with the component that asked first: the other tab may want it.
    if (cached?.key !== key) {
      const entry = { key, promise: loadWfsSchema(layer) }
      cached = entry
      // A failure is not kept: the next tab to mount tries again (a timeout, a blip…).
      entry.promise.catch(() => {
        if (cached === entry) cached = null
      })
    }
    return cached.promise
  }
}

/**
 * Parent: share one schema request between the tabs showing the same layer.
 */
export function provideWfsSchema() {
  provide<SchemaLoader>(WFS_SCHEMA_KEY, createSchemaLoader())
}

// Known before any request: the robot's checks on the resource URL, which is
// the WFS server itself.
export function getWfsBlocker(resource: Resource, trustedDomains: string[]): PreviewErrorType | null {
  if (resource.extras['check:available'] === false) return 'unavailable'
  if (getResourceCorsStatus(resource, trustedDomains) === 'blocked') return 'cors'
  return null
}

function createState<T>() {
  return {
    data: ref(null) as Ref<T | null>,
    status: ref<WfsStatus>('idle'),
    error: ref<WfsLoadError | null>(null),
  }
}

export function useWfsSchema(resource: MaybeRefOrGetter<Resource>, layer: MaybeRefOrGetter<WfsPreviewLayer | null>) {
  // Read here, during setup: `load` also runs from a watcher, where `inject()` is unavailable.
  const trustedDomains = useComponentsConfig().trustedDomains ?? []
  const loader = inject<SchemaLoader | null>(WFS_SCHEMA_KEY, null) ?? createSchemaLoader()
  const { data: schema, status, error } = createState<WfsSchema>()
  let run = 0

  async function load() {
    const current = ++run
    const l = toValue(layer)
    schema.value = null
    error.value = null
    if (!l) {
      status.value = 'idle'
      return
    }
    const blocker = getWfsBlocker(toValue(resource), trustedDomains)
    if (blocker) {
      error.value = { type: blocker }
      status.value = 'error'
      return
    }
    status.value = 'pending'
    try {
      const result = await loader(l)
      if (current !== run) return
      schema.value = result
      status.value = 'success'
    }
    catch (e) {
      if (current !== run) return
      error.value = diagnoseWfsError(e)
      status.value = 'error'
    }
  }

  // Outside a component (tests), the caller runs `load` itself.
  if (getCurrentInstance()) {
    onMounted(load)
    watch(() => {
      const l = toValue(layer)
      return l && layerKey(l)
    }, load)
  }
  return { schema, status, error, load }
}

export function useWfsFeatures(
  layer: MaybeRefOrGetter<WfsPreviewLayer | null>,
  schemaState: Pick<ReturnType<typeof useWfsSchema>, 'schema' | 'status' | 'error'>,
) {
  const { data: page, status, error } = createState<WfsFeaturePage>()
  let controller: AbortController | null = null

  async function load() {
    controller?.abort()
    controller = null
    page.value = null
    error.value = null
    const l = toValue(layer)
    const schema = schemaState.schema.value
    // Without a schema there is no attribute list to ask for, and the full
    // features could weigh tens of MB: mirror the schema's state instead.
    if (!l || !schema) {
      status.value = schemaState.status.value
      error.value = schemaState.error.value
      return
    }
    const current = controller = new AbortController()
    status.value = 'pending'
    try {
      const result = await loadWfsFeatures(l, schema, { signal: current.signal })
      // A newer load started meanwhile: its answer is the one to show.
      if (current !== controller) return
      page.value = result
      status.value = 'success'
    }
    catch (e) {
      if (isAbortError(e) || current.signal.aborted || current !== controller) return
      error.value = diagnoseWfsError(e)
      status.value = 'error'
    }
  }

  if (getCurrentInstance()) {
    // The schema is loaded on mount too: follow it rather than the layer.
    watch(() => [schemaState.schema.value, schemaState.status.value], load, { immediate: true })
    onUnmounted(() => controller?.abort())
  }

  const rows = computed(() => page.value?.rows ?? [])
  const total = computed(() => page.value?.total ?? null)
  return { rows, total, status, error, load }
}
