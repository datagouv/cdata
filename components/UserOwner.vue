<template>
  <div class="flex items-center space-x-2">
    <Placeholder
      type="organization"
      :src="organization.logo_thumbnail"
      class="shrink-0 size-8"
      :size="''"
    />
    <OrganizationNameWithCertificate
      class="w-full"
      :organization
    />
  </div>
</template>

<script setup lang="ts">
import { OrganizationNameWithCertificate, Placeholder, type Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
}>()
</script>
