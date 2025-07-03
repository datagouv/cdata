<template>
  <div class="fr-text--xs">
    <!-- Show truncation warning if needed -->
    <div
      v-if="jsonData && jsonData._truncated"
      class="fr-alert fr-alert--warning fr-mb-2v"
    >
      <p class="fr-alert__title">
        {{ $t('Aperçu tronqué') }}
      </p>
      <p>
        {{ $t('Le fichier JSON est trop volumineux ({size} caractères). Seuls les premiers {max} caractères sont affichés.', {
          size: jsonData._originalSize,
          max: config.maxJsonPreviewSize || 10000,
        }) }}
      </p>
    </div>

    <div v-if="jsonData">
      <JsonViewer
        :value="jsonData._truncated ? jsonData.data : jsonData"
        boxed
        sort
        theme="light"
        :max-depth="3"
        :expand-depth="1"
        :indent-width="2"
      />
    </div>
    <div
      v-else-if="loading"
      class="text-gray-medium"
    >
      {{ $t('Chargement de l\'aperçu JSON...') }}
    </div>
    <div
      v-else-if="error"
      class="text-gray-medium"
    >
      {{ $t('Erreur lors du chargement de l\'aperçu JSON.') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useComponentsConfig } from '../../config'
import type { Resource } from '../../types/resources'

interface JsonData {
  _truncated?: boolean
  _originalSize?: number
  data?: unknown
}

const config = useComponentsConfig()

const JsonViewer = defineAsyncComponent(() => import('vue3-json-viewer').then((module) => {
  import('vue3-json-viewer/dist/vue3-json-viewer.css')
  return { default: module.JsonViewer }
}))

const props = defineProps<{
  resource: Resource
}>()

const jsonData = ref<JsonData | null>(null)
const loading = ref(false)
const error = ref(false)

const fetchJsonData = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await fetch(props.resource.latest)
    // const response = await fetch('/test-data.json') // For testing locally without CORS issues
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Truncate large JSON objects to avoid performance issues
    const jsonString = JSON.stringify(data, null, 2)
    const maxSize = config.maxJsonPreviewSize || 10000

    if (jsonString.length > maxSize) {
      // Keep only the first part and add a truncation indicator
      const truncated = jsonString.substring(0, maxSize)
      try {
        // Try to parse the truncated JSON, if it fails, use the original data
        const parsedData = JSON.parse(truncated + '...')
        jsonData.value = {
          _truncated: true,
          _originalSize: jsonString.length,
          data: parsedData,
        }
      }
      catch (parseError) {
        // If parsing fails, just use the original data without truncation
        console.warn('Failed to parse truncated JSON, using original data:', parseError)
        jsonData.value = data
      }
    }
    else {
      jsonData.value = data
    }
  }
  catch (err) {
    console.error('Error loading JSON:', err)
    error.value = true
    jsonData.value = null
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchJsonData()
})
</script>
