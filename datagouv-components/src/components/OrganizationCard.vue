<template>
  <div class="border border-gray-default relative fr-enlarge-link">
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
        <NuxtLinkLocale
          :to="`/organizations/${organization.slug}`"
        >
          <OrganizationNameWithCertificate
            :show-type="false"
            :organization
          />
        </NuxtLinkLocale>
      </p>
      <div class="mb-2 flex flex-wrap items-center">
        <OwnerType
          v-if="type !== 'other'"
          class="mb-0 text-sm after:content-['—'] after:ml-1"
          :type
        />
        <div>
          <div class="text-gray-medium flex items-center text-sm gap-0.5" v-if="organization.metrics">
            <RiDatabase2Line class="size-4 -mt-1" /> {{ organization.metrics.datasets }}
            <RiTerminalLine class="size-4 -mt-1 ml-1" /> {{ organization.metrics.dataservices }}
            <RiLineChartLine class="size-4 -mt-1 ml-1" /> {{ organization.metrics.reuses }}
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
import { RiLineChartLine, RiDatabase2Line, RiTerminalLine } from '@remixicon/vue'
import { computed, ref, watchEffect } from 'vue'
import { removeMarkdown } from '../functions/markdown'
import { getOrganizationType } from '../functions/organizations'
import type { Organization } from '../types/organizations'
import OwnerType from './OwnerType.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'

const props = defineProps<{
  organization: Organization
}>()

const type = computed(() => getOrganizationType(props.organization))

const description = ref('')
watchEffect(async () => {
  description.value = await removeMarkdown(props.organization.description)
})
</script>
