<template>
  <section
    class="tool-trace overflow-hidden rounded-md border border-new-gray-light bg-white text-xs"
    :data-open="String(expanded)"
  >
    <button
      type="button"
      :aria-expanded="expanded"
      class="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-100"
      :aria-label="$t(trace.label)"
      @click="expanded = !expanded"
    >
      <RiWrenchLine
        class="size-3.5 shrink-0 text-new-gray-medium"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1">
        <strong class="block truncate text-[11px] font-semibold leading-4 text-new-gray-dark">
          {{ $t(trace.label) }}<span v-if="trace.count > 1">&nbsp;×{{ trace.count }}</span>
        </strong>
        <span
          class="block truncate text-[11px] leading-4"
          :class="trace.error ? 'text-new-error' : 'text-new-gray-medium'"
        >{{ trace.summary }}</span>
      </span>
      <RiErrorWarningLine
        v-if="trace.error"
        class="size-3.5 shrink-0 text-new-error"
        aria-hidden="true"
      />
      <RiArrowDownLine
        class="tool-trace-chevron size-3.5 shrink-0 text-new-gray-medium transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        aria-hidden="true"
      />
    </button>
    <div class="tool-trace-panel">
      <div class="tool-trace-panel-inner min-h-0">
        <div class="border-t border-new-gray-light px-2.5 pb-2.5 pt-2">
          <p
            v-if="trace.errorText"
            class="m-0 text-new-error"
          >
            {{ trace.errorText }}
          </p>
          <dl
            v-if="trace.details.length"
            class="m-0 grid gap-1"
          >
            <div
              v-for="detail in trace.details"
              :key="detail.label"
              class="grid grid-cols-[6rem_minmax(0,1fr)] gap-2"
            >
              <dt class="text-new-gray-medium">
                {{ $t(detail.label) }}
              </dt>
              <dd class="m-0 min-w-0 break-words text-new-gray-dark">
                {{ detail.value }}
              </dd>
            </div>
          </dl>
          <pre
            v-if="trace.code"
            class="m-0 mt-2 overflow-x-auto rounded bg-gray-50 p-2 font-mono text-[11px]"
          >{{ trace.code }}</pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RiArrowDownLine, RiErrorWarningLine, RiWrenchLine } from '@remixicon/vue'
import { ref } from 'vue'
import type { ToolTrace } from '~/utils/assistant'

defineProps<{
  trace: ToolTrace
}>()

const expanded = ref(false)
</script>

<style scoped>
.tool-trace-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.2s ease;
}

.tool-trace[data-open='true'] .tool-trace-panel {
  grid-template-rows: 1fr;
}

.tool-trace-panel-inner {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .tool-trace-panel {
    transition: none;
  }
}
</style>
