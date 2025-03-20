<template>
  <component
    :is="(resource.filetype === 'remote' && resource.format ? getResourceFormatIcon(resource.format) : null) || File"
    class="text-gray-800 shrink-0"
  />
</template>

<script setup lang="ts">
import type { ResourceFileType } from '../../types/resources'
import File from '../Icons/File.vue'
import { getResourceFormatIcon } from '../../functions/resources'

defineProps<{
  resource: { format?: string | null, filetype: ResourceFileType | null }
}>()
</script>
