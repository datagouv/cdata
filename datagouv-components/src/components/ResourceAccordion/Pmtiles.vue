<template>
  <div>
    <div
      v-if="hasError"
      class="bg-warning-lightest text-warning-dark p-3 mt-8 mx-8 mb-3"
    >
      <p class="fr-grid-row fr-m-0">
        <span
          class="fr-icon-warning-line"
          aria-hidden="true"
        />
        {{ t("The map preview of this file failed to load.") }}
      </p>
    </div>
    <template v-else>
      <div class="bg-blue-100 text-datagouv fr-hidden fr-unhidden-md p-4">
        <div class="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div
            class="fr-col-auto"
            v-html="franceSvg"
          />
          <div class="fr-col">
            <p class="fr-text--bold fr-m-0">
              {{ t("Explore data in detail") }}
            </p>
            <p class="fr-text--sm fr-m-0 f-italic">
              {{ t("Use PMTiles viewer to get an overview of geojson data.") }}
            </p>
          </div>
          <p class="fr-col-auto fr-my-0">
            <BrandedButton
              :href="pmtilesViewerUrl"
              :icon="RiExternalLinkFill"
              icon-right
            >
              {{ t("Explore map") }}
            </BrandedButton>
          </p>
        </div>
      </div>
      <div style="height: 600px;" ref="containerRef" />
      <div class="fr-px-5v fr-pt-5v">
        {{ t("Map preview updated on {date}", { date: lastUpdate }) }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiExternalLinkFill } from '@remixicon/vue'
import { Protocol, PMTiles } from 'pmtiles'
import maplibregl from 'maplibre-gl'
import DOMPurify from 'dompurify'
import { formatDate } from '../../functions/dates'
import type { Resource } from '../../types/resources'
import BrandedButton from '../BrandedButton.vue'
import styleVector from '../../../assets/json/vector.json'
import franceSvg from './france.svg?raw'

const props = defineProps<{ resource: Resource }>()

const { t } = useI18n()

const hasError = ref(false)
const pmtilesUrl = props.resource.extras['analysis:parsing:pmtiles_url']
const pmtilesViewerUrl = computed(() => `https://pmtiles.io/#url=${encodeURIComponent(pmtilesUrl)}`)

const lastUpdate = formatDate(props.resource.extras['analysis:parsing:finished_at'])

const container = useTemplateRef('containerRef')

async function displayMap() {
  await import('maplibre-gl/dist/maplibre-gl.css')

  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  const p = new PMTiles(pmtilesUrl)
  protocol.add(p)

  p.getHeader().then((h) => {
    const map = new maplibregl.Map({
      container: container.value, // container id
      style: styleVector,
      zoom: h.maxZoom - 2,
      center: [h.centerLon, h.centerLat],
    })
    map.addControl(new maplibregl.NavigationControl())

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    })

    function showMapPopup(e) {
      if (!e.features || !e.features[0])
        popup.remove()
      else {
        const coordinates = e.lngLat
        const description = Object.keys(e.features[0].properties).map((element) => {
          return `<b>${DOMPurify.sanitize(element)} :</b> ${DOMPurify.sanitize(e.features[0].properties[element])}`
        }).join('<br>')
        popup.setLngLat(coordinates).setHTML(description).addTo(map)
      }
    }

    map.on('load', () => {
      p.getMetadata().then((metadata) => {
        map.addSource('pmtiles_source', {
          type: 'vector',
          url: `pmtiles://${pmtilesUrl}`,
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        })

        metadata.tilestats.layers.forEach((layer) => {
          const typeLayer = computed(() => {
            switch (layer.geometry) {
              case 'Polygon':
                return 'fill'
              case 'Point':
                return `circle`
              case 'LineString':
                return `line`
              default:
                throwOnNever(layer.geometry, 'Unsupported geometry')
                return ''
            }
          })
          map.addLayer({
            'id': layer.layer,
            'source': 'pmtiles_source',
            'source-layer': layer.layer,
            'type': typeLayer.value,
            'paint': {
              [`${typeLayer.value}-color`]: 'steelblue',
              [`${typeLayer.value}-opacity`]: { base: 1, stops: [[0, 0.9], [10, 0.6]] },
            },
          })
          map.on('mousemove', layer.layer, showMapPopup)
          map.on('touchmove', layer.layer, showMapPopup)
          map.on('click', layer.layer, showMapPopup)
          map.on('mouseleave', layer.layer, showMapPopup)
        })
      }).catch (() => hasError.value = true)
    })
  }).catch (() => hasError.value = true)
}

onMounted(() => {
  displayMap()
})
</script>
