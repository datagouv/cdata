<template>
  <Badge
    v-if="license"
    :to="license.url || null"
    class="font-mono"
    :title="license.title"
  >
    {{ license.title }}
  </Badge>
</template>

<script setup lang="ts">
import type { License } from '../types/licenses'
import Badge from './Badge.vue'

defineProps<{
  license: License
}>()
</script>
