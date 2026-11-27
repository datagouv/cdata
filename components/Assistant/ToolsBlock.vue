<template>
  <CollapsibleTrace
    :icon="RiToolsLine"
    class="tools-block"
  >
    <template #header>
      <span class="block truncate">{{ title }}</span>
    </template>
    <ol class="m-0 list-none space-y-2 p-0">
      <li
        v-for="(trace, index) in traces"
        :key="index"
        class="marker:content-none"
      >
        <ToolTrace :trace="trace" />
      </li>
    </ol>
  </CollapsibleTrace>
</template>

<script setup lang="ts">
import { useTranslation } from '@datagouv/components-next'
import { RiToolsLine } from '@remixicon/vue'
import { computed } from 'vue'
import CollapsibleTrace from './CollapsibleTrace.vue'
import ToolTrace from './ToolTrace.vue'
import type { ToolTrace as ToolTraceModel } from './useMessageDisplay'

const props = defineProps<{
  traces: ToolTraceModel[]
  running: boolean
}>()

const { t } = useTranslation()

// Interpolated here: the $t mock of the tests ignores parameters.
const title = computed(() => {
  const n = props.traces.length
  return props.running ? t('Outils en cours · {n}', { n }) : t('Outils utilisés · {n}', { n })
})
</script>
