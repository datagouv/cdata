<script setup lang="ts">
import '../../assets/cards.css'
import { RiCheckboxCircleLine } from '@remixicon/vue'
import { getOrganizationType, isOrganizationCertified } from '../functions/organizations'
import type { Organization, OrganizationReference } from '../types/organizations'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'
import OwnerTypeIcon from './OwnerTypeIcon.vue'
import Tooltip from './CardCertificateTooltip.vue'

const config = useComponentsConfig(),
  { t } = useTranslation()
withDefaults(
  defineProps<{
    organization: Organization | OrganizationReference
    showCertificate?: boolean
    showAcronym?: boolean
    showType?: boolean
    size?: 'xl' | 'base' | 'sm' | 'xs'
    colorClass?: string
    as?: string
  }>(),
  {
    showCertificate: true,
    showAcronym: false,
    showType: true,
    size: 'base',
    colorClass: '',
    as: 'div',
  },
)
</script>

<template>
  <div
    class="dg-organization-name"
    :data-size="size"
  >
    <OwnerTypeIcon
      v-if="showType"
      :type="getOrganizationType(organization)"
    /><component
      :is="as"
      class="truncate dg-organization-name-label"
      :class="colorClass"
    >
      {{ organization.name
      }}<small v-if="organization.acronym && showAcronym">
        {{ organization.acronym }}</small>
    </component><Tooltip
      v-if="showCertificate && isOrganizationCertified(organization)"
      class="dg-organization-certificate"
      :aria-label="
        t(`L'identité de ce service public est certifiée par {certifier}`, {
          certifier: config.name,
        })
      "
    >
      <RiCheckboxCircleLine
        class="dg-ds-icon"
        data-icon-size="base"
        aria-hidden="true"
        focusable="false"
      /><template #tooltip>
        {{
          t(`L'identité de ce service public est certifiée par {certifier}`, {
            certifier: config.name,
          })
        }}
      </template>
    </Tooltip>
  </div>
</template>

<style scoped>
.dg-organization-name {
  display: flex;
  align-items: center;
  gap: var(--dg-card-space-4);
  min-width: 0;
  color: inherit;
  font: var(--dg-card-weight-regular) var(--dg-card-text-title)/var(--dg-card-leading-title)
    var(--dg-card-font-sans);
}
.dg-organization-name-label {
  margin: 0;
  min-width: 0;
  line-height: inherit;
  font-size: inherit;
  font-weight: inherit;
}
.dg-organization-name[data-size='sm'] {
  font-size: var(--dg-card-text-body);
  line-height: var(--dg-card-leading-body);
}
.dg-organization-name[data-size='xs'],
small {
  font-size: var(--dg-card-text-caption);
  line-height: var(--dg-card-leading-caption);
}
.dg-organization-name[data-size='xl'] {
  font-size: var(--dg-card-text-heading);
  line-height: var(--dg-card-leading-heading);
}
svg {
  width: var(--dg-card-icon);
  height: var(--dg-card-icon);
  flex-shrink: 0;
}
</style>

<style scoped>
/* Center the tooltip reference without the baseline space of an inline SVG. */
.dg-organization-name :deep(> .dg-card-tooltip) {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.dg-organization-name :deep(.dg-organization-certificate) {
  display: flex;
  align-items: center;
  justify-content: center;
}
.dg-organization-certificate svg {
  display: block;
}
</style>
