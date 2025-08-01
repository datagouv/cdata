<template>
  <div class="fr-text--xs">
    <div v-if="xmlData">
      <XmlViewer :xml="xmlData" />
    </div>
    <div
      v-else-if="loading"
      class="text-gray-medium"
    >
      {{ $t("Chargement de l'aperçu XML...") }}
    </div>
    <SimpleBanner
      v-else-if="fileTooLarge"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ fileSizeBytes
        ? $t("Fichier XML trop volumineux pour l'aperçu. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
        : $t("L'aperçu n'est pas disponible car la taille du fichier est inconnue. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
      }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error === 'network'"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ $t("Ce fichier XML ne peut pas être prévisualisé, peut-être parce qu'il est hébergé sur un autre site qui ne l'autorise pas. Pour le consulter, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.") }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ $t("Erreur lors du chargement de l'aperçu XML.") }}</span>
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { RiErrorWarningLine } from '@remixicon/vue'

import { useComponentsConfig } from '../../config'
import SimpleBanner from '../SimpleBanner.vue'
import type { Resource } from '../../types/resources'

const XmlViewer = defineAsyncComponent(() =>
  import('vue3-xml-viewer').then((module) => {
    return module.default || module.XmlViewer
  }),
)

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()

const xmlData = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const fileTooLarge = ref(false)

const fileSizeBytes = computed(() => {
  // Check if resource has filesize
  if (props.resource.filesize) {
    return props.resource.filesize
  }

  // Check if resource has content-length in extras (from API metadata)
  const contentLength = props.resource.extras?.['analysis:content-length']
  if (contentLength && typeof contentLength === 'number') {
    return contentLength
  }

  return null
})

const shouldLoadXml = computed(() => {
  const size = fileSizeBytes.value
  if (!size) {
    // If we don't know the size, don't risk loading a potentially huge file
    return false
  }

  // Check if maxXmlPreviewSize is configured
  if (!config.maxXmlPreviewSize) {
    // If no limit is set, don't load unknown files
    return false
  }

  // Convert maxXmlPreviewSize from characters to bytes (rough estimate)
  // Assuming average 1 byte per character for XML
  const maxSizeBytes = config.maxXmlPreviewSize

  return size <= maxSizeBytes
})

const fetchXmlData = async () => {
  // Check if file is too large or size is unknown before making the request
  if (!shouldLoadXml.value) {
    fileTooLarge.value = true
    return
  }

  loading.value = true
  error.value = null

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
