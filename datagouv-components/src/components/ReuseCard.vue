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
              class="relative block truncate break-all z-[2] flex-initial"
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
            <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
            <span class="block flex-none">{{ t('published {date}', { date: formatRelativeIfRecentDate(reuse.created_at, { dateStyle: 'medium' }) }) }}</span>
          </p>
          <ReuseDetails :reuse />
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
import { RiLockLine, RiSubtractLine } from '@remixicon/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import { formatRelativeIfRecentDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import type { Reuse } from '../types/reuses'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import ReuseDetails from './ReuseDetails.vue'

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
</script>
