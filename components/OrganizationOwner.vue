<template>
  <div class="flex items-center space-x-2">
    <div class="shrink-0 p-1.5 border">
      <Placeholder
        type="organization"
        :src="organization.logo_thumbnail"
        class="shrink-0 size-8"
        :size="32"
      />
    </div>
    <!-- :size=32 is the same as size-8, should remove the size prop to use Tailwind… -->
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

defineProps<{
  organization: Organization
}>()
</script>
