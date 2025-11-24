<template>
  <div class="flex items-center space-x-2">
    <div class="shrink-0 p-1.5 border">
      <Placeholder
        type="organization"
        :src="organization.logo_thumbnail"
        class="shrink-0"
        :class="logoSize"
      />
    </div>
    <CdataLink
      :to="organization.page"
      class="link flex-1 min-w-0"
    >
      <OrganizationNameWithCertificate
        class="w-full"
        :organization
      />
    </CdataLink>
  </div>
</template>

<script setup lang="ts">
import { OrganizationNameWithCertificate, Placeholder, type Organization } from '@datagouv/components-next'

withDefaults(defineProps<{
  organization: Organization
  logoSize?: string | undefined
}>(), {
  logoSize: 'size-8',
})
</script>
