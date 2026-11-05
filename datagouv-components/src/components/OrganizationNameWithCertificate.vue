<template>
  <span
    v-if="wrap"
    class="min-w-0 [overflow-wrap:anywhere]"
  >
    <OwnerTypeIcon
      v-if="showType"
      :type="getOrganizationType(organization)"
      size-class="size-4 inline-block align-[-2px] me-1"
    /><component
      :is="as"
      class="inline m-0 [font:inherit]"
      :class="colorClass"
    >
      {{ organization.name }}<small
        v-if="organization.acronym && showAcronym"
        class="text-xs"
      >
        {{ organization.acronym }}</small>
      <span
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
    </component>
  </span>
  <div
    v-else
    class="min-w-0 flex gap-1 items-center"
  >
    <OwnerTypeIcon
      v-if="showType"
      :type="getOrganizationType(organization)"
    />
    <component
      :is="as"
      class="mb-0 truncate flex-initial"
      :class="[colorClass, { 'text-xs': size === 'xs', 'text-sm': size === 'sm', 'text-base': size === 'base', 'text-xl sm:text-2xl': size === 'xl' }]"
    >
      {{ organization.name }}
      <small
        v-if="organization.acronym && showAcronym"
        class="text-xs text-gray-title font-extrabold align-super"
      >
        {{ organization.acronym }}
      </small>
    </component>
    <Tooltip v-if="isOrganizationCertified(organization)">
      <RiCheckboxCircleLine
        class="flex-none"
        :class="{
          'size-3': size === 'xs',
          'size-4': size === 'sm',
          'size-5': size === 'base',
          'size-6': size === 'xl',
        }"
        :aria-label="certifiedLabel"
        aria-hidden="true"
      />
      <template #tooltip>
        <p class="text-sm font-normal mb-0">
          {{ certifiedLabel }}
        </p>
      </template>
    </Tooltip>
  </div>
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

const config = useComponentsConfig()

const { t } = useTranslation()
withDefaults(defineProps<{
  organization: Organization | OrganizationReference
  showAcronym?: boolean
  showType?: boolean
  size?: 'xl' | 'base' | 'sm' | 'xs'
  colorClass?: string
  as?: string
  // Lets a long name wrap over several lines, the certificate following its last word,
  // and inherits the font of its container; by default the name is truncated on one line.
  wrap?: boolean
}>(), {
  showAcronym: false,
  showType: true,
  size: 'base',
  colorClass: 'text-new-primary',
  as: 'div',
})

const certifiedLabel = computed(() => t(`L'identité de ce service public est certifiée par {certifier}`, { certifier: config.name }))
</script>
