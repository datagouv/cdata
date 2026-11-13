<template>
  <CollapsibleTrace
    :icon="RiWrenchLine"
    class="tool-trace bg-white"
  >
    <template #header>
      <strong class="block truncate text-[11px] font-semibold leading-4 text-new-gray-dark">
        {{ $t(trace.label) }}
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
      v-if="trace.output"
      class="m-0 mt-2 overflow-x-auto rounded bg-gray-50 p-2 font-mono text-[11px]"
    >{{ trace.output }}</pre>
  </CollapsibleTrace>
</template>

<script setup lang="ts">
import { RiErrorWarningLine, RiWrenchLine } from '@remixicon/vue'
import CollapsibleTrace from './CollapsibleTrace.vue'
import type { ToolTrace } from '~/utils/assistant'

defineProps<{
  trace: ToolTrace
}>()
</script>
