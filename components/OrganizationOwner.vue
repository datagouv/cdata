<template>
  <div class="flex items-center space-x-2">
    <div :class="logoNoBorder ? '': 'shrink-0 p-1.5 border'">
      <OrganizationLogo
        :organization
        :size-class="logoSizeClass"
      />
    </div>
    <CdataLink
      :to="organization.page"
      class="link flex-1 min-w-0"
    >
      <OrganizationNameWithCertificate
        class="w-full"
        :as
        :organization
      />
    </CdataLink>
  </div>
</template>

<script setup lang="ts">
import { OrganizationLogo, OrganizationNameWithCertificate, type Organization, type OrganizationReference } from '@datagouv/components-next'

withDefaults(defineProps<{
  organization: Organization | OrganizationReference
  logoSizeClass?: string
  logoNoBorder?: boolean
  as?: string
}>(), {
  logoSizeClass: 'size-8',
  logoNoBorder: false,
})
</script>
