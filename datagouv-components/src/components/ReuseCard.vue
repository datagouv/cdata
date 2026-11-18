<template>
  <ObjectCard
    :url="reuseUrl || reuse.page"
    :icon="horizontal ? RiLineChartLine : undefined"
    :title-tag
    :media-size="horizontal ? 'lg' : undefined"
  >
    <template
      v-if="!horizontal"
      #cover
    >
      <div class="relative aspect-video border-b border-gray-default">
        <CardMedia
          :src="reuse.image"
          :alt="reuse.title"
          kind="reuse"
          class="absolute inset-0"
        />
      </div>
    </template>
    <template
      v-if="horizontal"
      #media
    >
      <CardMedia
        :src="reuse.image"
        :alt="reuse.title"
        kind="reuse"
      />
    </template>
    <template #title>
      {{ reuse.title }}
    </template>
    <template
      v-if="reuse.private || reuse.archived"
      #badge
    >
      <span class="flex flex-wrap gap-1">
        <ObjectCardBadge
          v-if="reuse.private"
          :icon="RiLockLine"
        >
          {{ t('Brouillon') }}
        </ObjectCardBadge>
        <ObjectCardBadge
          v-if="reuse.archived"
          :icon="RiArchiveLine"
        >
          {{ t('Archivé') }}
        </ObjectCardBadge>
      </span>
    </template>

    <ObjectCardOwner
      show-details
      :organization="reuse.organization"
      :owner="reuse.owner"
      :organization-url="organizationUrl"
    />
    <ObjectCardMeta>
      <TranslationT
        tag="span"
        class="tabular-nums"
        keypath="Publié {date}"
      >
        <template #date>
          <FormattedDate
            :date="reuse.created_at"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
    </ObjectCardMeta>
    <ReuseDetails
      :reuse
      class="max-[480px]:hidden"
    />
    <ObjectCardShortDescription
      :text="reuse.description"
      class="max-md:hidden"
    />
    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArchiveLine, RiLineChartLine, RiLockLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Reuse, ReuseV2 } from '../types/reuses'
import type { TitleTag } from '../types/ui'
import { useTranslation } from '../composables/useTranslation'
import CardMedia from './CardMedia.vue'
import FormattedDate from './FormattedDate.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ReuseDetails from './ReuseDetails.vue'
import TranslationT from './TranslationT.vue'

withDefaults(
  defineProps<{
    reuse: Reuse | ReuseV2

    /**
     * The reuseUrl is a route location object to allow Vue Router to navigate to the details of a reuse.
     * It is used as a separate prop to allow other sites using the package to define their own reuse pages.
     */
    reuseUrl?: RouteLocationRaw

    /**
     * The organizationUrl is an optional route location object to allow Vue Router to navigate to the details of the organization linked to tha reuse.
     * It is used as a separate prop to allow other sites using the package to define their own organization pages.
     * Pass null instead of a route to render the organization name as plain, non-linked text.
     */
    organizationUrl?: RouteLocationRaw | null

    titleTag?: TitleTag

    /**
     * Puts the illustration beside the content instead of above it, for full-width lists.
     * The card falls back to the vertical layout when it gets too narrow.
     */
    horizontal?: boolean
  }>(),
  {
    titleTag: 'h3',
  },
)

const { t } = useTranslation()
</script>
