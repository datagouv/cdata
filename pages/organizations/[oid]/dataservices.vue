<template>
  <div>
    <h2 class="!text-sm !mb-2.5">
      {{ $t(`API de l'organisation`) }}
    </h2>
    <DataservicesSearchPage :organization />
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
}>()
</script>
