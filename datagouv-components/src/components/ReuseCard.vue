<template>
  <article
    class="dg-content-card dg-catalog-card dg-reuse-card fr-enlarge-link flex flex-col relative"
  >
    <div class="dg-reuse-body flex flex-col flex-1 order-2">
      <div class="dg-card-details">
        <div class="dg-card-heading-row">
          <component
            :is="titleTag"
            class="dg-card-heading"
          >
            <AppLink
              class="dg-reuse-title"
              :to="reuseUrl"
            >
              {{ reuse.title }}
            </AppLink>
          </component>

          <ObjectCardBadge
            v-if="reuse.private"
            :icon="RiLockLine"
          >
            {{
              t('Brouillon')
            }}
          </ObjectCardBadge>

          <ObjectCardBadge
            v-else-if="reuse.archived"
            :icon="RiArchiveLine"
            tone="neutral"
          >
            {{
              t('Archivé')
            }}
          </ObjectCardBadge>
        </div>
        <ObjectCardOwner
          show-details
          :organization="reuse.organization"
          :owner="reuse.owner"
          :organization-url="organizationUrl"
        />
        <div class="dg-card-update-row">
          <TranslationT
            tag="div"
            class="dg-card-updated"
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
        </div>
        <ReuseDetails :reuse />
        <ObjectCardShortDescription :text="reuse.description" />
      </div>
    </div>
    <div class="order-1 relative flex-auto">
      <div class="dg-reuse-media">
        <div class="dg-card-media-slot">
          <CardMedia
            :src="reuse.image"
            :alt="reuse.title"
            kind="reuse"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import { RiLockLine, RiArchiveLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Reuse, ReuseV2 } from '../types/reuses'
import type { TitleTag } from '../types/ui'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ReuseDetails from './ReuseDetails.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import CardMedia from './CardMedia.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'

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
