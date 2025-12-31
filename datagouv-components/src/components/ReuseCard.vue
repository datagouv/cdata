<template>
  <!-- Search mode - horizontal layout -->
  <article
    v-if="search"
    class="p-4 bg-white hover:bg-gray-some border border-gray-default fr-enlarge-link relative"
  >
    <div
      v-if="reuse.private || reuse.archived"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p
        v-if="reuse.private"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <RiLockLine class="size-4 mr-1" />
        {{ t('Brouillon') }}
      </p>
      <p
        v-if="reuse.archived"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <RiLockLine class="size-4 mr-1" />
        {{ t('Archivé') }}
      </p>
    </div>
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div class="flex-none">
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
      </div>
      <div class="flex-1 overflow-hidden">
        <h4 class="w-full text-base mb-0 flex">
          <AppLink
            :to="reuseUrl"
            class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="flex-none"
            >
              <path
                d="M3.33333 2V12.6667H14V14H2V2H3.33333ZM13.5287 4.19533L14.4713 5.138L10.6667 8.94267L8.66667 6.94333L5.80467 9.80467L4.862 8.862L8.66667 5.05733L10.6667 7.05667L13.5287 4.19533Z"
                fill="#3A3A3A"
              />
            </svg>
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
        <div
          v-if="matchingBadges.length > 0"
          class="flex flex-wrap gap-2 mt-2"
        >
          <span
            v-for="badge in matchingBadges"
            :key="badge.value"
            class="px-2 py-1 rounded text-white text-xs font-bold"
            :style="{ backgroundColor: badge.color }"
          >
            {{ badge.name }}
          </span>
        </div>
      </div>
    </div>
  </article>

  <!-- Default mode - vertical layout -->
  <article
    v-else
    class="fr-enlarge-link group/reuse-card bg-white border border-gray-default hover:bg-gray-some flex flex-col relative"
  >
    <div class="flex flex-col h-full flex-1 order-2 px-8">
      <div class="order-1 flex flex-col px-4 py-1 h-full -mx-8">
        <h3 class="font-bold text-base mt-1 mb-0 truncate">
          <AppLink
            class="text-gray-title overflow-hidden"
            :to="reuseUrl"
          >
            {{ reuse.title }}
          </AppLink>
        </h3>
        <div class="order-3 text-sm m-0 text-gray-medium">
          <p class="text-sm mb-0 flex items-center">
            <span
              v-if="reuse.organization"
              class="relative block truncate break-all z-[2] flex-initial"
            >
              <AppLink
                v-if="organizationUrl"
                class="link overflow-hidden"
                :to="organizationUrl"
              >
                <OrganizationNameWithCertificate
                  :organization="reuse.organization"
                />
              </AppLink>
              <OrganizationNameWithCertificate
                v-else
                :organization="reuse.organization"
              />
            </span>
            <span
              v-else-if="ownerName"
              class="mr-1 truncate"
            >{{ ownerName }}</span>
            <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
            <span class="block flex-none">{{ t('publié {date}', { date: formatRelativeIfRecentDate(reuse.created_at, { dateStyle: 'medium' }) }) }}</span>
          </p>
          <ReuseDetails :reuse />
        </div>
        <div
          v-if="matchingBadges.length > 0"
          class="flex flex-wrap gap-2 mt-2"
        >
          <span
            v-for="badge in matchingBadges"
            :key="badge.value"
            class="px-2 py-1 rounded text-white text-xs font-bold"
            :style="{ backgroundColor: badge.color }"
          >
            {{ badge.name }}
          </span>
        </div>
      </div>
    </div>
    <div class="order-1 relative flex-auto">
      <div class="group-hover/reuse-card:brightness-90">
        <div class="object-cover block w-full h-auto aspect-[1.4]">
          <img
            v-if="reuse.image"
            :src="reuse.image"
            class="size-full object-cover"
          >
          <Placeholder
            v-else
            type="Reuse"
            class="w-full"
          />
        </div>
      </div>
      <ul
        v-if="reuse.private || reuse.archived"
        class="list-none m-0 p-0 mt-4 px-4 -mb-2"
      >
        <li v-if="reuse.private">
          <p class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium">
            <RiLockLine class="size-3.5 mr-0.5" />
            {{ t('Brouillon') }}
          </p>
        </li>
        <li v-if="reuse.archived">
          <p class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium">
            <RiLockLine class="size-3.5 mr-0.5" />
            {{ t('Archivé') }}
          </p>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { RiLockLine, RiSubtractLine } from '@remixicon/vue'
import { computed, ref, watchEffect } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useFormatDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import type { Reuse } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import { removeMarkdown } from '../functions/markdown'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import ReuseDetails from './ReuseDetails.vue'
import Placeholder from './Placeholder.vue'

type TagIntoBadge = {
  name: string
  value: string
  color: string
}

const props = withDefaults(defineProps<{
  reuse: Reuse

  /**
  * The reuseUrl is a route location object to allow Vue Router to navigate to the details of a reuse.
  * It is used as a separate prop to allow other sites using the package to define their own reuse pages.
  */
  reuseUrl?: RouteLocationRaw

  /**
  * The organizationUrl is an optional route location object to allow Vue Router to navigate to the details of the organization linked to tha reuse.
  * It is used as a separate prop to allow other sites using the package to define their own organization pages.
  */
  organizationUrl?: RouteLocationRaw

  /**
  * Enable search mode - displays the card in horizontal layout
  */
  search?: boolean

  tagIntoBadge?: TagIntoBadge[]
}>(), {
  search: false,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const ownerName = computed(() => getOwnerName(props.reuse))

const reuseUrl = computed(() => props.reuseUrl || props.reuse.page)

const descriptionShort = ref('')
watchEffect(async () => {
  if (props.search && props.reuse.description) {
    const cleaned = await removeMarkdown(props.reuse.description)
    // Limit to ~200 characters
    descriptionShort.value = cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned
  }
})

const matchingBadges = computed(() => {
  if (!props.tagIntoBadge || !props.reuse.tags) return []
  const reuseTags = new Set(props.reuse.tags)
  return props.tagIntoBadge.filter(badge => reuseTags.has(badge.value))
})
</script>
