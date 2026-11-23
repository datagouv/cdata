<template>
  <ObjectStatusBadge
    :status="getDataserviceStatus(dataservice)"
    :size
  />
</template>

<script setup lang="ts">
import { getDataserviceStatus } from '../functions/objectStatus'
import type { Dataservice } from '../types/dataservices'
import ObjectStatusBadge from './ObjectStatusBadge.vue'

defineProps<{
  dataservice: Dataservice
  size?: 'xs' | 'sm'
}>()
</script>
