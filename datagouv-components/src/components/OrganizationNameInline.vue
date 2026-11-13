<template>
  <span class="min-w-0 [overflow-wrap:anywhere]">
    <OwnerTypeIcon
      v-if="showType"
      :type="getOrganizationType(organization)"
      size-class="size-4 inline-block align-[-2px] me-1"
    />{{ organization.name }}<span
      v-if="isOrganizationCertified(organization)"
      class="relative z-2 ms-1 inline-flex align-[-2px]"
    >
      <Tooltip as="span">
        <RiCheckboxCircleLine
          class="size-4 block"
          aria-hidden="true"
        />
        <span class="sr-only">{{ certifiedLabel }}</span>
        <template #tooltip>
          <p class="text-sm font-normal mb-0">
            {{ certifiedLabel }}
          </p>
        </template>
      </Tooltip>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiCheckboxCircleLine } from '@remixicon/vue'
import { getOrganizationType, isOrganizationCertified } from '../functions/organizations'
import type { Organization, OrganizationReference } from '../types/organizations'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'
import OwnerTypeIcon from './OwnerTypeIcon.vue'
import Tooltip from './Tooltip.vue'

// Organization name flowing in a text: it wraps over several lines, the certificate follows
// its last word, and it inherits the font and the color of its container.
withDefaults(defineProps<{
  organization: Organization | OrganizationReference
  showType?: boolean
}>(), {
  showType: true,
})

const config = useComponentsConfig()
const { t } = useTranslation()
const certifiedLabel = computed(() => t(`L'identité de ce service public est certifiée par {certifier}`, { certifier: config.name }))
</script>
