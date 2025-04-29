<template>
  <div class="flex items-center space-x-2">
    <Placeholder
      type="organization"
      :src="organization.logo_thumbnail"
      class="shrink-0 size-8"
      :size="''"
    />
    <NuxtLink
      :to="organization.page"
      class="link"
    >
      <OrganizationNameWithCertificate
        class="w-full"
        :organization
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { OrganizationNameWithCertificate, Placeholder, type Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
}>()
</script>
