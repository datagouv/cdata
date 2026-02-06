<template>
  <AppLink
    v-if="license && license.url"
    :to="license.url"
    class="px-1 py-[2px] font-mono bg-gray-some text-gray-medium rounded"
  >
    {{ license.title }}
  </AppLink>
  <span
    v-else-if="license"
    class="px-1 py-[2px] font-mono bg-gray-some text-gray-medium rounded"
  >
    {{ license.title }}
  </span>
</template>

<script setup lang="ts">
import type { License } from '../types/licenses'
import AppLink from './AppLink.vue'

defineProps<{
  license: License
}>()
</script>
