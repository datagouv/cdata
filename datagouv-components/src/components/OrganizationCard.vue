<template>
  <div class="border border-gray-default bg-white relative fr-enlarge-link">
    <div class="h-[4.5rem] pt-4 px-4 bg-blue-lighter" />
    <div class="px-4 pb-4 pt-5 mt-2">
      <div class="inline-flex border border-gray-default p-1.5 absolute top-4 left-4 bg-white">
        <img
          :src="organization.logo_thumbnail"
          width="64"
          height="64"
          alt=""
          loading="lazy"
        >
      </div>
      <p class="mb-0.5 font-bold">
        <AppLink
          :to="organization.page"
          class="overflow-hidden"
        >
          <OrganizationNameWithCertificate
            :show-type="false"
            :organization
          />
        </AppLink>
      </p>
      <div class="mb-2 flex flex-wrap gap-1 items-center">
        <template v-if="type !== 'other'">
          <OwnerType
            class="mb-0 text-sm"
            :type
          />
          <RiSubtractLine
            aria-hidden="true"
            class="size-4 fill-gray-medium"
          />
        </template>
        <div>
          <div
            v-if="organization.metrics"
            class="text-gray-medium flex items-center text-sm gap-0.5"
            :aria-label="t('{datasets} jeux de données, {dataservices} API et {reuses} réutilisations', {
              datasets: organization.metrics.datasets,
              dataservices: organization.metrics.dataservices,
              reuses: organization.metrics.reuses,
            })"
          >
            <RiDatabase2Line
              aria-hidden="true"
              class="size-4 -mt-1"
            /> {{ organization.metrics.datasets }}
            <RiTerminalLine
              aria-hidden="true"
              class="size-4 -mt-1 ml-1"
            /> {{ organization.metrics.dataservices }}
            <RiLineChartLine
              aria-hidden="true"
              class="size-4 -mt-1 ml-1"
            /> {{ organization.metrics.reuses }}
          </div>
        </div>
      </div>
      <p class="mt-1 mb-0">
        <TextClamp
          v-if="description"
          :text="description"
          :max-lines="3"
        />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiLineChartLine, RiDatabase2Line, RiTerminalLine, RiSubtractLine } from '@remixicon/vue'
import { computed, ref, watchEffect } from 'vue'
import { removeMarkdown } from '../functions/markdown'
import { getOrganizationType } from '../functions/organizations'
import type { Organization } from '../types/organizations'
import OwnerType from './OwnerType.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import AppLink from './AppLink.vue'
import { useTranslation } from '../main'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useTranslation()

const type = computed(() => getOrganizationType(props.organization))

const description = ref('')
watchEffect(async () => {
  description.value = await removeMarkdown(props.organization.description)
})
</script>
