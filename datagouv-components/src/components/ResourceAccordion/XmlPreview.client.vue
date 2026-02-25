<template>
  <div class="fr-text--xs">
    <div v-if="xmlData">
      <XmlViewer :xml="xmlData" />
    </div>
    <div
      v-else-if="loading"
      class="text-gray-medium"
    >
      {{ t("Chargement de l'aperçu XML...") }}
    </div>
    <SimpleBanner
      v-else-if="fileTooLarge"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shrink-0 size-6" />
      <span>{{ fileSizeBytes
        ? t("Fichier XML trop volumineux pour l'aperçu. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
        : t("L'aperçu n'est pas disponible car la taille du fichier est inconnue. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
      }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error === 'cors'"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shrink-0 size-6" />
      <span>{{ t("Ce fichier XML ne peut pas être prévisualisé car il est hébergé sur un site distant qui restreint l'accès (CORS).") }}</span>
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
      <RiErrorWarningLine class="shrink-0 size-6" />
      <span>{{ t("Erreur lors du chargement de l'aperçu XML.") }}</span>
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { RiErrorWarningLine } from '@remixicon/vue'

import { useComponentsConfig } from '../../config'
import SimpleBanner from '../SimpleBanner.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize, getResourceCorsStatus } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'
import '../../types/vue3-xml-viewer.d'

const XmlViewer = defineAsyncComponent(() =>
  import('vue3-xml-viewer').then((module) => {
    return module.default || module.XmlViewer
  }),
)

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()
const { t } = useTranslation()

const xmlData = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const fileTooLarge = ref(false)

const fileSizeBytes = computed(() => getResourceFilesize(props.resource))

const corsStatus = computed(() => getResourceCorsStatus(props.resource))

const isSizeAllowed = computed(() => {
  const size = fileSizeBytes.value
  // Convert maxXmlPreviewCharSize from characters to bytes (rough estimate)
  // Assuming average 1 byte per character for XML
  const maxByteSize = config.maxXmlPreviewCharSize

  // If we don't know the size or the max size, don't risk loading a potentially huge file
  if (!size || !maxByteSize) return false

  return size <= maxByteSize
})

const fetchXmlData = async () => {
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
    // const response = await fetch('/test-data.xml') // For testing locally without CORS issues
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.text()

    // Use the XML data as string - let the XML viewer handle large files
    xmlData.value = data
  }
  catch (err) {
    console.error('Error loading XML:', err)

    if (err instanceof TypeError) {
      error.value = 'network'
    }
    else {
      error.value = 'generic'
    }

    xmlData.value = null
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchXmlData()
})
</script>
