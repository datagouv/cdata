<template>
  <section
    class="thinking-block overflow-hidden rounded-md border border-dashed border-new-gray-light text-xs"
    :data-open="String(expanded)"
  >
    <button
      type="button"
      :aria-expanded="expanded"
      :aria-controls="panelId"
      class="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-100"
      :aria-label="$t('Raisonnement')"
      @click="expanded = !expanded"
    >
      <RiMindMap
        class="size-3.5 shrink-0 text-new-gray-medium"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1">
        <span class="block truncate text-[11px] font-medium leading-4 text-new-gray-medium">{{ $t('Raisonnement') }}</span>
      </span>
      <RiArrowDownLine
        class="thinking-block-chevron size-3.5 shrink-0 text-new-gray-medium transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        aria-hidden="true"
      />
    </button>
    <!-- inert keeps the visually collapsed panel out of the accessibility tree -->
    <div
      :id="panelId"
      class="thinking-block-panel"
      :inert="!expanded || undefined"
    >
      <div class="thinking-block-panel-inner min-h-0">
        <p class="m-0 whitespace-pre-wrap border-t border-new-gray-light px-2.5 pb-2.5 pt-2 text-[11px] leading-4 text-new-gray-dark">
          {{ text }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RiArrowDownLine, RiMindMap } from '@remixicon/vue'
import { ref, useId } from 'vue'

defineProps<{
  text: string
}>()

const expanded = ref(false)
const panelId = useId()
</script>

<style scoped>
.thinking-block-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.2s ease;
}

.thinking-block[data-open='true'] .thinking-block-panel {
  grid-template-rows: 1fr;
}

.thinking-block-panel-inner {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .thinking-block-panel {
    transition: none;
  }
}
</style>
