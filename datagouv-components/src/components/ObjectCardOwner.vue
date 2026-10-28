<template>
  <div
    v-if="organization"
    class="dg-card-owner flex-initial"
  >
    <OrganizationLogo
      v-if="showLogo"
      class="dg-card-organization-logo"
      :organization="organization"
      size-class="dg-owner-logo"
    />
    <DetailsPopover
      v-if="showDetails && organizationUrl !== null"
      button-class="dg-details-trigger dg-organization-trigger"
      :button-props="{ title: t('À propos de cette organisation') }"
    >
      <OrganizationNameWithCertificate
        :show-certificate="showCertificate"
        :organization
        size="sm"
      />
      <template #toggletip>
        <section class="dg-organization-details">
          <OrganizationCard
            :organization="organization"
            compact
          />
          <AppLink
            :to="organizationUrl || organization.page"
            class="dg-organization-details-footer"
          >
            {{ t('Voir la page de l’organisation') }}
          </AppLink>
        </section>
      </template>
    </DetailsPopover>
    <AppLink
      v-else-if="organizationUrl !== null"
      class="link text-sm flex items-center relative z-[2]"
      :to="organizationUrl || organization.page"
    >
      <OrganizationNameWithCertificate
        :show-certificate="showCertificate"
        :organization
        size="sm"
      />
    </AppLink>
    <span
      v-else
      class="dg-card-owner-static"
    >
      <OrganizationNameWithCertificate
        :show-certificate="showCertificate"
        :organization
        size="sm"
      />
    </span>
  </div>
  <div
    v-else-if="ownerName"
    class="dg-card-owner"
  >
    {{ ownerName }}
  </div>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import { computed } from 'vue'
import DetailsPopover from './CardDetailsPopover.vue'
import { useTranslation } from '../composables/useTranslation'
import type { RouteLocationRaw } from 'vue-router'
import OrganizationCard from './OrganizationCard.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import { getOwnerName } from '../functions/owned'
import type { OrganizationReference } from '../types/organizations'
import type { UserReference } from '../types/users'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './CardOrganizationName.vue'

const props = withDefaults(
  defineProps<{
    showDetails?: boolean
    showLogo?: boolean
    showCertificate?: boolean
    organization?: OrganizationReference | null
    owner?: UserReference | null
    // undefined falls back to organization.page; pass null to render plain, non-linked text
    organizationUrl?: RouteLocationRaw | null
  }>(),
  { showCertificate: true },
)

const { t } = useTranslation()
const ownerName = computed(() => {
  if (!props.owner) return ''
  return getOwnerName({ organization: null, owner: props.owner })
})
</script>

<style scoped>
.dg-card-owner {
  display: flex;
  align-items: center;
  gap: var(--dg-card-space-8);
  min-width: 0;
  color: var(--dg-card-text-secondary);
  font: var(--dg-card-weight-regular) var(--dg-card-text-body)/var(--dg-card-leading-control)
    var(--dg-card-font-sans);
  overflow-wrap: anywhere;
}
.dg-card-owner :deep(.truncate) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
.dg-card-owner :deep(a) {
  color: var(--dg-card-text-secondary);
  background-image: none;
  text-decoration: underline;
  text-underline-offset: var(--dg-card-space-optical);
}
.dg-card-owner :deep(a:focus-visible) {
  outline: var(--dg-card-focus-width) solid var(--dg-card-focus);
  outline-offset: var(--dg-card-focus-offset);
}
</style>

<style scoped>
.dg-organization-details {
  display: flex;
  flex-direction: column;
  gap: var(--dg-card-space-16);
}
.dg-organization-details-footer {
  display: block;
  border-top: 1px solid var(--dg-card-border);
  padding-top: var(--dg-card-space-12);
  font: var(--dg-card-weight-medium) var(--dg-card-text-body)/var(--dg-card-leading-body)
    var(--dg-card-font-sans);
}
</style>

<style scoped>
.dg-owner-logo {
  width: var(--dg-card-space-32);
  height: var(--dg-card-space-32);
}
</style>
