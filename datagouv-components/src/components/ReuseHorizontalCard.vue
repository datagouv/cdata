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
      v-if="reuse.organization || reuse.owner"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="reuse.organization"
        :owner="reuse.owner"
        :organization-url="organizationUrl"
      />
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
import type { RouteLocationRaw } from 'vue-router'
import type { Reuse } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import ReuseDetails from './ReuseDetails.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'

defineProps<{
  reuse: Reuse
  reuseUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()
</script>
