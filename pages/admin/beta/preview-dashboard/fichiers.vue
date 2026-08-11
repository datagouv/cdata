<template>
  <TabularExplorer
    :resource-id="config.public.tabularApiPreviewResourcesId"
    :initial-filters="initialFilters"
  />
</template>

<script setup lang="ts">
import { TabularExplorer } from '@datagouv/components-next'
import { buildFiltersFromQuery } from '~/utils/previewDashboard'

const config = useRuntimeConfig()
const route = useRoute()

// The query only seeds the filters, it is never pushed back: /admin keys its
// NuxtPage on the full path, so every filter click would remount the page and
// reset sort and visible columns.
const initialFilters = buildFiltersFromQuery(route.query)
</script>
