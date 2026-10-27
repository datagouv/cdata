<template>
  <section
    v-if="compact"
    class="dg-organization-summary"
  >
    <header class="dg-organization-summary-heading">
      <OrganizationLogo
        :organization="organization"
        size-class="dg-organization-summary-logo"
      />
      <OrganizationNameWithCertificate
        :show-type="false"
        :organization="organization"
        as="h3"
      />
    </header>
    <div v-if="type !== 'other'">
      <OwnerType :type="type" />
    </div>
    <OrganizationMetrics
      v-if="'metrics' in organization && organization.metrics"
      :metrics="organization.metrics"
      show-labels
    />
    <ObjectCardShortDescription
      v-if="'description' in organization && organization.description"
      :text="organization.description"
    />
  </section>
  <OrganizationHorizontalCard
    v-else
    :organization
    class="dg-organization-vertical dg-organization-with-banner"
  >
    <template #cover>
      <div
        class="dg-organization-card-banner"
        :style="bannerStyle"
        aria-hidden="true"
      >
        <img
          v-if="bannerImage && !bannerFailed"
          :src="bannerImage"
          alt=""
          :style="{ objectPosition: `center ${bannerPosition}%` }"
          @error="bannerFailed = true"
        >
      </div>
    </template>
  </OrganizationHorizontalCard>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import OrganizationHorizontalCard from './OrganizationHorizontalCard.vue'
import OrganizationMetrics from './OrganizationMetrics.vue'
import { computed, ref, watch } from 'vue'
import { getOrganizationType } from '../functions/organizations'
import type { Organization, OrganizationReference } from '../types/organizations'
import OrganizationLogo from './OrganizationLogo.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OwnerType from './OwnerType.vue'
import OrganizationNameWithCertificate from './CardOrganizationName.vue'

const props = defineProps<{
  compact?: boolean
  organization: Organization | OrganizationReference
}>()

const bannerFailed = ref(false)
const bannerImage = computed(() =>
  'banner_image' in props.organization ? props.organization.banner_image : null,
)
const bannerPosition = computed(() =>
  'banner_image_position' in props.organization
    ? (props.organization.banner_image_position ?? 50)
    : 50,
)
const bannerStyle = computed(() =>
  'banner_color' in props.organization && props.organization.banner_color
    ? { backgroundColor: props.organization.banner_color }
    : undefined,
)
watch(bannerImage, () => {
  bannerFailed.value = false
})
const type = computed(() => getOrganizationType(props.organization))
</script>

<style scoped>
.dg-organization-summary {
  display: flex;
  flex-direction: column;
  gap: var(--dg-card-space-12);
  min-width: 0;
  color: var(--dg-card-text);
  font: var(--dg-card-weight-regular) var(--dg-card-text-body)/var(--dg-card-leading-body)
    var(--dg-card-font-sans);
}
.dg-organization-summary-heading {
  display: flex;
  align-items: flex-start;
  gap: var(--dg-card-space-12);
}
.dg-organization-summary-logo {
  width: var(--dg-card-space-48);
  height: var(--dg-card-space-48);
  flex: none;
  border: 1px solid var(--dg-card-border);
  border-radius: var(--dg-card-radius);
  overflow: hidden;
}
.dg-organization-summary-heading :deep(.dg-organization-name) {
  flex: 1;
  align-items: center;
  font-weight: var(--dg-card-weight-semibold);
}
.dg-organization-summary-heading :deep(.dg-organization-name-label) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  overflow-wrap: anywhere;
}
.dg-organization-summary :deep(.dg-card-metric) {
  gap: var(--dg-card-space-4);
}
.dg-organization-summary :deep(.dg-organization-counts) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dg-card-space-8) var(--dg-card-space-16);
}
</style>
