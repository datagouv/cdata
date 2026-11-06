<template>
  <PreviewError
    v-if="error"
    :resource
    :error-type="error.type"
    :detail="error.detail"
    :show-producer-cta="canEdit"
  />
  <!-- Also shown during the server-side render: the schema is only fetched by the browser. -->
  <PreviewLoader v-else-if="!schema" />
  <DataStructureGrid
    v-else
    :columns
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '../../types/resources'
import type { WfsGeometryType, WfsPreviewLayer } from '../../functions/wfs'
import { useTranslation } from '../../composables/useTranslation'
import { useWfsSchema } from '../../composables/useWfs'
import DataStructureGrid from './DataStructureGrid.vue'
import PreviewError from './PreviewError.vue'
import PreviewLoader from './PreviewLoader.vue'

const props = defineProps<{
  resource: Resource
  // From `useResourceCapabilities`.
  layer: WfsPreviewLayer
  canEdit?: boolean
}>()

const { t } = useTranslation()

// Shared with the data tab when the parent called `provideWfsSchema`.
const { schema, error } = useWfsSchema(() => props.resource, () => props.layer)

const geometryLabels = computed<Record<WfsGeometryType, string>>(() => ({
  Point: t('point'),
  MultiPoint: t('multipoint'),
  LineString: t('ligne'),
  MultiLineString: t('multiligne'),
  Polygon: t('polygone'),
  MultiPolygon: t('multipolygone'),
  Geometry: '',
}))

// The geometry comes first, like the column of a GIS attribute table.
const columns = computed(() => {
  if (!schema.value) return []
  const { geometry, attributes } = schema.value
  const shape = geometry ? geometryLabels.value[geometry.type] : ''
  return [
    ...geometry ? [{ name: geometry.name, format: shape ? t('géométrie ({type})', { type: shape }) : t('géométrie') }] : [],
    ...attributes.map(attribute => ({ name: attribute.name, format: attribute.type })),
  ]
})
</script>
