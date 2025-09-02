<template>
  <TabGroup
    as="div"
    :class="{
      'tabs-sm': size === 'sm',
    }"
    :default-index="props.defaultIndex"
    @change="onChange"
  >
    <slot />
  </TabGroup>
</template>

<script setup lang="ts">
import { TabGroup } from '@headlessui/vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md'
  defaultIndex?: number
}>(), {
  size: 'md',
  defaultIndex: 0,
})

const emit = defineEmits<{
  change: [value: number]
}>()

const onChange = (index: number) => {
  emit('change', index)
}
</script>
