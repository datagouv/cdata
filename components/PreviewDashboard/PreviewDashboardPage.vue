<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Tableau de bord des aperçus') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Tableau de bord des aperçus') }}
    </h1>

    <TabGroup
      :key="activeTabKey"
      size="sm"
      :default-index="defaultTabIndex"
      @change="onTabChange"
    >
      <TabList class="max-w-full overflow-x-auto">
        <Tab>{{ t('Statistique') }}</Tab>
        <Tab>{{ t('Fichiers') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <PreviewFormatStatsTable :resource-id="statsResourceId" />
        </TabPanel>
        <TabPanel>
          <TabularExplorer
            :resource-id="resourcesResourceId"
            :filters="fileFilters"
            @update:filters="onFiltersUpdate"
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#imports'
import { Tab, TabGroup, TabList, TabPanel, TabPanels, TabularExplorer } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PreviewFormatStatsTable from './PreviewFormatStatsTable.vue'
import { buildFiltersFromQuery, buildQueryFromFilters, type PreviewDashboardFilters } from '~/utils/previewDashboard'

const { t } = useTranslation()

const resourcesResourceId = '982d9dd0-365a-4c4b-8a83-75dec40c36bb'
const statsResourceId = '33cf9a65-3f77-4d88-acd1-bca420d83e60'

const route = useRoute()
const router = useRouter()

const TAB_KEYS = ['statistique', 'fichiers'] as const
type TabKey = typeof TAB_KEYS[number]

const activeTabKey = computed<TabKey>(() => {
  const tab = route.query.tab
  return TAB_KEYS.includes(tab as TabKey) ? (tab as TabKey) : 'statistique'
})

const defaultTabIndex = computed(() => TAB_KEYS.indexOf(activeTabKey.value))

const fileFilters = computed<PreviewDashboardFilters>(() => buildFiltersFromQuery(route.query))

function onFiltersUpdate(filters: PreviewDashboardFilters) {
  const formatQuery = buildQueryFromFilters(filters)
  const query = { ...route.query }

  if (formatQuery.format) {
    query.format = formatQuery.format
  }
  else {
    delete query.format
  }

  router.replace({ query })
}

function onTabChange(index: number) {
  const key = TAB_KEYS[index] ?? 'statistique'
  const query = { ...route.query, tab: key }
  router.replace({ query })
}
</script>
