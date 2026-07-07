<template>
  <div class="sticky top-0 z-30 flex h-[58px] shrink-0 items-center justify-between gap-2 border-b border-gray-default bg-gray-some/95 px-3 backdrop-blur-[5px] sm:gap-4">
    <div class="flex min-w-0 items-center gap-2">
      <OrganizationLogo
        v-if="dataset.organization"
        :organization="dataset.organization"
        size-class="size-[34px] shrink-0 rounded-sm border border-gray-default bg-white p-1"
      />
      <div class="flex min-w-0 items-center gap-1 text-[13px] leading-[1.4] sm:text-base">
        <span class="min-w-0 truncate text-gray-title">{{ producerName }}</span>
        <span class="shrink-0 text-gray-title">/</span>
        <span class="min-w-0 truncate font-bold text-gray-title">{{ dataset.title }}</span>
        <template v-if="dataset.last_update">
          <span class="hidden shrink-0 text-gray-medium sm:inline">·</span>
          <span class="hidden truncate text-gray-medium sm:inline">
            {{ t('mis à jour le {date}', { date: formatDate(dataset.last_update) }) }}
          </span>
        </template>
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <BrandedButton
        v-if="resource"
        :href="resource.latest"
        :icon="RiDownloadLine"
        rel="ugc nofollow noopener"
        download
        external
        class="matomo_download"
        size="xs"
      >
        {{ t('Télécharger') }}
      </BrandedButton>
      <BrandedButton
        v-if="exitTo"
        :href="exitTo"
        :icon="RiFullscreenExitLine"
        color="secondary"
        size="xs"
        icon-only
        :title="t('Quitter le plein écran')"
      >
        {{ t('Quitter le plein écran') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiDownloadLine, RiFullscreenExitLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import BrandedButton from '../BrandedButton.vue'
import OrganizationLogo from '../OrganizationLogo.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useFormatDate } from '../../functions/dates'
import type { Dataset, DatasetV2 } from '../../types/datasets'
import type { Resource } from '../../types/resources'

const props = defineProps<{
  dataset: Dataset | DatasetV2
  resource: Resource | null
  exitTo?: RouteLocationRaw
}>()

const { t } = useTranslation()
const { formatDate } = useFormatDate()

// Plain producer name (org or owner), matching the prototype: dark text, no link,
// no certificate badge — unlike ObjectCardOwner which renders a styled link.
const producerName = computed(() => {
  const { organization, owner } = props.dataset
  if (organization) return organization.name
  if (owner) return `${owner.first_name} ${owner.last_name}`
  return ''
})
</script>
