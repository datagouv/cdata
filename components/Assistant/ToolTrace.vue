<template>
  <CollapsibleTrace
    :icon="RiWrenchLine"
    class="tool-trace bg-white"
  >
    <template #header>
      <strong class="block truncate text-[11px] font-semibold leading-4 text-new-gray-dark">
        {{ trace.label }}
      </strong>
      <span
        class="block truncate text-[11px] leading-4"
        :class="trace.error ? 'text-new-error' : 'text-new-gray-medium'"
      >{{ trace.summary }}</span>
    </template>
    <template
      v-if="trace.error"
      #status
    >
      <RiErrorWarningLine
        class="size-3.5 shrink-0 text-new-error"
        aria-hidden="true"
      />
    </template>
    <p
      v-if="trace.errorText"
      class="m-0 text-new-error"
    >
      {{ trace.errorText }}
    </p>
    <pre
      v-if="trace.output"
      class="m-0 mt-2 overflow-x-auto rounded bg-gray-50 p-2 font-mono text-[11px]"
    >{{ trace.output }}</pre>
  </CollapsibleTrace>
</template>

<script setup lang="ts">
import { RiErrorWarningLine, RiWrenchLine } from '@remixicon/vue'
import CollapsibleTrace from './CollapsibleTrace.vue'
import type { ToolTrace } from './useChatDisplayItems'

defineProps<{
  trace: ToolTrace
}>()
</script>
