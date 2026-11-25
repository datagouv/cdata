<template>
  <component
    :is="as"
    class="organization-owner"
    :data-size="nameSize"
    :data-long-name="organization.name.length > 64"
  >
    <!-- The logo repeats the link of the name for the pointer only: one stop for the keyboard. -->
    <component
      :is="withLink ? 'a' : 'span'"
      :href="withLink ? organization.page : undefined"
      class="organization-owner__logo"
      :class="{ 'is-framed': !logoNoBorder }"
      :tabindex="withLink ? -1 : undefined"
      aria-hidden="true"
    >
      <OrganizationLogo
        :organization
        :size-class="resolvedLogoSizeClass"
      />
    </component>
    <span class="organization-owner__identity">
      <component
        :is="withLink ? 'a' : 'span'"
        :href="withLink ? organization.page : undefined"
        class="organization-owner__name"
        :class="[nameColor, { 'is-linked': withLink }]"
      >{{ organization.name }}</component>
      <!-- Outside the link: the underline of the name does not reach them, and their tooltip
           is not an interactive element inside another one. -->
      <span
        v-if="showBadges && (organizationType !== 'other' || certified)"
        class="organization-owner__badges"
      >
        <Tooltip
          v-if="organizationType !== 'other'"
          as="span"
        >
          <OrganizationTypeBadge :type="organizationType" />
          <template #tooltip>
            {{ typeDescription }}
          </template>
        </Tooltip>
        <Tooltip
          v-if="certified"
          as="span"
        >
          <Badge
            tone="primary"
            size="sm"
            :icon="RiCheckboxCircleLine"
            medium
          >
            {{ $t('Certifié') }}
          </Badge>
          <template #tooltip>
            {{ $t(`L'identité de ce service public est certifiée par {certifier}`, { certifier: componentsConfig.name }) }}
          </template>
        </Tooltip>
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine } from '@remixicon/vue'
import { Badge, getOrganizationType, isOrganizationCertified, OrganizationLogo, OrganizationTypeBadge, Tooltip, useComponentsConfig, type Organization, type OrganizationReference } from '@datagouv/components-next'

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

const { t } = useTranslation()
const componentsConfig = useComponentsConfig()

const organizationType = computed(() => getOrganizationType(props.organization))
const certified = computed(() => isOrganizationCertified(props.organization))
const typeDescription = computed(() => ({
  'public-service': t('Administration, établissement public ou organisme chargé d’une mission de service public.'),
  'local-authority': t('Commune, département, région ou groupement de collectivités.'),
  'association': t('Organisation à but non lucratif.'),
  'company': t('Organisation à but lucratif.'),
  'other': '',
}[organizationType.value]))
const resolvedLogoSizeClass = computed(() => props.logoSizeClass || ({
  base: 'size-14',
  sm: 'size-12',
  xs: 'size-10',
}[props.nameSize]))
</script>

<style scoped>
.organization-owner {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
  margin: 0;
  color: var(--color-gray-title);
  font-family: var(--font-marianne);
}
.organization-owner[data-long-name="true"] {
  align-items: flex-start;
}

.organization-owner__logo {
  display: block;
  flex: none;
  line-height: 0;
  background: #fff;
  /* DSFR draws an underline on every link through a background image. */
  background-image: none !important;
  --underline-img: none;
}
.organization-owner__logo.is-framed {
  padding: 3px;
  border: 1px solid var(--color-gray-default);
  border-radius: 4px;
}

.organization-owner__identity {
  display: grid;
  justify-items: start;
  gap: calc(var(--spacing) * 1.5);
  min-width: 0;
}

.organization-owner__name {
  min-width: 0;
  font-size: var(--text-base);
  line-height: 24px;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.organization-owner[data-size="sm"] .organization-owner__name {
  font-size: var(--text-sm);
  line-height: 22px;
}
.organization-owner[data-size="xs"] .organization-owner__name {
  font-size: var(--text-xs);
  line-height: 18px;
}
.organization-owner__name.is-linked {
  background-image: none;
  --underline-img: none;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.organization-owner__name.is-linked:hover,
.organization-owner__name.is-linked:active,
.organization-owner__name.is-linked:focus-visible,
.organization-owner:has(.organization-owner__logo:hover) .organization-owner__name.is-linked {
  color: var(--color-new-primary) !important;
}
.organization-owner__name.is-linked:focus-visible {
  outline: 2px solid var(--color-new-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

.organization-owner__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing);
  min-width: 0;
}
</style>
