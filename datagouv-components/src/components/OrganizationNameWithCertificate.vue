<template>
  <div class="min-w-0 flex gap-1 items-center">
    <OwnerTypeIcon
      v-if="showType"
      :type="getOrganizationType(organization)"
    />
    <div
      class="mb-0 truncate flex-initial"
      :class="{ 'text-sm': size === 'sm' }"
    >
      {{ organization.name }}
      <small
        v-if="organization.acronym && showAcronym"
        class="text-xs text-gray-title font-extrabold align-super"
      >
        {{ organization.acronym }}
      </small>
    </div>
    <Tooltip v-if="isOrganizationCertified(organization)">
      <RiCheckboxCircleLine
        class="flex-none"
        :class="{
          'size-4': size === 'sm',
          'size-5': size === 'base',
        }"
        :aria-label="t(`L'identité de ce service public est certifiée par {certifier}`, { certifier: config.name })"
        aria-hidden="true"
      />
      <template #tooltip>
        <p class="text-sm font-normal mb-0">
          {{ t(`L'identité de ce service public est certifiée par {certifier}`, { certifier: config.name }) }}
        </p>
      </template>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine } from '@remixicon/vue'
import { useI18n } from 'vue-i18n'
import { getOrganizationType, isOrganizationCertified } from '../functions/organizations'
import type { Organization } from '../types/organizations'
import { useComponentsConfig } from '../config'
import OwnerTypeIcon from './OwnerTypeIcon.vue'

const config = useComponentsConfig()

const { t } = useI18n()
withDefaults(defineProps<{
  organization: Organization
  showAcronym?: boolean
  showType?: boolean
  size?: 'base' | 'sm'
}>(), {
  showAcronym: false,
  showType: true,
  size: 'base',
})
</script>
