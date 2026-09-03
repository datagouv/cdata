<template>
  <TabularExplorer
    v-if="config.public.tabularApiPreviewResourcesId"
    :resource-id="config.public.tabularApiPreviewResourcesId"
    :initial-filters="initialFilters"
  >
    <TabularToolbar class="py-3" />
    <TabularTable />
    <TabularMobileFilters />
  </TabularExplorer>
  <SimpleBanner
    v-else
    class="mt-2"
    type="warning"
  >
    {{ t('Statistiques de prévisualisations non disponibles.') }}
  </SimpleBanner>
</template>

<script setup lang="ts">
import { SimpleBanner, TabularExplorer, TabularMobileFilters, TabularTable, TabularToolbar } from '@datagouv/components-next'
import { buildFiltersFromQuery } from '~/utils/previewDashboard'

const config = useRuntimeConfig()
const route = useRoute()

const { t } = useTranslation()

// The query only seeds the filters, it is never pushed back: /admin keys its
// NuxtPage on the full path, so every filter click would remount the page and
// reset sort and visible columns.
const initialFilters = buildFiltersFromQuery(route.query)
</script>
