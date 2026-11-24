<template>
  <component
    :is="as"
    class="proposed-organization-owner"
    :data-size="nameSize"
    :data-long-name="organization.name.length > 64"
  >
    <component
      :is="withLink ? 'a' : 'span'"
      :href="withLink ? organization.page : undefined"
      class="proposed-organization-owner-target"
      :class="{ 'is-linked': withLink }"
    >
      <span
        class="proposed-organization-owner-logo"
        :class="{ 'is-framed': !logoNoBorder }"
        aria-hidden="true"
      >
        <OrganizationLogo
          :organization
          :size-class="resolvedLogoSizeClass"
        />
      </span>
      <span
        class="proposed-organization-owner-identity"
        :class="nameColor"
      >
        <span class="proposed-organization-owner-name">{{ organization.name }}</span>
        <span
          v-if="showBadges && (organizationType !== 'other' || certified)"
          class="proposed-organization-owner-badges"
        >
          <OrganizationTypeBadge :type="organizationType" />
          <Badge
            v-if="certified"
            tone="primary"
            size="sm"
            :icon="RiCheckboxCircleLine"
            medium
          >
            {{ $t('Certifié') }}
          </Badge>
        </span>
      </span>
    </component>
  </component>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine } from '@remixicon/vue'
import { Badge, getOrganizationType, isOrganizationCertified, OrganizationLogo, OrganizationTypeBadge, type Organization, type OrganizationReference } from '@datagouv/components-next'

const props = withDefaults(defineProps<{
  organization: Organization | OrganizationReference
  logoSizeClass?: string
  nameSize?: 'base' | 'sm' | 'xs'
  nameColor?: string
  logoNoBorder?: boolean
  as?: string
  withLink?: boolean
  showBadges?: boolean
}>(), {
  logoSizeClass: '',
  logoNoBorder: false,
  withLink: true,
  nameColor: 'text-gray-title',
  nameSize: 'base',
  as: 'div',
  showBadges: true,
})

const organizationType = computed(() => getOrganizationType(props.organization))
const certified = computed(() => isOrganizationCertified(props.organization))
const resolvedLogoSizeClass = computed(() => props.logoSizeClass || ({
  base: 'size-14',
  sm: 'size-12',
  xs: 'size-10',
}[props.nameSize]))
</script>

<style scoped>
.proposed-organization-owner {
  display: block;
  min-width: 0;
  margin: 0;
  color: var(--color-gray-title);
  font-family: var(--font-marianne);
}

.proposed-organization-owner-target {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
  color: inherit;
  text-decoration: none !important;
  background-image: none !important;
  --underline-img: none !important;
}

.proposed-organization-owner-target.is-linked,
.proposed-organization-owner-target.is-linked:visited {
  color: var(--color-gray-title);
}

.proposed-organization-owner[data-long-name="true"] .proposed-organization-owner-target {
  align-items: flex-start;
}

.proposed-organization-owner-target.is-linked:focus-visible {
  outline: 2px solid var(--color-new-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

.proposed-organization-owner-logo {
  display: block;
  flex: none;
  line-height: 0;
  background: #fff;
}

.proposed-organization-owner-logo.is-framed {
  padding: 3px;
  border: 1px solid var(--color-gray-default);
  border-radius: 4px;
}

.proposed-organization-owner-identity {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: inherit;
}

.proposed-organization-owner-name {
  min-width: 0;
  color: inherit;
  font-family: var(--font-marianne);
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
}

.proposed-organization-owner[data-size="sm"] .proposed-organization-owner-name {
  font-size: 14px;
  line-height: 22px;
}

.proposed-organization-owner[data-size="xs"] .proposed-organization-owner-name {
  font-size: 12px;
  line-height: 18px;
}

.proposed-organization-owner-target.is-linked .proposed-organization-owner-name {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.proposed-organization-owner-target.is-linked:hover .proposed-organization-owner-identity,
.proposed-organization-owner-target.is-linked:hover .proposed-organization-owner-name,
.proposed-organization-owner-target.is-linked:active .proposed-organization-owner-identity,
.proposed-organization-owner-target.is-linked:active .proposed-organization-owner-name,
.proposed-organization-owner-target.is-linked:focus-visible .proposed-organization-owner-identity,
.proposed-organization-owner-target.is-linked:focus-visible .proposed-organization-owner-name {
  color: var(--color-new-primary) !important;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.proposed-organization-owner-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

@media (max-width: 480px) {
  .proposed-organization-owner {
    gap: 6px;
  }
}
</style>
