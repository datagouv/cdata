<template>
  <PreviewUnavailable v-if="hasError">
    {{ t("L'aperçu cartographique de ce fichier n'a pas pu être chargé.") }}
  </PreviewUnavailable>
  <div
    v-else
    ref="mapRef"
    class="size-full"
  />
</template>

<script setup lang = "ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import PreviewUnavailable from './PreviewUnavailable.vue'
import type { Resource } from '../../types/resources'
import { useTranslation } from '../../composables/useTranslation'

type WmsCapabilitiesLayer = { Name: string }

type LayerImportInternals = {
  _serviceUrlImportInput: HTMLInputElement
  _formContainer: HTMLFormElement
  _getCapResponseWMSLayers: Array<WmsCapabilitiesLayer> | null
  _addGetCapWMSLayer: (layerInfo: WmsCapabilitiesLayer | undefined) => void
}

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
    collapsed: false,
  })
  map.addControl(attributions)

  const layerImport = new LayerImport({
    // @ts-expect-error `position` is handled by the base control but missing from the published types
    position: 'bottom-left',
    listable: true,
    layerTypes: ['WMS'],
  })
  // LayerImport has no public API to load a service URL: we fill and submit its form,
  // then add the resource's layer once the GetCapabilities response is parsed.
  const layerImportInternals = layerImport as unknown as LayerImportInternals
  layerImportInternals._serviceUrlImportInput.value = props.resource.url
  layerImportInternals._formContainer.dispatchEvent(new CustomEvent('submit', { cancelable: true }))

  map.addControl(layerImport)

  // Wait for GetCapabilities to be called before trying to show layer
  // TODO: use signal handling to know whether GetCapabilities failed or not
  const waitTimeout = 500
  let retry = 20
  function showLayer() {
    if (!layerImportInternals._getCapResponseWMSLayers) {
      retry--
      if (retry > 0)
        setTimeout(showLayer, waitTimeout)
      else
        hasError.value = true
    }
    else {
      const layerInfo = layerImportInternals._getCapResponseWMSLayers.filter(layer => layer.Name == props.resource.title)[0]
      layerImportInternals._addGetCapWMSLayer(layerInfo)
    }
  }
  setTimeout(showLayer, waitTimeout)
}

onMounted(() => {
  displayMap()
})
</script>
