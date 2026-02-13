<template>
  <slot />
</template>

<script setup lang="ts" generic="T">
import { watch } from 'vue'

const props = defineProps<{
  value: T
}>()
const emits = defineEmits<{
  changed: [T]
}>()

watch(() => props.value, () => {
  emits('changed', props.value)
})
</script>
