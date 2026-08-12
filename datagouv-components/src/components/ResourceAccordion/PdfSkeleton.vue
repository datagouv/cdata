<template>
  <!-- An A4 sheet on the reader backdrop with a few pulsing text lines, matching the
       real PdfPreview framing (centered, capped ~800px, gray backdrop). -->
  <div
    class="overflow-hidden bg-gray-100"
    :class="fill ? 'min-h-0 flex-1' : 'max-h-[80vh]'"
    role="status"
    :aria-label="t('Chargement de l\'aperçu…')"
  >
    <div class="flex justify-center p-4">
      <div class="aspect-[210/297] w-[800px] max-w-full bg-white p-10 shadow-sm">
        <div class="animate-pulse-placeholder space-y-6">
          <div class="space-y-3">
            <div class="h-5 w-1/2 rounded bg-gray-200" />
            <div class="h-3 w-full rounded bg-gray-200" />
            <div class="h-3 w-full rounded bg-gray-200" />
            <div class="h-3 w-5/6 rounded bg-gray-200" />
          </div>
          <div class="space-y-3">
            <div class="h-3 w-full rounded bg-gray-200" />
            <div class="h-3 w-11/12 rounded bg-gray-200" />
            <div class="h-3 w-full rounded bg-gray-200" />
            <div class="h-3 w-3/4 rounded bg-gray-200" />
          </div>
          <div class="space-y-3">
            <div class="h-3 w-full rounded bg-gray-200" />
            <div class="h-3 w-5/6 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'

defineProps<{
  // Fill the available height (fullscreen) instead of the default capped height.
  fill?: boolean
}>()

const { t } = useTranslation()
</script>
