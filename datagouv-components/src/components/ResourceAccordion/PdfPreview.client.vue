<template>
  <div class="text-xs">
    <div
      v-if="pdfReady"
      ref="containerRef"
      class="w-full overflow-y-auto max-h-[80vh] space-y-3"
    >
      <canvas
        v-for="page in totalPages"
        :key="page"
        :ref="(el) => setCanvasRef(el as HTMLCanvasElement, page)"
        class="w-full"
      />
    </div>
    <div
      v-else-if="loading"
      class="text-gray-medium"
    >
      {{ t("Chargement de l'aperçu PDF...") }}
    </div>
    <SimpleBanner
      v-else-if="fileTooLarge"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="flex-none size-6" />
      <span>{{ fileSizeBytes
        ? t("Fichier PDF trop volumineux pour l'aperçu. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
        : t("L'aperçu n'est pas disponible car la taille du fichier est inconnue. Pour consulter le fichier complet, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.")
      }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error === 'network'"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="flex-none size-6" />
      <span>{{ t("Ce fichier PDF ne peut pas être prévisualisé, peut-être parce qu'il est hébergé sur un autre site qui ne l'autorise pas. Pour le consulter, téléchargez-le en cliquant sur le bouton bleu ou depuis l'onglet Téléchargements.") }}</span>
    </SimpleBanner>
    <SimpleBanner
      v-else-if="error"
      type="warning"
      class="flex items-center space-x-2"
    >
      <RiErrorWarningLine class="flex-none size-6" />
      <span>{{ t("Erreur lors du chargement de l'aperçu PDF. Pour consulter le fichier, téléchargez-le depuis l'onglet Téléchargements.") }}</span>
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RiErrorWarningLine } from '@remixicon/vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import SimpleBanner from '../SimpleBanner.vue'
import { useComponentsConfig } from '../../config'
import type { Resource } from '../../types/resources'
import { useTranslation } from '../../composables/useTranslation'
import { getResourceFilesize } from '../../functions/datasets'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()
const { t } = useTranslation()

const containerRef = ref<HTMLElement | null>(null)
const pdfReady = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fileTooLarge = ref(false)
const totalPages = ref(0)

let pdfDoc: PDFDocumentProxy | null = null
const canvasRefs = new Map<number, HTMLCanvasElement>()

function setCanvasRef(el: HTMLCanvasElement | null, pageNum: number) {
  if (el) canvasRefs.set(pageNum, el)
}

async function renderPage(pageNum: number) {
  if (!pdfDoc) return

  const canvas = canvasRefs.get(pageNum)
  if (!canvas) return

  const page = await pdfDoc.getPage(pageNum)

  const containerWidth = containerRef.value?.clientWidth ?? 800
  const unscaledViewport = page.getViewport({ scale: 1 })
  const scale = containerWidth / unscaledViewport.width
  const viewport = page.getViewport({ scale })

  const dpr = window.devicePixelRatio || 1
  canvas.width = viewport.width * dpr
  canvas.height = viewport.height * dpr
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`

  const context = canvas.getContext('2d')!
  context.scale(dpr, dpr)

  await page.render({
    canvasContext: context,
    viewport,
  }).promise
}

const fileSizeBytes = computed(() => getResourceFilesize(props.resource))

const shouldLoadPdf = computed(() => {
  const size = fileSizeBytes.value
  if (!size) {
    // If we don't know the size, don't risk loading a potentially huge file
    return false
  }

  // Use maxPdfPreviewByteSize from config, fallback to 10 MB if not set
  const maxByteSize = config.maxPdfPreviewByteSize ?? 10_000_000
  return size <= maxByteSize
})

const loadPdf = async () => {
  if (!shouldLoadPdf.value) {
    fileTooLarge.value = true
    return
  }

  loading.value = true
  error.value = null

  try {
    const loadingTask = pdfjsLib.getDocument({
      url: props.resource.url,
      isEvalSupported: false,
    })

    pdfDoc = await loadingTask.promise
    totalPages.value = pdfDoc.numPages
    pdfReady.value = true

    await nextTick()

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      await renderPage(i)
    }
  }
  catch (err) {
    console.error('Error loading PDF:', err)

    if (err instanceof TypeError) {
      error.value = 'network'
    }
    else {
      error.value = 'generic'
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPdf()
})

onBeforeUnmount(() => {
  pdfDoc?.destroy()
})
</script>
