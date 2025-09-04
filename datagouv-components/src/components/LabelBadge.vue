<template>
  <span class="bg-gray-lower text-xs leading-5 px-2 py-0.5 rounded-full uppercase">
    {{ badge.label }}
  </span>
</template>

<script setup lang="ts">
import type { TranslatedBadge } from '@/types/badges'

defineProps<{
  badge: TranslatedBadge
}>()
</script>
