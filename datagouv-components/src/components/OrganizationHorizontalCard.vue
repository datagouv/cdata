<template>
  <ObjectCard class="organization-card">
    <template v-if="$slots.cover" #cover><slot name="cover" /></template>
    <template #media>
      <OrganizationLogo :organization="organization" size-class="size-12" />
    </template>
    <ObjectCardHeader :url="organization.page">
      <OrganizationNameWithCertificate
        :show-type="false"
        :organization
        size="base"
        color-class="text-gray-title"
      />
    </ObjectCardHeader>
    <OwnerType v-if="type !== 'other'" class="organization-card__type" :type />
    <OrganizationMetrics
      v-if="'metrics' in organization"
      :metrics="organization.metrics"
      show-followers
    />
    <ObjectCardShortDescription
      v-if="'description' in organization"
      :text="organization.description"
    />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getOrganizationType } from '../functions/organizations'
import type { Organization, OrganizationReference } from '../types/organizations'
import OrganizationLogo from './OrganizationLogo.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import OwnerType from './OwnerType.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OrganizationMetrics from './OrganizationMetrics.vue'

const props = defineProps<{
  organization: Organization | OrganizationReference
}>()

const type = computed(() => getOrganizationType(props.organization))
</script>

<style scoped>
.organization-card__type {
  color: #555;
}
</style>
