<template>
  <article class="reuse-card fr-enlarge-link">
    <div class="reuse-card__body">
      <div class="reuse-card__content">
        <div class="reuse-card__heading">
          <component :is="titleTag" class="reuse-card__title">
            <AppLink class="reuse-card__link" :to="reuseUrl">
              {{ reuse.title }}
            </AppLink>
          </component>
          <ObjectCardBadge v-if="reuse.private" :icon="RiLockLine">{{
            t('Brouillon')
          }}</ObjectCardBadge>
          <ObjectCardBadge v-else-if="reuse.archived" :icon="RiArchiveLine">{{
            t('Archivé')
          }}</ObjectCardBadge>
        </div>
        <ObjectCardOwner
          :organization="reuse.organization"
          :owner="reuse.owner"
          :organization-url="organizationUrl"
        />
        <TranslationT class="reuse-card__date" keypath="Publié {date}">
          <template #date
            ><FormattedDate
              :date="reuse.created_at"
              format="relative"
              :options="{ dateStyle: 'medium' }"
          /></template>
        </TranslationT>
        <ReuseDetails :reuse />
        <ObjectCardShortDescription :text="reuse.description" />
      </div>
    </div>
    <div class="reuse-card__media">
      <CardMedia :src="reuse.image" alt="" kind="reuse" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { RiArchiveLine, RiLockLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Reuse, ReuseV2 } from '../types/reuses'
import type { TitleTag } from '../types/ui'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ReuseDetails from './ReuseDetails.vue'
import CardMedia from './CardMedia.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

const props = withDefaults(
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
  }>(),
  {
    titleTag: 'h3',
  },
)

const { t } = useTranslation()

const reuseUrl = computed(() => props.reuseUrl || props.reuse.page)
</script>

<style scoped>
.reuse-card {
  display: flex;
  position: relative;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  border-radius: 0.25rem;
  background: #fff;
  color: #161616;
}
.reuse-card__body {
  order: 2;
  flex: 1;
  padding: 1rem;
}
.reuse-card__content {
  display: flex;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
}
.reuse-card__heading {
  display: flex;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
}
.reuse-card__title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}
.reuse-card__link {
  display: -webkit-box;
  overflow: hidden;
  color: #161616;
  background-image: none;
  text-decoration: none;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.reuse-card__link::before {
  content: '';
  position: absolute;
  inset: 0;
}
.reuse-card__link::after {
  display: none;
}
.reuse-card__date {
  color: #555;
  font-size: 0.875rem;
  line-height: 1.5rem;
  font-variant-numeric: tabular-nums;
}
.reuse-card__media {
  order: 1;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-bottom: 1px solid #e5e5e5;
}
.reuse-card:has(.reuse-card__link:focus-visible) {
  outline: 2px solid #0a76f6;
  outline-offset: 3px;
}
@media (hover: hover) {
  .reuse-card:has(.reuse-card__link:hover) {
    background: #f6f6f6;
  }
  .reuse-card__link:hover {
    color: #000091;
  }
}
</style>
