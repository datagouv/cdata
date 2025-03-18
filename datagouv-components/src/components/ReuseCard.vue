<template>
  <article class="fr-enlarge-link group/reuse-card bg-white border border-gray-default flex flex-col relative">
    <div class="flex flex-col h-full flex-1 order-2 px-8">
      <div class="order-1 flex flex-col px-4 py-1 h-full -mx-8">
        <h3 class="font-bold text-base mt-1 mb-0 truncate">
          <AppLink
            class="text-gray-title"
            :to="reuseUrl"
          >
            {{ reuse.title }}
          </AppLink>
        </h3>
        <div class="order-3 text-sm m-0 text-gray-medium">
          <p class="text-sm mb-0 flex items-center">
            <span
              v-if="reuse.organization"
              class="relative block truncate z-[2] flex-1"
            >
              <AppLink
                v-if="organizationUrl"
                class="fr-link block"
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
            <RiSubtractLine class="size-4 fill-gray-medium" />
            <span>{{ t('published {date}', { date: formatRelativeIfRecentDate(reuse.created_at, { dateStyle: 'medium' }) }) }}</span>
          </p>
          <div class="flex flex-wrap items-center gap-0.5">
            <p class="text-sm mb-0">
              {{ reuseType }}
            </p>
            <RiSubtractLine
              aria-hidden="true"
              class="size-4 fill-gray-medium"
            />
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="t('{n} views', reuse.metrics.views)"
            >
              <RiEyeLine
                aria-hidden="true"
                class="size-3.5"
              />{{ summarize(reuse.metrics.views) }}
            </p>
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="t('{n} followers', reuse.metrics.followers)"
            >
              <RiStarLine
                aria-hidden="true"
                class="size-3.5"
              />{{ summarize(reuse.metrics.followers) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="order-1 relative flex-auto">
      <div class="group-hover/reuse-card:brightness-90">
        <Placeholder
          class="object-cover block object-center w-full h-auto aspect-[1.4]"
          alt=""
          type="reuse"
          :src="reuse.image"
          :size="320"
        />
      </div>
      <ul
        v-if="reuse.private || reuse.archived"
        class="list-none m-0 p-0 mt-4 px-4 -mb-2"
      >
        <li v-if="reuse.private">
          <p class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium">
            <RiLockLine class="size-3.5 mr-0.5" />
            {{ t('Draft') }}
          </p>
        </li>
        <li v-if="reuse.archived">
          <p class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium">
            <RiLockLine class="size-3.5 mr-0.5" />
            {{ t('Archived') }}
          </p>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { RiEyeLine, RiLockLine, RiStarLine, RiSubtractLine } from '@remixicon/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import useReuseType from '../composables/useReuseType'
import { formatRelativeIfRecentDate } from '../functions/dates'
import { summarize } from '../functions/helpers'
import { getOwnerName } from '../functions/owned'
import type { Reuse } from '../types/reuses'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'

const props = defineProps<{
  reuse: Reuse

  /**
  * The reuseUrl is a route location object to allow Vue Router to navigate to the details of a reuse.
  * It is used as a separate prop to allow other sites using the package to define their own reuse pages.
  */
  reuseUrl: RouteLocationRaw

  /**
  * The organizationUrl is an optional route location object to allow Vue Router to navigate to the details of the organization linked to tha reuse.
  * It is used as a separate prop to allow other sites using the package to define their own organization pages.
  */
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useI18n()

const ownerName = computed(() => getOwnerName(props.reuse))
const { label: reuseType } = useReuseType(() => props.reuse.type)
</script>
