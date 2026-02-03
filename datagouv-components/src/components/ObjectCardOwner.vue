<template>
  <div
    v-if="organization"
    class="-mr-0.5 flex-initial truncate"
  >
    <AppLink
      class="link text-sm overflow-hidden flex items-center relative z-[2] truncate"
      :to="organizationUrl || organization.page"
    >
      <OrganizationNameWithCertificate
        :organization
        size="sm"
      />
    </AppLink>
  </div>
  <div
    v-else-if="ownerName"
    class="mr-1 truncate"
  >
    {{ ownerName }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { getOwnerName } from '../functions/owned'
import type { OrganizationReference } from '../types/organizations'
import type { UserReference } from '../types/users'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'

const props = defineProps<{
  organization?: OrganizationReference | null
  owner?: UserReference | null
  organizationUrl?: RouteLocationRaw
}>()

const ownerName = computed(() => {
  if (!props.owner) return ''
  return getOwnerName({ organization: null, owner: props.owner })
})
</script>
