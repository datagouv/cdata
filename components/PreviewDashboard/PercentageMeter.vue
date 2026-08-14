<template>
  <div class="flex items-center gap-2">
    <ProgressBar
      :value="safeValue"
      :max="100"
      bar-class="bg-gray-low"
      class="flex-1 !min-w-0"
    />
    <span class="text-xs tabular-nums">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { ProgressBar } from '@datagouv/components-next'

const props = withDefaults(defineProps<{
  value?: number | null
}>(), { value: 0 })

const safeValue = computed(() => {
  const num = Number(props.value ?? 0)
  return Number.isFinite(num) ? num : 0
})

const label = computed(() => `${safeValue.value.toFixed(1)}%`)
</script>
