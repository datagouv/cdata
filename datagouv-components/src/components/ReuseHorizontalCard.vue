<template>
  <ObjectCard media-size="lg">
    <template #badge>
      <ObjectCardBadge
        v-if="reuse.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="reuse.archived"
        :icon="RiArchiveLine"
      >
        {{ t('Archivé') }}
      </ObjectCardBadge>
    </template>

    <template #media>
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
    </template>

    <ObjectCardHeader
      :icon="RiLineChartLine"
      :url="reuseUrl || reuse.page"
    >
      {{ reuse.title }}
    </ObjectCardHeader>

    <div
      v-if="reuse.organization || ownerName"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <div
        v-if="reuse.organization"
        class="-mr-0.5 flex-initial truncate"
      >
        <AppLink
          class="link text-sm overflow-hidden flex items-center relative z-[2] truncate"
          :to="organizationUrl || reuse.organization.page"
        >
          <OrganizationNameWithCertificate
            :organization="reuse.organization"
            size="sm"
          />
        </AppLink>
      </div>
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

    <ObjectCardShortDescription :text="reuse.description" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArchiveLine, RiLineChartLine, RiLockLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { getOwnerName } from '../functions/owned'
import type { Reuse } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import ReuseDetails from './ReuseDetails.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'

const props = defineProps<{
  reuse: Reuse
  reuseUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()

const ownerName = computed(() => getOwnerName(props.reuse))
</script>
