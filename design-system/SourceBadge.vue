<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="badgeClasses"
  >
    <component
      :is="icon"
      class="size-3"
    />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { RiCheckLine, RiAlertLine } from '@remixicon/vue'

const props = withDefaults(defineProps<{
  inLib?: boolean
}>(), {
  inLib: false,
})

const badgeClasses = computed(() =>
  props.inLib
    ? 'bg-green-100 text-green-800'
    : 'bg-amber-100 text-amber-800',
)

const icon = computed(() => props.inLib ? RiCheckLine : RiAlertLine)

const label = computed(() =>
  props.inLib
    ? '@datagouv/components-next'
    : 'Local - À porter',
)
</script>
