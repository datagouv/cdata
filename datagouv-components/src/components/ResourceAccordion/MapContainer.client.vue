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
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import View from 'ol/View'
import Map from 'ol/Map'
import ScaleLine from 'ol/control/ScaleLine'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'

import {
  CRS,
  GeoportalAttribution,
  GeoportalFullScreen,
  GeoportalZoom,
  LayerImport,
  LayerSwitcher,
  SearchEngine,
  ControlList,
} from 'geopf-extensions-openlayers'
import Gp from 'geoportal-access-lib'

import SimpleBanner from '../SimpleBanner.vue'
import type { Resource } from '../../types/resources'

const props = defineProps<{ resource: Resource }>()

const { t } = useI18n()

let map = null
const mapRef = ref(0)
const hasError = ref(false)

async function displayMap() {
  await import('ol/ol.css')
  await import('@gouvfr/dsfr/dist/dsfr.css')
  await import('@gouvfr/dsfr/dist/utility/icons/icons.css')
  await import('geopf-extensions-openlayers/css/Dsfr.css')

  const cfg = new Gp.Services.Config({
    customConfigFile: 'https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json',
    onSuccess: () => {
      CRS.load()
      map = new Map({
        target: mapRef.value,
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

      const layerImport = new LayerImport({
        position: 'bottom-left',
        listable: true,
        layerTypes: ['WMS'],
      })
      layerImport._serviceUrlImportInput.value = props.resource.url
      layerImport._formContainer.dispatchEvent(new CustomEvent('submit', { cancelable: true }))

      // Wait for GetCapabilities to be called before trying to show layer
      let count = 10
      function showLayer() {
        if (!layerImport._getCapResponseWMSLayers) {
          count--
          if (count > 0)
            setTimeout(showLayer, 500)
          else
            hasError.value = true
        }
        else {
          const layerInfo = layerImport._getCapResponseWMSLayers.filter(layer => layer.Name == props.resource.title)[0]
          layerImport._addGetCapWMSLayer(layerInfo)
        }
      }
      setTimeout(showLayer, 500)

      map.addControl(layerImport)

      const search = new SearchEngine({
        displayButtonAdvancedSearch: true,
        displayButtonGeolocate: false,
        displayButtonCoordinateSearch: true,
        displayButtonClose: false,
        collapsible: false,
        resources: {
          search: true,
        },
        searchOptions: {
          addToMap: true,
          filterServices: 'WMTS,WMS,TMS,WFS',
          filterLayersPriority: 'PLAN.IGN,GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1,GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2,CADASTRALPARCELS.PARCELLAIRE_EXPRESS,ORTHOIMAGERY.ORTHOPHOTOS',
          filterWMTSPriority: true,
          serviceOptions: {
            maximumResponses: 20,
          },
        },
        markerUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAzNiIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4Ij48cGF0aCBmaWxsPSIjMDAwMDkxIiBkPSJNMTguMzY0IDMuNjM2YTkgOSAwIDAgMSAwIDEyLjcyOEwxMiAyMi43MjhsLTYuMzY0LTYuMzY0QTkgOSAwIDAgMSAxOC4zNjQgMy42MzZaTTEyIDhhMiAyIDAgMSAwIDAgNCAyIDIgMCAwIDAgMC00WiIvPjwvc3ZnPg==',
      })
      map.addControl(search)

      const attributions = new GeoportalAttribution({
        position: 'bottom-right',
      })
      map.addControl(attributions)

      const controlList = new ControlList({
        draggable: false,
        position: 'bottom-right',
      })
      map.addControl(controlList)
    },
    onFailure: (e) => {
      console.error(e)
      hasError.value = true
    },
  })
  cfg.call()
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
