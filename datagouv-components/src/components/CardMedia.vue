<template>
  <!-- Without an image, the placeholder stands for it: it carries the same text alternative. -->
  <div
    class="grid place-items-center size-full min-w-0 overflow-hidden bg-gray-some text-gray-secondary"
    :role="hasImage ? undefined : 'img'"
    :aria-label="hasImage ? undefined : alt"
  >
    <img
      v-if="hasImage"
      :src="src!"
      :alt="alt || ''"
      loading="lazy"
      class="block size-full object-cover"
      @error="failed = true"
    >
    <component
      :is="icon"
      v-else
      class="size-12 flex-none pointer-events-none"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RiArticleLine, RiBarChartBoxLine, RiLineChartLine } from '@remixicon/vue'

const props = defineProps<{
  src?: string | null
  alt?: string
  kind: 'post' | 'reuse' | 'chart'
}>()

// A broken image falls back to the placeholder instead of the browser's broken image icon.
const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})
const hasImage = computed(() => !!props.src?.trim() && !failed.value)
const icon = computed(() => ({ post: RiArticleLine, reuse: RiLineChartLine, chart: RiBarChartBoxLine })[props.kind])
</script>
