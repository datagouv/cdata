<template>
  <Badge
    :size
    tone="neutral"
  >
    {{ label }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from '@datagouv/components-next'

// The label comes from the caller, which already fetches the contact point roles for its select options
withDefaults(defineProps<{
  label: string
  size?: 'xs' | 'sm'
}>(), {
  size: 'xs',
})
</script>
