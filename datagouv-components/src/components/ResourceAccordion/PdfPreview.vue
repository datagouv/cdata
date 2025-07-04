<template>
  <div class="fr-text--xs">
    <div v-if="pdfData">
      <PDF
        :src="resource.url"
        :show-progress="true"
        progress-color="#0063cb"
        :show-page-tooltip="true"
        :show-back-to-top-btn="true"
        :scroll-threshold="300"
        pdf-width="100%"
        :row-gap="12"
        :use-system-fonts="true"
        :disable-range="false"
        :disable-stream="false"
        :disable-auto-fetch="false"
        class="w-full"
        @on-progress="handleProgress"
        @on-complete="handleComplete"
        @on-page-change="handlePageChange"
        @on-pdf-init="handlePdfInit"
        @on-error="handleError"
      />
    </div>
    <div
      v-else-if="loading"
      class="text-gray-medium"
    >
      {{ $t("Chargement de l'aperçu PDF...") }}
    </div>
    <SimpleBanner
      v-else-if="fileTooLarge"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ fileSizeBytes
        ? $t('Fichier PDF trop volumineux pour l\'aperçu. Pour consulter le fichier complet, téléchargez-le depuis l\'onglet Téléchargements.')
        : $t('L\'aperçu n\'est pas disponible car la taille du fichier est inconnue. Pour consulter le fichier complet, téléchargez-le depuis l\'onglet Téléchargements.')
      }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="shink-0 size-6" />
      <span>{{ $t('Erreur lors du chargement de l\'aperçu PDF.') }}</span>
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { RiErrorWarningLine } from '@remixicon/vue'
import SimpleBanner from '../SimpleBanner.vue'
import { useComponentsConfig } from '../../config'
import type { Resource } from '../../types/resources'

const PDF = defineAsyncComponent(() =>
  import('pdf-vue3').then((module) => {
    return module.default
  }),
)

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()

const pdfData = ref<boolean>(false)
const loading = ref(false)
const error = ref(false)
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

const shouldLoadPdf = computed(() => {
  const size = fileSizeBytes.value
  if (!size) {
    // If we don't know the size, don't risk loading a potentially huge file
    return false
  }

  // Use maxPdfPreviewSize from config, fallback to 10 MB if not set
  const maxSizeBytes = config.maxPdfPreviewSize ?? 10_000_000
  return size <= maxSizeBytes
})

const loadPdf = async () => {
  // Check if file is too large or size is unknown before loading
  if (!shouldLoadPdf.value) {
    fileTooLarge.value = true
    return
  }

  loading.value = true
  error.value = false

  try {
    // For PDF, we don't need to fetch the data, just set pdfData to true
    // The PDF component will handle the loading
    pdfData.value = true
  }
  catch (err) {
    console.error('Error loading PDF:', err)
    error.value = true
    pdfData.value = false
  }
  finally {
    loading.value = false
  }
}

// Event handlers for PDF component
const handleProgress = (loadRatio: number) => {
  console.log(`PDF loading progress: ${loadRatio}%`)
}

const handleComplete = () => {
  console.log('PDF download completed')
}

const handlePageChange = (page: number) => {
  console.log(`PDF page changed to: ${page}`)
}

const handlePdfInit = (pdf: unknown) => {
  console.log('PDF initialized:', pdf)
}

const handleError = (err: unknown) => {
  console.error('PDF loading error:', err)
  error.value = true
  pdfData.value = false
}

onMounted(() => {
  loadPdf()
})
</script>
