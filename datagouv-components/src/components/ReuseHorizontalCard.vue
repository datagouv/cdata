<template>
  <ObjectCard>
    <template #badges>
      <div
        v-if="reuse.private || reuse.archived"
        class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
      >
        <p
          v-if="reuse.private"
          class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
        >
          <RiLockLine
            aria-hidden="true"
            class="size-4 mr-1"
          />
          {{ t('Brouillon') }}
        </p>
        <p
          v-if="reuse.archived"
          class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
        >
          <RiArchiveLine
            aria-hidden="true"
            class="size-4 mr-1"
          />
          {{ t('Archivé') }}
        </p>
      </div>
    </template>

    <template #media>
      <div
        class="flex justify-center items-center border border-gray-lower bg-[#fff] rounded-md overflow-hidden"
        style="width: 240px; height: 160px;"
      >
        <img
          v-if="reuse.image"
          :src="reuse.image"
          class="w-full h-full object-cover"
          :alt="reuse.title"
        >
        <Placeholder
          v-else
          type="Reuse"
          class="w-full h-full"
        />
      </div>
    </template>

    <h4 class="w-full text-base mb-0 flex">
      <AppLink
        :to="reuseUrl"
        class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
      >
        <RiLineChartLine
          aria-hidden="true"
          class="size-4 flex-none"
        />
        <span class="block truncate flex-1">{{ reuse.title }}</span>
        <span class="absolute inset-0" />
      </AppLink>
    </h4>

    <div
      v-if="reuse.organization || ownerName"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <template v-if="reuse.organization">
        <div class="-mr-0.5 flex-initial truncate">
          <AppLink
            v-if="organizationUrl"
            class="link text-sm overflow-hidden flex items-center relative z-[2] truncate"
            :to="organizationUrl"
          >
            <OrganizationNameWithCertificate :organization="reuse.organization" />
          </AppLink>
          <OrganizationNameWithCertificate
            v-else
            :organization="reuse.organization"
          />
        </div>
      </template>
      <div
        v-else-if="ownerName"
        class="mr-1 truncate"
      >
        {{ ownerName }}
      </div>
    </div>

    <div class="mx-0 -mb-1 flex flex-wrap items-center text-sm text-gray-medium mt-1">
      <ReuseDetails :reuse />
    </div>

    <p
      v-if="descriptionShort"
      class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:block line-clamp-2"
    >
      {{ descriptionShort }}
    </p>

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArchiveLine, RiLineChartLine, RiLockLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { getOwnerName } from '../functions/owned'
import { removeMarkdownSync } from '../functions/markdown'
import type { Reuse } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import ReuseDetails from './ReuseDetails.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'

const props = defineProps<{
  reuse: Reuse
  reuseUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()

const ownerName = computed(() => getOwnerName(props.reuse))
const reuseUrl = computed(() => props.reuseUrl || props.reuse.page)
const organizationUrl = computed(() => props.organizationUrl || props.reuse.organization?.page)

const descriptionShort = computed(() => {
  if (!props.reuse.description) return ''
  const cleaned = removeMarkdownSync(props.reuse.description)
  return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned
})
</script>
