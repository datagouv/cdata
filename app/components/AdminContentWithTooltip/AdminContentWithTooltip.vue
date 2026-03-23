<template>
  <Tooltip
    ref="content"
    tooltip-class="xl:hidden"
  >
    <slot />
    <template #tooltip>
      {{ tooltipText }}
    </template>
  </Tooltip>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Tooltip } from '@datagouv/components-next'

defineOptions({
  inheritAttrs: false,
})

const contentRef = useTemplateRef('content')
const tooltipText = ref('')

onMounted(() => {
  if (contentRef.value) {
    tooltipText.value = contentRef.value.$el.textContent || ''
  }
})
</script>

<style scoped>
p {
  line-height: var(--lh) !important;
}
</style>
