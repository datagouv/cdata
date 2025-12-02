<template>
  <div class="flex items-center space-x-2">
    <div class="shrink-0 p-1.5 border">
      <OrganizationLogo
        :organization
        size-class="size-8"
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
import { OrganizationLogo, OrganizationNameWithCertificate, type Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
}>()
</script>
