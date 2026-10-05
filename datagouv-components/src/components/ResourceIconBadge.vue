<template>
  <span
    :class="[iconColor, '[&_svg]:fill-current']"
    class="flex size-5 shrink-0 items-center justify-center rounded-[1px]"
  >
    <component
      :is="iconComponent"
      class="size-4"
      aria-hidden="true"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import File from './Icons/File.vue'
import { getResourceFormatIcon, getResourceIconColor } from '../functions/resources'
import type { Resource } from '../types/resources'

const props = defineProps<{
  resource: Resource
}>()

// Render the icon directly (not via ResourceIcon which forces a gray color) so the
// colored badge can tint it through currentColor + [&_svg]:fill-current.
const iconComponent = computed(() => (props.resource.format ? getResourceFormatIcon(props.resource.format) : null) ?? File)
const iconColor = computed(() => getResourceIconColor(props.resource.format))
</script>
