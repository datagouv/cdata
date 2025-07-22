<template>
  <CdataLink
    v-if="license"
    :to="license.url"
    class="px-1 py-[2px] font-mono bg-gray-some text-gray-medium rounded"
    external
  >
    {{ license.title }}
  </CdataLink>
</template>

<script setup lang="ts">
import type { License } from '@datagouv/components-next'

defineProps<{
  license: License
}>()
</script>
