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
    <SimpleBanner
      v-else-if="fileTooLarge"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ fileSizeBytes
        ? t("Fichier JSON trop volumineux pour l'aperçu. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
        : t("L'aperçu n'est pas disponible car la taille du fichier est inconnue. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
      }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error === 'cors'"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shrink-0 size-6" />
      <span>{{ t("Ce fichier JSON ne peut pas être prévisualisé car il est hébergé sur un site distant qui restreint l'accès (CORS).") }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error === 'network'"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shrink-0 size-6" />
      <span>{{ t("Impossible de charger l'aperçu. Vérifiez votre connexion ou l'accessibilité du fichier.") }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ t("Erreur lors du chargement de l'aperçu JSON.") }}</span>
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { RiErrorWarningLine } from '@remixicon/vue'

import { useComponentsConfig } from '../../config'
import SimpleBanner from '../SimpleBanner.vue'
import type { Resource } from '../../types/resources'
import { isResourceCorsEnabled, getResourceFilesize } from '../../functions/datasets'
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

const isCorsAllowed = computed(() => isResourceCorsEnabled(props.resource))

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

  // If CORS is blocked, don't even try
  if (!isCorsAllowed.value) {
    error.value = 'cors'
    return
  }

  // Check if file is too large or size is unknown
  if (!isSizeAllowed.value) {
    fileTooLarge.value = true
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
