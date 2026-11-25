<template>
  <ObjectStatusBadge
    :status="getReuseStatus(reuse)"
    :size
  />
</template>

<script setup lang="ts">
import { getReuseStatus } from '../functions/objectStatus'
import type { Reuse, ReuseV2 } from '../types/reuses'
import ObjectStatusBadge from './ObjectStatusBadge.vue'

defineProps<{
  reuse: Reuse | ReuseV2
  size?: 'xs' | 'sm'
}>()
</script>
