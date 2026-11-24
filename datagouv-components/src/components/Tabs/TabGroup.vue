<template>
  <TabGroup
    as="div"
    :class="{
      'tabs-sm': size === 'sm',
    }"
    :default-index="props.defaultIndex"
    :selected-index="props.selectedIndex"
    @change="onChange"
  >
    <slot />
  </TabGroup>
</template>

<script setup lang="ts">
import { TabGroup } from '@headlessui/vue'
import { provide, toRef } from 'vue'
import { tabsUnderlineInjectionKey } from './tabsContext'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md'
  defaultIndex?: number
  // Controlled selection: set it from the change event (default: defaultIndex, then uncontrolled)
  selectedIndex?: number
  // Underline variant: left-aligned tabs over a bottom border, like SegmentedControl's (default: segmented)
  underline?: boolean
}>(), {
  size: 'md',
  defaultIndex: 0,
  selectedIndex: undefined,
  underline: false,
})

const emit = defineEmits<{
  change: [value: number]
}>()

provide(tabsUnderlineInjectionKey, toRef(props, 'underline'))

const onChange = (index: number) => {
  emit('change', index)
}
</script>
