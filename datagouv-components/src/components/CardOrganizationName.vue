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
      class="dg-organization-name-label"
      :class="colorClass"
    >
      {{ organization.name
      }}<small v-if="organization.acronym && showAcronym">
        {{ organization.acronym }}</small>
      <Tooltip
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
    </component>
  </div>
</template>

<style scoped>
.dg-organization-name {
  display: block;
  min-width: 0;
  color: inherit;
  font: var(--dg-card-weight-regular) var(--dg-card-text-title)/var(--dg-card-leading-title)
    var(--dg-card-font-sans);
}
.dg-organization-name-label {
  display: inline;
  margin: 0;
  min-width: 0;
  line-height: inherit;
  font-size: inherit;
  font-weight: inherit;
  white-space: normal;
  overflow-wrap: anywhere;
}
.dg-organization-name[data-size='sm'] {
  font-size: var(--dg-card-text-body);
  line-height: var(--dg-card-leading-title);
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
/* Keep certification in the text flow, immediately after the last word. */
.dg-organization-name :deep(.dg-card-tooltip) {
  display: inline-flex;
  margin-inline-start: 4px;
  vertical-align: -2px;
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
