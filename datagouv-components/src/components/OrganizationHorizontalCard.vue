<template>
  <ObjectCard>
    <template #media>
      <OrganizationLogo
        :organization="organization"
        size-class="size-12"
      />
    </template>
    <ObjectCardHeader
      :icon="RiBuilding2Line"
      :url="organization.page"
    >
      <OrganizationNameWithCertificate
        :show-type="false"
        :organization
        size="sm"
        color-class="text-gray-title"
      />
    </ObjectCardHeader>
    <div class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate">
      <template v-if="type !== 'other'">
        <OwnerType
          class="mb-0"
          :type
        />
        <RiSubtractLine
          v-if="'metrics' in organization"
          aria-hidden="true"
          class="hidden md:block size-4 flex-none fill-gray-medium"
        />
      </template>
      <div
        v-if="'metrics' in organization"
        class="text-gray-medium flex items-center text-sm gap-0.5"
        :aria-label="t('{datasets} jeux de donn\u00e9es, {dataservices} API et {reuses} r\u00e9utilisations', {
          datasets: organization.metrics.datasets,
          dataservices: organization.metrics.dataservices,
          reuses: organization.metrics.reuses,
        })"
      >
        <RiDatabase2Line
          aria-hidden="true"
          class="size-3.5"
        /> {{ summarize(organization.metrics.datasets) }}
        <RiTerminalLine
          aria-hidden="true"
          class="size-3.5 ml-1"
        /> {{ summarize(organization.metrics.dataservices) }}
        <RiLineChartLine
          aria-hidden="true"
          class="size-3.5 ml-1"
        /> {{ summarize(organization.metrics.reuses) }}
        <RiStarLine
          aria-hidden="true"
          class="size-3.5 ml-1"
        /> {{ summarize(organization.metrics.followers) }}
      </div>
    </div>
    <ObjectCardShortDescription
      v-if="'description' in organization"
      :text="organization.description"
    />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiBuilding2Line, RiDatabase2Line, RiLineChartLine, RiStarLine, RiSubtractLine, RiTerminalLine } from '@remixicon/vue'
import { computed } from 'vue'
import { getOrganizationType } from '../functions/organizations'
import { summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'
import type { Organization, OrganizationReference } from '../types/organizations'
import OrganizationLogo from './OrganizationLogo.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import OwnerType from './OwnerType.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

const props = defineProps<{
  organization: Organization | OrganizationReference
}>()

const { t } = useTranslation()

const type = computed(() => getOrganizationType(props.organization))
</script>
