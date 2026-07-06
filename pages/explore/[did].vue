<template>
  <div
    v-if="dataset"
    class="min-h-dvh bg-white px-4 py-4 md:px-6"
  >
    <ResourceExplorer
      :dataset
      no-results-image="/illustrations/dataset.svg"
    />
    <!-- No site header/breadcrumb in fullscreen: keep a discreet way back to the dataset. -->
    <BrandedButton
      :href="`/datasets/${dataset.id}`"
      :icon="RiCloseLine"
      color="secondary"
      size="sm"
      icon-only
      class="fixed top-3 right-3 z-50"
      :title="$t('Revenir au jeu de données')"
    >
      {{ $t('Revenir au jeu de données') }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, ResourceExplorer } from '@datagouv/components-next'
import type { DatasetV2 } from '@datagouv/components-next'
import { RiCloseLine } from '@remixicon/vue'

const route = useRoute()
const { t } = useTranslation()

// Truly fullscreen: no site header, no breadcrumb — the explorer owns the whole page.
definePageMeta({ layout: false })

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset } = await useAPI<DatasetV2>(url, {
  redirectOn404: true,
  redirectOnSlug: 'did',
})

useSeoMeta({
  // Same content as the dataset page: keep it out of the index to avoid duplicates.
  robots: 'noindex',
  title: () => t('Explorer — {title}', { title: dataset.value?.title ?? '' }),
})
</script>
