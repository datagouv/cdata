<template>
  <div
    ref="containerRef"
    class="h-[400px] w-[400px] fr-raw-link"
  />
</template>

<script setup lang="ts">
import type { GeoJsonObject } from 'geojson'

const props = defineProps<{
  geojson: GeoJsonObject
}>()

const container = useTemplateRef('containerRef')

onMounted(async () => {
  await import('leaflet/dist/leaflet.css')
  const L = await import('leaflet')

  if (!container.value) return
  const map = L.map(container.value)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  const geoJSON = L.geoJSON(props.geojson).addTo(map)
  map.fitBounds(geoJSON.getBounds())
})
</script>
