<template>
  <div
    class="group flex items-center justify-between rounded group-data-[with-container=true]/layout:!px-0 p-4 md:px-6"
    :data-banner-action-type="type"
    :class="{
      'bg-datagouv-lightest text-datagouv-dark': type === 'info',
      'bg-danger-lightest text-danger-dark': type === 'error',
      'bg-warning-lightest text-warning-dark': type === 'warning',
      'bg-success-lighter text-success-darker': type === 'success',
    }"
  >
    <div class="group-data-[with-container=true]/layout:container flex items-center">
      <component
        :is="icon"
        class="size-4 mr-2"
      />
      <div class="flex-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiAlertLine, RiCheckDoubleLine, RiInformationLine, RiSpamLine } from '@remixicon/vue'
import { throwOnNever } from '@datagouv/components-next'

const props = defineProps<{
  type: 'info' | 'error' | 'warning' | 'success'
}>()

const icon = computed(() => {
  switch (props.type) {
    case 'info':
      return RiInformationLine
    case 'error':
      return RiSpamLine
    case 'warning':
      return RiAlertLine
    case 'success':
      return RiCheckDoubleLine
    default:
      return throwOnNever(props.type as never, 'Unknown banner type')
  }
})
</script>
