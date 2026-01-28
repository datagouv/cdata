<template>
  <article class="fr-enlarge-link group/reuse-card bg-white border border-gray-default hover:bg-gray-some flex flex-col relative">
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
          <div class="text-sm mb-0 flex items-center">
            <div
              v-if="reuse.organization"
              class="relative truncate break-all z-[2] flex-initial"
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
            </div>
            <div
              v-else-if="ownerName"
              class="mr-1 truncate"
            >
              {{ ownerName }}
            </div>
            <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
            <span class="block flex-none">{{ t('publié {date}', { date: formatRelativeIfRecentDate(reuse.created_at, { dateStyle: 'medium' }) }) }}</span>
          </div>
          <ReuseDetails :reuse />
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
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useFormatDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import type { Reuse } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import ReuseDetails from './ReuseDetails.vue'
import Placeholder from './Placeholder.vue'

const props = defineProps<{
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
}>()

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const ownerName = computed(() => getOwnerName(props.reuse))

const reuseUrl = computed(() => props.reuseUrl || props.reuse.page)
</script>
