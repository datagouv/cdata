<template>
  <div class="flex items-center space-x-2 truncate">
    <div :class="logoNoBorder ? '': 'shrink-0 p-1.5 border'">
      <OrganizationLogo
        :organization
        :size-class="logoSizeClass"
      />
    </div>
    <component
      :is="withLink ? CdataLink : 'span'"
      :to="withLink ? organization.page : undefined"
      class="flex-1 min-w-0"
      :class="{ 'link font-bold': withLink }"
    >
      <OrganizationNameWithCertificate
        class="w-full"
        :as
        :color-class="nameColor"
        :organization
        :size="nameSize"
      />
    </component>
  </div>
</template>

<script setup lang="ts">
import { OrganizationLogo, OrganizationNameWithCertificate, type Organization, type OrganizationReference } from '@datagouv/components-next'
import CdataLink from './CdataLink.vue'

withDefaults(defineProps<{
  organization: Organization | OrganizationReference
  logoSizeClass?: string
  nameSize?: 'base' | 'sm' | 'xs'
  nameColor?: string
  logoNoBorder?: boolean
  as?: string
  withLink?: boolean
}>(), {
  logoSizeClass: 'size-8',
  logoNoBorder: false,
  withLink: true,
  nameColor: 'text-new-primary',
  nameSize: 'base',
})
</script>
