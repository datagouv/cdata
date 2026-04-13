<template>
  <PreviewWrapper
    v-slot="{ data }"
    file-type="PDF"
    :resource="resource"
    :max-size="config.maxPdfPreviewByteSize"
    :load="load"
    @loaded="renderAllPages"
  >
    <div
      ref="containerRef"
      class="w-full overflow-y-auto max-h-[80vh] space-y-3"
    >
      <canvas
        v-for="page in (data as PDFDocumentProxy).numPages"
        :key="page"
        :ref="(el) => setCanvasRef(el as HTMLCanvasElement, page)"
        class="w-full"
      />
    </div>
  </PreviewWrapper>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import PreviewWrapper from './PreviewWrapper.vue'
import { useComponentsConfig } from '../../config'
import type { Resource } from '../../types/resources'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()

const containerRef = ref<HTMLElement | null>(null)
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

const load = async () => {
  const loadingTask = pdfjsLib.getDocument({
    url: props.resource.url,
    isEvalSupported: false,
  })
  pdfDoc = await loadingTask.promise
  return pdfDoc
}

const renderAllPages = async () => {
  if (!pdfDoc) return
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    await renderPage(i)
  }
}

onBeforeUnmount(() => {
  pdfDoc?.destroy()
})
</script>
