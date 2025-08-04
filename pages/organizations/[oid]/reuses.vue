<template>
  <div>
    <h2 class="!text-sm !mb-2.5">
      {{ $t(`Réutilisations de l'organisation`) }}
    </h2>
    <ReusesListFromOrganization :organization="props.organization" />
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

const props = defineProps<{
  organization: Organization
}>()
</script>
