<template>
  <div class="fr-text--xs">
    <div v-if="jsonData">
      <JsonViewer
        :value="jsonData"
        boxed
        sort
        theme="light"
        :max-depth="3"
        :expand-depth="2"
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
import type { Resource } from '../../types/resources'

const JsonViewer = defineAsyncComponent(() =>
  import('vue3-json-viewer').then((module) => {
    // Import CSS when component loads
    import('vue3-json-viewer/dist/vue3-json-viewer.css')
    return module.JsonViewer
  })
)

const props = defineProps<{
  resource: Resource
}>()

const jsonData = ref<unknown>(null)
const loading = ref(false)
const error = ref(false)

const fetchJsonData = async () => {
  loading.value = true
  error.value = false

  try {
    // const response = await fetch(props.resource.latest)
    const response = await fetch('/test-data.json') // For testing locally without CORS issues
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Use the original data directly - let the JSON viewer handle large files
    jsonData.value = data
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
