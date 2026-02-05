<template>
  <SimpleBanner
    v-if="hasError"
    type="warning"
    class="flex items-center space-x-2"
  >
    <RiErrorWarningLine class="shink-0 size-6" />
    <span>{{ t("L'aperçu cartographique de ce fichier n'a pas pu être chargé.") }}</span>
  </SimpleBanner>
  <div
    v-else
    id="map"
    ref="mapRef"
  />
</template>

<script setup lang = "ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { RiErrorWarningLine } from '@remixicon/vue'

import SimpleBanner from '../SimpleBanner.vue'
import type { Resource } from '../../types/resources'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{ resource: Resource }>()

const { t } = useTranslation()

let map = null
const mapRef = useTemplateRef('mapRef')
const hasError = ref(false)

async function displayMap() {
  // Dynamic imports for client-only libraries
  const [
    { default: View },
    { default: Map },
    { default: ScaleLine },
    { default: TileLayer },
    { default: OSM },
    geopf,
  ] = await Promise.all([
    import('ol/View'),
    import('ol/Map'),
    import('ol/control/ScaleLine'),
    import('ol/layer/Tile'),
    import('ol/source/OSM'),
    // @ts-expect-error no types provided
    import('geopf-extensions-openlayers'),
  ])

  const { CRS, GeoportalAttribution, GeoportalFullScreen, GeoportalZoom, LayerImport, LayerSwitcher } = geopf

  await import('ol/ol.css')
  await import('@gouvfr/dsfr/dist/dsfr.css')
  await import('@gouvfr/dsfr/dist/utility/icons/icons.css')
  await import('geopf-extensions-openlayers/css/Dsfr.css')

  CRS.load()
  map = new Map({
    target: mapRef.value!,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: [288074.8449901076, 6247982.515792289],
      zoom: 8,
      constrainResolution: true,
    }),
  })

  const scaleControl = new ScaleLine({
    units: 'metric',
    bar: false,
  })
  map.addControl(scaleControl)

  const fullscreen = new GeoportalFullScreen({
    position: 'top-right',
  })
  map.addControl(fullscreen)

  const zoom = new GeoportalZoom({
    position: 'bottom-left',
  })
  map.addControl(zoom)

  const layerSwitcher = new LayerSwitcher({
    options: {
      position: 'top-right',
    },
  })
  map.addControl(layerSwitcher)

  const attributions = new GeoportalAttribution({
    position: 'bottom-right',
  })
  map.addControl(attributions)

  const layerImport = new LayerImport({
    position: 'bottom-left',
    listable: true,
    layerTypes: ['WMS'],
  })
  layerImport._serviceUrlImportInput.value = props.resource.url
  layerImport._formContainer.dispatchEvent(new CustomEvent('submit', { cancelable: true }))

  map.addControl(layerImport)

  // Wait for GetCapabilities to be called before trying to show layer
  // TODO: use signal handling to know whether GetCapabilities failed or not
  const waitTimeout = 500
  let retry = 20
  function showLayer() {
    if (!layerImport._getCapResponseWMSLayers) {
      retry--
      if (retry > 0)
        setTimeout(showLayer, waitTimeout)
      else
        hasError.value = true
    }
    else {
      // @ts-expect-error no typing from library
      const layerInfo = layerImport._getCapResponseWMSLayers.filter(layer => layer.Name == props.resource.title)[0]
      layerImport._addGetCapWMSLayer(layerInfo)
    }
  }
  setTimeout(showLayer, waitTimeout)
}

onMounted(() => {
  displayMap()
})
</script>

<style>
  #map {
    width: 100%;
    height: 500px;
  }
</style>
