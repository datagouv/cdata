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
      {{ t("Chargement de l'aperçu JSON...") }}
    </div>
    <PreviewUnavailable v-else-if="fileTooLarge">
      {{ fileSizeBytes
        ? t("Le fichier JSON est trop volumineux pour être prévisualisé. Téléchargez-le depuis l'onglet Téléchargements.")
        : t("La taille du fichier est inconnue, l'aperçu n'est pas disponible. Téléchargez-le depuis l'onglet Téléchargements.")
      }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="error === 'cors'">
      {{ t("Ce fichier JSON ne peut pas être prévisualisé car il est hébergé sur un site distant qui restreint l'accès (CORS).") }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="error === 'network'">
      {{ t("Ce fichier est hébergé sur un site externe qui ne permet pas la prévisualisation. Téléchargez-le depuis l'onglet Téléchargements.") }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="error">
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé. Téléchargez-le depuis l'onglet Téléchargements.") }}
    </PreviewUnavailable>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useComponentsConfig } from '../../config'
import PreviewUnavailable from './PreviewUnavailable.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize, getResourceCorsStatus } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'

const JsonViewer = defineAsyncComponent(() =>
  import('vue3-json-viewer').then((module) => {
    // Import CSS when component loads
    import('vue3-json-viewer/dist/vue3-json-viewer.css')
    return module.JsonViewer
  }),
)

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()
const { t } = useTranslation()

const jsonData = ref<unknown>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const fileTooLarge = ref(false)

const fileSizeBytes = computed(() => getResourceFilesize(props.resource))

const corsStatus = computed(() => getResourceCorsStatus(props.resource))

const isSizeAllowed = computed(() => {
  const size = fileSizeBytes.value
  // Convert maxJsonPreviewCharSize from characters to bytes (rough estimate)
  // Assuming average 1 byte per character for JSON
  const maxByteSize = config.maxJsonPreviewCharSize

  // If we don't know the size or the max size, don't risk loading a potentially huge file
  if (!size || !maxByteSize) return false

  return size <= maxByteSize
})

const fetchJsonData = async () => {
  error.value = null
  fileTooLarge.value = false

  // Check if file is too large or size is unknown
  if (!isSizeAllowed.value) {
    fileTooLarge.value = true
    return
  }

  // Check if CORS is allowed
  if (corsStatus.value === 'blocked') {
    error.value = 'cors'
    return
  }

  loading.value = true
  try {
    const response = await fetch(props.resource.url)
    // const response = await fetch('/test-data.json') // For testing locally without CORS issues
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Use the original data directly - let the JSON viewer handle large files
    jsonData.value = data
  }
  catch (err) {
    console.error('Error loading JSON:', err)

    if (err instanceof TypeError) {
      error.value = 'network'
    }
    else {
      error.value = 'generic'
    }

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
