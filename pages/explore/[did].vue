<template>
  <div
    v-if="dataset"
    class="flex h-dvh flex-col overflow-hidden bg-white"
  >
    <ResourceExplorer
      :dataset
      fullscreen
      :exit-to="exitTo"
      no-results-image="/illustrations/dataset.svg"
    />
  </div>
</template>

<script setup lang="ts">
import { ResourceExplorer } from '@datagouv/components-next'
import type { DatasetV2 } from '@datagouv/components-next'

const route = useRoute()
const { t } = useTranslation()

// Truly fullscreen: no site header, no breadcrumb — the explorer owns the whole page.
definePageMeta({ layout: false })

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset } = await useAPI<DatasetV2>(url, {
  redirectOn404: true,
  redirectOnSlug: 'did',
})

// Carry the resource being viewed back to the dataset page so we land on it when
// leaving fullscreen. Uses the slug (canonical URL) to avoid a slug redirect that
// would drop the query, and tracks the current resource as it changes in fullscreen.
const exitTo = computed(() => {
  const base = `/datasets/${dataset.value?.slug}`
  const resourceId = route.query.resource_id
  return typeof resourceId === 'string' && resourceId
    ? `${base}?resource_id=${encodeURIComponent(resourceId)}`
    : base
})

useSeoMeta({
  // Same content as the dataset page: keep it out of the index to avoid duplicates.
  robots: 'noindex',
  title: () => t('Explorer — {title}', { title: dataset.value?.title ?? '' }),
})
</script>
